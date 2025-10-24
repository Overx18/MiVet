# **Product Backlog \- Sistema Web de Gestión Veterinaria**

## **1\. Módulo de Autenticación y Gestión de Usuarios**

* **US-01: Registro de Usuarios**  
  **Descripción**: Como usuario no autenticado, quiero registrarme con email, contraseña y datos personales para acceder al sistema.  
  **Criterios de Aceptación**:

  * Formulario con nombre, apellido, email, contraseña, teléfono, dirección.  
  * Validación de unicidad de email y formato correcto.  
  * Envío de email de confirmación con enlace funcional.  
  * Rol por defecto: Cliente.  
    **Prioridad**: Alta  
    **Estimación**: 5 puntos  
* **US-02: Inicio de Sesión**  
  **Descripción**: Como usuario registrado, quiero iniciar sesión con email y contraseña para acceder a mi dashboard.  
  **Criterios de Aceptación**:

  * Login con email/contraseña; token JWT generado.  
  * Mensajes de error claros para credenciales inválidas o cuenta no confirmada.  
  * Redirección al dashboard según rol.  
    **Prioridad**: Alta  
    **Estimación**: 3 puntos  
* **US-03: Cierre de Sesión**  
  **Descripción**: Como usuario autenticado, quiero cerrar sesión para proteger mi cuenta.  
  **Criterios de Aceptación**:

  * Botón de logout que invalida el token.  
  * Redirección a página de inicio (Home).  
    **Prioridad**: Media  
    **Estimación**: 2 puntos  
* **US-04: Recuperación de Contraseña**  
  **Descripción**: Como usuario, quiero recuperar mi contraseña vía email para restablecerla.  
  **Criterios de Aceptación**:

  * Formulario para ingresar email.  
  * Envío de enlace temporal (expira en 1 hora).  
  * Formulario para nueva contraseña con validación.  
    **Prioridad**: Media  
    **Estimación**: 5 puntos  
* **US-05: Gestión de Roles**  
  **Descripción**: Como Admin, quiero asignar/modificar/revocar roles para controlar accesos.  
  **Criterios de Aceptación**:

  * Interfaz para listar usuarios y sus roles.  
  * Opciones para cambiar roles (Admin, Cliente, Veterinario, Recepcionista, Groomer).  
  * Registro de cambios en base de datos.  
    **Prioridad**: Alta  
    **Estimación**: 5 puntos  
* **US-06: Edición de Perfil**  
  **Descripción**: Como usuario autenticado, quiero editar mi perfil para actualizar mis datos.  
  **Criterios de Aceptación**:

  * Formulario para editar nombre, email, teléfono, dirección, contraseña.  
  * Confirmación por email para cambios en email.  
  * Validación de formatos en frontend y backend.  
    **Prioridad**: Media  
    **Estimación**: 3 puntos

## **2\. Módulo de Gestión de Mascotas**

* **US-07: Registro de Mascotas**  
  **Descripción**: Como Cliente o Recepcionista, quiero registrar una mascota para asociarla a un propietario.  
  **Criterios de Aceptación**:

  * Formulario con nombre, especie, raza, edad, peso, género, fecha de nacimiento, notas.  
  * Especie seleccionada de un catálogo predefinido.  
  * Validación de campos obligatorios.  
    **Prioridad**: Alta  
    **Estimación**: 5 puntos  
* **US-08: Listado y Búsqueda de Mascotas**  
  **Descripción**: Como usuario autenticado, quiero listar y buscar mascotas para gestionarlas.  
  **Criterios de Aceptación**:

  * Lista paginada con filtros por nombre, especie, raza, propietario.  
  * Ordenamiento por edad o fecha de registro.  
  * Clientes ven solo sus mascotas; otros roles ven todas.  
    **Prioridad**: Alta  
    **Estimación**: 5 puntos  
* **US-09: Edición y Eliminación de Mascotas**  
  **Descripción**: Como Cliente, Recepcionista o Veterinario, quiero editar o eliminar mascotas para mantener datos actualizados.  
  **Criterios de Aceptación**:

  * Formulario para editar datos de mascota.  
  * Eliminación lógica (marcar como inactiva) con confirmación.  
  * Clientes editan solo sus mascotas.  
    **Prioridad**: Media  
    **Estimación**: 3 puntos  
* **US-10: Catálogo de Especies**  
  **Descripción**: Como Admin, quiero gestionar el catálogo de especies para estandarizar registros.  
  **Criterios de Aceptación**:

  * Interfaz para agregar/editar/eliminar especies (nombre, descripción).  
  * Validación de unicidad de especie.  
  * Lista de especies accesible para registro de mascotas.  
    **Prioridad**: Media  
    **Estimación**: 3 puntos

## **3\. Módulo de Gestión de Citas**

* **US-11: Programación de Citas**  
  **Descripción**: Como Cliente o Recepcionista, quiero programar citas para servicios veterinarios o de grooming.  
  **Criterios de Aceptación**:

  * Formulario para seleccionar mascota, servicio, fecha/hora, profesional(se filtra veterinarios o groomers).  
  * Validación de disponibilidad en tiempo real.  
  * Confirmación de cita con resumen.  
    **Prioridad**: Alta  
    **Estimación**: 8 puntos  
* **US-12: Calendario Interactivo**  
  **Descripción**: Como usuario autenticado, quiero ver un calendario interactivo para gestionar citas.  
  **Criterios de Aceptación**:

  * Calendario con vistas día/semana/mes; colores por servicio.  
  * Tooltips con detalles de cita.  
  * Drag-and-drop para reprogramar (con validación).  
    **Prioridad**: Alta  
    **Estimación**: 8 puntos  
* **US-13: Cancelación y Reprogramación de Citas**  
  **Descripción**: Como Cliente, Recepcionista, Veterinario o Groomer, quiero cancelar o reprogramar citas.  
  **Criterios de Aceptación**:

  * Opción para cancelar con confirmación; notificación por email.  
  * Cancelaciones \<24h requieren aprobación de Recepcionista.  
  * Reprogramación vía calendario o formulario.  
    **Prioridad**: Media  
    **Estimación**: 5 puntos  
* **US-14: Pago de Citas**  
  **Descripción**: Como Cliente o Recepcionista, quiero pagar citas para confirmarlas.  
  **Criterios de Aceptación**:

  * Integración de pago simulado (o Stripe mock).  
  * Soporte para tarjeta/transferencia; recibo digital generado.  
  * Actualización de estado a "Pagada".  
    **Prioridad**: Alta  
    **Estimación**: 8 puntos  
* **US-15: Recordatorios de Citas**  
  **Descripción**: Como Cliente, quiero recibir recordatorios automáticos de citas próximas.  
  **Criterios de Aceptación**:

  * Email 24h antes con detalles de cita y opción de cancelar.  
  * Configurable por Admin (activar/desactivar).  
    **Prioridad**: Media  
    **Estimación**: 3 puntos

## **4\. Módulo de Gestión de Servicios**

* **US-16: Catálogo de Servicios**  
  **Descripción**: Como Admin, quiero gestionar el catálogo de servicios para definir opciones disponibles.  
  **Criterios de Aceptación**:

  * Interfaz para agregar/editar/eliminar servicios (descripción, precio, duración, tipo).  
  * Validación de campos obligatorios.  
  * Lista accesible para citas.  
    **Prioridad**: Alta  
    **Estimación**: 5 puntos  
* **US-17: Asignación de Servicios a Citas**  
  **Descripción**: Como Cliente o Recepcionista, quiero asignar servicios a citas con precios calculados.  
  **Criterios de Aceptación**:

  * Selección de servicio desde catálogo durante programación.  
  * Cálculo automático de precio con ajustes opcionales.  
    **Prioridad**: Alta  
    **Estimación**: 3 puntos

## **5\. Módulo de Gestión de Inventario**

* **US-18: Registro de Productos**  
  **Descripción**: Como Recepcionista o Admin, quiero registrar productos en el inventario.  
  **Criterios de Aceptación**:

  * Formulario con nombre, descripción, cantidad, precio, proveedor, fecha de caducidad.  
  * Validación de campos numéricos y fechas.  
    **Prioridad**: Media  
    **Estimación**: 5 puntos  
* **US-19: Listado y Búsqueda de Inventario**  
  **Descripción**: Como Recepcionista, Veterinario o Admin, quiero listar y buscar productos en inventario.  
  **Criterios de Aceptación**:

  * Lista paginada con filtros por nombre, stock bajo (\<10), caducidad próxima (\<30 días).  
  * Alertas visuales para stock bajo.  
    **Prioridad**: Media  
    **Estimación**: 5 puntos  
* **US-20: Actualización de Stock**  
  **Descripción**: Como Recepcionista o Veterinario, quiero actualizar el stock para reflejar ventas o usos.  
  **Criterios de Aceptación**:

  * Formulario para entrada/salida de productos con motivo.  
  * Bloqueo de ventas si stock insuficiente.  
  * Registro de transacciones.  
    **Prioridad**: Media  
    **Estimación**: 3 puntos

## **6\. Módulo de Historial Médico**

* **US-21: Registro de Historial Médico**  
  **Descripción**: Como Veterinario o Groomer, quiero registrar el historial médico o de servicios de una mascota.  
  **Criterios de Aceptación**:

  * Formulario para diagnóstico, tratamiento, medicamentos (vinculado a inventario), notas.  
  * Vinculación a cita específica.  
    **Prioridad**: Alta  
    **Estimación**: 5 puntos  
* **US-22: Consulta de Historial Médico**  
  **Descripción**: Como Veterinario, Cliente o Admin, quiero consultar el historial de una mascota.  
  **Criterios de Aceptación**:

  * Vista cronológica con búsqueda por fecha/keyword.  
  * Clientes ven solo historial de sus mascotas (solo lectura).  
    **Prioridad**: Alta  
    **Estimación**: 5 puntos

## **7\. Módulo de Dashboards**

* **US-23: Dashboards Personalizados**  
  **Descripción**: Como usuario autenticado, quiero un dashboard personalizado según mi rol.  
  **Criterios de Aceptación**:  
  * Admin: Usuarios, citas pendientes, inventario bajo, ingresos.  
  * Cliente: Mascotas, citas próximas, historial.  
  * Veterinario: Citas del día, pacientes.  
  * Recepcionista: Citas pendientes, pagos, stock.  
  * Groomer: Citas asignadas.  
  * Gráficos simples con recharts.  
    **Prioridad**: Alta  
    **Estimación**: 8 puntos

## **8\. Módulo de Reportes**

* **US-24: Generación de Reportes**  
  **Descripción**: Como Admin, quiero generar reportes para analizar el negocio.  
  **Criterios de Aceptación**:  
  * Reportes de ingresos, citas atendidas, inventario, usuarios activos.  
  * Filtros por fecha; exportación a PDF/CSV.  
    **Prioridad**: Media  
    **Estimación**: 5 puntos

## **9\. Módulo de Configuración del Sistema**

* **US-25: Configuración General**  
  **Descripción**: Como Admin, quiero configurar parámetros del sistema para personalizarlo.  
  **Criterios de Aceptación**:  
  * Interfaz para horarios, precios base, umbrales de alertas, plantillas de email.  
  * Validación de formatos (ej.: horarios válidos).  
    **Prioridad**: Baja  
    **Estimación**: 3 puntos

## **10\. Módulo de Páginas Principales**

* **US-26: Página Home**  
  **Descripción**: Como visitante, quiero ver una página de inicio atractiva para conocer el sistema.  
  **Criterios de Aceptación**:

  * Carrusel de imágenes, servicios destacados, formulario de contacto, enlaces a registro/login.  
  * Diseño responsive con TailwindCSS.  
    **Prioridad**: Media  
    **Estimación**: 3 puntos  
* **US-27: Página Not Found (404)**  
  **Descripción**: Como usuario, quiero ver una página de error amigable si ingreso una URL inválida.  
  **Criterios de Aceptación**:

  * Mensaje claro, enlace a Home, sugerencia de búsqueda.  
  * Diseño consistente con el sistema.  
    **Prioridad**: Baja  
    **Estimación**: 2 puntos

## **11\. Tareas Técnicas**

* **US-28: Configuración Inicial del Backend**  
  **Descripción**: Como desarrollador, quiero configurar el backend para iniciar el proyecto.  
  **Criterios de Aceptación**:

  * Configuración de Express, Sequelize, MySQL, dotenv, helmet, cors.  
  * Conexión a base de datos local.  
    **Prioridad**: Alta  
    **Estimación**: 5 puntos  
* **US-29: Configuración Inicial del Frontend**  
  **Descripción**: Como desarrollador, quiero configurar el frontend para iniciar el proyecto.  
  **Criterios de Aceptación**:

  * Configuración de React, Vite, TailwindCSS, react-router-dom, axios.  
  * Estructura base con componentes reutilizables.  
    **Prioridad**: Alta  
    **Estimación**: 5 puntos  
* **US-30: Pruebas y Despliegue Local**  
  **Descripción**: Como desarrollador, quiero realizar pruebas y un despliegue local para validar el sistema.  
  **Criterios de Aceptación**:

  * Pruebas unitarias básicas para endpoints y componentes.  
  * Despliegue en entorno local con nodemon.  
  * Corrección de bugs detectados.  
    **Prioridad**: Media  
    **Estimación**: 5 puntos

