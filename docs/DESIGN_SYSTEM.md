# Sistema de diseño — Naranjos Reporta

## Dirección

Una herramienta cívica de consulta y seguimiento, con lenguaje de producto digital. La interfaz debe ayudar a encontrar un problema, ubicarlo y seguir su evolución. El mapa y los resultados son contenido principal; no una ilustración junto a un mensaje comercial.

Se adopta una composición compacta, neutral y precisa: superficies claras, bordes discretos, texto grafito y azul para acciones. El naranja identifica la marca con moderación. El verde se reserva a estados positivos verificados. No usar gradientes decorativos, grandes héroes, tarjetas de relleno, cifras inventadas ni sombras dominantes.

Guías aplicadas: `frontend-design` y `ui-ux-pro-max`, instaladas en `.agents/skills/`. Se revisaron `search.py` y sus importaciones antes de considerar su ejecución. No se ejecutó el buscador: `python`, `python3` y `py` no están disponibles. Las decisiones siguientes son una síntesis de los requisitos y de `references/quick-reference.md`, no resultados de una búsqueda inexistente.

## Tokens

| Rol               | Valor     | Uso                                    |
| ----------------- | --------- | -------------------------------------- |
| Fondo             | `#F8FAFC` | Área de trabajo                        |
| Superficie        | `#FFFFFF` | Formularios, lista y paneles           |
| Texto             | `#172334` | Títulos y contenido                    |
| Texto secundario  | `#526174` | Ayuda, fechas y descripción contextual |
| Borde             | `#D8E0EB` | Separadores y controles                |
| Acción            | `#315FBB` | Botón principal, enlaces, selección    |
| Acción hover      | `#244B99` | Respuesta al puntero                   |
| Acción suave      | `#EDF3FF` | Fondo seleccionado                     |
| Acento marca      | `#E88B52` | Símbolo y detalles no textuales        |
| Error             | `#B42332` | Validación y fallo                     |
| Error suave       | `#FFF1F2` | Mensajes de error                      |
| Advertencia       | `#895407` | Pendiente y cautelas                   |
| Advertencia suave | `#FFF7E6` | Fondo de avisos                        |
| Verificado        | `#236548` | Solución verificada                    |
| Verificado suave  | `#EAF7EF` | Fondo de estado positivo               |

El acento naranja no es texto normal sobre blanco: no ofrece el contraste necesario. Medir contraste de las parejas implementadas antes de declarar conformidad. El color nunca comunica un estado sin su etiqueta escrita.

Espaciado: 4, 8, 12, 16, 24, 32 y 48 px. Radios: controles 8 px, paneles 12 px. Bordes de 1 px; sin sombra en filas. Reservar elevación suave para elementos flotantes reales. Foco visible de 3 px con separación de 3 px. Las capas del mapa no deben tapar navegación ni diálogos.

Tipografía: sans legible disponible localmente, con `Segoe UI` como primera opción del entorno Windows y fallback de sistema. Se conserva una carga inicial ligera, sin solicitudes a un proveedor tipográfico externo. Base 16 px/1.5; secundario 14 px/1.5; etiqueta 14 px/600; título de pantalla 28–36 px/1.15. No escalar titulares con viewport hasta dominar la primera pantalla. Identificadores largos admiten corte con `overflow-wrap: anywhere`.

## Arquitectura de navegación

Navegación principal: Inicio, Explorar y Crear reporte; Acceso/Perfil como utilidad. Mapa es una vista de Explorar y debe poder abrirse mediante URL o enlace directo, evitando dos listas de filtros independientes. Moderación solo se ofrece a un rol confirmado; ocultar el enlace no sustituye autorización en servidor.

En móvil, conservar marca y Crear reporte visibles; las opciones restantes pueden envolver o usar una navegación compacta operable por teclado. No introducir menú sin implementar apertura, cierre, foco y estado expandido.

## Pantallas

### Inicio

Título literal de producto y propósito, una frase de contexto y dos acciones: Explorar reportes y Crear reporte. A continuación, explorador real o un enlace a él claramente identificado. El primer viewport no debe cerrarse como un póster. Explicación breve del proceso y aviso de independencia institucional al pie. No repetir seis tarjetas de categoría sin resultados o acción útil.

### Explorar

Barra de búsqueda y filtros por categoría y estado. Ordenamiento explícito. Filtros persistidos en URL cuando sea viable; no perderlos al volver del detalle. Aplicar y Limpiar deben producir resultados observables.

En escritorio desde 1024 px: listado aproximadamente 420 px y mapa flexible. Ambos muestran el mismo conjunto filtrado y cada marcador abre la ficha correspondiente. A 768 px, priorizar distribución legible antes que forzar dos paneles estrechos. A 390 px: selector Lista/Mapa y un solo panel principal visible; cambiar de vista no reinicia filtros.

Lista de filas informativas: categoría, título, estado, fecha y ubicación aproximada. El título es enlace real al detalle. No encerrar toda una fila interactiva alrededor de otros botones. Paginación limitada con botones Anterior/Siguiente y estado de disponibilidad.

El mapa reserva altura antes de cargar, incluye atribución y controles de zoom. No afirmar encuadre municipal sin coordenadas verificadas. Una vista inicial amplia y neutral es preferible a inventar un centro local. La ausencia de teselas o conectividad muestra un mensaje útil; el listado continúa disponible.

### Crear reporte

Una sola página con tres secciones: Qué ocurre, Dónde ocurre y Revisar antes de enviar. Título y categoría antes de descripción. Etiquetas visibles y ayuda concreta; no solicitar contacto ni nombre. Foto opcional solo cuando la subida cumpla validación, privacidad y almacenamiento.

Ubicación manual por mapa, con entradas de latitud/longitud como alternativa accesible. Mostrar coordenadas seleccionadas y permitir corregirlas. La ubicación del dispositivo requiere una acción explícita y consentimiento; nunca pedirla al abrir la página.

Validar junto a cada campo y enfocar resumen enlazado si hay varios errores. Mantener valores tras fallo. Antes de enviar, mostrar resumen y explicar que el reporte quedará pendiente de moderación. Deshabilitar envío mientras hay una solicitud; un doble clic no debe crear dos incidencias. El éxito muestra identificador y acceso autorizado al detalle o seguimiento propio, sin hacer pública la incidencia pendiente.

### Detalle

Ficha de incidencia: identificador breve, título, categoría, fecha y estado arriba. Evidencia aprobada, descripción revisada, ubicación aproximada e historial público después. No publicar identidad, claves de storage, ubicación privada ni razones internas. Una solución comunicada se etiqueta como tal; no usar lenguaje de atención municipal.

### Moderación

Cola paginada con elementos pendientes. Vista de evidencia privada autorizada y contenido antes de decidir. Aprobar y Rechazar son acciones distintas; el rechazo exige motivo y ambos registran actor/fecha en auditoría. Mostrar conflictos de versión y refrescar la ficha; no repetir decisiones automáticamente.

## Estados y contenido

| Estado técnico     | Etiqueta pública                             |
| ------------------ | -------------------------------------------- |
| PENDING_MODERATION | Pendiente de revisión, solo autor/moderación |
| PUBLISHED          | Publicado                                    |
| UNDER_REVIEW       | En seguimiento                               |
| SOLUTION_REPORTED  | Solución comunicada                          |
| SOLUTION_VERIFIED  | Solución verificada                          |
| REJECTED           | No publicado, solo autor/moderación          |

Una respuesta correcta sin elementos usa “No hay reportes con estos filtros” y acción Limpiar filtros. Fallo de API usa “No pudimos cargar los reportes” y Reintentar. No reemplazar un error por cero reportes. Infraestructura ausente no se presenta como catálogo vacío. Carga con texto de estado y espacio reservado; cambios de resultado se anuncian con `aria-live="polite"` sin mover foco.

Datos DEMO, si se añaden, llevan etiqueta textual persistente en marcador, fila, ficha y estadísticas. No mezclar cifras DEMO con cifras públicas.

## Aceptación de diseño y revisión

- Todas las acciones visibles producen navegación o cambio de estado real.
- Navegación completa con teclado; foco visible y no oculto por elementos fijos.
- Inputs con label, errores asociados y `autocomplete` correcto en acceso.
- Controles táctiles de al menos 44 px como meta de comodidad; no depender de hover ni arrastre.
- No desbordamiento horizontal a 390, 768 y 1440 px; probar también texto ampliado.
- Los badges conservan etiqueta; filas y nombres largos pueden envolver.
- Respetar `prefers-reduced-motion`; no añadir animación decorativa.
- Capturas reales de las tres anchuras y una revisión crítica posterior. Estas especificaciones no constituyen verificación visual.

La conformidad WCAG 2.2 AA es un objetivo que requiere pruebas; no se presume por utilizar componentes semánticos.
