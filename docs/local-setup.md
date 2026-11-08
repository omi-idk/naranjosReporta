# Entorno local paso a paso

No hay PostgreSQL, Docker ni credenciales Supabase configurados en la máquina auditada. Esta guía está preparada, pero los servicios no se han instalado ni arrancado en esta sesión. Se necesita Docker Desktop con motor Linux y Node 24 LTS. No es necesario pagar ni crear un proyecto remoto para probar localmente.

## Opción A: Supabase local completo (recomendada para flujo ciudadano)

Supabase CLI arranca PostgreSQL, Auth y Studio con Docker. Seguir la [guía oficial](https://supabase.com/docs/guides/local-development/cli/getting-started?platform=npx&queryGroups=platform). Desde la raíz, revisar/instalar la CLI oficial antes de ejecutar sus comandos; esta sesión no descarga ni ejecuta esa CLI:

```powershell
npx.cmd supabase init
npx.cmd supabase start
npx.cmd supabase status
Copy-Item .env.example .env
```

Usar los valores que realmente imprima `status`, no asumir puertos si fueron reasignados. En `.env` configurar:

- DATABASE_URL: conexión PostgreSQL local mostrada por CLI (habitualmente puerto 54322).
- NEXT_PUBLIC_SUPABASE_URL: API local mostrada (habitualmente http://127.0.0.1:54321).
- NEXT_PUBLIC_SUPABASE_ANON_KEY: clave pública/anon local. Nunca usar service_role aquí.
- NEXT_PUBLIC_APP_URL: URL exacta donde abrirás Next, por ejemplo http://localhost:3000.

No copies la salida completa de status a Git ni al chat. `.env` está ignorado. Reinicia Next al cambiar variables públicas. El esquema inicial usa extensión PostGIS; aplicarlo solo a una base de desarrollo vacía y revisar permisos antes de ejecutar:

```powershell
npm.cmd ci
npm.cmd run db:validate
npm.cmd run db:deploy
npm.cmd run db:seed
npm.cmd run dev
```

Crear dos cuentas de prueba propias desde Auth/Users en Studio local: ciudadano y moderador (correo/contraseña elegidos por ti, confirmados solo para pruebas). Iniciar sesión con cada cuenta una vez para crear su User local; en SQL Editor asignar MODERATOR únicamente al UUID verificado de la cuenta moderadora:

```sql
-- Sustituir por UUID real de tu cuenta local; ejecutar como administrador local.
UPDATE "User" SET role = 'MODERATOR' WHERE id = '<UUID_VERIFICADO>'::uuid;
```

No existe registro público ni promoción de rol desde la aplicación. No usar personas o correos ajenos como fixtures.

Para un piloto cerrado deshabilitar también el registro público en la configuración de Auth de Supabase; ocultar una pantalla de registro no impide llamadas directas a su API. Las tablas de dominio tienen RLS activado sin políticas y privilegios revocados a anon/authenticated: solo Next debe acceder. La conexión postgres del propietario local funciona para desarrollo; un rol de servidor de producción necesita políticas explícitas limitadas a ese rol. No dar BYPASSRLS ni credenciales SQL a clientes.

## Opción B: solo PostgreSQL/PostGIS para integración

No arrancar esta opción y Supabase para la misma base de forma accidental. `compose.yaml` sirve cuando necesitas BD aislada y usarás Auth separado después:

```powershell
docker compose up -d db
Copy-Item .env.example .env
npm.cmd run db:deploy
npm.cmd run db:seed
$env:INTEGRATION_DATABASE_URL = 'postgresql://naranjos:local_only@127.0.0.1:5432/naranjos'
npm.cmd run test:integration
```

Las credenciales de compose son deliberadamente locales y el puerto solo se publica en loopback. No reutilizarlas en producción. `docker compose stop` conserva datos. No ejecutar `down -v` sobre datos que quieras conservar.

## Prueba manual del flujo

1. Abrir /acceso e iniciar sesión como ciudadano. La sesión está solo en memoria; una recarga la descarta.
2. Abrir Crear reporte por navegación interna. Usar información rotulada DEMO si haces una prueba y coordenadas seleccionadas conscientemente. Completar título, categoría, descripción y consentimiento; revisar y enviar una sola vez.
3. Comprobar detalle privado pendiente. En otro navegador anónimo, ese identificador debe devolver 404 y no aparecer en lista ni estadísticas.
4. En una segunda sesión/navegador, entrar como moderador, abrir /moderacion, escribir motivo y aprobar/rechazar.
5. Confirmar que solo el aprobado aparece en exploración, mapa y estadísticas; historial muestra transición sin identidad ni motivo interno.

Las pruebas DEMO guardadas son datos de prueba: no mezclar con piloto público. La suite de integración utiliza transacciones que se revierten y no deja fixtures. No hay demo público precargado.

## Verificación automatizada

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run test:integration
npm.cmd run build
npm.cmd run test:e2e
```

No ejecutar `next build` mientras otro `next dev` usa la misma `.next`; puede invalidar sus chunks e impedir hidratación. E2E se configura contra servidor de producción separado y requiere build previo. Capturas, trazas y reportes están ignorados. Sin INTEGRATION_DATABASE_URL la suite BD informa omisión; no equivale a PASS de integración.
