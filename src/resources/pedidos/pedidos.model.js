const mongoose = require("../../db/nosql/mongo");

const PedidoSchema = new mongoose.Schema({
    usuarioId: { type: Number, required: true },
    productos: [
        {
            productoId: Number,
            cantidad: Number
        }
    ],
    total: Number,
    fecha: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("Pedido", PedidoSchema);
