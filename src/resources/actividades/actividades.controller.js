const actividadesService = require("./actividades.service");

module.exports = {
    getActividades,
    getActividadById,
    createActividad,
    updateActividad,
    deleteActividad
};

async function getActividades(req, res) {
    try {
        const actividades = await actividadesService.getActividades();
        res.json(actividades);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo actividades", details: error });
    }
}

async function getActividadById(req, res) {
    try {
        const actividad = await actividadesService.getActividadById(req.params.id);
        res.json(actividad);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo actividad", details: error });
    }
}

async function createActividad(req, res) {
    try {
        const actividad = await actividadesService.createActividad(req.body);
        res.json({ message: "Actividad creada", actividad });
    } catch (error) {
        res.status(500).json({ error: "Error creando actividad", details: error });
    }
}

async function updateActividad(req, res) {
    try {
        await actividadesService.updateActividad(req.params.id, req.body);
        res.json({ message: "Actividad actualizada" });
    } catch (error) {
        res.status(500).json({ error: "Error actualizando actividad", details: error });
    }
}

async function deleteActividad(req, res) {
    try {
        await actividadesService.deleteActividad(req.params.id);
        res.json({ message: "Actividad borrada lógicamente" });
    } catch (error) {
        res.status(500).json({ error: "Error eliminando actividad", details: error });
    }
}
