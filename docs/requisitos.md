# **Especificación de Requisitos de Software (ERS)**

## **1\. Introducción**

Esta Especificación de Requisitos de Software (ERS) se centra exclusivamente en los requisitos funcionales para un sistema web de gestión veterinaria. El sistema permitirá la administración eficiente de una clínica veterinaria, incluyendo la gestión de usuarios con roles diferenciados, mascotas, citas, servicios, inventario y historial médico. Se incluirán funcionalidades como un calendario interactivo, pagos de citas, páginas principales (home y not found), dashboards personalizados por rol, reportes para administradores y configuración del sistema. Los requisitos son realistas, basados en escenarios típicos de una clínica veterinaria mediana, y están diseñados para ser completos y consistentes, evitando ambigüedades que podrían generar inconsistencias en el desarrollo.

El sistema será accesible vía web, con autenticación segura y autorización basada en roles para garantizar que cada usuario solo acceda a las funcionalidades permitidas.

## **2\. Requisitos Funcionales**

Los requisitos funcionales se organizan por módulos principales, con subrequisitos detallados. Cada requisito incluye una descripción clara, actores involucrados (roles de usuarios) y condiciones de ejecución.

### **2.1 Módulo de Autenticación y Gestión de Usuarios**

* **RF-1.1: Registro de Usuarios** El sistema permitirá a los usuarios no autenticados registrarse proporcionando nombre, apellido, email, contraseña, teléfono y dirección. Durante el registro, el usuario seleccionará un rol inicial (Cliente por defecto; otros roles requieren aprobación de Admin). El sistema validará la unicidad del email y enviará un correo de confirmación. Actores: Usuario no autenticado.  
* **RF-1.2: Inicio de Sesión (Login)** Los usuarios registrados podrán iniciar sesión con email y contraseña. El sistema verificará las credenciales y asignará un token de sesión. En caso de error, mostrará mensajes como "Credenciales inválidas" o "Cuenta no confirmada". Actores: Todos los roles (Admin, Cliente, Veterinario, Recepcionista, Groomer).  
* **RF-1.3: Cierre de Sesión (Logout)** El usuario autenticado podrá cerrar sesión, invalidando el token y redirigiendo a la página de inicio. Actores: Todos los roles.  
* **RF-1.4: Recuperación de Contraseña** El sistema permitirá solicitar recuperación de contraseña vía email, enviando un enlace temporal para restablecerla. El enlace expirará en 1 hora. Actores: Usuario no autenticado.  
* **RF-1.5: Gestión de Roles** El Admin podrá asignar, modificar o revocar roles a usuarios existentes (ej.: promover un Groomer a Veterinario). El sistema mantendrá un registro de roles: Admin (acceso total), Cliente (gestión propia), Veterinario (historial médico), Recepcionista (citas e inventario), Groomer (servicios de grooming). Actores: Admin.  
* **RF-1.6: Perfil de Usuario** Cada usuario podrá ver y editar su perfil (nombre, email, teléfono, dirección, contraseña). Los cambios requerirán confirmación vía email para campos sensibles como email. Actores: Todos los roles.

  ### **2.2 Módulo de Gestión de Mascotas**

* **RF-2.1: Registro de Mascotas** El sistema permitirá registrar una mascota asociada a un Cliente, incluyendo nombre, especie (de una lista predefinida: perro, gato, ave, etc.), raza, edad, peso, género, fecha de nacimiento y notas adicionales. Se validará que la especie exista en el catálogo de especies. Actores: Cliente, Recepcionista.  
* **RF-2.2: Listado y Búsqueda de Mascotas** El sistema mostrará una lista paginada de mascotas, filtrable por nombre, especie, raza o propietario (Cliente). Incluirá opciones de ordenamiento por edad o fecha de registro. Actores: Todos los roles (vista limitada para Cliente: solo sus mascotas).  
* **RF-2.3: Edición y Eliminación de Mascotas** Se podrá editar los detalles de una mascota existente o eliminarla lógicamente (marcar como inactiva, sin borrar datos históricos). La eliminación requerirá confirmación. Actores: Cliente (solo sus mascotas), Recepcionista, Veterinario.  
* **RF-2.4: Catálogo de Especies** El Admin podrá agregar, editar o eliminar especies del catálogo (ej.: agregar "conejo" con descripción). El sistema mantendrá una lista de especies disponibles para registrar mascotas. Actores: Admin.

  ### **2.3 Módulo de Gestión de Citas**

* **RF-3.1: Programación de Citas** El sistema permitirá programar una cita seleccionando mascota, servicio (de la lista disponible), fecha/hora (validando disponibilidad), y asignando a un Veterinario o Groomer según el servicio. Incluirá un calendario interactivo que muestre slots disponibles en tiempo real, con vistas por día/semana/mes. Actores: Cliente, Recepcionista.  
* **RF-3.2: Calendario Interactivo** El calendario mostrará citas programadas, con colores por tipo de servicio y tooltips con detalles (mascota, cliente, hora). Permitirá arrastrar y soltar para reprogramar citas (con validación de disponibilidad). Actores: Todos los roles (vista filtrada por rol: Veterinario ve solo sus citas).  
* **RF-3.3: Cancelación y Reprogramación de Citas** Se podrá cancelar o reprogramar una cita existente, enviando notificaciones por email al Cliente y al personal asignado. Cancelaciones dentro de 24 horas requerirán aprobación de Recepcionista. Actores: Cliente (sus citas), Recepcionista, Veterinario, Groomer.  
* **RF-3.4: Pago de Citas** Al programar o confirmar una cita, el sistema integrará un módulo de pago (simulado o con gateway como Stripe), permitiendo pago total o parcial. Generará un recibo digital y actualizará el estado de la cita a "Pagada". Soporte para métodos: tarjeta, transferencia. Actores: Cliente, Recepcionista.  
* **RF-3.5: Recordatorios de Citas** El sistema enviará recordatorios automáticos por email 24 horas antes de la cita, incluyendo detalles y opción para cancelar. Actores: Sistema (automático).

  ### **2.4 Módulo de Gestión de Servicios**

* **RF-4.1: Catálogo de Servicios** El Admin podrá agregar, editar o eliminar servicios (ej.: consulta general, vacunación, grooming), con descripción, precio base, duración y tipo (médico o estético). Actores: Admin.  
* **RF-4.2: Asignación de Servicios a Citas** Durante la programación de citas, se seleccionará un servicio del catálogo, calculando el precio automáticamente (con posibles ajustes por mascota). Actores: Cliente, Recepcionista.

  ### **2.5 Módulo de Gestión de Inventario**

* **RF-5.1: Registro de Productos** El sistema permitirá agregar productos al inventario (ej.: medicamentos, alimentos), con nombre, descripción, cantidad, precio, proveedor y fecha de caducidad. Actores: Recepcionista, Admin.  
* **RF-5.2: Listado y Búsqueda de Inventario** Mostrará una lista paginada de productos, filtrable por nombre, cantidad baja (\<10 unidades) o caducidad próxima (\<30 días). Incluirá alertas visuales para stock bajo. Actores: Recepcionista, Veterinario, Admin.  
* **RF-5.3: Actualización de Stock** Se podrá actualizar la cantidad de un producto (entrada/salida), registrando transacciones con motivo (ej.: venta, uso en cita). El sistema bloqueará ventas si stock es insuficiente. Actores: Recepcionista, Veterinario.

  ### **2.6 Módulo de Historial Médico**

* **RF-6.1: Registro de Historial** Durante o después de una cita, se registrará el historial médico de la mascota: diagnóstico, tratamiento, medicamentos prescritos (vinculado a inventario), notas y fecha. Actores: Veterinario, Groomer (solo para servicios no médicos).  
* **RF-6.2: Consulta de Historial** El sistema mostrará el historial completo de una mascota, ordenado cronológicamente, con búsqueda por fecha o keyword (ej.: "vacunación"). Actores: Veterinario, Cliente (solo lectura para sus mascotas), Admin.

  ### **2.7 Módulo de Dashboards**

* **RF-7.1: Dashboard General** Cada rol tendrá un dashboard personalizado:  
  * Admin: Resumen de usuarios, citas pendientes, inventario bajo, ingresos diarios.  
  * Cliente: Lista de sus mascotas, citas próximas, historial reciente.  
  * Veterinario: Citas del día, pacientes asignados, alertas de historial.  
  * Recepcionista: Citas pendientes, pagos pendientes, stock bajo.  
  * Groomer: Citas asignadas, servicios pendientes. Incluirá gráficos simples (ej.: citas por día). Actores: Todos los roles.

  ### **2.8 Módulo de Reportes (Admin)**

* **RF-8.1: Generación de Reportes** El Admin podrá generar reportes filtrados por fecha: ingresos por servicios, citas atendidas, uso de inventario, métricas de usuarios (ej.: clientes activos). Exportables a PDF/CSV. Actores: Admin.

  ### **2.9 Módulo de Configuración del Sistema (Admin)**

* **RF-9.1: Configuración General** El Admin podrá configurar parámetros como horarios de atención, precios base de servicios, umbrales de alertas (stock bajo), y plantillas de emails. Actores: Admin.

  ### **2.10 Módulo de Páginas Principales**

* **RF-10.1: Página Home** La página de inicio mostrará información general: servicios destacados, formulario de contacto, enlace a registro/login, y un carrusel de imágenes de mascotas. No requerirá autenticación. Actores: Todos (no autenticados incluidos).  
* **RF-10.2: Página Not Found (404)** En caso de URL inválida, redirigirá a una página de error con mensaje amigable, enlace a home y sugerencia de búsqueda. Actores: Todos.

### **2.11 Módulo de Inteligencia Artificial y Automatización**

* **RF-11.1: Documentación Clínica Automatizada** El sistema integrará un módulo de ML para procesar conversaciones en tiempo real durante consultas veterinarias. Con consentimiento del cliente, grabará audio (vía navegador o app integrada), lo transcribirá usando NLP y generará notas médicas estructuradas (diagnóstico, síntomas, recomendaciones). Estas notas se almacenarán automáticamente en el historial médico de la mascota, accesibles desde el dashboard del Veterinario. Actores: Veterinario, Groomer.  
* **RF-11.2: Clasificación Automática de Síntomas** El sistema permitirá a los clientes describir síntomas de mascotas por texto (ej.: en un formulario o chat). Usando ML, clasificará los síntomas, sugerirá posibles causas y asignará prioridad (urgente/no urgente), integrándose con programación de citas para sugerir slots inmediatos si es crítico. Actores: Cliente, Recepcionista.  
* **RF-11.3: Recomendación Nutricional Básica** Basado en datos de la mascota (peso, edad, especie), el sistema usará ML para recomendar planes nutricionales básicos (ej.: tipo de alimento, porciones diarias). Estas sugerencias se mostrarán en el dashboard del Cliente o durante consultas, promoviendo bienestar preventivo. Actores: Cliente, Veterinario.  
* **RF-11.4: Chatbot Veterinario 24/7** El sistema incluirá un chatbot impulsado por ML para responder dudas frecuentes de clientes (ej.: cuidados básicos, síntomas comunes). Integrado en la web, enviará recordatorios personalizados (vacunas, chequeos) basados en historiales, y escalará a personal humano si es complejo. Actores: Cliente, Sistema (automático).

  ## **3\. Consideraciones Generales para Consistencia**

* Todos los módulos requerirán autenticación excepto Home, Registro, Login y Not Found.  
* El sistema manejará errores graciosamente (ej.: mensajes claros, logs internos).  
* Validaciones: Campos obligatorios, formatos (email, fechas), y chequeos de integridad (ej.: no programar cita en horario cerrado).  
* Notificaciones: Emails para confirmaciones, recordatorios y alertas críticas (stock bajo).
* Integraciones de ML requerirán APIs externas seguras (ej.: para NLP), con manejo de datos privados conforme a regulaciones."

  #### **2\. Requisitos No Funcionales**

Estos requisitos abordan aspectos de calidad del sistema.

**2.2 Usabilidad**

* RNF-2.2.1: El sistema debe proporcionar mensajes de error amigables y validaciones en formularios (e.g., campos obligatorios, formatos válidos).  
* RNF-2.2.3: Todos los dashboards deben ser personalizables en términos de visualización (e.g., filtros por fecha), con elementos interactivos como drag-and-drop en el calendario.

**2.3 Seguridad**

* RNF-2.3.1: El sistema debe cifrar datos sensibles (e.g., contraseñas, datos de pago) utilizando HTTPS y algoritmos como bcrypt para almacenamiento.  
* RNF-2.3.2: Debe implementar autenticación basada en tokens (e.g., JWT) para sesiones, con expiración automática después de 30 minutos de inactividad.  
* RNF-2.3.3: Accesos deben ser controlados por roles (RBAC), previniendo accesos no autorizados, y registrar logs de actividades sensibles (e.g., ediciones de datos médicos).
* RNF-2.3.4: Consentimiento explícito para grabaciones de audio y procesamiento ML, con encriptación de datos sensibles." Y en 2.5 Compatibilidad:

**2.5 Compatibilidad**

* RNF-2.5.2: Debe soportar integración con servicios externos para pagos (e.g., Stripe) y emails (e.g., SendGrid).
* RNF-2.5.3: Integración con APIs de ML como Google Cloud o Hugging Face para NLP y recomendaciones.