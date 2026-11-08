# ADR 0003: transacciones SQL, sesión y exploración real

Estado: aceptado para incremento V2.

Se mantiene Prisma para esquema, cliente generado y migraciones. El primer repositorio usa pg parametrizado para operaciones completas porque ubicación PostGIS y eventos deben ejecutarse en una sola transacción. Evita coordinar dos clientes o escrituras parciales. No se cambia base de datos ni se introduce memoria como reemplazo; medir antes de añadir capas.

Supabase valida tokens mediante /auth/v1/user en servidor. User local se crea como ciudadano después de verificar identidad; rol nunca se copia de metadatos editables. El navegador conserva access token solo en contexto React, sin localStorage ni refresh token persistente. Recargar exige nuevo acceso; el piloto requiere cuentas provisionadas por operador, sin registro público todavía. Caducidad devuelve 401. Cerrar sesión borra acceso local; revocación global no implementada.

Creación y cambios de estado usan transacción, bloqueo por actor, cuotas en BD y versión esperada. DTO público excluye identidad, motivos internos y coordenadas precisas; coordenadas redondeadas a tres decimales. Proximidad usa esa misma precisión para evitar inferir puntos exactos mediante consultas. Índice de expresión/medición pendiente; el GiST original no acelera esa expresión.

La interfaz muestra error de infraestructura si faltan servicios, nunca cero inventado. Mapa OSM carga por red sin precache ni descarga masiva; requiere atribución y revisión de política del proveedor para escalar. Encadre general de México no representa límites ni centro municipal verificado.

Configuración Codex contrastada con [referencia oficial](https://learn.chatgpt.com/docs/config-file/config-reference) y [subagentes](https://learn.chatgpt.com/docs/agent-configuration/subagents): agents.enabled, max_concurrent_threads_per_session y archivos independientes con name, description, developer_instructions. No se cambian modelos ni permisos. Validación sintáctica/local de carga pendiente cuando CLI instalada lo permita; la ejecución de subagentes en esta sesión se hizo con herramientas disponibles, no por los archivos TOML recién creados.

Validación posterior: `codex.cmd --strict-config doctor --summary` fuera del sandbox cargó configuración sin fallos (22 OK, 3 advertencias opcionales del entorno/MCP). El intento dentro del sandbox no resolvía HOME. No se cambiaron permisos ni configuración global para corregirlo.

La segunda migración habilita RLS sin políticas y revoca privilegios de roles anon/authenticated si existen, para evitar acceso directo por PostgREST en Supabase. El propietario de la BD local puede acceder; un rol dedicado de producción requiere políticas propias revisadas. RLS por sí solo no protege TRUNCATE, por ello se revocan privilegios.
