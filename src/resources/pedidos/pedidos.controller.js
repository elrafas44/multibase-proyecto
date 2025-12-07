const pedidosService = require("./pedidos.service");

module.exports = {
    getPedidos,
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido
};

async function getPedidos(req, res) {
    try {
        const pedidos = await pedidosService.getPedidos();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo pedidos", details: error });
    }
}

async function getPedidoById(req, res) {
    try {
        const pedido = await pedidosService.getPedidoById(req.params.id);
        res.json(pedido);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo pedido", details: error });
    }
}

async function createPedido(req, res) {
    try {
        const pedido = await pedidosService.createPedido(req.body);
        res.json({ message: "Pedido creado", pedido });
    } catch (error) {
        res.status(500).json({ error: "Error creando pedido", details: error });
    }
}

async function updatePedido(req, res) {
    try {
        await pedidosService.updatePedido(req.params.id, req.body);
        res.json({ message: "Pedido actualizado" });
    } catch (error) {
        res.status(500).json({ error: "Error actualizando pedido", details: error });
    }
}

async function deletePedido(req, res) {
    try {
        await pedidosService.deletePedido(req.params.id);
        res.json({ message: "Pedido borrado lógicamente" });
    } catch (error) {
        res.status(500).json({ error: "Error eliminando pedido", details: error });
    }
}
