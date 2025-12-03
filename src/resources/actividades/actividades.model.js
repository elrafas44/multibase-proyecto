const mongoose = require("../../db/nosql/mongo");

const ActividadSchema = new mongoose.Schema({
    usuarioId: Number,
    descripcion: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("Actividad", ActividadSchema);
