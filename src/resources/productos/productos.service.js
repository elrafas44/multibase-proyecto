const { getConnection, sql } = require("../../db/relational/sqlserver");

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};

async function getProductos() {
  const pool = await getConnection();
  const result = await pool.request()
    .query(`
      SELECT id, nombre, precio, stock, descripcion, creadoEn, actualizadoEn, isDeleted
      FROM Productos
      WHERE isDeleted = 0
      ORDER BY id ASC
    `);
  return result.recordset;
}

async function getProductoById(id) {
  const pool = await getConnection();
  const result = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT id, nombre, precio, stock, descripcion, creadoEn, actualizadoEn, isDeleted
      FROM Productos
      WHERE id = @id AND isDeleted = 0
    `);
  return result.recordset[0];
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
  return;
}
