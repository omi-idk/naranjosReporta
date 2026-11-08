# Arquitectura

Monolito Next.js App Router. Identificadores y código en inglés; documentación e interfaz en español mexicano. Reglas puras y esquemas Zod en `src/features/reports/domain`. Se añadirán application e infrastructure al implementar los primeros casos de uso; evitar capas vacías.

PostgreSQL y PostGIS: `geography(Point,4326)` almacena longitud/latitud WGS84; distancias de `ST_DWithin` en metros e índice GiST. Prisma no escribe ese tipo directamente: operaciones de ubicación deben usar consultas etiquetadas parametrizadas dentro de la misma transacción que reporte e historial. No interpolar SQL ni aceptar nombres de columnas del cliente.

Supabase Auth es la opción prevista, aún sin integración: validar identidad en servidor, vincular UUID a User y obtener Role de BD. No almacenar contactos en modelos públicos. Storage privado detrás de una interfaz a implementar. Los motivos internos y coordenadas sensibles no deben llegar al DTO público sin revisión.

Migración inicial generada desde esquema y ampliada con PostGIS, índices y controles de auditoría; no ejecutada. Comparar esquema y migración con una instancia real antes de producción. El propietario de BD puede saltar controles: usar rol de aplicación sin DDL ni privilegios de superusuario.

La referencia de producto se conserva en `naranjos-reporta-codex`; plan, ADR y avance de implementación están en `docs/` de la raíz. La portada es el único flujo web disponible actualmente.
