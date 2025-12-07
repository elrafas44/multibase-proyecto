const { connectMongo } = require("../../db/nosql/mongo");
const { ObjectId } = require("mongodb");

module.exports = {
    getActividades,
    getActividadById,
    createActividad,
    updateActividad,
    deleteActividad
};

async function getActividades() {
    const db = await connectMongo();
    return db.collection("actividades")
        .find({ isDeleted: false })
        .toArray();
}

async function getActividadById(id) {
    const db = await connectMongo();
    return db.collection("actividades")
        .findOne({ _id: new ObjectId(id) });
}

async function createActividad(data) {
    const db = await connectMongo();

    const actividad = {
        usuarioId: data.usuarioId,
        accion: data.accion,
        descripcion: data.descripcion,
        timestamp: new Date(),
        isDeleted: false
    };

    await db.collection("actividades").insertOne(actividad);
    return actividad;
}

async function updateActividad(id, campos) {
    const db = await connectMongo();

    await db.collection("actividades").updateOne(
        { _id: new ObjectId(id) },
        { $set: campos }
    );
}

async function deleteActividad(id) {
    const db = await connectMongo();

    await db.collection("actividades").updateOne(
        { _id: new ObjectId(id) },
        { $set: { isDeleted: true } }
    );
}
