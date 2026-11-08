# NARANJOS REPORTA

Plataforma ciudadana open source en construcción para Naranjos-Amatlán, Veracruz. Independiente del Ayuntamiento; no es un servicio de emergencias.

## Estado

Primer incremento: portada responsive en español, dominio de estados probado, validación de creación, modelo Prisma y configuración de herramientas. **No es todavía un MVP operativo**: no recibe reportes, no tiene autenticación, mapa, almacenamiento ni moderación conectados. No contiene reportes ni ubicaciones inventadas.

## Desarrollo local

Requisitos: Node 24 LTS (el entorno inicial usa Node 26), npm, PostgreSQL con PostGIS para las futuras integraciones.

```sh
npm ci
cp .env.example .env
npm run db:validate
npm run db:generate
npm run dev
```

En PowerShell con scripts restringidos, utilizar `npm.cmd` y `Copy-Item .env.example .env`. Abrir http://localhost:3000. La portada no necesita servicios externos. Las credenciales del ejemplo son exclusivamente locales; sustituirlas antes de usar una base real.

```sh
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

## Base de datos y despliegue

El esquema no crea usuarios de Supabase ni roles administrativos. No asignar roles desde entradas del cliente. Revisar SQL y usar una base vacía antes de `npm run db:deploy`; no se ejecutan migraciones automáticamente al arrancar. PostGIS requiere permisos del administrador para instalar la extensión. No usar propietario de BD como identidad de aplicación en producción.

Para despliegue futuro: ejecutar checks y migraciones revisadas, `npm run build` y `npm start` detrás de HTTPS. Configurar Auth, storage privado, límites compartidos y política de privacidad antes de habilitar datos ciudadanos. No se ha publicado ni provisionado infraestructura.

Ver [plan](docs/implementation-plan.md), [avance](docs/progress.md), [seguridad](docs/security.md) y [decisiones](docs/adr/0001-monolito-y-privacidad.md). Licencia de código pendiente de selección explícita antes de distribución como proyecto open source.

La carpeta aportada [naranjos-reporta-codex](naranjos-reporta-codex/INICIO-CODEX.md) conserva el PRD y las instrucciones de arranque originales; el avance vigente está en `docs/progress.md` de la raíz. Las verificaciones locales pasan; quedan ocho avisos moderados de dependencias de desarrollo y pruebas de integración/seguridad pendientes antes de producción.
