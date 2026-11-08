# Avance real

## Fase actual

Fase 0 completada; primer incremento de Fase 1 implementado. MVP todavía incompleto. Fecha local: 7 de noviembre de 2026.

## Completado

- Auditoría de repositorio inicialmente vacío, sin commits ni archivos del usuario.
- Revisión posterior de `naranjos-reporta-codex/AGENTS.md`, `INICIO-CODEX.md`, PRD, avance y ocho roles. Carpeta preservada intacta; sus documentos son referencias de producto, no el estado ejecutado actual.
- Plan, arquitectura, dos ADR, contrato API previsto y controles de seguridad/retención.
- Next 16.4.5, React 19.3.1, TypeScript 6.0.3 strict, Tailwind 4, Zod, Prisma 7.10.1, Vitest y CI. Versiones directas fijadas y package-lock.json generado.
- Portada responsive en español con aviso independiente y estado de desarrollo; no simula funcionalidades de recepción ni cifras.
- Entidades User, Category, Report, ReportImage, ReportEvent, ReportConfirmation y ModerationDecision.
- Migración inicial generada y ampliada con PostGIS, índice GiST, restricciones de imágenes y triggers append-only. No aplicada a BD.
- Reglas puras de transición y esquema estricto para entradas; 16 pruebas.

## Archivos principales

`src/app/*`, `src/features/reports/domain/*`, `prisma/schema.prisma`, `prisma/migrations/202611080001_initial/migration.sql`, `prisma.config.ts`, `package.json`, lockfile, configuración TS/lint/Vitest/PostCSS, `.env.example`, `.github/workflows/ci.yml`, README y docs.

## Verificaciones ejecutadas y resultados

Entorno: Windows PowerShell, Node 26.13.0. Se usa npm.cmd por política de ejecución de scripts; no se alteró esa política.

| Comando                                                                    | Resultado final                                                                                                                                             |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm.cmd run typecheck                                                      | PASS, sin errores                                                                                                                                           |
| npm.cmd run lint                                                           | PASS, sin errores ni advertencias                                                                                                                           |
| npm.cmd test                                                               | PASS, 1 archivo, 16 pruebas                                                                                                                                 |
| npm.cmd run format:check                                                   | PASS                                                                                                                                                        |
| npm.cmd run db:generate                                                    | PASS, cliente 7.10.1 generado                                                                                                                               |
| npm.cmd run db:validate                                                    | PASS                                                                                                                                                        |
| npm.cmd run build                                                          | PASS, / y /_not-found generadas                                                                                                                             |
| prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script | PASS, SQL inicial generado sin conexión                                                                                                                     |
| npm.cmd audit --json                                                       | Detectó inicialmente 10 avisos moderados relacionados con minimatch y herramientas de lint; instalación final informa 8 moderados después de fijar ESLint 9 |

Fallos corregidos: TypeScript 7 incompatible con typescript-eslint → TS 6.0.3; ESLint 10 fuera de peer range de plugins → 9.39.5; enlace interno corregido a Next Link; export PostCSS nombrado; configuración ESM explícita. ESLint 9 aparece deprecado: revisar actualización compatible antes de producción.

La consulta inicial de npm falló por acceso de red/cache del sandbox y se repitió con aprobación. No se aplicó `npm audit fix --force`.

## Bloqueos y límites

- No se detectó Docker ni se dispone de conexión PostgreSQL configurada: SQL aún sin prueba de ejecución, integridad o rollback.
- Auth y Storage no configurados; aún no hay API de incidencias, casos de uso persistentes, mapa, formularios, moderación ni PWA offline.
- No se ejecutaron E2E, pruebas de integración de BD ni QA visual en navegador. CI está escrita, no ejecutada en GitHub.
- Resolver avisos de herramientas de desarrollo y escoger licencia antes de distribuir el proyecto como open source.
- No hay datos seed; no se inventaron incidencias, coordenadas ni estadísticas municipales.
- No se hizo commit, push, publicación ni migración sobre infraestructura externa.

## Próximo incremento reproducible

1. Ejecutar `npm ci` y las verificaciones del README. Preparar PostgreSQL/PostGIS local, copiar .env.example a .env y revisar/aplicar `npm run db:deploy` solo a base vacía.
2. Probar migración e inmutabilidad con rol de aplicación sin DDL. Añadir integración con BD efímera en CI.
3. Añadir adaptador PostgreSQL de Prisma, DTO públicos explícitos, catálogo y lectura paginada. Implementar proximidad con ST_DWithin parametrizado.
4. Integrar sesión Supabase verificada y roles de BD; creación pendiente con evento atómico, cuota y origen. Probar 401/403/404, validaciones, concurrencia e IDOR antes de habilitar escrituras.
5. Listado/mapa/formulario/detalle y moderación; evidencia privada recodificada; denuncias. Seguir criterios de docs/implementation-plan.md y PRD de referencia.
6. Añadir E2E, revisión WCAG, PWA sin caché de datos privados, piloto DEMO aislado y guía operativa.
