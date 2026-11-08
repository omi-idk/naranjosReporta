# Naranjos Reporta — Instrucciones permanentes para Codex

## Misión
Construir y mantener Naranjos Reporta, una PWA ciudadana **independiente y no oficial** para visibilizar, geolocalizar y dar seguimiento a incidencias comunitarias de Naranjos-Amatlán, Veracruz. El repositorio es open source. La aplicación no sustituye servicios de emergencia ni sistemas oficiales.

## Fuentes de verdad
1. `docs/PRD.md`: alcance, historias y restricciones del producto.
2. `docs/architecture.md`: arquitectura y decisiones técnicas (crear cuando se inicie la implementación).
3. `docs/implementation-plan.md`: fases, criterios de aceptación y dependencias (crear antes de codificar).
4. `docs/progress.md`: estado real de la implementación, bloqueos y resultados de pruebas.
5. `docs/agents/*.md`: responsabilidades y listas de revisión por especialidad.

Si faltan documentos, créalos incrementalmente; si el código contradice la documentación, analiza la divergencia antes de modificar cualquiera de los dos.

## Orquestación
El agente principal ejerce como **Tech Lead y Orquestador**: inspecciona el repositorio, divide el trabajo, controla dependencias, integra cambios y valida resultados. No delegar por delegar: las tareas breves o fuertemente acopladas se ejecutan directamente.

Roles especializados: `product`, `ui-ux`, `frontend`, `backend`, `data-geo`, `security`, `qa`, `devops`. Sus responsabilidades están en `docs/agents/`. Si Codex dispone de subagentes, delega tareas independientes y asigna propiedad explícita de archivos. Si no dispone de ellos, aplica estos roles secuencialmente. **Los roles escritos en Markdown no crean procesos/agentes por sí solos.**

### Contrato para delegaciones
Cada tarea debe incluir: objetivo, alcance, archivos propios, entradas, criterios de aceptación, pruebas exigidas, restricciones y formato de entrega. Cada resultado debe contener cambios realizados, pruebas ejecutadas con salida real, riesgos y pendientes.

### Protocolo para evitar conflictos
- No permitir que dos agentes editen el mismo archivo simultáneamente.
- El orquestador es dueño de `package.json`, lockfile, migraciones compartidas, `AGENTS.md` y configuración global, salvo transferencia explícita.
- Los agentes que revisan seguridad o QA pueden trabajar en lectura mientras otros implementan.
- Integrar un incremento a la vez; revisar diffs antes de continuar.
- Nunca inventar resultados de pruebas ni afirmar que una tarea se completó sin evidencia.

## Stack previsto (validar versiones y compatibilidad)
- Next.js App Router + TypeScript `strict`; React, Tailwind CSS, shadcn/ui.
- Backend inicialmente dentro de Next.js, monolito modular por funcionalidades.
- PostgreSQL + PostGIS; Prisma para CRUD convencional y SQL parametrizado para operaciones geográficas.
- Leaflet + OpenStreetMap, respetando las condiciones de uso del proveedor de teselas.
- Autenticación y almacenamiento a seleccionar tras un ADR (opciones: Supabase Auth/Storage).
- Zod, Vitest, Playwright, ESLint, Prettier, GitHub Actions.
- No introducir microservicios, colas ni infraestructura costosa antes de justificar su necesidad.

## Módulos de dominio
Categorías, reportes, ubicaciones, evidencias, identidades y roles, moderación, historial de eventos, confirmaciones ciudadanas y métricas agregadas. Modelar estados y transiciones explícitas; distinguir `solución reportada` de `solución verificada`.

## Reglas de implementación
1. Inspeccionar `git status`, estructura y convenciones antes de cada lote importante. No reemplazar trabajo ajeno.
2. Definir primero historia, criterios de aceptación, riesgos y pruebas.
3. Mantener código en español o inglés según una convención uniforme elegida en un ADR; interfaz pública en español mexicano.
4. Aplicar separación de responsabilidades; evitar sobreingeniería y abstracciones especulativas.
5. Validar en servidor, autorizar por recurso y registrar eventos relevantes.
6. Dar preferencia a componentes accesibles, diseños mobile-first, estados vacíos, de carga y error.
7. Usar datos `DEMO` inequívocos; nunca presentar coordenadas, estadísticas, colonias o incidencias ficticias como reales.
8. Si una herramienta falla o no está disponible, registrar el bloqueo y proseguir solo con tareas independientes.
9. No ejecutar `git push`, crear repositorios remotos, desplegar, pagar servicios, borrar datos o aplicar migraciones destructivas sin consentimiento explícito.
10. Mantener `.env.example`; jamás subir secretos, identificadores sensibles ni datos personales reales.

## Seguridad, privacidad y confianza
- No exponer identidad/contacto de autores en vistas públicas; minimizar PII.
- No obtener localización del dispositivo sin consentimiento. Permitir elegir un punto manualmente.
- Considerar imprecisión deliberada de ubicaciones sensibles y retirar metadatos EXIF de imágenes.
- Exigir revisión/moderación inicial de contenido público, límites de tasa, carga segura, mecanismos de denuncia y retiro.
- No afirmar atención municipal, estatus oficial o reparación verificada sin evidencia.
- Preparar políticas de privacidad, conservación, eliminación y accesibilidad antes de publicar en producción.
- Proteger contra IDOR/BOLA, XSS, SQL injection, CSRF cuando aplique y abuso de almacenamiento.

## Puerta de calidad
Antes de marcar un incremento como terminado: instalar/compilar cuando sea posible, ejecutar lint, typecheck, pruebas apropiadas, verificar autorización, accesibilidad básica y revisar errores de consola. Documentar los comandos exactos y sus resultados en `docs/progress.md`. Nunca falsificar verificaciones.

## Flujo de trabajo
**Fase 0:** auditar repositorio, contrastar PRD y escribir `docs/implementation-plan.md` y ADR inicial. **Fase 1:** andamiaje, configuración, esquema y ambiente local. **Fase 2:** servicios y API de reportes/categorías. **Fase 3:** UI responsive y mapa. **Fase 4:** identidad, almacenamiento y moderación. **Fase 5:** E2E, seguridad, documentación y piloto con datos DEMO.

Al finalizar cada fase: describir archivos editados, explicar decisiones, informar pruebas efectivamente corridas, actualizar `docs/progress.md` y proponer el siguiente incremento seguro. Si el contexto se agota, dejar instrucciones reproducibles para continuar.
