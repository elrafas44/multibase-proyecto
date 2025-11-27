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
| SQL Server    | Relacional           | Usuarios y Productos                   |
| MongoDB       | NoSQL (documentos)   | Pedidos y Actividades                  |
| Redis         | Clave-Valor          | Cache y seciones                       |


``
# Inicio explicación para Sql Server

# README – Módulos de Usuarios y Productos

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


