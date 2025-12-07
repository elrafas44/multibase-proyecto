const { sql, getConnection } = require("../../db/relational/sqlserver");

module.exports = {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario
};

// -----------------------------------------------------
// Obtener todos los usuarios NO eliminados
// -----------------------------------------------------
async function getUsuarios() {
    const pool = await getConnection();
    const result = await pool.request()
        .query(`
            SELECT id, nombre, email, passwordHash, creadoEn, actualizadoEn, isDeleted
            FROM usuarios
            WHERE isDeleted = 0
        `);

    return result.recordset;
}

// -----------------------------------------------------
// Obtener un usuario por ID
// -----------------------------------------------------
async function getUsuarioById(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT id, nombre, email, passwordHash, creadoEn, actualizadoEn, isDeleted
            FROM usuarios
            WHERE id = @id
        `);

    return result.recordset[0];
}

// -----------------------------------------------------
// Crear usuario
// -----------------------------------------------------
async function createUsuario(usuario) {
    const pool = await getConnection();

    const result = await pool.request()
        .input("nombre", sql.VarChar, usuario.nombre)
        .input("email", sql.VarChar, usuario.email)
        .input("passwordHash", sql.VarChar, usuario.password)
        .query(`
            INSERT INTO usuarios (nombre, email, passwordHash)
            VALUES (@nombre, @email, @passwordHash)
        `);

    return result.rowsAffected[0];
}

// -----------------------------------------------------
// Actualizar usuario (PATCH dinámico / borrado lógico)
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

    if (params.nombre !== undefined)
        request.input("nombre", sql.VarChar, params.nombre);

    if (params.email !== undefined)
        request.input("email", sql.VarChar, params.email);

    if (params.passwordHash !== undefined)
        request.input("passwordHash", sql.VarChar, params.passwordHash);

    if (params.isDeleted !== undefined)
        request.input("isDeleted", sql.Bit, params.isDeleted);

    await request.query(query);
}

// -----------------------------------------------------
// Borrado lógico
// -----------------------------------------------------
async function deleteUsuario(id) {
    const pool = await getConnection();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            UPDATE usuarios
            SET isDeleted = 1, actualizadoEn = GETDATE()
            WHERE id = @id
        `);

    return result.rowsAffected[0];
}
