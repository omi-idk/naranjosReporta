# Revisión de seguridad y calidad — incremento V2

## Alcance y método

Revisión defensiva local del código y pruebas automatizadas. No se realizan pruebas intrusivas a servicios externos. La revisión no constituye una certificación para producción. Se consultaron las [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) durante este incremento para revisar semántica, foco, formularios, estados asíncronos, navegación y desbordamientos.

## Auditoría de partida

- `src/features/reports/domain/report.ts`: validación Zod estricta y autorización pura de transiciones presentes. La regla permite que solo el autor comunique solución y reserva verificación a moderadores. No representa autorización de endpoint hasta verificar sesión y rol en servidor.
- `prisma/schema.prisma`: identidad separada de la publicación; eventos y decisiones registran actor privado. El rol no tiene un campo que el formulario ciudadano deba aceptar.
- `prisma/migrations/202611080001_initial/migration.sql`: índice espacial y triggers append-only presentes, sin ejecución verificada en PostgreSQL en la auditoría inicial.
- `src/app/page.tsx`: al comenzar V2 solo había portada estática; no existían mapa, carga de archivos ni rutas de incidencias que pudieran considerarse funcionales.

## Bloqueantes antes de piloto público

1. Probar migraciones y casos de integración contra PostgreSQL/PostGIS real; el SQL generado o los mocks no prueban integridad transaccional ni permisos SQL.
2. Configurar Auth y validar el flujo completo con usuarios reales de prueba y roles de BD controlados. No aceptar roles desde metadatos editables del proveedor ni del cliente.
3. No habilitar cargas hasta implementar validación por contenido, recodificación sin EXIF, límites, autorización y storage privado. No basta validar la extensión.
4. Configurar responsable y procedimiento de denuncias, retiro, retención y eliminación. No presentar políticas propuestas como automatizaciones implementadas.
5. Resolver o aceptar explícitamente los avisos de dependencias con una revisión de impacto; no aplicar actualizaciones mayores forzadas sin pruebas.

## Pruebas de navegador

La configuración está en `playwright.config.ts`. Se descargó Chromium mediante Playwright con aprobación; no existía navegador de Playwright previamente. Capturas y trazas se guardan en directorios ignorados por Git.

`npm.cmd exec playwright -- test tests/e2e/api-boundaries.spec.ts`: **5 pruebas pasaron** contra la aplicación local. Verifican rechazo de creación sin sesión (401), filtros con estados privados (400), consultas geográficas inválidas (400), mutación de origen ajeno (403), y acceso sin sesión a cola/transiciones (401). No usan datos ciudadanos ni crean reportes. Esto prueba límites HTTP reales, no persistencia exitosa ni roles de sesiones válidas.

`npm.cmd run typecheck`: pasó tras añadir la configuración y los tests.

Verificación final tras integrar PWA y correcciones visuales: `$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:3001'; npm.cmd exec playwright -- test` contra el build de producción local: **11/11 pruebas pasaron en 7.3 s**. Incluye cinco pruebas de API, navegación, edición de coordenadas manuales con marcador visible, título demasiado corto inválido, consentimiento desmarcado inicialmente, desbordamientos y cambio lista/mapa en 1440/768/390 px. Se esperó a que las imágenes de todas las teselas cargaran y finalizara su transición de opacidad antes de capturar. No se enviaron reportes ni se usaron usuarios ficticios como ciudadanos reales.

La prueba PWA verificó registro/control del service worker en producción, navegación offline con aviso “Necesitas conexión para continuar” y contenido de Cache Storage limitado exactamente a `/offline.html`, incluso después de solicitar API de reportes y sesión. No hay caché de reportes, sesiones o teselas por el service worker.

Las pruebas iniciales contra el servidor de desarrollo fallaron porque no se completaba la hidratación: el trace contenía chunks 200 pero ningún fetch de efectos de React y handshakes HMR inválidos. La hipótesis operativa fue conflicto entre dev y build sobre `.next`; la verificación se aisló en servidor de producción puerto 3001 y pasó. No ejecutar build y dev compartiendo ese directorio. La primera ejecución de producción en sandbox bloqueó teselas con `ERR_NETWORK_ACCESS_DENIED`; se repitió con escalación aprobada y cargó OpenStreetMap real. La configuración de Playwright ahora inicia `npm run start` en 3001; exige build previo.

Los 503 de categorías/reportes permanecen visibles en consola y pantalla porque no está configurada la base de datos; **no se presentan como un flujo de persistencia completado**. No se detectaron errores JavaScript no capturados en las tres pruebas responsive.

## Revisión visual renderizada

Se inspeccionaron mediante `view_image` las capturas de `test-results/interface-exploración-no-desborda-a-{ancho}px-chromium/` para 1440, 768 y 390 px. También se capturan las pestañas lista y mapa para tablet y móvil. No se observó desbordamiento horizontal, solapamiento de navegación o controles, ni texto cortado fuera de su contenedor; el mapa cargó teselas completas y conservó atribución visible.

Crítica comunicada al integrador y corregida: se colapsó la altura mínima en vista lista móvil/tablet y los textos auxiliares del mapa subieron a 12 px. Se volvieron a inspeccionar las capturas finales de 1440/768/390: el error ya no deja un bloque blanco interno innecesario y los textos son legibles sin solaparse. Estas observaciones visuales no equivalen a una auditoría WCAG AA completa ni una medición automatizada de contraste de todos los estados.

Hallazgos menores de Web Interface Guidelines comunicados y estado:

- `src/app/reportes/nuevo/page.tsx:73` — se añadió foco al error agregado; queda pendiente asociación detallada de cada error Zod por campo.
- `src/app/reportes/nuevo/page.tsx:234` — corregido: nombres e inputMode de coordenadas; autocomplete explícito de campos.
- `src/app/reportes/nuevo/page.tsx:179` — pendiente: advertencia de salida con cambios sin enviar. El botón Editar conserva los datos durante la revisión; no equivale a conservar borrador entre rutas o recargas.

Los números de línea corresponden a la revisión y pueden desplazarse al integrar cambios.

## Revisión cruzada del backend V2

- `src/features/reports/infrastructure/auth.ts`: identidad verificada con proveedor y rol resuelto desde User, no desde campos del formulario ni metadatos editables; ausencia de sesión rechazada.
- `src/features/reports/infrastructure/http.ts`: lectura JSON limitada a 16 KiB contando bytes reales, rechazo de origen explícito ajeno, respuestas no-store y errores internos redactados. El origen de producción debe configurarse explícitamente; el fallback al URL del request es para desarrollo.
- `src/features/reports/infrastructure/repository.ts`: consultas parametrizadas y ordenamiento limitado a valores enumerados; DTO explícito sin identidad. Creación y transiciones transaccionales con bloqueo por actor y registro de eventos. Cuota persistida de cinco reportes/hora por autor; aún falta protección compartida contra abuso distribuido por origen/proveedor.
- `src/features/reports/infrastructure/repository.ts`: ubicación pública redondeada a tres decimales y proximidad calculada sobre esa misma ubicación aproximada para evitar reconstrucción por consultas de distancia a la coordenada exacta. El índice espacial de ubicación exacta no acelera esa expresión; añadir un índice de expresión con una migración revisada si las mediciones lo requieren.
- Autorización positiva con sesiones válidas, IDOR sobre registros de usuarios diferentes, carreras concurrentes y rollback siguen pendientes de integración con servicios reales. No declarar esos controles verificados solo por lectura de código.

## Criterio de privacidad revisado

Listas, detalle, mapa y estadísticas deben tener el mismo filtro de visibilidad. Un 404 para recursos no visibles debe ser indistinguible de uno inexistente. DTO públicos deben excluir identidad, correos, claves de almacenamiento y motivos internos. Ubicación pública aproximada no equivale a anonimización completa; el operador debe revisar posibles domicilios sensibles y evitar consultas de proximidad que reconstruyan coordenadas exactas.
