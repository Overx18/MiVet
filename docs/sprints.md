### **División de Tareas por Sprints (Cronograma Detallado)**

Para implementar el sistema web de gestión veterinaria utilizando Scrum en 12 semanas (6 Sprints de 2 semanas cada uno), he dividido las User Stories del Product Backlog en un cronograma detallado. 

#### **Sprint 1: Fundación y Autenticación (Semanas 1, Puntos: 25\)**

**Enfoque**: Configuración inicial y módulo de autenticación para tener un sistema básico autenticado. Esto permite acceso seguro desde el inicio.

**User Stories Seleccionadas**:

* US-28: Configuración Inicial del Backend (5 puntos)  
* US-29: Configuración Inicial del Frontend (5 puntos)  
* US-01: Registro de Usuarios (5 puntos)  
* US-02: Inicio de Sesión (3 puntos)  
* US-03: Cierre de Sesión (2 puntos)  
* US-06: Edición de Perfil (3 puntos) **Tareas Detalladas**:  
  * **Backend (Días 2-5)**: Instalar Express, Sequelize, MySQL, dotenv, helmet, cors, jsonwebtoken, bcryptjs. Crear modelos para Usuarios y Roles. Implementar endpoints para registro/login/logout (con validación y tokens JWT).  
  * **Frontend (Días 2-5)**: Configurar React \+ Vite \+ TailwindCSS, react-router-dom, axios, react-hook-form. Crear páginas de registro/login con formularios y manejo de errores.  
  * **Integración (Días 6-8)**: Conectar frontend a backend para autenticación; implementar redirección basada en roles. Agregar edición de perfil con confirmación de email.  
  * **Pruebas (Día 9\)**: Pruebas unitarias para endpoints y componentes; simular emails con console.log. **Entregable**: Sistema con autenticación funcional y perfiles editables. Demo: Registro, login y logout.

#### **Sprint 2: Gestión de Usuarios Avanzada y Mascotas (Semanas 2, Puntos: 28\)**

**Enfoque**: Completar gestión de usuarios y agregar módulo de mascotas para permitir registros básicos de clientes.

**User Stories Seleccionadas**:

* US-04: Recuperación de Contraseña (5 puntos)  
* US-05: Gestión de Roles (5 puntos)    
* US-10: Catálogo de Especies (3 puntos) 
* US-07: Registro de Mascotas (5 puntos) 
* US-08: Listado y Búsqueda de Mascotas (5 puntos)
* US-09: Edición y Eliminación de Mascotas (3 puntos) **Tareas Detalladas**:  
  * **Backend (Días 2-5)**: Implementar endpoints para recuperación de contraseña (enlace temporal). Agregar gestión de roles con autorización basada en JWT. Crear modelos para Mascotas y Especies; endpoints CRUD para ambos.  
  * **Frontend (Días 2-5)**: Formularios para recuperación de contraseña y gestión de roles (solo para Admin). Interfaz para registro/edición de mascotas con selección de especies.  
  * **Integración (Días 6-8)**: Vincular mascotas a usuarios (Clientes). Implementar eliminación lógica y validaciones (ej.: especie existente).  
  * **Pruebas (Día 9\)**: Probar flujos completos de roles y mascotas; verificar restricciones por rol. **Entregable**: Usuarios con roles gestionados y clientes registrando mascotas. Demo: Asignar rol y registrar una mascota.

#### **Sprint 3: Citas Básicas y Calendario (Semanas 3-4, Puntos: 27\)**

**Enfoque**: Módulo de citas con calendario interactivo y servicios básicos, para habilitar programación.

**User Stories Seleccionadas**:

* US-16: Catálogo de Servicios (5 puntos)  
* US-11: Programación de Citas (8 puntos)  
* US-12: Calendario Interactivo (8 puntos)  
* US-17: Asignación de Servicios a Citas (3 puntos)  
* US-15: Recordatorios de Citas (3 puntos) **Tareas Detalladas**:  
  * **Backend (Días 2-5)**: Modelos para Citas y Servicios; endpoints para CRUD de servicios y programación de citas (con chequeo de disponibilidad).  
  * **Frontend (Días 2-5)**: Implementar calendario con recharts (vistas día/semana/mes, drag-and-drop). Formularios para programación con selección de servicios.  
  * **Integración (Días 6-8)**: Calcular precios automáticos; simular recordatorios (cron job básico o setTimeout para pruebas).  
  * **Pruebas (Día 9\)**: Validar colisiones de horarios y vistas filtradas por rol. **Entregable**: Citas programadas visibles en calendario. Demo: Programar una cita y ver en calendario.

#### **Sprint 4: Citas Avanzadas, Pagos e Inventario (Semanas 5-6, Puntos: 26\)**

**Enfoque**: Agregar pagos, cancelaciones y gestión de inventario para hacer las citas operativas.

**User Stories Seleccionadas**:

* US-13: Cancelación y Reprogramación de Citas (5 puntos)  
* US-14: Pago de Citas (8 puntos)  
* US-18: Registro de Productos (5 puntos)  
* US-19: Listado y Búsqueda de Inventario (5 puntos)  
* US-20: Actualización de Stock (3 puntos) **Tareas Detalladas**:  
  * **Backend (Días 2-5)**: Endpoints para cancelación/reprogramación (con emails simulados). Integrar pagos mock (Stripe simulado). Modelos para Inventario; endpoints CRUD y actualizaciones.  
  * **Frontend (Días 2-5)**: Formas de pago con react-hot-toast; listas paginadas para inventario con filtros y alertas.  
  * **Integración (Días 6-8)**: Vincular pagos a citas; bloquear stock insuficiente.  
  * **Pruebas (Día 9\)**: Probar flujos de pago y stock (ej.: intento de venta sin stock). **Entregable**: Citas pagadas y gestionadas, con inventario actualizable. Demo: Pagar y cancelar una cita.

#### **Sprint 5: Historial, Dashboards y IA Básica (Semanas 7-8, Puntos: 28)**

**Enfoque**: Agregar historial médico y vistas resumidas para roles. Incluir IA básica para documentación automatizada y recomendaciones, integrándolas con dashboards para pruebas tempranas.

**User Stories Seleccionadas**:

* US-21: Registro de Historial Médico (5 puntos)  
* US-22: Consulta de Historial Médico (5 puntos)  
* US-23: Dashboards Personalizados (8 puntos)  
* US-31: Documentación Clínica Automatizada (8 puntos)  # Nueva  
* US-33: Recomendación Nutricional Básica (5 puntos)    # Nueva, movida aquí por integración con dashboards  

**Tareas Detalladas**:  
  * **Backend (Días 2-5)**: Modelos para Historial; endpoints para registro/consulta. Integrar API de ML (ej.: Hugging Face para NLP) para transcripción audio y recomendaciones nutricionales básicas.  
  * **Frontend (Días 2-5)**: Vistas de historial cronológico; dashboards con gráficos (recharts) personalizados por rol, incluyendo secciones para recomendaciones IA. Botón para grabación audio con consentimiento.  
  * **Integración (Días 6-8)**: Vincular historial a citas e inventario; procesar audio en tiempo real para notas automáticas.  
  * **Pruebas (Día 9\)**: Verificar filtros en vistas, precisión inicial de ML (usar datasets de prueba para nutrición). **Entregable**: Dashboards funcionales con IA básica. Demo: Generar nota automática y ver recomendación en dashboard.

#### **Sprint 6: Reportes, Configuración e IA Intermedia (Semanas 9-10, Puntos: 23)**

**Enfoque**: Finalizar reportes y configuración general. Agregar IA intermedia como clasificación de síntomas, probando integraciones con módulos existentes.

**User Stories Seleccionadas**:

* US-24: Generación de Reportes (5 puntos)  
* US-25: Configuración General (3 puntos)  
* US-32: Clasificación Automática de Síntomas (5 puntos)  # Nueva  
* US-15: Recordatorios de Citas (3 puntos)  # Movida aquí para alineación con IA (recordatorios personalizados)  
* US-30: Pruebas y Despliegue Local (5 puntos)  # Parcial, enfocado en pruebas intermedias  

**Tareas Detalladas**:  
  * **Backend (Días 2-5)**: Queries para reportes (export a CSV/PDF). Endpoints para configuración. Integrar ML para clasificación de síntomas (ej.: modelo preentrenado para texto).  
  * **Frontend (Días 2-5)**: Interfaz para reportes filtrados; formularios de configuración. Formulario para síntomas con sugerencias IA.  
  * **Integración (Días 6-8)**: Vincular clasificación a citas y recordatorios. Pruebas locales parciales.  
  * **Pruebas (Día 9\)**: Cobertura de reportes y precisión de clasificación (escenarios de síntomas comunes). **Entregable**: Reportes generados y IA para síntomas funcional. Demo: Clasificar síntomas y generar reporte.

#### **Sprint 7: Páginas Principales, IA Avanzada y Pulido Final (Semanas 11-12, Puntos: 25)**

**Enfoque**: Completar páginas públicas, integrar IA avanzada (chatbot) y realizar pruebas exhaustivas/end-to-end para un sistema completo y estable.

**User Stories Seleccionadas**:

* US-26: Página Home (3 puntos)  
* US-27: Página Not Found (404) (2 puntos)  
* US-34: Chatbot Veterinario 24/7 (8 puntos)  # Nueva, avanzada por complejidad  
* US-30: Pruebas y Despliegue Local (5 puntos)  # Completo, con énfasis en ML  
* US-05: Gestión de Roles (5 puntos)  # Revisión final para asegurar accesos IA por rol  
* US-12: Calendario Interactivo (2 puntos)  # Optimización final  

**Tareas Detalladas**:  
  * **Backend (Días 2-5)**: Ajustes finales de seguridad y roles. Integrar ML para chatbot (ej.: Dialogflow o Rasa para respuestas 24/7).  
  * **Frontend (Días 2-5)**: Página Home con carrusel y formulario; página 404. Widget de chatbot integrado en web.  
  * **Integración (Días 6-8)**: Vincular chatbot a historial y recordatorios; pruebas end-to-end de todo el sistema.  
  * **Pruebas (Día 9\)**: Cobertura total, corrección de bugs, optimización (performance en calendario y ML). Probar precisión de chatbot con consultas reales, incluyendo escalado a humanos. **Entregable**: Sistema completo, probado y deployable localmente. Demo: Navegación completa con chatbot respondiendo dudas.