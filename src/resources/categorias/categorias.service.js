const { getConnection, sql } = require("../../db/relational/sqlserver");
const { client } = require("../../db/keyvalue/redis"); 

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};

// Definimos las llaves y tiempos
const CACHE_KEY_ALL = 'categorias:all';
const CACHE_EXPIRATION = 3600; // 1 hora

async function getAll() {
    // 1. INTENTAR LEER DE REDIS
    try {
        const cachedData = await client.get(CACHE_KEY_ALL);
        if (cachedData) {
            console.log("Categorías desde Caché (Redis)");
            return JSON.parse(cachedData);
        }
    } catch (err) {
        console.error("Error lectura Redis:", err);
    }

    // 2. SI NO HAY CACHÉ, LEER DE SQL
    const pool = await getConnection();
    const result = await pool.request()
        .query("SELECT * FROM Categorias WHERE isDeleted = 0");
    
    const categorias = result.recordset;

    // 3. GUARDAR EN REDIS
    try {
        await client.set(CACHE_KEY_ALL, JSON.stringify(categorias), {
            EX: CACHE_EXPIRATION
        });
        console.log(" Categorías desde SQL (Guardado en Caché)");
    } catch (err) {
        console.error("Error escritura Redis:", err);
    }

    return categorias;
}

async function getById(id) {
    const key = `categoria:${id}`;

    // 1. Cache individual
    try {
        const cachedItem = await client.get(key);
        if (cachedItem) {
            console.log(`Categoría ${id} desde Caché`);
            return JSON.parse(cachedItem);
        }
    } catch (err) { console.error(err); }

    // 2. SQL
    const pool = await getConnection();
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM Categorias WHERE id = @id AND isDeleted = 0");
    
    const item = result.recordset[0];

    // 3. Guardar en Redis si existe
    if (item) {
        await client.set(key, JSON.stringify(item), { EX: CACHE_EXPIRATION });
    }

    return item;
}

async function create(data) {
    const pool = await getConnection();
    await pool.request()
        .input("nombre", sql.NVarChar, data.nombre)
        .input("descripcion", sql.NVarChar, data.descripcion || "")
        .query("INSERT INTO Categorias (nombre, descripcion) VALUES (@nombre, @descripcion)");
    
    // INVALIDAR CACHÉ (Borramos la lista porque cambió)
    await client.del(CACHE_KEY_ALL);
    return;
}

async function update(id, data) {
    const pool = await getConnection();
    const request = pool.request().input("id", sql.Int, id);
    
    let query = "UPDATE Categorias SET ";
    const updates = [];

    if (data.nombre) {
        updates.push("nombre = @nombre");
        request.input("nombre", sql.NVarChar, data.nombre);
    }
    if (data.descripcion) {
        updates.push("descripcion = @descripcion");
        request.input("descripcion", sql.NVarChar, data.descripcion);
    }

    if (updates.length === 0) return;

    query += updates.join(", ") + " WHERE id = @id";
    await request.query(query);

    // INVALIDAR CACHÉ (Borramos lista y el item específico)
    await client.del(CACHE_KEY_ALL);
    await client.del(`categoria:${id}`);
    return;
}

async function remove(id) {
    const pool = await getConnection();
    await pool.request().input("id", sql.Int, id)
        .query("UPDATE Categorias SET isDeleted = 1 WHERE id = @id");
    
    // INVALIDAR CACHÉ
    await client.del(CACHE_KEY_ALL);
    await client.del(`categoria:${id}`);
    return;
}