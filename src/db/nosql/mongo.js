const productosService = require("./productos.service");

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};

async function getProductos(req, res) {
  try {
    const productos = await productosService.getProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo productos", error: error.message || error });
  }
}

async function getProductoById(req, res) {
  try {
    const producto = await productosService.getProductoById(req.params.id);
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo producto", error: error.message || error });
  }
}

async function createProducto(req, res) {
  try {
    await productosService.createProducto(req.body);
    res.status(201).json({ message: "Producto creado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error creando producto", error: error.message || error });
  }
}

async function updateProducto(req, res) {
  try {
    await productosService.updateProducto(req.params.id, req.body);
    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando producto", error: error.message || error });
  }
}

async function deleteProducto(req, res) {
  try {
    await productosService.deleteProducto(req.params.id);
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando producto", error: error.message || error });
  }
}
