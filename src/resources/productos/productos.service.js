const { getConnection, sql } = require("../../db/relational/sqlserver");
const { client } = require("../../db/keyvalue/redis"); // Importamos Redis

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};

const CACHE_KEY_ALL = 'productos:all'; // Llave para la lista completa
const CACHE_EXPIRATION = 3600; // Tiempo de vida en segundos (1 hora)

async function getProductos() {
  // 1. Intentar obtener de Redis
  try {
    const cachedProducts = await client.get(CACHE_KEY_ALL);
    if (cachedProducts) {
      console.log("⚡ Obteniendo productos desde Caché (Redis)");
      return JSON.parse(cachedProducts);
    }
  } catch (err) {
    console.error("Error lectura Redis:", err);
  }

  // 2. Si no hay caché, consultar SQL Server
  const pool = await getConnection();
  const result = await pool.request()
    .query(`
      SELECT id, nombre, precio, stock, descripcion, creadoEn, actualizadoEn, isDeleted
      FROM Productos
      WHERE isDeleted = 0
      ORDER BY id ASC
    `);
  
  const productos = result.recordset;

  // 3. Guardar en Redis para futuras consultas
  try {
    await client.set(CACHE_KEY_ALL, JSON.stringify(productos), {
      EX: CACHE_EXPIRATION
    });
  } catch (err) {
    console.error("Error escritura Redis:", err);
  }

  console.log(" Obteniendo productos desde SQL Server");
  return productos;
}

async function getProductoById(id) {
  const key = `producto:${id}`;

  // 1. Intentar obtener de Redis
  try {
    const cachedProduct = await client.get(key);
    if (cachedProduct) {
      console.log(`Producto ${id} desde Caché`);
      return JSON.parse(cachedProduct);
    }
  } catch (err) { console.error(err); }

  // 2. Consultar SQL
  const pool = await getConnection();
  const result = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT id, nombre, precio, stock, descripcion, creadoEn, actualizadoEn, isDeleted
      FROM Productos
      WHERE id = @id AND isDeleted = 0
    `);
  
  const producto = result.recordset[0];

  if (producto) {
    // 3. Guardar en Redis
    await client.set(key, JSON.stringify(producto), { EX: CACHE_EXPIRATION });
  }

  return producto;
}

async function createProducto(data) {
  const { nombre, precio, stock, descripcion } = data;

  const pool = await getConnection();
  await pool.request()
    .input("nombre", sql.NVarChar(150), nombre)
    .input("precio", sql.Decimal(10, 2), precio)
    .input("stock", sql.Int, stock)
    .input("descripcion", sql.NVarChar(500), descripcion || null)
    .query(`
      INSERT INTO Productos (nombre, precio, stock, descripcion)
      VALUES (@nombre, @precio, @stock, @descripcion)
    `);
  
  // INVALIDAR CACHÉ: Al crear uno nuevo, la lista completa cambia.
  await client.del(CACHE_KEY_ALL);
  return;
}

async function updateProducto(id, campos) {
  const pool = await getConnection();

  const sets = [];
  const request = pool.request().input("id", sql.Int, id);

  if (campos.nombre !== undefined) {
    sets.push("nombre = @nombre");
    request.input("nombre", sql.NVarChar(150), campos.nombre);
  }
  if (campos.precio !== undefined) {
    sets.push("precio = @precio");
    request.input("precio", sql.Decimal(10, 2), campos.precio);
  }
  if (campos.stock !== undefined) {
    sets.push("stock = @stock");
    request.input("stock", sql.Int, campos.stock);
  }
  if (campos.descripcion !== undefined) {
    sets.push("descripcion = @descripcion");
    request.input("descripcion", sql.NVarChar(500), campos.descripcion);
  }
  if (campos.isDeleted !== undefined) {
    sets.push("isDeleted = @isDeleted");
    request.input("isDeleted", sql.Bit, campos.isDeleted);
  }

  if (sets.length === 0) {
    throw new Error("No se enviaron campos para actualizar.");
  }

  const sqlQuery = `
    UPDATE Productos
    SET ${sets.join(", ")}, actualizadoEn = GETDATE()
    WHERE id = @id
  `;

  await request.query(sqlQuery);

  // INVALIDAR CACHÉ: Borramos la lista general y el item específico
  await client.del(CACHE_KEY_ALL);
  await client.del(`producto:${id}`);
  return;
}

async function deleteProducto(id) {
  const pool = await getConnection();
  await pool.request()
    .input("id", sql.Int, id)
    .query(`
      UPDATE Productos
      SET isDeleted = 1, actualizadoEn = GETDATE()
      WHERE id = @id
    `);

  // INVALIDAR CACHÉ
  await client.del(CACHE_KEY_ALL);
  await client.del(`producto:${id}`);
  return;
}