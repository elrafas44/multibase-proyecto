const express = require("express");
const router = express.Router();

const {
    getActividades,
    getActividadById,
    createActividad,
    updateActividad,
    deleteActividad
} = require("./actividades.controller");

router.get("/", getActividades);
router.get("/:id", getActividadById);
router.post("/", createActividad);
router.patch("/:id", updateActividad);
router.delete("/:id", deleteActividad);

module.exports = router;
