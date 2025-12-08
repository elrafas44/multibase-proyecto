const { connectMongo } = require("../../db/nosql/mongo");
const { ObjectId } = require("mongodb");
const { client } = require("../../db/keyvalue/redis"); // <--- Importamos Redis

module.exports = {
    getPedidos,
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido
};

const CACHE_KEY_ALL = 'pedidos:all';
const CACHE_EXPIRATION = 3600; // 1 hora

// -----------------------------------------------------
// Obtener todos los pedidos (Con Caché)
// -----------------------------------------------------
async function getPedidos() {
    // 1. INTENTAR LEER DE REDIS
    try {
        const cachedData = await client.get(CACHE_KEY_ALL);
        if (cachedData) {
            console.log("Pedidos desde Caché (Redis)");
            return JSON.parse(cachedData);
        }
    } catch (err) {
        console.error("Error lectura Redis:", err);
    }

    // 2. LEER DE MONGODB
    const db = await connectMongo();
    const pedidos = await db.collection("pedidos")
        .find({ isDeleted: false })
        .toArray();

    // 3. GUARDAR EN REDIS
    try {
        await client.set(CACHE_KEY_ALL, JSON.stringify(pedidos), {
            EX: CACHE_EXPIRATION
        });
        console.log("Pedidos desde MongoDB (Guardado en Caché)");
    } catch (err) {
        console.error("Error escritura Redis:", err);
    }

    return pedidos;
}

// -----------------------------------------------------
// Obtener un pedido por ID (Con Caché Individual)
// -----------------------------------------------------
async function getPedidoById(id) {
    const key = `pedido:${id}`;

    // 1. Caché individual
    try {
        const cachedItem = await client.get(key);
        if (cachedItem) {
            console.log(`Pedido ${id} desde Caché`);
            return JSON.parse(cachedItem);
        }
    } catch (err) { console.error(err); }

    // 2. MONGODB
    const db = await connectMongo();
    const pedido = await db.collection("pedidos")
        .findOne({ _id: new ObjectId(id) });

    // 3. Guardar en Redis
    if (pedido) {
        await client.set(key, JSON.stringify(pedido), { EX: CACHE_EXPIRATION });
    }

    return pedido;
}

// -----------------------------------------------------
// Crear Pedido (Invalida Caché)
// -----------------------------------------------------
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

    // INVALIDAR CACHÉ (La lista cambió)
    await client.del(CACHE_KEY_ALL);

    return pedido;
}

// -----------------------------------------------------
// Actualizar Pedido (Invalida Caché)
// -----------------------------------------------------
async function updatePedido(id, campos) {
    const db = await connectMongo();

    campos.actualizadoEn = new Date();

    await db.collection("pedidos").updateOne(
        { _id: new ObjectId(id) },
        { $set: campos }
    );

    // INVALIDAR CACHÉ (Lista y Elemento específico)
    await client.del(CACHE_KEY_ALL);
    await client.del(`pedido:${id}`);
}

// -----------------------------------------------------
// Borrado Lógico (Invalida Caché)
// -----------------------------------------------------
async function deletePedido(id) {
    const db = await connectMongo();

    await db.collection("pedidos").updateOne(
        { _id: new ObjectId(id) },
        { $set: { isDeleted: true, actualizadoEn: new Date() } }
    );

    // INVALIDAR CACHÉ
    await client.del(CACHE_KEY_ALL);
    await client.del(`pedido:${id}`);
}