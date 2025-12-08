const service = require("./categorias.service");

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};

async function getAll(req, res) {
    try {
        const categorias = await service.getAll();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getById(req, res) {
    try {
        const categoria = await service.getById(req.params.id);
        if (!categoria) return res.status(404).json({ message: "Categoría no encontrada" });
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function create(req, res) {
    try {
        if (!req.body.nombre) return res.status(400).json({ message: "El nombre es obligatorio" });
        
        await service.create(req.body);
        res.status(201).json({ message: "Categoría creada con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function update(req, res) {
    try {
        await service.update(req.params.id, req.body);
        res.json({ message: "Categoría actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function remove(req, res) {
    try {
        await service.remove(req.params.id);
        res.json({ message: "Categoría eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}