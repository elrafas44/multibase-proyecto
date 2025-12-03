const Pedido = require("./pedidos.model");

// GET todos los pedidos (solo los no eliminados)
const getPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.find({}).toarray();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo pedidos", error });
    }
};

// GET por ID
const getPedidoById = async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id);
        res.json(pedido);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo pedido", error });
    }
};

// POST crear pedido
const createPedido = async (req, res) => {
    try {
        await Pedido.create(req.body);
        res.status(201).json({ message: "Pedido creado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error creando pedido", error });
    }
};

// PATCH actualizar pedido
const updatePedido = async (req, res) => {
    try {
        await Pedido.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: "Pedido actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error actualizando pedido", error });
    }
};

// DELETE lógico
const deletePedido = async (req, res) => {
    try {
        await Pedido.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ message: "Pedido eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error eliminando pedido", error });
    }
};

module.exports = {
    getPedidos,
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido
};
