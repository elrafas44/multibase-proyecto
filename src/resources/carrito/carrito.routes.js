const express = require("express");
const router = express.Router();
const carritoController = require("./carrito.controller");

// GET: Ver carrito de un usuario
router.get("/:usuarioId", carritoController.getCarrito);

// POST: Agregar item al carrito del usuario
router.post("/:usuarioId", carritoController.agregarProducto);

// DELETE: Quitar un producto específico
router.delete("/:usuarioId/producto/:productoId", carritoController.eliminarProducto);

// DELETE: Vaciar todo el carrito
router.delete("/:usuarioId", carritoController.vaciarCarrito);

module.exports = router;