# PRD — Naranjos Reporta

## Propósito y límites

Producto ciudadano independiente para registrar, consultar y seguir problemas comunitarios de Naranjos-Amatlán, Veracruz. No es un servicio del Ayuntamiento, una denuncia oficial ni un sistema de emergencias. No presupone colaboración municipal ni demanda validada; esas hipótesis se revisarán durante el piloto.

Este documento actualiza el alcance operativo del [PRD de arranque](../naranjos-reporta-codex/docs/PRD.md), que se conserva intacto. El estado realmente implementado se consulta en [progress.md](progress.md), no se infiere de estas historias.

## Personas y trabajo principal

Ciudadano desde teléfono: ubicar un problema y registrar contexto suficiente sin revelar datos personales innecesarios. Visitante: encontrar incidencias publicadas, entender su estado y consultar evidencia. Moderador comunitario: revisar contenido y registrar decisiones justificadas. No se modelan operadores municipales como participantes confirmados.

## Prioridad de producto

Primero el flujo vertical: explorar → seleccionar ubicación → crear autenticado → persistir pendiente → consultar seguimiento autorizado → moderar → consultar publicación. Un reporte pendiente no puede consultarse por el endpoint público; la confirmación de creación debe mantener acceso privado del autor sin saltar moderación.

Exploración, creación, detalle y moderación tienen prioridad sobre estadísticas avanzadas, confirmaciones o funciones sociales. La interfaz inicial es una herramienta, no una landing page como sustituto del producto.

## Historias y criterios de aceptación

| ID    | Prioridad | Historia                                     | Aceptación observable                                                                                                                                                  |
| ----- | --------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-01 | P0        | Como visitante, exploro incidencias          | Listado paginado y mapa obtienen datos persistidos; solo estados públicos; carga, error y vacío diferenciados                                                          |
| US-02 | P0        | Busco y filtro                               | Búsqueda, categoría, estado público y orden cambian resultados; limpiar restaura filtros; paginación acotada                                                           |
| US-03 | P0        | Selecciono ubicación                         | Marcador manual interactivo y alternativa por coordenadas; validación de rangos; no geolocalización automática                                                         |
| US-04 | P0        | Creo un reporte autenticado                  | Categoría activa, título 10–120, descripción 30–2000, coordenadas válidas y consentimiento; revisión previa; identidad del servidor; pendiente y evento en transacción |
| US-05 | P0        | Recupero mi registro                         | Confirmación con id; autor ve seguimiento pendiente mediante acceso autorizado; otro ciudadano recibe respuesta uniforme sin datos privados                            |
| US-06 | P0        | Consulto ficha pública                       | Título, categoría, estado, descripción, fecha, ubicación aproximada y eventos publicables; sin identidad ni motivos internos                                           |
| US-07 | P0        | Modero                                       | Sesión y rol verificados en servidor; aprobar/rechazar con motivo; concurrencia controlada; historial inmutable                                                        |
| US-08 | P1        | Comunico solución                            | Solo autor autorizado; solución comunicada distinta de verificada; verificar requiere moderador                                                                        |
| US-09 | P1        | Aporto evidencia opcional                    | Límites 3×5 MB, contenido JPEG/PNG/WebP comprobado, recodificación sin EXIF, almacenamiento privado y acceso autorizado; no habilitar antes de completar controles     |
| US-10 | P1        | Consulto agregados                           | Conteos por categoría/estado y evolución temporal exclusivamente de datos públicos persistidos; error no se convierte en cero                                          |
| US-11 | P1        | Identifico posible duplicado                 | Consulta de proximidad parametrizada y acotada; sugerencia informativa, nunca bloqueo automático sin revisión                                                          |
| US-12 | P1        | Reporto contenido inapropiado                | Denuncia privada con límites de abuso, confirmación y cola de revisión; procedimiento de retiro documentado                                                            |
| US-13 | P1        | Accedo desde móvil con conectividad limitada | Layout útil a 390 px, lista alternativa al mapa, estados de red, sin caché de respuestas privadas                                                                      |

## Dominio y privacidad

Estados: PENDING_MODERATION, PUBLISHED, UNDER_REVIEW, SOLUTION_REPORTED, SOLUTION_VERIFIED y REJECTED. Las transiciones deben ser explícitas y autorizadas. El evento identifica actor/fecha en almacenamiento privado; su representación pública elimina identidad y motivos sensibles.

No inventar coordenadas, límites municipales, colonias, estadísticas, fotografías o incidencias auténticas. Si se necesita demostración, los registros y agregados deben estar aislados y rotulados DEMO en todas las vistas. Precisión pública, retención y canal de eliminación requieren definición antes del piloto público.

## Fuera del MVP

Integración oficial con Ayuntamiento, emergencias, pagos, publicidad, chat, WhatsApp automático, IA de clasificación, multitenancy y expansión municipal. No incorporar servicios con costo ni despliegues públicos sin autorización.

## Calidad y puerta de piloto

TypeScript strict, lint, formato, pruebas de dominio/API e integración PostGIS. E2E del flujo ciudadano/moderador, pruebas IDOR y revisión de cargas. Capturas 1440/768/390, navegación con teclado y contraste. Revisión de dependencias y secretos. Instalación reproducible y responsable de moderación/privacidad designado antes de recibir datos reales.

Las métricas del piloto serán objetivos medidos, nunca cifras de marketing: finalización del formulario, aprobación/rechazo, tiempo de moderación, posibles duplicados y reportes con actualización. Recogerlas sin identificar visitantes innecesariamente.
