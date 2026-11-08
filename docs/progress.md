# Avance real

## Incremento V2 — estado vigente

Fecha local: 7 de noviembre de 2026. Fases 0/1 V2 auditadas y rediseño implementado; fases 2–4 tienen código integrado, **sin validación positiva con servicios reales**. Fase 5 parcialmente verificada. No declarar el MVP completo ni listo para piloto público.

### Auditoría y clasificación actual

| Funcionalidad                                  | Clasificación y evidencia                                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Navegación, exploración y diseño responsive    | Implementada/verificada en navegador 1440/768/390                                                    |
| Mapa Leaflet, teselas y selección manual       | Implementada/verificada con teselas OSM reales                                                       |
| Búsqueda, filtros, paginación y proximidad API | Implementada parcialmente: validaciones/SQL y UI; datos positivos necesitan BD                       |
| Formulario y revisión                          | Implementada; restricciones, consentimiento y selección probados; envío exitoso pendiente de BD/Auth |
| Persistencia, consulta y detalle privado       | Implementados en SQL real; no se ha ejecutado migración ni probado registro vía API real             |
| Supabase Auth y roles                          | Implementados parcialmente; límites sin sesión probados, cuenta válida pendiente                     |
| Cola/aprobación/rechazo e historial            | Implementados parcialmente; permisos negativos probados, flujo positivo pendiente                    |
| Estadísticas                                   | Implementadas sobre datos persistidos; solo error real verificado sin BD                             |
| Imágenes                                       | No implementadas; subida deshabilitada explícitamente                                                |
| PWA                                            | Manifest/iconos y aviso offline implementados; caché verificada solo offline.html                    |
| Denuncias, eliminación y defensa por red/IP    | Documentadas como requisitos; no implementadas                                                       |
| Integración BD                                 | Suite de seis tests preparada, omitida por falta de conexión                                         |

### Trabajo y decisiones

- Se ejecutaron tres subagentes reales: diseño/producto, backend/GIS, QA/seguridad. El orquestador implementó frontend, integró cambios, CI, configuración y documentación; no se ejecutaron nueve agentes simultáneos.
- Aplicadas frontend-design, ui-ux-pro-max y web-design-guidelines. El buscador Python de ui-ux no pudo ejecutarse porque Python no existe; se revisó fuente y se usó guía estática, sin inventar resultados.
- Nueva dirección neutral/azul, inicio compacto, listado/mapa dividido, vista móvil lista/mapa, formularios y estados honestos. Corregido espacio vacío excesivo en móvil y textos de mapa a 12 px después de crítica de capturas.
- API real con pg parametrizado, DTO sin autor, coordenadas aproximadas y proximidad a esa misma precisión. Prisma conserva esquema/migraciones. ADR 0003 justifica la transacción SQL completa.
- Sesión Bearer verificada en Supabase, rol local de BD, token solo en memoria; creación pendiente/evento atómicos, cuota persistida y control de concurrencia. Evidencia y registro público aún no habilitados.
- Migración aditiva RLS y revocación de privilegios públicos para evitar acceso directo por PostgREST. No aplicada: necesita revisión y prueba con PostGIS.
- Catálogo idempotente sin reportes, compose local ligado a loopback, guía docs/local-setup.md y job CI PostGIS/integración preparados.
- AGENTS.md raíz y nueve roles declarativos en .codex/agents; claves contrastadas con documentación oficial. `codex.cmd --strict-config doctor --summary` con permisos aprobados cargó configuración (22 OK, 3 advertencias opcionales, 0 fallos); sandbox inicial no resolvía HOME.

### Verificación V2 ejecutada

| Comando o revisión                         | Resultado                                                                                                      |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| npm.cmd run typecheck                      | PASS                                                                                                           |
| npm.cmd run lint                           | PASS                                                                                                           |
| npm.cmd test                               | PASS: 41 pruebas, cinco archivos; repositorio probado con dobles explícitos                                    |
| npm.cmd run db:validate / db:generate      | PASS                                                                                                           |
| npm.cmd run build                          | PASS: páginas y rutas API generadas; manifest incluido                                                         |
| npm.cmd run format:check                   | PASS antes del cierre documental; comprobación final al entregar                                               |
| npm.cmd run test:integration               | Seis OMITIDAS, INTEGRATION_DATABASE_URL ausente; no es PASS de PostGIS                                         |
| Playwright sobre producción 127.0.0.1:3001 | 11/11 PASS, 7.3 s; cinco límites API, navegación, selección/validación, tres anchos y PWA offline              |
| Capturas 1440/768/390                      | Revisadas por QA y móvil también por orquestador; sin solapamiento ni desbordamiento; correcciones verificadas |
| npm.cmd audit --omit=dev --json            | Cero vulnerabilidades conocidas de producción en consulta ejecutada                                            |
| Auditoría de desarrollo                    | Ocho avisos moderados pendientes de herramientas de lint; no se aplicó fix --force                             |

Las primeras E2E contra dev fallaron por hidratación/HMR; se aislaron en producción y pasaron. Hipótesis: conflicto dev/build sobre .next. Las teselas fueron bloqueadas por red del sandbox; la repetición autorizada cargó OSM real. Errores 503 de datos son esperados sin infraestructura, no se ocultaron ni tradujeron a cero. La suite no prueba persistencia ni usuario autenticado válido.

### Git y límites operativos

El commit inicial `4b69677` sí se subió a origin/master después de completar autenticación GitHub. Estos cambios V2 son locales, sin nuevo commit ni push. La carpeta de referencias del usuario se preserva intacta. No se desplegó ni ejecutó migración contra servicios externos.

El usuario confirmó que no tiene PostgreSQL/Supabase y pidió instrucciones locales; se preparó docs/local-setup.md. No instalar Docker, crear cuentas remotas ni copiar secretos automáticamente. No hubo datos ciudadanos ni fixtures DEMO persistidos en esta sesión.

### Próximo paso exacto

1. Instalar/arrancar Docker Desktop y seguir docs/local-setup.md opción Supabase local. Configurar .env sin exponer claves, revisar/aplicar migraciones a base vacía y ejecutar db:seed.
2. Ejecutar seis tests PostGIS con INTEGRATION_DATABASE_URL. Probar usuario ciudadano y moderador propios: crear→detalle privado→aprobar/rechazar→consulta pública y verificar IDOR, concurrencia y rol SQL/RLS.
3. Implementar evidencia recodificada con storage privado, denuncias y límites por red/IP. Seleccionar licencia y responsable/canal de privacidad antes de piloto.
4. Completar UI de cambios de seguimiento, proximidad/duplicados y pruebas positivas con servicios; revisar rendimiento espacial, WCAG y recuperación de cuentas.
5. Revisar este incremento y pedir autorización antes de cualquier nuevo push/publicación.

---

## Historial: incremento inicial (anterior a V2)

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
