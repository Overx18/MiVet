# 🐳 Guía de Docker para MiVet

Esta guía te ayudará a ejecutar el proyecto MiVet usando Docker en cualquier máquina.

## 📋 Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) (incluido en Docker Desktop)
- Git (para clonar el repositorio)

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd MiVet
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y edita las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales reales:
- Stripe API keys
- Credenciales de email
- Google Generative AI API key
- JWT secret (mínimo 32 caracteres)

### 3. Ejecutar en Producción

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

El sistema estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Base de Datos**: localhost:3306

### 4. Ejecutar en Desarrollo (con hot-reload)

```bash
# Usar el archivo de docker-compose para desarrollo
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Detener servicios
docker-compose -f docker-compose.dev.yml down
```

## 📦 Servicios Incluidos

### 1. Base de Datos MySQL
- Puerto: 3306
- Base de datos: `mivet`
- Usuario: `mivet_user`
- Datos persistentes en volumen Docker

### 2. Backend (Node.js/Express)
- Puerto: 5000
- Hot-reload en modo desarrollo
- Conexión automática a MySQL

### 3. Frontend (React + Vite)
- Puerto: 3000 (desarrollo) / 80 (producción con Nginx)
- Hot-reload en modo desarrollo
- Build optimizado en producción

## 🛠️ Comandos Útiles

### Ver estado de servicios
```bash
docker-compose ps
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Reconstruir servicios (después de cambios en Dockerfile)
```bash
docker-compose up -d --build
```

### Ejecutar comandos en un contenedor
```bash
# Acceder a la base de datos
docker-compose exec db mysql -u mivet_user -p mivet

# Acceder al backend
docker-compose exec backend sh

# Acceder al frontend
docker-compose exec frontend sh
```

### Limpiar todo (⚠️ Elimina volúmenes)
```bash
docker-compose down -v
```

### Ver uso de recursos
```bash
docker stats
```

## 🔧 Solución de Problemas

### El backend no se conecta a la base de datos
- Espera a que MySQL esté completamente iniciado (healthcheck automático)
- Verifica las variables de entorno en `.env`
- Revisa logs: `docker-compose logs db`

### El frontend no se puede conectar al backend
- Verifica que `VITE_API_URL` en `.env` apunte a `http://localhost:5000/api`
- Asegúrate de que el backend esté corriendo: `docker-compose ps`

### Problemas con permisos en Windows
- Asegúrate de que Docker Desktop tenga permisos para acceder a tus carpetas
- Habilita "File Sharing" en Docker Desktop Settings

### El puerto ya está en uso
Cambia los puertos en `docker-compose.yml`:
```yaml
ports:
  - "PUERTO_EXTERNO:PUERTO_INTERNO"
```

## 🔐 Seguridad en Producción

**IMPORTANTE**: Antes de desplegar en producción:

1. ✅ Cambia `JWT_SECRET` por una clave aleatoria fuerte (mínimo 32 caracteres)
2. ✅ Usa contraseñas robustas para MySQL
3. ✅ Configura HTTPS con certificados SSL
4. ✅ Nunca subas el archivo `.env` a Git
5. ✅ Usa variables de entorno del sistema en lugar de archivos `.env`
6. ✅ Activa firewall y restringe puertos

## 📊 Arquitectura Docker

```
┌─────────────────────────────────────────────────┐
│              Docker Network (mivet-network)      │
│                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Frontend │───→│ Backend  │───→│  MySQL   │  │
│  │  (Nginx) │    │ (Node.js)│    │  (DB)    │  │
│  │  :3000   │    │  :5000   │    │  :3306   │  │
│  └──────────┘    └──────────┘    └──────────┘  │
│       ↓                ↓                ↓        │
│  [Volumen]       [Volumen]      [Volumen DB]    │
└─────────────────────────────────────────────────┘
```

## 🌐 Despliegue en la Nube

### AWS EC2 / DigitalOcean / Azure VM

1. Instala Docker en el servidor
2. Clona el repositorio
3. Configura las variables de entorno
4. Ejecuta `docker-compose up -d`
5. Configura Nginx como reverse proxy (opcional)
6. Obtén certificados SSL con Let's Encrypt

### Docker Hub (Opcional)

```bash
# Construir imágenes
docker-compose build

# Tag para Docker Hub
docker tag mivet-backend usuario/mivet-backend:latest
docker tag mivet-frontend usuario/mivet-frontend:latest

# Push a Docker Hub
docker push usuario/mivet-backend:latest
docker push usuario/mivet-frontend:latest
```

## 📝 Notas Adicionales

- Los datos de MySQL persisten en volúmenes Docker
- En desarrollo, los cambios en el código se reflejan automáticamente
- En producción, se sirve una versión optimizada y minificada
- Las variables de entorno son diferentes para desarrollo y producción

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado de los servicios: `docker-compose ps`
3. Asegúrate de tener la última versión de Docker Desktop
4. Consulta la documentación oficial de Docker

---

**¡Listo!** 🎉 Ahora puedes ejecutar MiVet en cualquier máquina con Docker.
