const { connectMongo } = require("../../db/nosql/mongo");
const { ObjectId } = require("mongodb");
const { client } = require("../../db/keyvalue/redis"); // <--- Importamos Redis

module.exports = {
    getActividades,
    getActividadById,
    createActividad,
    updateActividad,
    deleteActividad
};

const CACHE_KEY_ALL = 'actividades:all';
const CACHE_EXPIRATION = 3600; // 1 hora

// -----------------------------------------------------
// Obtener todas las actividades (Con Caché)
// -----------------------------------------------------
async function getActividades() {
    // 1. INTENTAR LEER DE REDIS
    try {
        const cachedData = await client.get(CACHE_KEY_ALL);
        if (cachedData) {
            console.log("Actividades desde Caché (Redis)");
            return JSON.parse(cachedData);
        }
    } catch (err) {
        console.error("Error lectura Redis:", err);
    }

    // 2. LEER DE MONGODB
    const db = await connectMongo();
    const actividades = await db.collection("actividades")
        .find({ isDeleted: false })
        .toArray();

    // 3. GUARDAR EN REDIS
    try {
        await client.set(CACHE_KEY_ALL, JSON.stringify(actividades), {
            EX: CACHE_EXPIRATION
        });
        console.log("Actividades desde MongoDB (Guardado en Caché)");
    } catch (err) {
        console.error("Error escritura Redis:", err);
    }

    return actividades;
}

// -----------------------------------------------------
// Obtener por ID (Con Caché Individual)
// -----------------------------------------------------
async function getActividadById(id) {
    const key = `actividad:${id}`;

    // 1. Caché individual
    try {
        const cachedItem = await client.get(key);
        if (cachedItem) {
            console.log(`Actividad ${id} desde Caché`);
            return JSON.parse(cachedItem);
        }
    } catch (err) { console.error(err); }

    // 2. MONGODB
    const db = await connectMongo();
    const actividad = await db.collection("actividades")
        .findOne({ _id: new ObjectId(id) });

    // 3. Guardar en Redis
    if (actividad) {
        await client.set(key, JSON.stringify(actividad), { EX: CACHE_EXPIRATION });
    }

    return actividad;
}

// -----------------------------------------------------
// Crear Actividad (Invalida Caché)
// -----------------------------------------------------
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

    // INVALIDAR CACHÉ (La lista general cambió)
    await client.del(CACHE_KEY_ALL);

    return actividad;
}

// -----------------------------------------------------
// Actualizar Actividad (Invalida Caché)
// -----------------------------------------------------
async function updateActividad(id, campos) {
    const db = await connectMongo();

    await db.collection("actividades").updateOne(
        { _id: new ObjectId(id) },
        { $set: campos }
    );

    // INVALIDAR CACHÉ (Lista y Elemento específico)
    await client.del(CACHE_KEY_ALL);
    await client.del(`actividad:${id}`);
}

// -----------------------------------------------------
// Borrado Lógico (Invalida Caché)
// -----------------------------------------------------
async function deleteActividad(id) {
    const db = await connectMongo();

    await db.collection("actividades").updateOne(
        { _id: new ObjectId(id) },
        { $set: { isDeleted: true } }
    );

    // INVALIDAR CACHÉ
    await client.del(CACHE_KEY_ALL);
    await client.del(`actividad:${id}`);
}