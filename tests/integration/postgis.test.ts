import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

// Opt-in only. Use an isolated integration database with reviewed migrations already applied.
// Fixtures are DEMO and synthetic (0,0); every test transaction is rolled back.
const connectionString = process.env.INTEGRATION_DATABASE_URL;
if (!connectionString)
  console.info(
    "SKIP PostgreSQL/PostGIS integration: INTEGRATION_DATABASE_URL is not configured.",
  );

describe.skipIf(!connectionString)(
  "PostgreSQL/PostGIS migration and persistence integration",
  () => {
    let pool: Pool;
    let client: PoolClient;
    let authorId: string;
    let moderatorId: string;
    let categoryId: string;

    beforeAll(async () => {
      pool = new Pool({
        connectionString,
        max: 1,
        connectionTimeoutMillis: 5000,
        statement_timeout: 5000,
      });
      client = await pool.connect();
    });
    beforeEach(async () => {
      await client.query("BEGIN");
      authorId = randomUUID();
      moderatorId = randomUUID();
      categoryId = randomUUID();
      await client.query(
        "INSERT INTO \"User\" (id,role) VALUES ($1,'CITIZEN'),($2,'MODERATOR')",
        [authorId, moderatorId],
      );
      await client.query(
        "INSERT INTO \"Category\" (id,slug,name) VALUES ($1,$2,'DEMO: categoría de integración')",
        [categoryId, `demo-integration-${categoryId}`],
      );
    });
    afterEach(async () => {
      await client.query("ROLLBACK");
    });
    afterAll(async () => {
      client?.release();
      await pool?.end();
    });

    async function createPending(
      title = "DEMO: incidencia sintética de integración",
    ) {
      const id = randomUUID();
      const eventId = randomUUID();
      await client.query(
        'INSERT INTO "Report" (id,"authorId","categoryId",title,description,location,"updatedAt") VALUES ($1,$2,$3,$4,$5,ST_SetSRID(ST_MakePoint($6,$7),4326)::geography,now())',
        [
          id,
          authorId,
          categoryId,
          title,
          "DEMO: no representa una incidencia auténtica. Registro exclusivo de una prueba con rollback.",
          0,
          0,
        ],
      );
      await client.query(
        'INSERT INTO "ReportEvent" (id,"reportId","actorId","toStatus",reason) VALUES ($1,$2,$3,\'PENDING_MODERATION\',\'DEMO: creación en prueba de integración\')',
        [eventId, id, authorId],
      );
      return { id, eventId };
    }

    it("has PostGIS geography and all required domain tables", async () => {
      const extension = await client.query<{ version: string }>(
        "SELECT PostGIS_Version() AS version",
      );
      expect(extension.rows[0].version).toBeTruthy();
      const tables = await client.query<{ name: string }>(
        "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])",
        [
          [
            "User",
            "Category",
            "Report",
            "ReportImage",
            "ReportEvent",
            "ReportConfirmation",
            "ModerationDecision",
          ],
        ],
      );
      expect(tables.rowCount).toBe(7);
      const location = await client.query<{ type: string }>(
        "SELECT format_type(a.atttypid,a.atttypmod) AS type FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid WHERE c.relname = 'Report' AND a.attname = 'location' AND NOT a.attisdropped",
      );
      expect(location.rows[0].type.toLowerCase()).toBe("geography(point,4326)");
    });

    it("persists pending with audit, excludes it publicly, then publishes with optimistic version and audit", async () => {
      const { id } = await createPending();
      const pending = await client.query<{ status: string; count: number }>(
        'SELECT r.status,(SELECT count(*)::int FROM "ReportEvent" e WHERE e."reportId" = r.id) AS count FROM "Report" r WHERE r.id = $1',
        [id],
      );
      expect(pending.rows[0]).toMatchObject({
        status: "PENDING_MODERATION",
        count: 1,
      });
      const invisible = await client.query(
        'SELECT id FROM "Report" WHERE id = $1 AND status = ANY($2::"ReportStatus"[])',
        [
          id,
          [
            "PUBLISHED",
            "UNDER_REVIEW",
            "SOLUTION_REPORTED",
            "SOLUTION_VERIFIED",
          ],
        ],
      );
      expect(invisible.rowCount).toBe(0);

      const published = await client.query(
        "UPDATE \"Report\" SET status='PUBLISHED',version=version+1,\"updatedAt\"=now() WHERE id=$1 AND status='PENDING_MODERATION' AND version=$2 RETURNING id",
        [id, 0],
      );
      expect(published.rowCount).toBe(1);
      await client.query(
        'INSERT INTO "ReportEvent" (id,"reportId","actorId","fromStatus","toStatus",reason) VALUES ($1,$2,$3,\'PENDING_MODERATION\',\'PUBLISHED\',\'DEMO: publicación revisada en integración\')',
        [randomUUID(), id, moderatorId],
      );
      await client.query(
        'INSERT INTO "ModerationDecision" (id,"reportId","moderatorId",outcome,reason) VALUES ($1,$2,$3,\'PUBLISHED\',\'DEMO: decisión sintética de integración\')',
        [randomUUID(), id, moderatorId],
      );
      const visible = await client.query<{
        id: string;
        latitude: number;
        longitude: number;
        version: number;
      }>(
        "SELECT id,round(ST_Y(location::geometry)::numeric,3)::float8 AS latitude,round(ST_X(location::geometry)::numeric,3)::float8 AS longitude,version FROM \"Report\" WHERE id=$1 AND status='PUBLISHED'",
        [id],
      );
      expect(visible.rows[0]).toEqual({
        id,
        latitude: 0,
        longitude: 0,
        version: 1,
      });
      const stale = await client.query(
        'UPDATE "Report" SET version=version+1 WHERE id=$1 AND version=$2 RETURNING id',
        [id, 0],
      );
      expect(stale.rowCount).toBe(0);
      const history = await client.query(
        'SELECT id FROM "ReportEvent" WHERE "reportId"=$1',
        [id],
      );
      expect(history.rowCount).toBe(2);
    });

    it("executes real spatial distance/proximity and treats injected text as a parameter", async () => {
      const title = "DEMO: '; DROP TABLE Report; --";
      const { id } = await createPending(title);
      const nearby = await client.query<{
        id: string;
        title: string;
        distance: number;
      }>(
        'SELECT id,title,ST_Distance(location,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography) AS distance FROM "Report" WHERE id=$1 AND ST_DWithin(location,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,$4)',
        [id, 0, 0, 100],
      );
      expect(nearby.rows[0]).toMatchObject({ id, title, distance: 0 });
      const far = await client.query(
        'SELECT id FROM "Report" WHERE id=$1 AND ST_DWithin(location,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,$4)',
        [id, 1, 1, 100],
      );
      expect(far.rowCount).toBe(0);
    });

    it("rejects modifications and deletion of report audit records", async () => {
      const { id, eventId } = await createPending();
      await client.query("SAVEPOINT audit_update");
      await expect(
        client.query('UPDATE "ReportEvent" SET reason=$2 WHERE id=$1', [
          eventId,
          "DEMO: modificación prohibida",
        ]),
      ).rejects.toThrow("Audit records are immutable");
      await client.query("ROLLBACK TO SAVEPOINT audit_update");
      await client.query("SAVEPOINT audit_delete");
      await expect(
        client.query('DELETE FROM "ReportEvent" WHERE "reportId"=$1', [id]),
      ).rejects.toThrow("Audit records are immutable");
      await client.query("ROLLBACK TO SAVEPOINT audit_delete");
      expect(
        (
          await client.query('SELECT id FROM "ReportEvent" WHERE id=$1', [
            eventId,
          ])
        ).rowCount,
      ).toBe(1);
    });

    it("rejects alteration of moderation decisions and invalid evidence metadata", async () => {
      const { id } = await createPending();
      const decisionId = randomUUID();
      await client.query(
        'INSERT INTO "ModerationDecision" (id,"reportId","moderatorId",outcome,reason) VALUES ($1,$2,$3,\'REJECTED\',\'DEMO: decisión de prueba de inmutabilidad\')',
        [decisionId, id, moderatorId],
      );
      await client.query("SAVEPOINT decision_update");
      await expect(
        client.query('UPDATE "ModerationDecision" SET reason=$2 WHERE id=$1', [
          decisionId,
          "DEMO: modificación prohibida",
        ]),
      ).rejects.toThrow("Audit records are immutable");
      await client.query("ROLLBACK TO SAVEPOINT decision_update");
      await client.query("SAVEPOINT image_constraint");
      await expect(
        client.query(
          'INSERT INTO "ReportImage" (id,"reportId","storageKey","mimeType","byteSize") VALUES ($1,$2,$3,$4,$5)',
          [randomUUID(), id, `demo-${randomUUID()}`, "image/svg+xml", 100],
        ),
      ).rejects.toMatchObject({ code: "23514" });
      await client.query("ROLLBACK TO SAVEPOINT image_constraint");
    });

    it("rolls back report, identity and audit together without deleting immutable rows", async () => {
      const { id, eventId } = await createPending();
      const fixtureAuthor = authorId;
      await client.query("ROLLBACK");
      const reports = await client.query(
        'SELECT id FROM "Report" WHERE id=$1',
        [id],
      );
      const events = await client.query(
        'SELECT id FROM "ReportEvent" WHERE id=$1',
        [eventId],
      );
      const users = await client.query('SELECT id FROM "User" WHERE id=$1', [
        fixtureAuthor,
      ]);
      expect(reports.rowCount).toBe(0);
      expect(events.rowCount).toBe(0);
      expect(users.rowCount).toBe(0);
      // Keep afterEach rollback balanced. No DELETE/TRUNCATE/DROP is used for fixture cleanup.
      await client.query("BEGIN");
    });
  },
);
