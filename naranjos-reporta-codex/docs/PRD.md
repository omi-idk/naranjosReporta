# PRD — Naranjos Reporta

## Problema
Los habitantes necesitan un lugar fácil de consultar para registrar y visualizar problemas comunitarios y aportar evidencia de su evolución. Esta hipótesis requiere validación con usuarios locales; no presupone colaboración municipal.

## Público objetivo
Habitantes de Naranjos-Amatlán, moderadores comunitarios y visitantes que consulten información pública.

## Propuesta de valor
Mapa y listado de incidencias ciudadanas con fotografías moderadas, contexto, estado transparente e historial auditable.

## Alcance MVP
1. Explorar mapa y listado de incidencias publicadas.
2. Filtrar por categoría y estado; abrir detalle.
3. Crear reporte con título, descripción, categoría, marcador manual e imágenes opcionales, sujeto a moderación.
4. Autenticarse para publicar y consultar reportes propios.
5. Aprobar/rechazar contenidos como moderador con motivo y auditoría.
6. Mantener historial de cambios e identificar reportes potencialmente duplicados por proximidad.
7. Mostrar únicamente estadísticas derivadas de datos almacenados, con DEMO identificado.

## Fuera del MVP
Integración oficial con Ayuntamiento, emergencias, pagos, publicidad, chat, avisos automáticos por WhatsApp, IA de clasificación y expansión multi-municipio.

## Políticas del dominio
- No hay garantía de atención municipal; incluir aviso visible en UI.
- Estado `SOLUCION_REPORTADA` no significa `SOLUCION_VERIFICADA`.
- Las decisiones de moderación deben incluir actor y marca temporal.
- Un reporte rechazado no debe aparecer públicamente.
- Evitar publicación de información personal o ubicaciones sensibles.

## Historias iniciales y aceptación
### US-01 Consultar reportes
Como visitante, quiero abrir un mapa/listado con reportes publicados para conocer incidencias cercanas.
**Aceptación:** los datos se obtienen del backend; hay estados vacío, error, cargando; no aparecen reportes pendientes ni rechazados.

### US-02 Crear incidencia
Como ciudadano autenticado, quiero capturar categoría, descripción, ubicación manual y evidencias opcionales.
**Aceptación:** validación servidor y cliente; reporte inicia pendiente de moderación; se registra autor privado e historial.

### US-03 Moderar incidencia
Como moderador, quiero aprobar o rechazar una publicación documentando el motivo.
**Aceptación:** autorización en servidor; transición permitida; evento auditable; contenido rechazado no se publica.

### US-04 Consultar historial
Como visitante, quiero ver estados y evidencias publicables para interpretar la evolución.
**Aceptación:** acciones no verificadas no se atribuyen a autoridades y los eventos privados no se exponen.

## Criterios no funcionales
Accesibilidad WCAG 2.2 AA como objetivo; mobile-first; privacidad por defecto; protección contra abuso; pruebas de regresión; observabilidad mínima; costos de operación bajos.

## Métricas piloto (objetivos, no hechos)
Porcentaje de formularios completados, reportes aprobados, tiempo medio de moderación, tasa de duplicados y incidencias con evidencia de actualización.
