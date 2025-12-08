const { sql, getConnection } = require("../../db/relational/sqlserver");
const { client } = require("../../db/keyvalue/redis"); // <--- Importamos Redis

module.exports = {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario
};

const CACHE_KEY_ALL = 'usuarios:all';
const CACHE_EXPIRATION = 3600; // 1 hora

// -----------------------------------------------------
// Obtener todos los usuarios (Con Caché)
// -----------------------------------------------------
async function getUsuarios() {
    // 1. INTENTAR LEER DE REDIS
    try {
        const cachedData = await client.get(CACHE_KEY_ALL);
        if (cachedData) {
            console.log("Usuarios desde Caché (Redis)");
            return JSON.parse(cachedData);
        }
    } catch (err) {
        console.error("Error lectura Redis:", err);
    }

    // 2. LEER DE SQL
    const pool = await getConnection();
    const result = await pool.request()
        .query(`
            SELECT id, nombre, email, passwordHash, creadoEn, actualizadoEn, isDeleted
            FROM usuarios
            WHERE isDeleted = 0
        `);

    const usuarios = result.recordset;

    // 3. GUARDAR EN REDIS
    try {
        await client.set(CACHE_KEY_ALL, JSON.stringify(usuarios), {
            EX: CACHE_EXPIRATION
        });
        console.log("Usuarios desde SQL (Guardado en Caché)");
    } catch (err) {
        console.error("Error escritura Redis:", err);
    }

    return usuarios;
}

// -----------------------------------------------------
// Obtener un usuario por ID (Con Caché Individual)
// -----------------------------------------------------
async function getUsuarioById(id) {
    const key = `usuario:${id}`;

    // 1. Caché individual
    try {
        const cachedItem = await client.get(key);
        if (cachedItem) {
            console.log(`Usuario ${id} desde Caché`);
            return JSON.parse(cachedItem);
        }
    } catch (err) { console.error(err); }

    // 2. SQL
    const pool = await getConnection();
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT id, nombre, email, passwordHash, creadoEn, actualizadoEn, isDeleted
            FROM usuarios
            WHERE id = @id
        `);

    const usuario = result.recordset[0];

    // 3. Guardar en Redis
    if (usuario) {
        await client.set(key, JSON.stringify(usuario), { EX: CACHE_EXPIRATION });
    }

    return usuario;
}

// -----------------------------------------------------
// Crear usuario (Invalida Caché)
// -----------------------------------------------------
async function createUsuario(usuario) {
    const pool = await getConnection();

    await pool.request()
        .input("nombre", sql.VarChar, usuario.nombre)
        .input("email", sql.VarChar, usuario.email)
        .input("passwordHash", sql.VarChar, usuario.password)
        .query(`
            INSERT INTO usuarios (nombre, email, passwordHash)
            VALUES (@nombre, @email, @passwordHash)
        `);

    // INVALIDAR CACHÉ (La lista cambia)
    await client.del(CACHE_KEY_ALL);
    return;
}

// -----------------------------------------------------
// Actualizar usuario (Invalida Caché)
// -----------------------------------------------------
async function updateUsuario(id, campos) {
    const pool = await getConnection();

    const sets = [];
    const params = { id };

    if (campos.nombre !== undefined) {
        sets.push("nombre = @nombre");
        params.nombre = campos.nombre;
    }
    if (campos.email !== undefined) {
        sets.push("email = @email");
        params.email = campos.email;
    }
    if (campos.password !== undefined) {
        sets.push("passwordHash = @passwordHash");
        params.passwordHash = campos.password;
    }
    if (campos.isDeleted !== undefined) {
        sets.push("isDeleted = @isDeleted");
        params.isDeleted = campos.isDeleted;
    }

    if (sets.length === 0) {
        throw new Error("No se enviaron campos para actualizar.");
    }

    const query = `
        UPDATE usuarios
        SET ${sets.join(", ")}, actualizadoEn = GETDATE()
        WHERE id = @id
    `;

    const request = pool.request();
    request.input("id", sql.Int, id);

    if (params.nombre !== undefined) request.input("nombre", sql.VarChar, params.nombre);
    if (params.email !== undefined) request.input("email", sql.VarChar, params.email);
    if (params.passwordHash !== undefined) request.input("passwordHash", sql.VarChar, params.passwordHash);
    if (params.isDeleted !== undefined) request.input("isDeleted", sql.Bit, params.isDeleted);

    await request.query(query);

    // INVALIDAR CACHÉ (Lista y Usuario específico)
    await client.del(CACHE_KEY_ALL);
    await client.del(`usuario:${id}`);
    return;
}

// -----------------------------------------------------
// Borrado lógico (Invalida Caché)
// -----------------------------------------------------
async function deleteUsuario(id) {
    const pool = await getConnection();

    await pool.request()
        .input("id", sql.Int, id)
        .query(`
            UPDATE usuarios
            SET isDeleted = 1, actualizadoEn = GETDATE()
            WHERE id = @id
        `);

    // INVALIDAR CACHÉ
    await client.del(CACHE_KEY_ALL);
    await client.del(`usuario:${id}`);
    return;
}