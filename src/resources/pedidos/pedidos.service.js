const { connectMongo } = require("../../db/nosql/mongo");
const { ObjectId } = require("mongodb");

module.exports = {
    getPedidos,
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido
};

async function getPedidos() {
    const db = await connectMongo();
    return db.collection("pedidos")
        .find({ isDeleted: false })
        .toArray();
}

async function getPedidoById(id) {
    const db = await connectMongo();
    return db.collection("pedidos")
        .findOne({ _id: new ObjectId(id) });
}

async function createPedido(data) {
    const db = await connectMongo();

    const pedido = {
        usuarioId: data.usuarioId,
        productoId: data.productoId,
        cantidad: data.cantidad,
        total: data.total,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        isDeleted: false
    };

    await db.collection("pedidos").insertOne(pedido);
    return pedido;
}

async function updatePedido(id, campos) {
    const db = await connectMongo();

    campos.actualizadoEn = new Date();

    await db.collection("pedidos").updateOne(
        { _id: new ObjectId(id) },
        { $set: campos }
    );
}

async function deletePedido(id) {
    const db = await connectMongo();

    await db.collection("pedidos").updateOne(
        { _id: new ObjectId(id) },
        { $set: { isDeleted: true, actualizadoEn: new Date() } }
    );
}
