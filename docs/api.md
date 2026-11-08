# Contrato API previsto — aún no implementado

No hay endpoints de incidencias habilitados en este incremento. Las siguientes rutas son contrato de trabajo, no capacidades disponibles.

| Ruta                              | Acceso                             | Comportamiento                                                      |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| GET /api/categories               | Público                            | Categorías activas                                                  |
| GET /api/reports                  | Público                            | DTO públicos, cursor, categoría, estado público, proximidad acotada |
| GET /api/reports/:id              | Público                            | 404 uniforme si privado o inexistente                               |
| POST /api/reports                 | Ciudadano                          | Validación estricta, pendiente y evento atómicos; 201               |
| POST /api/reports/:id/transitions | Autor o moderador según transición | Versión esperada, motivo, transacción; 409 ante concurrencia        |
| POST /api/reports/:id/images      | Autor                              | Evidencia privada recodificada; límites y cuota                     |
| POST /api/reports/:id/flags       | Autenticado                        | Denuncia privada, idempotencia y límite de frecuencia               |
| GET /api/stats                    | Público                            | Agregados solo de publicaciones visibles                            |

Error uniforme: `{ "error": { "code": "VALIDATION_ERROR", "message": "Revisa los campos indicados" } }`. No incluir trazas ni valores sensibles. 400 entrada inválida; 401 sin sesión; 403 operación prohibida; 404 recurso no visible; 409 conflicto; 413 tamaño; 429 límite; 503 infraestructura no disponible.

DTO público previsto: id, título, descripción revisada, categoría, estado, ubicación pública aprobada, fechas e historial con motivos públicos redactados. Nunca serializar modelos Prisma directamente. Precisión pública de coordenadas pendiente de decisión de privacidad antes del lanzamiento.
