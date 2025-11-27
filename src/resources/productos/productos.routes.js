const express = require("express");
const router = express.Router();
const productosController = require("./productos.controller");

router.get("/", productosController.getProductos);
router.get("/:id", productosController.getProductoById);
router.post("/", productosController.createProducto);
router.patch("/:id", productosController.updateProducto);
router.delete("/:id", productosController.deleteProducto);

module.exports = router;
