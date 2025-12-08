# TECNOLÓGICO NACIONAL DE MÉXICO INSTITUTO TECNOLÓGICO DE COLIMA
## Integrantes:
Gilberto Cárdenas López 22460460 username: carlop07
José Antonio Casillas Guerra 22460461 username: Antonio1212122
José Iván Reyes Chávez 22460482 username: Iván Reyes (IguanaChelera)
José Rafael Rolón 22460485 username: elrafas44

---

# Proyecto Multibase de Datos

# Requisitos previos

Antes de ejecutar el proyecto, es necesario contar con:

## Node.js 18+
https://nodejs.org/

## Gestor de paquetes (npm o yarn)
npm viene incluido con Node.js.

## Motores de base de datos instalados
Para los módulos de Usuarios y Productos se utilizan:

| Base de datos | Tipo                 | Uso                                    |
|---------------|----------------------|----------------------------------------|
| SQL Server    | Relacional           | Usuarios, Productos y categorias       |
| MongoDB       | NoSQL (documentos)   | Pedidos y Actividades                  |
| Redis         | Clave-Valor          | Cache y carrito                        |


``
# Inicio explicación para Sql Server

# README – Módulos de Usuarios, Productos y categorias

Este documento explica cómo instalar, configurar y ejecutar la parte del proyecto correspondiente a los recursos Usuarios y Productos, desarrollados como Web Services con conexión a múltiples motores de base de datos.

---


Esta sección utiliza principalmente SQL Server.

---

# Configuración de la Base de Datos

## 1. Crear base de datos en SQL Server

```sql
CREATE DATABASE multibase_sql;
GO

USE multibase_sql;
GO

-- ==========================
--       TABLA: Usuarios
-- ==========================
CREATE TABLE Usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    passwordHash NVARCHAR(255) NOT NULL,
    creadoEn DATETIME DEFAULT GETDATE(),
    actualizadoEn DATETIME NULL,
    isDeleted BIT DEFAULT 0
);
GO

-- ==========================
--       TABLA: Productos
-- ==========================
CREATE TABLE Productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(150) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    descripcion NVARCHAR(500),
    creadoEn DATETIME DEFAULT GETDATE(),
    actualizadoEn DATETIME NULL,
    isDeleted BIT DEFAULT 0
);
GO

-- ==========================
--      TABLA: Categorias
-- ==========================
CREATE TABLE Categorias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(200),
    isDeleted BIT DEFAULT 0
);
GO


```
# Configuración de Variables de Entorno
Crear un archivo .env en la raíz del proyecto:

DB_SERVER=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_DATABASE=multibase_sql

# Instalación de dependencias
Ejecutar:
    npm install

Ejecutar el servidor: 
    npm start 

El servidor iniciará en:
    http://localhost:3000

# Endpoint disponibles
Usuarios
Método	Endpoint	      Descripción
GET	    api/usuarios	    Listar usuarios
GET	    api/usuarios/:id	Obtener usuario
POST	api/usuarios	    Crear usuario
PATCH	api/usuarios/:id	Actualizar usuario
DELETE	api/usuarios/:id	Borrado lógico

Ejemplo de petición POST
{
  "nombre": "Rafael",
  "email": "rafa@example.com",
  "password": "123456"
}

Productos
Método	Endpoint	      Descripción
GET	    api/productos	    Listar productos
GET	    api/productos/:id	Obtener producto
POST	api/productos	    Crear producto
PATCH	api/productos/:id	Actualizar producto
DELETE	api/productos/:id	Borrado lógico

Ejemplo de petición POST
{
  "nombre": "Laptop Gamer",
  "precio": 25999.99,
  "stock": 12
}


Categorías
Método  Endpoint             Descripción
GET     api/categorias       Listar categorías
GET     api/categorias/:id   Obtener categoría
POST    api/categorias       Crear categoría
PATCH   api/categorias/:id   Actualizar categoría
DELETE  api/categorias/:id   Borrado lógico

Ejemplo de petición POST
{
  "nombre": "Electrónica",
  "descripcion": "Dispositivos, gadgets y accesorios"
}


# Pruebas Recomendadas

Utilizar Postman o Thunder Client para probar:

Crear usuario

Actualizar usuario

Borrado lógico de usuario

Crear producto

Actualizar producto

Borrado lógico de producto

Todas las operaciones han sido verificadas previamente.


En headers se debe ingresar lo siguiente:
    application/json

# Fin de la explicación para sql server
``


-----

## MongoDB

### Módulos de Pedidos y Actividades (MongoDB)
Esta parte del proyecto utiliza **MongoDB** como motor de base de datos NoSQL para almacenar documentos relacionados con:
* **Pedidos**
* **Actividades del sistema** (bitácora o historial)

Los datos se guardan en colecciones dentro de la base indicada en el archivo `.env`.

###  Configuración de MongoDB

#### 1. Tener MongoDB instalado o usar Docker

**Opción 1: Instalado localmente**
[Descargar MongoDB Community](https://www.mongodb.com/try/download/community)

**Opción 2: Usar Docker (recomendado)**
Ejecuta el siguiente comando para levantar el contenedor:
```bash
docker run -d --name mongo-multibase -p 27017:27017 mongo
````

Mongo quedará disponible en:

`````
mongodb://localhost:27017
```

### Variables de Entorno para MongoDB

En tu archivo `.env`, agrega las siguientes líneas:

```
MONGO_URI=mongodb://localhost:27017
MONGO_DB=multibase_mongo
```

> Si ya tienes estas variables, solo verifica que los valores sean correctos.

### Colecciones utilizadas

Mongo crea automáticamente las colecciones cuando se insertan documentos. No se requiere ejecutar scripts manuales como en SQL Server.

| Colección     | Uso                                      |
| :---          | :---                                     |
| `pedidos`     | Almacena pedidos realizados por usuarios |
| `actividades` | Guarda acciones importantes del sistema  |

-----

### Endpoints – Pedidos (MongoDB)

| Método     | Endpoint          | Descripción                         |
| :---       | :---              | :---                                |
| **GET**    | `api/pedidos`     | Listar pedidos                      |
| **GET**    | `api/pedidos/:id` | Obtener pedido por ID               |
| **POST**   | `api/pedidos`     | Crear pedido                        |
| **PATCH**  | `api/pedidos/:id` | Actualizar pedido                   |
| **DELETE** | `api/pedidos/:id` | Borrado lógico (`isDeleted = true`) |

#### Ejemplo de POST – Crear Pedido

**Body (JSON):**

```json
{
  "usuarioId": "user123",
  "productoId": "prod55",
  "cantidad": 2,
  "total": 350.50
}
```

**Respuesta esperada:**

```json
{
  "message": "Pedido creado",
  "pedido": {
    "usuarioId": "user123",
    "productoId": "prod55",
    "cantidad": 2,
    "total": 350.50,
    "creadoEn": "2025-12-05T02:10:00.000Z",
    "actualizadoEn": "2025-12-05T02:10:00.000Z",
    "isDeleted": false
  }
}
```

-----

### Endpoints – Actividades (MongoDB)

| Método    | Endpoint              | Descripción              |
| :---      | :---                  | :---                     |
| **GET**   | `api/actividades`     | Listar actividades       |
| **GET**   | `api/actividades/:id` | Obtener actividad por ID |
| **POST**  | `api/actividades`     | Crear actividad          |
| **PATCH** | `api/actividades/:id` | Actualizar actividad     |
| **DELETE**| `api/actividades/:id` | Borrado lógico           |

#### Ejemplo de POST – Crear Actividad

**Body (JSON):**

```json
{
  "usuarioId": "user123",
  "accion": "pedido_pagado",
  "descripcion": "El pedido cambió de 'pendiente' a 'pagado'."
}
```

**Respuesta esperada:**

```json
{
  "message": "Actividad creada",
  "actividad": {
    "usuarioId": "user123",
    "accion": "pedido_pagado",
    "descripcion": "El pedido cambió de 'pendiente' a 'pagado'.",
    "timestamp": "2025-12-05T02:15:00.000Z",
    "isDeleted": false
  }
}
```

-----

### Sobre los IDs en MongoDB

Mongo genera un `_id` automático del tipo:

```
67534c18c09e2442e6735c1a
```

Este ID debe usarse para **GET por ID**, **PATCH** y **DELETE**.

**Ejemplo:**

```
DELETE http://localhost:3000/api/pedidos/67534c18c09e2442e6735c1a
```

>  **Nota:** No usar `/1`, `/2`, etc., porque esos IDs no existen en MongoDB de forma predeterminada.

### Pruebas recomendadas en Mongo

Se recomienda usar **Postman** o **Thunder Client** con el siguiente header:

```
Content-Type: application/json
```

-----

## Redis

### Módulo de Caché (Redis)
Esta parte del proyecto utiliza **Redis** como base de datos Clave-Valor para implementar una capa de **Caché** en **todos los servicios de lectura** (Usuarios, Productos, Categorías, Pedidos y Actividades).

El objetivo es reducir la carga sobre SQL Server y MongoDB, mejorando drásticamente la velocidad de respuesta.

**Patrón Utilizado (Cache-Aside):**
1.  **Lectura (GET):** Se consulta Redis primero. Si existe (HIT), responde en milisegundos. Si no (MISS), consulta la BD real y guarda en Redis.
2.  **Escritura (POST/PATCH/DELETE):** Al modificar datos, se **invalida (borra)** automáticamente la caché relacionada para mantener la consistencia.

### Configuración de Redis

#### 1. Tener Redis instalado

**Opción 1: Instalado localmente**
[Descargar Redis](https://redis.io/download/)

**Opción 2: Usar Docker (recomendado)**
Ejecuta el siguiente comando para levantar el contenedor:
``
docker run -d --name redis-multibase -p 6379:6379 redis

### Módulo de Carrito de Compras (Híbrido Redis + Mongo)

Se implementó un sistema de carrito de compras robusto que combina dos tecnologías:
* **Persistencia (MongoDB):** Los carritos se guardan en una colección permanente para no perder datos si el servidor se reinicia.
* **Velocidad (Redis):** Las operaciones de lectura del carrito se sirven desde la memoria RAM de Redis para máxima eficiencia.

#### Endpoints - Carrito

| Método     | Endpoint                               | Descripción                      |
| :---       | :---                                   | :---                             |
| **GET**    | `api/carrito/:userId`                  | Ver contenido actual del carrito |
| **POST**   | `api/carrito/:userId`                  | Agregar un producto al carrito   |
| **DELETE** | `api/carrito/:userId/producto/:prodId` | Eliminar un item específico      |
| **DELETE** | `api/carrito/:userId`                  | Vaciar el carrito completo       |