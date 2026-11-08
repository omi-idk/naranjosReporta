# Seguridad y privacidad — estado previo al lanzamiento

La portada es pública; aún no existen endpoints de reportes ni cargas. No habilitar recepción de datos hasta completar autorización y revisión de controles.

## Controles requeridos

Validar sesión con proveedor en servidor y resolver rol en BD. Rechazar pendientes/rechazados en listados, detalles, imágenes y agregados públicos. DTO con campos explícitos sin autor, email ni claves de storage. Responder igual ante recursos privados e inexistentes. Mutaciones de estado con versión esperada y auditoría transaccional. El rol SQL de aplicación no debe ser propietario ni poder modificar eventos.

Validación Zod estricta; SQL parametrizado; nunca renderizar HTML proporcionado por usuarios. Verificar origen en mutaciones basadas en cookie. Límites de frecuencia persistentes por identidad y origen, paginación acotada y límite del cuerpo antes de parsearlo. Denuncias privadas y revisión humana.

## Fotografías y ubicación

Consentimiento explícito para ubicación; selección manual disponible. Advertir sobre rostros, placas, interiores y domicilios. Recodificar imágenes y eliminar EXIF antes de guardar; bucket privado, URLs firmadas breves, autorización por reporte y moderación antes de difusión. Límite propuesto: tres imágenes, cinco MB cada una. No cachear respuestas privadas en service worker.

## Retención y eliminación

Antes de producción debe acordarse un responsable y canal de solicitud. Propuesta pendiente de aprobación: eliminar evidencia rechazada a los 30 días; revisar anualmente reportes cerrados. Borrado de objetos, derivados y copias conforme al ciclo de backups; seudonimizar identidad en auditoría conservando integridad. La inmutabilidad de eventos no permite retener datos personales indefinidamente: motivos deben excluir datos personales y la eliminación legal debe tener un procedimiento privilegiado auditado. No hay purga automática implementada.
