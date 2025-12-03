const Actividad = require("./actividades.model");

// GET todas
const getActividades = async (req, res) => {
    try {
        const actividades = await Actividad.find({}).toarray();
        res.json(actividades);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo actividades", error });
    }
};

// GET por ID
const getActividadById = async (req, res) => {
    try {
        const actividad = await Actividad.findById(req.params.id);
        res.json(actividad);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo actividad", error });
    }
};

// POST crear
const createActividad = async (req, res) => {
    try {
        await Actividad.create(req.body);
        res.status(201).json({ message: "Actividad creada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error creando actividad", error });
    }
};

// PATCH actualizar
const updateActividad = async (req, res) => {
    try {
        await Actividad.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: "Actividad actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error actualizando actividad", error });
    }
};

// DELETE lógico
const deleteActividad = async (req, res) => {
    try {
        await Actividad.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ message: "Actividad eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error eliminando actividad", error });
    }
};

module.exports = {
    getActividades,
    getActividadById,
    createActividad,
    updateActividad,
    deleteActividad
};
