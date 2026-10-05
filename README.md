<h1 align="center">
  <br>
Tienda-Node.js
</h1>

<p align="center">
  Una tienda en línea construida con <strong>Node.js</strong>, utilizando <strong>MySQL</strong>, <strong>Docker</strong> y <strong>Bootstrap</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white">
</p>

## Configuración

### 1. Base de datos

```bash
docker run --name tienda-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -p 3306:3306 -d mysql:8
```

Crea el esquema y los datos de ejemplo:

```bash
mysql -h 127.0.0.1 -u root -p < sql/alumnos-ejs.sql
```

Se recomienda crear un usuario propio para la aplicación en lugar de usar `root`:

```sql
CREATE USER 'tienda'@'%' IDENTIFIED BY 'una-contraseña-segura';
GRANT SELECT, INSERT, UPDATE, DELETE ON alumnos_ejs.* TO 'tienda'@'%';
```

> Si tu base de datos se creó antes de este cambio, ejecuta también las migraciones de `sql/migraciones/` en orden.

### 2. Variables de entorno

```bash
cp .env.example .env
```

Completa los valores del `.env`. `SESSION_SECRET` debe tener al menos 32 caracteres:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

El archivo `.env` no se sube al repositorio.

### 3. Instalar y ejecutar

```bash
npm install
npm run dev    # desarrollo (se reinicia con cada cambio)
npm start      # producción
npm test       # pruebas
```

Usuario administrador de ejemplo: `example@gmail.com` / `1234567890`. **Cámbialo** antes de publicar la tienda.

## Estructura

| Carpeta | Contenido |
| --- | --- |
| `config/` | Pool de conexiones MySQL (`db.js`) y configuración de subida de imágenes |
| `controllers/` | Lógica de cada sección |
| `middleware/` | Autenticación, control de roles y manejo de errores |
| `routes/` | Definición de rutas |
| `utils/` | Validaciones y utilidades |
| `views/` | Plantillas EJS |
| `public/` | Archivos estáticos, service worker y manifest |
| `sql/` | Esquema inicial y migraciones |
| `test/` | Pruebas (`node --test`) |

Las rutas del panel (`/home`, `/almacen`, `/lista`, `/compras`, `/ofertas`) solo son accesibles para usuarios con el rol **Admin**.
