# Roadmap — Naranjos Reporta

Plan de entrega incremental, no declaración de funcionalidades terminadas. Los resultados reales y bloqueos viven en [progress.md](progress.md).

| Fase                | Resultado                                                                        | Dependencias                                     | Puerta de aceptación                                                 |
| ------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| 0. Auditoría V2     | Estado clasificado, configuración revisada, fuentes de verdad enlazadas          | Repositorio y documentación existente            | Diferenciar implementado/verificado, parcial, solo visual y ausente  |
| 1. Experiencia      | Navegación y workspace neutral azul, exploración lista/mapa y formulario         | Sistema de diseño, contratos API                 | Acciones reales; carga/error/vacío; revisión 1440/768/390            |
| 2. Persistencia/API | PostgreSQL/PostGIS, lectura filtrada, creación transaccional y errores uniformes | BD de prueba; autenticación para escrituras      | Validación estricta, SQL parametrizado, paginación acotada y pruebas |
| 3. Flujo vertical   | Explorar, seleccionar punto, crear, persistir y recuperar                        | API, sesión verificada y UI integrada            | E2E real con autor; pendiente privado; no simulación de persistencia |
| 4. Moderación       | Cola, aprobación/rechazo, historial y seguimiento                                | Roles de servidor y control de concurrencia      | Pruebas 401/403/404, IDOR, auditoría y transiciones inválidas        |
| 5. Estabilización   | Evidencia segura, denuncias, estadísticas, PWA y piloto                          | Storage privado, controles de abuso y privacidad | E2E, revisión de seguridad, accesibilidad y guía de operación        |

## Secuencia del siguiente incremento

1. Sustituir la portada comercial por navegación compacta y acceso al explorador.
2. Establecer contratos públicos de categorías, reportes y error; no serializar entidades completas.
3. Integrar lectura y mapa Leaflet. Diferenciar infraestructura no configurada de una base vacía.
4. Implementar selección manual y formulario con validación compartida y revisión previa.
5. Conectar identidad verificada y creación pendiente atómica; confirmar id y acceso privado del autor.
6. Probar persistencia/recuperación con PostGIS real y luego moderación/publicación.

## Condiciones de lanzamiento piloto

BD migrada y probada, HTTPS, Auth y storage configurados, moderadores designados, límites compartidos contra abuso, denuncias operativas, política de retención/eliminación y privacidad, licencia seleccionada y documentación reproducible. Datos de demostración aislados. No afirmar que la solución está verificada por autoridades ni que genera una solicitud oficial.

No hacer push, publicar, provisionar servicios con costo, modificar producción ni ejecutar migraciones destructivas sin autorización explícita. Una dependencia externa pendiente permite continuar tareas independientes, pero impide declarar verificado el flujo que depende de ella.
