# Documento de Diseño UI/UX para el Frontend del Sistema de Gestión Veterinaria

## 1. Introducción

Este documento se centra exclusivamente en el diseño de la interfaz de usuario (UI) y la experiencia de usuario (UX) para el frontend del sistema web de gestión veterinaria. El objetivo es proporcionar una guía detallada y coherente para implementar una interfaz intuitiva, accesible y atractiva, alineada con los requisitos funcionales del sistema. El diseño se basa en Material UI (MUI) como framework principal para componentes, estilos y temas, eliminando cualquier dependencia de otros frameworks de estilos para mantener una consistencia absoluta con los estándares de Material Design.

El enfoque prioriza la usabilidad para diferentes roles de usuarios (Admin, Cliente, Veterinario, Recepcionista, Groomer), asegurando navegación fluida, retroalimentación inmediata y accesibilidad. Se adopta un estilo minimalista y elegante, caracterizado por simplicidad, uso abundante de espacio en blanco, líneas limpias, elementos esenciales y una paleta de colores basada en tonos azules elegantes para transmitir sofisticación, confianza y calma en un contexto veterinario. El diseño es responsive, adaptándose a dispositivos móviles y desktop, con énfasis en principios de Material Design: jerarquía visual clara, animaciones suaves y elementos interactivos intuitivos. Todos los componentes se construirán o adaptarán de Material UI para evitar inconsistencias estilísticas.

**Alcance**: Este documento cubre paleta de colores, tipografía, estilos globales, principios UX, componentes reutilizables, flujos de usuario clave y consideraciones de accesibilidad. Se integra con las librerías especificadas (e.g., Material UI + Material Icons), asumiendo una implementación en React con Vite. El diseño es realista para una clínica veterinaria mediana, completo en su cobertura de módulos y libre de ambigüedades para prevenir inconsistencias durante el desarrollo.

## 2. Principios Generales de Diseño

### 2.1 Enfoque en Material Design con Estilo Minimalista y Elegante
- El sistema seguirá las directrices de Material Design 3 (MD3) adaptadas a un estilo minimalista y elegante: reducción de elementos visuales no esenciales, enfoque en funcionalidad y uso de espacio negativo para mejorar la legibilidad y la concentración del usuario, con un toque de sofisticación a través de azules profundos.
- **Tema Personalizado**: Usar `createTheme` de Material UI para definir un tema global que se aplique a toda la aplicación vía `ThemeProvider`. Esto asegura uniformidad en colores, tipografía y componentes, con un énfasis en elegancia (e.g., botones planos con transiciones refinadas, sin sombras excesivas).
- **Responsive Design**: Implementar breakpoints de Material UI (xs, sm, md, lg, xl) para layouts adaptables. Por ejemplo, sidebars colapsables en móviles y grids flexibles que prioricen el contenido central con elegancia.
- **Accesibilidad**: Cumplir con WCAG 2.1 (nivel AA mínimo). Usar ARIA attributes integrados en componentes MUI, alto contraste en textos y navegación por teclado, asegurando que el minimalismo elegante no comprometa la usabilidad para usuarios con discapacidades.

### 2.2 Paleta de Colores
Inspirada en temas veterinarios sofisticados y minimalistas: tonos azules elegantes para evocar profesionalismo y serenidad, combinados con neutros limpios para mantener la simplicidad. La paleta evita saturación excesiva, favoreciendo combinaciones armónicas como azul profundo con grises suaves y blancos, para un aspecto refinado y moderno. Definir en el tema MUI para consistencia absoluta.

- **Primario**: #3F51B5 (azul índigo elegante, para botones principales y acentos positivos como "Confirmar cita"). Representa sofisticación y confianza, ideal para un entorno veterinario profesional.
- **Secundario**: #7986CB (azul lavanda suave, para enlaces y acciones secundarias como "Editar", combinando perfectamente con el primario para un flujo visual refinado).
- **Error**: #E57373 (rojo suave, para alertas como stock bajo, atenuado para no romper el minimalismo elegante).
- **Warning**: #FFF176 (amarillo claro, para notificaciones como caducidad próxima, usado con moderación para mantener la elegancia).
- **Success**: #3F51B5 (azul índigo, alineado con el primario para confirmaciones, e.g., pago exitoso).
- **Neutrales**: 
  - Fondo principal: #FFFFFF (blanco puro, abundante para espacio negativo minimalista).
  - Fondo secundario: #E8EAF6 (azul muy claro y elegante, para cards y secciones, combinando con el azul primario sin sobrecargar).
  - Texto principal: #212121 (gris oscuro para legibilidad alta y elegancia).
  - Texto secundario: #757575 (gris medio para descripciones, manteniendo sutileza refinada).
- **Modo Oscuro**: Soporte opcional vía `mode: 'dark'` en el tema, invirtiendo a fondos #1A237E (azul oscuro elegante) y textos #E8EAF6 (azul claro), con azul índigo como acento para preservar la armonía. Detectar preferencia del usuario con `useMediaQuery`.

Ejemplo de configuración en `theme.js`:
```jsx
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#3F51B5' },
    secondary: { main: '#7986CB' },
    error: { main: '#E57373' },
    // ...otros colores
  },
});
```

### 2.3 Tipografía
- **Fuente Principal**: Roboto (incluida por defecto en Material UI, sans-serif para alta legibilidad y minimalismo moderno con un toque elegante).
- **Escalas de Tamaños** (usando `typography` en el tema MUI, con énfasis en simplicidad y espacio):
  - h1: 2rem (títulos principales, e.g., "Dashboard", con amplio margen inferior para elegancia).
  - h2: 1.5rem (subtítulos, e.g., "Lista de Mascotas").
  - h3: 1.25rem (secciones, e.g., "Detalles de Cita").
  - Body1: 1rem (texto principal, espaciado para respiración visual refinada).
  - Body2: 0.875rem (descripciones secundarias).
  - Caption: 0.75rem (etiquetas pequeñas, e.g., fechas).
- **Estilos Adicionales**: Line-height: 1.6 para comodidad de lectura en diseños minimalistas elegantes. Peso: 400 (normal para la mayoría), 500 (medio para énfasis sutil), evitando bold excesivo para mantener la ligereza y sofisticación.
- **Personalización**: Ajustar en tema para consistencia global, priorizando texto limpio sin decoraciones innecesarias.

### 2.4 Estilos Globales y Layouts
- **Espaciado**: Usar el sistema de spacing de MUI (multiples de 8px, e.g., padding: theme.spacing(3)), con mayor énfasis en márgenes amplios para un feel minimalista, elegante y aireado.
- **Animaciones**: Transiciones integradas en MUI (e.g., ripple sutil en botones, fade en modales), minimizadas para no distraer; solo para mejorar la fluidez con refinamiento.
- **Layouts Base**:
  - **MainLayout**: AppBar superior minimalista con logo simple, menú de usuario icónico y búsqueda discreta. Drawer izquierdo colapsable para navegación, con íconos solos en vistas minimalistas. Contenido principal en Grid o Box centrado, con mucho espacio blanco para elegancia.
  - **AuthLayout**: Sin sidebar, centrado y espacioso para login/register, enfocando solo en elementos esenciales con toques azules elegantes.
- **Íconos**: Usar @mui/icons-material para íconos limpios y minimalistas (e.g., PetsIcon para mascotas, CalendarTodayIcon para citas). Tamaño estándar: 24px, en colores secundarios para armonía refinada.
- **Gráficos**: Integrar Recharts dentro de Paper components de MUI para dashboards, con líneas simples y colores azules elegantes, evitando clutter visual.

## 3. Principios UX

- **Intuitividad**: Flujos guiados paso a paso con minimalismo elegante (e.g., wizard en formulario de cita: seleccionar mascota → servicio → fecha, con solo campos necesarios visibles). Usar tooltips (MUI Tooltip) solo para clarificaciones esenciales.
- **Retroalimentación**: 
  - Notificaciones: react-hot-toast integradas con estilos MUI minimalistas (e.g., toast en azul índigo para success, sin bordes pesados).
  - Loaders: CircularProgress de MUI sutil durante fetches.
  - Errores: Alert components en tonos suaves con mensajes claros y concisos.
- **Personalización por Rol**: Dashboards dinámicos (condicionales basados en rol de Zustand), con layouts minimalistas elegantes: solo resúmenes clave, gráficos simples y espacio blanco.
- **Navegación**: 
  - Breadcrumbs (MUI Breadcrumbs) minimalistas para rutas profundas (e.g., Home > Mascotas).
  - Menú responsive: En móviles, AppBar con menú hamburguesa que abre Drawer temporal, manteniendo simplicidad y elegancia.
- **Formularios**: Usar react-hook-form con MUI TextField, Select, DatePicker. Validaciones visuales sutiles (error helpers en gris) y botones deshabilitados durante submits, con diseños limpios sin adornos.
- **Interactividad**: Drag-and-drop en calendario (integrar react-dnd con MUI Grid simple). Tablas interactivas con sorting y pagination (DataGrid de MUI, columnas mínimas).
- **Consistencia**: Todos los elementos siguen el tema MUI con paleta azul elegante. Evitar estilos personalizados para no generar inconsistencias.
- **Eficiencia**: Atajos de teclado (e.g., Enter para submit). Paginación en listas largas para no sobrecargar la UI minimalista elegante.
- **Inclusividad**: Soporte para screen readers (ARIA en MUI). Contraste mínimo 4.5:1 en azul y neutros. Opciones de zoom y texto alternativo en imágenes, asegurando que el minimalismo sea accesible.

## 4. Componentes Reutilizables

Todos basados en Material UI para consistencia, minimalismo y elegancia:

- **Button**: MUIButton con variantes planas (contained primary en azul índigo, outlined secondary). Props para loading (con CircularProgress sutil).
- **Input**: TextField minimalista con validación integrada (error prop de react-hook-form, sin bordes pesados).
- **Select**: MUI Select para dropdowns simples (e.g., especies de mascotas).
- **Modal/Dialog**: MUI Dialog limpio para confirmaciones (e.g., eliminar mascota, con fondo blanco y botones espaciados elegantemente).
- **Card**: MUICard plana sin sombras para items en listas (e.g., card de mascota con Avatar simple para foto, CardContent minimalista).
- **Table/DataGrid**: MUI DataGrid para listas paginadas (e.g., inventario con columnas filtrables y alertas condicionales en azul claro).
- **Timeline**: MUI Timeline simple para historial médico cronológico, con puntos minimalistas.
- **Chart**: Envolver Recharts en MUI Paper plano (e.g., BarChart en tonos azules elegantes para ingresos en dashboard).
- **Toast**: Personalizar react-hot-toast con colores del tema MUI, diseños aireados y refinados.
- **DatePicker/Calendar**: DesktopDatePicker y CalendarPicker de MUI para citas, con vistas minimalistas elegantes.

## 5. Flujos de Usuario Clave

- **Autenticación**: Login con TextField centrados y espaciados, botón en azul índigo. Post-login: Redirección a dashboard con fade transition suave.
- **Registro de Mascota**: Formulario stepper (MUI Stepper) minimalista: Paso 1: Datos básicos; Paso 2: Especie/Detalles; Paso 3: Confirmar, con progresión lineal simple y elegante.
- **Programación de Cita**: Dialog con Tabs limpios: Seleccionar mascota, servicio, fecha (CalendarPicker con slots destacados en azul claro).
- **Dashboard**: Grid layout aireado con Cards planas para resúmenes (e.g., Chip sutil para conteos, Chart minimalista para gráficos). Filtros con Select espaciados.
- **Historial Médico**: Accordion (MUI Accordion) simple para entradas expandibles, ordenadas por fecha con mucho espacio blanco.
- **Reportes**: Form minimalista con DateRangePicker, botón en azul índigo para generar (descarga PDF/CSV vía backend).
- **Página Home**: AppBar simple, Hero section con Typography limpia y Button en azul índigo para registro. Grid de Cards planas para servicios destacados.
- **Error 404**: Centrado con IconButton (HomeIcon en azul) para volver, texto minimalista elegante.

## 6. Consideraciones de Implementación y Pruebas

- **Integración**: Aplicar tema global en App.jsx con paleta azul elegante. Usar clsx solo si necesario para clases condicionales mínimas (sin otros frameworks).
- **Pruebas UX**: Verificar flujos en diferentes dispositivos (Chrome DevTools). Test de accesibilidad con tools como Lighthouse, enfocando en contraste azul y minimalismo elegante.
- **Optimizaciones**: Memoizar componentes con React.memo. Usar lazy loading para páginas pesadas (e.g., dashboard con gráficos), manteniendo rendimiento en diseños simples y refinados.
- **Realismo y Completitud**: Este diseño es realista para una clínica mediana, completo en su cobertura de módulos sin ambigüedades. Asegura que no haya inconsistencias al adherirse estrictamente a Material UI con paleta azul elegante, evitando mezclas de estilos que podrían confundir al usuario o desarrollador. La combinación de colores (azul índigo con neutros) promueve un ambiente sofisticado y profesional, ideal para usuarios en un contexto veterinario, mientras el minimalismo reduce carga cognitiva y mejora la eficiencia.