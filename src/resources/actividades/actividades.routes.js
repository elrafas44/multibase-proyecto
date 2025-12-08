const express = require("express");
const router = express.Router();
const controller = require("./actividades.controller");

router.get("/", controller.getActividades);
router.get("/:id", controller.getActividadById);
router.post("/", controller.createActividad);
router.patch("/:id", controller.updateActividad);
router.delete("/:id", controller.deleteActividad);

module.exports = router;
