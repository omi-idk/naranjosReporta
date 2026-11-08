# Arquitectura

Monolito Next.js App Router. Identificadores y código en inglés; documentación e interfaz en español mexicano. Reglas puras y esquemas Zod en `src/features/reports/domain`. Se añadirán application e infrastructure al implementar los primeros casos de uso; evitar capas vacías.

PostgreSQL y PostGIS: `geography(Point,4326)` almacena longitud/latitud WGS84; distancias de `ST_DWithin` en metros e índice GiST. Prisma no escribe ese tipo directamente: operaciones de ubicación deben usar consultas etiquetadas parametrizadas dentro de la misma transacción que reporte e historial. No interpolar SQL ni aceptar nombres de columnas del cliente.

Supabase Auth es la opción prevista, aún sin integración: validar identidad en servidor, vincular UUID a User y obtener Role de BD. No almacenar contactos en modelos públicos. Storage privado detrás de una interfaz a implementar. Los motivos internos y coordenadas sensibles no deben llegar al DTO público sin revisión.

Migración inicial generada desde esquema y ampliada con PostGIS, índices y controles de auditoría; no ejecutada. Comparar esquema y migración con una instancia real antes de producción. El propietario de BD puede saltar controles: usar rol de aplicación sin DDL ni privilegios de superusuario.

La referencia de producto se conserva en `naranjos-reporta-codex`; producto, diseño, roadmap, ADR y avance vigente están en `docs/` de la raíz. V2 incorpora exploración, mapa, formulario, acceso, detalle, moderación y estadísticas. El repositorio pg parametrizado concentra transacciones que incluyen PostGIS; Prisma permanece como esquema y migraciones (ADR 0003). No se verificó todavía la integración positiva con servicios reales.

API recibe Bearer, valida con Supabase, consulta Role en User y produce DTO sin identidad. RLS sin políticas y privilegios públicos revocados bloquean acceso directo por PostgREST; el servidor debe usar un rol apropiado y revisado. Un rol no propietario necesita políticas explícitas: no basta configurarlo en DATABASE_URL.

PWA registra worker en producción y guarda solamente un aviso offline estático. APIs, mapas, reportes y sesiones nunca se almacenan en caché del worker. No hay cola de envío offline ni persistencia local de borradores.
