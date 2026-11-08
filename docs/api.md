# API implementada — incremento V2

JSON, rutas dinámicas no-store, validación Zod, SQL parametrizado y errores redactados. No hay API de imágenes habilitada.

| Ruta                              | Acceso                           | Respuesta                                                    |
| --------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| GET /api/categories               | Público                          | `{items: CategoryDto[]}` activas                             |
| GET /api/reports                  | Público                          | `{items,page,pageSize:20,hasMore}`                           |
| GET /api/reports/:id              | Público o Bearer opcional        | Detalle público; privados solo autor/moderador; 404 uniforme |
| POST /api/reports                 | Bearer válido                    | 201 `{id,status:PENDING_MODERATION}`                         |
| POST /api/reports/:id/transitions | Autor/moderador según transición | `{id,status,version}`                                        |
| GET /api/moderation?page=1        | Moderador                        | Cola pendiente paginada                                      |
| GET /api/session                  | Bearer válido                    | `{role}` de BD                                               |
| GET /api/stats                    | Público                          | `{total,byCategory,byStatus,monthly}` publicados             |

Contratos TypeScript: `src/features/reports/application/contracts.ts`. DTO explícito: id, título, descripción, categoría, estado, fechas, versión, latitud/longitud aproximadas y `locationPrecision`. Historial público solo id/estados/fecha; no motivos internos, actor, contacto ni storage keys.

## Consulta

GET reportes acepta `q` hasta 120, `category` UUID, `status` exclusivamente público, `page` 1–500, `sort=newest|oldest`. Proximidad opcional: latitude (−90..90), longitude (−180..180), radius (100..10000 metros), los tres juntos. Se calcula sobre el mismo punto redondeado que publica DTO, no la coordenada exacta. No hay límites municipales inventados. Los campos desconocidos se rechazan.

## Escritura

Bearer access token Supabase verificado con proveedor por solicitud; identidad local se crea solo después de verificar UUID. Rol se resuelve en BD. No se aceptan cookies ni roles del cliente. Configurar NEXT_PUBLIC_APP_URL con el origen exacto; se rechaza origen explícito ajeno y sec-fetch-site cross-site.

Crear: JSON de máximo 16 KiB; categoryId UUID activo, title 10–120, description 30–2000, latitude/longitude numéricos finitos válidos y locationConsent true. Inicio pendiente + evento en transacción. Hasta cinco reportes por autor/hora, coordinado mediante bloqueo transaccional. Reintento idéntico de un pendiente del mismo autor dentro de un minuto devuelve el mismo id. No es idempotencia durable general ni límite contra cuentas masivas.

Transición: `{to,reason,version}`, motivo 10–1000 y versión entera esperada. Dominio impide transiciones inválidas; ciudadano solo comunica solución de reporte propio; moderador aprueba/rechaza/verifica según ciclo. Hasta cien eventos por actor/hora. Bloqueo de reporte, incremento de versión, evento y decisión inicial atómicos. Historial append-only y RLS por migración.

## Errores

`{"error":{"code":"VALIDATION_ERROR","message":"Revisa los campos indicados.","fields":{}}}`. `fields` solo en validación; no se incluyen trazas ni valores privados. 400 entrada, 401 sesión ausente/inválida, 403 permiso/origen, 404 privado/inexistente, 409 transición/versión, 413 tamaño, 415 contenido, 429 cuota, 503 infraestructura. Sin DATABASE_URL o Auth configurados se devuelve fallo explícito, no datos de demostración.

## Verificación y pendientes

Pruebas unitarias de reglas/repositorio usan dobles explícitos, E2E verifica límites HTTP sin identidades. La suite PostgreSQL está preparada y omitida localmente por falta de conexión. Falta comprobar sesiones válidas, persistencia por API y concurrencia en servicios reales. Quedan denuncias, archivos, rate limit de red y flujo de recuperación/alta de cuenta fuera de este incremento.
