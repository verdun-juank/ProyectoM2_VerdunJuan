# Blog API REST

API REST desarrollada con **Node.js, Express y PostgreSQL** para administrar autores y publicaciones. El proyecto permite realizar operaciones CRUD, validar datos, gestionar errores y consultar publicaciones asociadas a cada autor.

La API cuenta con pruebas automatizadas mediante Jest y Supertest, y documentación interactiva mediante OpenAPI y Swagger UI.

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- node-postgres (`pg`)
- Jest
- Supertest
- OpenAPI 3.0.3
- Swagger UI

## Índice 
- [Prompts y usos de la IA](docs/IA.md) 

## Estructura del proyecto

```text
ProyectoM2_VerdunJuan/
│
├── src/
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   ├── authors.routes.js
│   │   └── posts.routes.js
│   ├── services/
│   │   ├── authors.service.js
│   │   └── posts.service.js
│   ├── middlewares/
│   │   ├── error.middleware.js
│   │   └── not-found.middleware.js
│   ├── docs/
│   │   └── openapi.yaml
│   ├── app.js
│   └── server.js
│
├── tests/
│   ├── unit/
│   │   ├── authors.service.test.js
│   │   └── posts.service.test.js
│   ├── authors.test.js
│   └── posts.test.js
│
├── setup.sql
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
│
├── Docs/
│   └── IA.md
│
└── README.md
```

## Funcionalidades

### Autores

- Listar todos los autores.
- Consultar un autor por su ID.
- Crear un autor.
- Actualizar un autor.
- Eliminar un autor.
- Validar campos obligatorios y evitar emails duplicados.

### Publicaciones

- Listar todas las publicaciones.
- Consultar una publicación por su ID.
- Crear una publicación.
- Actualizar una publicación.
- Eliminar una publicación.
- Consultar las publicaciones de un autor.
- Validar los datos y comprobar que el autor exista.

### Relación entre autores y publicaciones

Cada publicación pertenece a un autor mediante el campo `author_id`, que funciona como clave foránea hacia `authors.id`.

La relación utiliza `ON DELETE CASCADE`, por lo que al eliminar un autor también se eliminan sus publicaciones.

## Requisitos previos

Para ejecutar el proyecto localmente necesitas:

- Node.js y npm.
- PostgreSQL.
- pgAdmin (opcional, para administrar la base de datos).
- Git.

## Instalación y configuración local

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO](https://github.com/verdun-juank/ProyectoM2_VerdunJuan)
cd blog-api/Desarrollo
```


### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear la base de datos

Desde PostgreSQL o pgAdmin, crear una base de datos llamada:

```sql
CREATE DATABASE blog_api;
```

### 4. Ejecutar los scripts SQL

Ejecutar `setup.sql` desde Query Tool de pgAdmin o mediante una herramienta compatible con PostgreSQL.

**Importante:** ejecutar los scripts sobre una base de datos nueva o vacía. El seed de ejemplo utiliza los IDs iniciales 1, 2 y 3 para relacionar las publicaciones con sus autores.

### 5. Configurar las variables de entorno

Crear una copia de `.env.example` y renombrarla a `.env`.

Completar los datos de conexión de PostgreSQL:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=blog_api
```

Utilizar las credenciales correspondientes a la instalación local de PostgreSQL.


### 6. Ejecutar la API

Modo desarrollo:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Por defecto, la API estará disponible en:

```text
http://localhost:3000
```

## Endpoints disponibles

### Autores

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/authors` | Listar autores |
| GET | `/authors/:id` | Consultar un autor |
| POST | `/authors` | Crear un autor |
| PUT | `/authors/:id` | Actualizar un autor |
| DELETE | `/authors/:id` | Eliminar un autor |

### Publicaciones

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/posts` | Listar publicaciones |
| GET | `/posts/:id` | Consultar una publicación |
| GET | `/posts/author/:authorId` | Consultar publicaciones de un autor |
| POST | `/posts` | Crear una publicación |
| PUT | `/posts/:id` | Actualizar una publicación |
| DELETE | `/posts/:id` | Eliminar una publicación |

### Ejemplo para crear un autor

**POST** `/authors`

```json
{
  "name": "Ana García",
  "email": "ana@example.com",
  "bio": "Desarrolladora full-stack"
}
```

### Ejemplo para crear una publicación

**POST** `/posts`

```json
{
  "title": "Introducción a Node.js",
  "content": "Contenido de ejemplo sobre Node.js.",
  "author_id": 1,
  "published": true
}
```

## Tests automatizados

El proyecto utiliza Jest y Supertest para comprobar el funcionamiento de la API y sus servicios.

Las pruebas están divididas en:

- **Pruebas de integración:** comprueban el funcionamiento de los endpoints y su interacción con PostgreSQL.
- **Pruebas unitarias:** comprueban la lógica de los servicios utilizando mocks para simular las consultas a la base de datos.

### Ejecutar todas las pruebas

```bash
npm test
```

### Ejecutar pruebas unitarias de autores

```bash
npx jest tests/unit/authors.service.test.js --runInBand
```

### Ejecutar pruebas unitarias de publicaciones

```bash
npx jest tests/unit/posts.service.test.js --runInBand
```

El proyecto cuenta actualmente con **27 pruebas automatizadas**.

## Documentación OpenAPI y Swagger UI

La documentación de la API está definida en:

```text
src/docs/openapi.yaml
```

Para consultar la documentación interactiva:

1. Iniciar el servidor con `npm run dev`.
2. Abrir el navegador.
3. Ingresar a:

```text
http://localhost:3000/api-docs
```

Desde Swagger UI es posible consultar los endpoints, revisar los parámetros, visualizar los esquemas de datos y ejecutar solicitudes HTTP.

## Deployment en Railway

El proyecto puede desplegarse utilizando [Railway](https://railway.com/), conectando el repositorio de GitHub y configurando los servicios necesarios.

### 1. Crear el proyecto

1. Crear una cuenta en Railway.
2. Crear un nuevo proyecto.
3. Conectar el repositorio de GitHub.
4. Seleccionar el servicio correspondiente a la API.

Como el código está dentro de `Desarrollo/`, configurar esa carpeta como directorio raíz (*Root Directory*) del servicio.

### 2. Crear la base de datos PostgreSQL

1. Agregar un servicio PostgreSQL dentro del mismo proyecto de Railway.
2. Esperar a que la base de datos esté disponible.
3. Utilizar sus variables de conexión para configurar la API.

### 3. Configurar las variables de entorno

En la sección Variables del servicio de la API, configurar:

| Variable | Valor |
|---|---|
| `PORT` | Puerto proporcionado por Railway, si corresponde |
| `DB_HOST` | Host interno de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL |
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Contraseña de PostgreSQL |
| `DB_NAME` | Nombre de la base de datos |

Railway permite utilizar variables de referencia entre servicios. Por ejemplo, si el servicio de base de datos se llama `Postgres`, se pueden vincular sus variables mediante referencias como:

```text
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
```

Los nombres de las referencias deben coincidir con el nombre real del servicio PostgreSQL en Railway.

### 4. Inicializar la base de datos

Ejecutar `setup.sql` sobre la base de datos PostgreSQL de Railway, utilizando una conexión administrativa apropiada.

Primero se crean las tablas y después se insertan los datos de ejemplo.

### 5. Iniciar el servicio

Railway debe ejecutar el comando de inicio configurado en `package.json`:

```bash
npm start
```

El servidor debe escuchar el puerto definido por la variable `PORT` proporcionada por la plataforma.

### 6. Internal URL y Public URL

**Internal URL:**

Es la dirección privada utilizada para que los servicios dentro del mismo proyecto Railway se comuniquen entre sí. En este proyecto, la API utiliza el host interno de PostgreSQL para conectarse a la base de datos.

**Public URL:**

Es la dirección pública que Railway genera para acceder a la API desde Internet.

Una vez generado el dominio público, se podrán consultar los endpoints y Swagger UI mediante:

```text
https://TU-DOMINIO.up.railway.app/authors
https://TU-DOMINIO.up.railway.app/posts
https://TU-DOMINIO.up.railway.app/api-docs
```

Reemplazar `TU-DOMINIO` por el dominio real generado por Railway.





