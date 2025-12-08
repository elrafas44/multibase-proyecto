const carritoService = require("./carrito.service");

module.exports = {
    getCarrito,
    agregarProducto,
    eliminarProducto,
    vaciarCarrito
};

async function getCarrito(req, res) {
    try {
        const { usuarioId } = req.params;
        const carrito = await carritoService.getCarrito(usuarioId);
        res.json({ usuarioId, items: carrito });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function agregarProducto(req, res) {
    try {
        const { usuarioId } = req.params;
        const { productoId, nombre, precio, cantidad } = req.body;

        // Validación básica
        if (!productoId || !cantidad) {
            return res.status(400).json({ message: "Faltan datos del producto" });
        }

        const carritoActualizado = await carritoService.agregarProducto(usuarioId, {
            productoId, nombre, precio, cantidad
        });

        res.json({ message: "Producto agregado", carrito: carritoActualizado });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function eliminarProducto(req, res) {
    try {
        const { usuarioId, productoId } = req.params;
        const carrito = await carritoService.eliminarProducto(usuarioId, productoId);
        res.json({ message: "Producto eliminado", carrito });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function vaciarCarrito(req, res) {
    try {
        const { usuarioId } = req.params;
        await carritoService.vaciarCarrito(usuarioId);
        res.json({ message: "Carrito vaciado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}