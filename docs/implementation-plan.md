# Plan de implementación — NARANJOS REPORTA

## Auditoría inicial

Repositorio vacío, sin commits, archivos ni convenciones existentes. Windows, PowerShell y Node 26.13 disponibles. No se detectó Docker. npm.ps1 está restringido por ExecutionPolicy; se utiliza npm.cmd sin cambiar políticas.

## Alcance y prioridades

Monolito modular Next.js App Router, React, TypeScript strict, PostgreSQL/PostGIS, Prisma, Zod, Leaflet y Tailwind. Identidad con Supabase Auth verificada en servidor; roles propios persistidos, nunca tomados de metadatos editables. Storage privado mediante interfaz. Ningún servicio remoto se provisiona ni publica en esta sesión.

1. Fundamentos: configuración reproducible, esquema, migración aditiva, pruebas y CI.
2. Dominio/API: catálogo, creación pendiente, lectura pública filtrada, proximidad parametrizada y errores uniformes.
3. Interfaz: inicio, lista, mapa interactivo, selección manual, creación y detalle accesibles.
4. Identidad/moderación: sesiones verificadas, políticas de acceso, evidencia privada, aprobación/rechazo e historial transaccional.
5. Entrega: E2E, revisión de seguridad, PWA, documentación y DEMO explícita.

## Comportamiento y aceptación antes de implementar

- Visitante: consulta exclusivamente reportes publicados y conteos derivados; jamás identidad del autor ni pendientes/rechazados.
- Ciudadano autenticado: crea con categoría activa, título 10–120, descripción 30–2000 y coordenadas válidas seleccionadas explícitamente. Resultado pendiente e historial inicial en una transacción.
- Moderador: aprueba pendiente o rechaza con motivo; todo cambio autorizado genera evento inmutable. Un ciudadano solo comunica solución de su reporte; verificarla exige moderador.
- Mapa: carga datos reales de API, permite marcador manual; geolocalización solo por acción y consentimiento. Sin coordenadas municipales inventadas: encuadre inicial neutro hasta configurar cobertura verificada.
- Evidencia: máximo 3 archivos de 5 MB, JPEG/PNG/WebP verificados por contenido, recodificación sin EXIF, claves privadas y autorización previa a lectura. No habilitar subida hasta completar controles.
- Abuso: límites compartidos persistentes, denuncias de contenido, protección CSRF/origen y validación estricta.
- QA: typecheck, lint, unitarias, integración con PostGIS y E2E del flujo ciudadano/moderador. Registrar resultados reales y bloqueos.

## Arquitectura

`src/features/*/domain` contiene reglas puras; application casos de uso; infrastructure persistencia; `src/app/api` valida límites y serializa DTO públicos; presentación en App Router. Identidad privada separada de DTO. Cambios de estado usan concurrencia optimista y transacción con auditoría. Campo de cobertura estable, sin multitenancy.

## Documentación de arranque incorporada

Se revisó la carpeta aportada después de la auditoría inicial: [PRD](../naranjos-reporta-codex/docs/PRD.md), [instrucciones](../naranjos-reporta-codex/AGENTS.md) y los ocho roles de `docs/agents/`. Se conserva intacta como referencia; el avance ejecutado se registra en el `docs/progress.md` de la raíz. Se añade al backlog detección de posibles duplicados por proximidad, sin impedir automáticamente la creación; WCAG 2.2 AA es objetivo pendiente de validación. Confirmaciones ciudadanas pertenecen al modelo pero no anteceden al flujo principal de moderación.

## Riesgos y entrega

Sin PostgreSQL, credenciales Auth/Storage ni navegador preparado no puede declararse MVP operativo. No sustituir persistencia por memoria en producción. Datos DEMO aislados y rotulados; ningún reporte auténtico inventado. Publicación, push y migraciones destructivas requieren autorización. Cada incremento actualiza progress.md y CHANGELOG.md.
