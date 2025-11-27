const usuariosService = require("./usuarios.service");

module.exports = {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario
};

async function getUsuarios(req, res) {
    try {
        const usuarios = await usuariosService.getUsuarios();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo usuarios", details: error });
    }
}

async function getUsuarioById(req, res) {
    try {
        const usuario = await usuariosService.getUsuarioById(req.params.id);
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo usuario", details: error });
    }
}

async function createUsuario(req, res) {
    try {
        await usuariosService.createUsuario(req.body);
        res.json({ message: "Usuario creado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error creando usuario", details: error });
    }
}

async function updateUsuario(req, res) {
    try {
        await usuariosService.updateUsuario(req.params.id, req.body);
        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error actualizando usuario", details: error });
    }
}

async function deleteUsuario(req, res) {
    try {
        await usuariosService.deleteUsuario(req.params.id);
        res.json({ message: "Usuario eliminado (borrado lógico)" });
    } catch (error) {
        res.status(500).json({ error: "Error eliminando usuario", details: error });
    }
}
