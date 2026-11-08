import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { z } from "zod";
import { AppError } from "../application/errors";
import type {
  CategoryDto,
  ReportDetailDto,
  ReportDto,
  ReportListDto,
  StatsDto,
} from "../application/contracts";
import type { ListQuery } from "../application/queries";
import {
  authorizeTransition,
  createReportSchema,
  publicStatuses,
  type ReportStatus,
} from "../domain/report";
import type { Actor } from "./auth";
import { database, transaction } from "./database";

interface ReportRow {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
const selectReport = `r.id, r.title, r.description, r."categoryId", c.slug AS "categorySlug", c.name AS "categoryName", r.status,
  round(ST_Y(r.location::geometry)::numeric, 3)::float8 AS latitude,
  round(ST_X(r.location::geometry)::numeric, 3)::float8 AS longitude,
  r."createdAt", r."updatedAt", r.version`;
export function reportDto(row: ReportRow): ReportDto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: {
      id: row.categoryId,
      slug: row.categorySlug,
      name: row.categoryName,
    },
    status: row.status,
    latitude: row.latitude,
    longitude: row.longitude,
    locationPrecision: "approximate",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    version: row.version,
  };
}
export async function categories(): Promise<CategoryDto[]> {
  return (
    await database().query<CategoryDto>(
      'SELECT id, slug, name FROM "Category" WHERE active = true ORDER BY name',
    )
  ).rows;
}
export async function listReports(query: ListQuery): Promise<ReportListDto> {
  const values: unknown[] = [publicStatuses];
  const conditions = ['r.status = ANY($1::"ReportStatus"[])'];
  if (query.q) {
    values.push(query.q);
    conditions.push(
      `(position(lower($${values.length}) in lower(r.title)) > 0 OR position(lower($${values.length}) in lower(r.description)) > 0)`,
    );
  }
  if (query.category) {
    values.push(query.category);
    conditions.push(`r."categoryId" = $${values.length}::uuid`);
  }
  if (query.status) {
    values.push(query.status);
    conditions.push(`r.status = $${values.length}::"ReportStatus"`);
  }
  if (
    query.latitude !== undefined &&
    query.longitude !== undefined &&
    query.radius !== undefined
  ) {
    // Query the same approximate geometry that is public, avoiding an exact-location proximity oracle.
    values.push(query.longitude, query.latitude, query.radius);
    const count = values.length;
    conditions.push(
      `ST_DWithin(ST_SetSRID(ST_MakePoint(round(ST_X(r.location::geometry)::numeric,3)::float8,round(ST_Y(r.location::geometry)::numeric,3)::float8),4326)::geography, ST_SetSRID(ST_MakePoint($${count - 2},$${count - 1}),4326)::geography, $${count})`,
    );
  }
  values.push(21, (query.page - 1) * 20);
  const direction = query.sort === "oldest" ? "ASC" : "DESC";
  const result = await database().query<ReportRow>(
    `SELECT ${selectReport} FROM "Report" r JOIN "Category" c ON c.id = r."categoryId" WHERE ${conditions.join(" AND ")} ORDER BY r."createdAt" ${direction}, r.id ${direction} LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  return {
    items: result.rows.slice(0, 20).map(reportDto),
    page: query.page,
    pageSize: 20,
    hasMore: result.rows.length > 20,
  };
}
export async function reportDetail(
  id: string,
  actor?: Actor,
): Promise<ReportDetailDto> {
  const result = await database().query<ReportRow>(
    `SELECT ${selectReport} FROM "Report" r JOIN "Category" c ON c.id = r."categoryId" WHERE r.id = $1 AND (r.status = ANY($2::"ReportStatus"[]) OR r."authorId" = $3::uuid OR $4::boolean)`,
    [id, publicStatuses, actor?.id ?? null, actor?.role === "MODERATOR"],
  );
  const row = result.rows[0];
  if (!row) throw new AppError(404, "NOT_FOUND", "No se encontró el reporte.");
  const events = await database().query<{
    id: string;
    fromStatus: ReportStatus | null;
    toStatus: ReportStatus;
    createdAt: Date;
  }>(
    'SELECT id, "fromStatus", "toStatus", "createdAt" FROM "ReportEvent" WHERE "reportId" = $1 ORDER BY "createdAt", id',
    [id],
  );
  return {
    ...reportDto(row),
    events: events.rows.map((event) => ({
      id: event.id,
      fromStatus: event.fromStatus,
      toStatus: event.toStatus,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}
async function lockActor(client: PoolClient, actor: Actor): Promise<void> {
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [
    actor.id,
  ]);
}
export async function createReport(
  input: z.infer<typeof createReportSchema>,
  actor: Actor,
): Promise<{ id: string; status: "PENDING_MODERATION" }> {
  return transaction(async (client) => {
    await lockActor(client, actor);
    const duplicate = await client.query<{ id: string }>(
      'SELECT id FROM "Report" WHERE "authorId" = $1 AND status = \'PENDING_MODERATION\' AND title = $2 AND description = $3 AND "categoryId" = $4 AND ST_Equals(location::geometry, ST_SetSRID(ST_MakePoint($5,$6),4326)) AND "createdAt" > now() - interval \'1 minute\' ORDER BY "createdAt" DESC LIMIT 1',
      [
        actor.id,
        input.title,
        input.description,
        input.categoryId,
        input.longitude,
        input.latitude,
      ],
    );
    if (duplicate.rows[0])
      return { id: duplicate.rows[0].id, status: "PENDING_MODERATION" };
    const count = await client.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM "Report" WHERE "authorId" = $1 AND "createdAt" > now() - interval \'1 hour\'',
      [actor.id],
    );
    if (count.rows[0].count >= 5)
      throw new AppError(
        429,
        "RATE_LIMITED",
        "Alcanzaste el límite de cinco reportes por hora. Intenta más tarde.",
      );
    const category = await client.query(
      'SELECT id FROM "Category" WHERE id = $1 AND active = true FOR SHARE',
      [input.categoryId],
    );
    if (!category.rowCount)
      throw new AppError(
        400,
        "INVALID_CATEGORY",
        "Selecciona una categoría disponible.",
      );
    const id = randomUUID();
    await client.query(
      'INSERT INTO "Report" (id,"authorId","categoryId",title,description,location,"updatedAt") VALUES ($1,$2,$3,$4,$5,ST_SetSRID(ST_MakePoint($6,$7),4326)::geography,now())',
      [
        id,
        actor.id,
        input.categoryId,
        input.title,
        input.description,
        input.longitude,
        input.latitude,
      ],
    );
    await client.query(
      'INSERT INTO "ReportEvent" (id,"reportId","actorId","toStatus",reason) VALUES ($1,$2,$3,\'PENDING_MODERATION\',\'Reporte creado por su autor\')',
      [randomUUID(), id, actor.id],
    );
    return { id, status: "PENDING_MODERATION" };
  });
}
export async function transitionReport(
  id: string,
  input: { to: ReportStatus; reason: string; version: number },
  actor: Actor,
): Promise<{ id: string; status: ReportStatus; version: number }> {
  return transaction(async (client) => {
    await lockActor(client, actor);
    const result = await client.query<{
      authorId: string;
      status: ReportStatus;
      version: number;
    }>(
      'SELECT "authorId", status, version FROM "Report" WHERE id = $1 AND ("authorId" = $2 OR $3::boolean) FOR UPDATE',
      [id, actor.id, actor.role === "MODERATOR"],
    );
    const row = result.rows[0];
    if (!row)
      throw new AppError(404, "NOT_FOUND", "No se encontró el reporte.");
    if (row.version !== input.version)
      throw new AppError(
        409,
        "VERSION_CONFLICT",
        "El reporte cambió. Actualiza la página.",
      );
    try {
      authorizeTransition({
        from: row.status,
        to: input.to,
        role: actor.role,
        isAuthor: row.authorId === actor.id,
        reason: input.reason,
      });
    } catch (error) {
      const code = error instanceof Error ? error.message : "FORBIDDEN";
      throw new AppError(
        code === "FORBIDDEN" ? 403 : 409,
        code,
        "No se permite este cambio de estado.",
      );
    }
    const count = await client.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM "ReportEvent" WHERE "actorId" = $1 AND "createdAt" > now() - interval \'1 hour\'',
      [actor.id],
    );
    if (count.rows[0].count >= 100)
      throw new AppError(
        429,
        "RATE_LIMITED",
        "Alcanzaste el límite de acciones por hora.",
      );
    await client.query(
      'UPDATE "Report" SET status = $2, version = version + 1, "updatedAt" = now() WHERE id = $1',
      [id, input.to],
    );
    await client.query(
      'INSERT INTO "ReportEvent" (id,"reportId","actorId","fromStatus","toStatus",reason) VALUES ($1,$2,$3,$4,$5,$6)',
      [randomUUID(), id, actor.id, row.status, input.to, input.reason],
    );
    if (row.status === "PENDING_MODERATION" && actor.role === "MODERATOR")
      await client.query(
        'INSERT INTO "ModerationDecision" (id,"reportId","moderatorId",outcome,reason) VALUES ($1,$2,$3,$4,$5)',
        [randomUUID(), id, actor.id, input.to, input.reason],
      );
    return { id, status: input.to, version: row.version + 1 };
  });
}
export async function moderationQueue(page: number): Promise<ReportListDto> {
  const result = await database().query<ReportRow>(
    `SELECT ${selectReport} FROM "Report" r JOIN "Category" c ON c.id=r."categoryId" WHERE r.status = 'PENDING_MODERATION' ORDER BY r."createdAt",r.id LIMIT 21 OFFSET $1`,
    [(page - 1) * 20],
  );
  return {
    items: result.rows.slice(0, 20).map(reportDto),
    page,
    pageSize: 20,
    hasMore: result.rows.length > 20,
  };
}
export async function statistics(): Promise<StatsDto> {
  const result = await database().query<{
    status: ReportStatus;
    name: string;
    month: string;
    count: number;
  }>(
    'SELECT r.status, c.name, to_char(r."createdAt" AT TIME ZONE \'UTC\',\'YYYY-MM\') AS month, count(*)::int AS count FROM "Report" r JOIN "Category" c ON c.id=r."categoryId" WHERE r.status = ANY($1::"ReportStatus"[]) GROUP BY r.status,c.name,month',
    [publicStatuses],
  );
  const category = new Map<string, number>();
  const state = new Map<ReportStatus, number>();
  const month = new Map<string, number>();
  let total = 0;
  for (const row of result.rows) {
    total += row.count;
    category.set(row.name, (category.get(row.name) ?? 0) + row.count);
    state.set(row.status, (state.get(row.status) ?? 0) + row.count);
    month.set(row.month, (month.get(row.month) ?? 0) + row.count);
  }
  return {
    total,
    byCategory: [...category].map(([name, count]) => ({ name, count })),
    byStatus: [...state].map(([status, count]) => ({ status, count })),
    monthly: [...month]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count })),
  };
}
