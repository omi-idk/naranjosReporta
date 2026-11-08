# ADR 0001: monolito modular y publicación moderada

Estado: aceptada.

Se adopta Next.js App Router como monolito, PostgreSQL con PostGIS para proximidad y Prisma para entidades estándar. SQL geográfico parametrizado. No se introduce multitenancy; la cobertura inicial es Naranjos-Amatlán y deberá validarse con una fuente geográfica autorizada antes de restringir puntos.

Toda creación queda pendiente. Identidad y evidencia se mantienen privadas; las respuestas públicas usan listas explícitas de campos. La solución comunicada no equivale a solución verificada. Roles se comprueban en servidor. No habrá autenticación de prueba accesible en producción.

Las migraciones iniciales son aditivas y su ejecución se deja explícita al operador. No se inventan ubicaciones ni se precargan reportes. Auth, storage, moderación y PWA se habilitarán solo con sus controles y verificaciones correspondientes.
