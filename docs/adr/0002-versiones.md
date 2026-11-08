# ADR 0002: versiones verificadas y reproducibilidad

Estado: aceptada para el primer incremento.

El registro npm consultado el 8 de noviembre de 2026 UTC devolvió Next 16.4.5, React 19.3.1, Vitest 5.1.0 y Prisma 8.0.0-rc.33. Se elige Prisma 7.10.1 estable para evitar una candidata de lanzamiento. Next exige Node >=20.9; Prisma 7.10.1 admite >=24 y Vitest 5 admite Node 24 o >=26. Se recomienda Node 24 LTS para CI/producción y se prueba localmente con Node 26.13.0.

Fuentes: https://nextjs.org/docs/app/getting-started/installation y https://www.prisma.io/docs/orm/reference/system-requirements; los metadatos `npm view` de las versiones concretas son la comprobación efectiva para instalar. Dependencias directas fijadas y lockfile versionado. Revalidar en actualizaciones; no depender de `latest` en CI.

Tailwind se configura desde el inicio. shadcn/ui y Leaflet se añadirán en el incremento de formularios y mapas, al existir componentes que los necesiten. No se genera un service worker vacío que sugiera capacidades offline inexistentes.

La instalación de TypeScript latest resolvió a 7 y falló en typescript-eslint; se fija 6.0.3. ESLint 10 produjo conflictos de peer dependencies con los plugins de Next y se fija temporalmente 9.39.5. Esta versión está deprecada y la instalación final informa ocho avisos moderados de herramientas de desarrollo; la actualización compatible queda pendiente, sin forzar majors ni presentar el entorno como libre de vulnerabilidades.
