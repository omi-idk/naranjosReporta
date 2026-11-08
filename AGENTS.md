# Naranjos Reporta — reglas de trabajo

Plataforma ciudadana independiente de Naranjos-Amatlán; no oficial y no destinada a emergencias. Leer docs/PRD.md, docs/DESIGN_SYSTEM.md, docs/ROADMAP.md, docs/architecture.md y docs/progress.md antes de implementar. La carpeta naranjos-reporta-codex contiene referencias originales preservadas.

Definir aceptación antes de modificar. TypeScript strict, monolito modular, validación de límites, roles en servidor, SQL parametrizado y DTO públicos explícitos. Nunca inventar datos municipales ni presentar DEMO como real. No almacenar secretos, PII ni ubicaciones exactas en respuestas públicas. No habilitar evidencia antes de verificar contenido, recodificar y quitar EXIF.

El orquestador asigna archivos exclusivos a cada agente; conserva package.json, lockfile, migraciones, configuración e integración. Delegar solo trabajo independiente. QA y Security revisan cambios de otros agentes; registrar resultados reales y límites. Aplicar frontend-design, ui-ux-pro-max y web-design-guidelines cuando correspondan, sin ejecutar scripts desconocidos sin inspección.

No borrar trabajo ajeno, ejecutar migraciones destructivas, desplegar, crear servicios de pago ni hacer push sin autorización explícita. Antes de entregar: typecheck, lint, unitarias, build y pruebas apropiadas, inspección visual cuando disponible, docs/progress.md actualizado. No afirmar persistencia o acceso válido sin pruebas con servicios reales. La configuración declarativa no implica que los agentes estén ejecutándose.
