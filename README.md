# NARANJOS REPORTA

Plataforma ciudadana independiente para Naranjos-Amatlán, Veracruz. No es un servicio oficial del Ayuntamiento ni un servicio de emergencias. Un reporte no constituye una denuncia oficial.

## Estado real

La aplicación ya contiene explorador con búsqueda/filtros/paginación, mapa Leaflet interactivo, selección manual, formulario con revisión, detalle e historial, acceso Supabase, moderación y estadísticas. Las rutas están conectadas a PostgreSQL/PostGIS real, **sin reemplazo en memoria**. PWA con aviso offline; no permite enviar reportes sin red.

**Todavía no está lista para un piloto público.** Falta configurar y probar PostgreSQL/Supabase: no se ha verificado un registro exitoso de extremo a extremo con esos servicios. La carga de fotografías está deshabilitada. Faltan límites de red/IP, denuncias y operación de privacidad. No contiene reportes ni estadísticas inventadas.

## Iniciar desde cero

Requisitos: Node 24 LTS y npm. La interfaz puede abrirse sin BD y muestra el error de servicio correspondiente. Para recibir datos se necesita PostgreSQL/PostGIS y Auth; seguir [la guía local completa](docs/local-setup.md), con opción Supabase local mediante Docker y alternativa PostgreSQL aislado.

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run db:generate
npm.cmd run dev
```

Abrir http://localhost:3000. En shells sin restricción de scripts se puede usar `npm` en lugar de `npm.cmd`. No cambiar ExecutionPolicy del equipo. Configurar variables en `.env` sin subirlas a Git; las variables NEXT_PUBLIC se incorporan al build y nunca deben contener claves privilegiadas.

Después de preparar una **base local vacía** y revisar migraciones:

```powershell
npm.cmd run db:validate
npm.cmd run db:deploy
npm.cmd run db:seed
```

El seed crea solamente seis categorías, no usuarios ni incidencias. Las migraciones no se aplican automáticamente al arrancar. La segunda activa RLS y revoca acceso directo de roles públicos: el navegador debe pasar por API Next. Conexión propietaria solo para desarrollo; producción requiere un rol de servidor con políticas y permisos revisados.

## Rutas y uso

- `/`: inicio compacto y explorador real.
- `/reportes`, `/mapa`: filtros compartidos y resultados publicados.
- `/reportes/nuevo`: contexto, ubicación manual, consentimiento, revisión y envío autenticado.
- `/reportes/:id`: detalle público o privado del autor/moderador.
- `/acceso`: cuentas del piloto provisionadas por operador; sin registro público en UI.
- `/moderacion`: cola verificada en servidor; aprobar/rechazar con motivo.
- `/estadisticas`: conteos de publicaciones persistidas; un error no se presenta como cero.

La sesión vive solo en memoria; recargar exige acceso de nuevo. Iniciar sesión antes de completar el formulario. Editar la revisión conserva campos; abandonar la pantalla descarta el borrador. El token se verifica en servidor y el rol sale de la BD, nunca de entradas del cliente.

## Verificaciones

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run format:check
npm.cmd run test:integration
npm.cmd run build
npm.cmd run test:e2e
```

Integración exige INTEGRATION_DATABASE_URL sobre base aislada migrada; sin ella informa seis pruebas omitidas. E2E requiere Chromium (`npx.cmd playwright install chromium`) y build previo; inicia producción en 127.0.0.1:3001. Requiere red para comprobar teselas reales de OpenStreetMap. No ejecutar build mientras dev comparte `.next`. No se han ejecutado los jobs remotos de GitHub Actions de este incremento.

## Operación y límites

Despliegue futuro: checks, migraciones revisadas, `npm run build` y `npm start` detrás de HTTPS. Antes de publicar: validar flujo con usuarios propios, deshabilitar signup público para piloto, límites compartidos por red/origen, RLS/roles, backups, responsable/canal de denuncias y eliminación. No cachear datos sensibles. El modo offline solo muestra un aviso público; no guarda ni reenvía formularios. Respetar atribución y política de teselas del proveedor.

Sin licencia elegida explícitamente, no distribuir todavía como proyecto open source licenciado. Las skills instaladas conservan procedencia y condiciones de sus autores.

Documentación: [avance y pruebas reales](docs/progress.md), [producto](docs/PRD.md), [diseño](docs/DESIGN_SYSTEM.md), [roadmap](docs/ROADMAP.md), [arquitectura](docs/architecture.md), [API](docs/api.md), [seguridad](docs/security-review-v2.md) y [ADR](docs/adr/0003-flujo-sql-y-sesion.md). Referencias originales preservadas en `naranjos-reporta-codex/`.
