const express = require("express");
const router = express.Router();
const controller = require("./pedidos.controller");

router.get("/", controller.getPedidos);
router.get("/:id", controller.getPedidoById);
router.post("/", controller.createPedido);
router.patch("/:id", controller.updatePedido);
router.delete("/:id", controller.deletePedido);

module.exports = router;
