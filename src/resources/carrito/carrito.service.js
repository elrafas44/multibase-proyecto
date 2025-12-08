const { client } = require("../../db/keyvalue/redis");
const { connectMongo } = require("../../db/nosql/mongo");

module.exports = {
    getCarrito,
    agregarProducto,
    eliminarProducto,
    vaciarCarrito
};

const TTL_CARRITO = 86400; // 24 horas

// -----------------------------------------------------
// Obtener Carrito (Patrón Cache-Aside)
// -----------------------------------------------------
async function getCarrito(usuarioId) {
    const key = `carrito:${usuarioId}`;

    // 1. INTENTAR LEER DE REDIS (Caché)
    try {
        const cachedCarrito = await client.get(key);
        if (cachedCarrito) {
            console.log("Carrito desde Caché (Redis)");
            return JSON.parse(cachedCarrito);
        }
    } catch (err) { console.error(err); }

    // 2. SI NO ESTÁ, LEER DE MONGODB (Persistencia)
    console.log("Carrito desde MongoDB");
    const db = await connectMongo();
    
    // Buscamos el documento del carrito de este usuario
    const carritoDoc = await db.collection("carritos").findOne({ usuarioId: usuarioId });
    
    // Si existe en Mongo, tomamos sus items, si no, es arreglo vacío
    const items = carritoDoc ? carritoDoc.items : [];

    // 3. GUARDAR EN REDIS (Para la próxima)
    try {
        await client.set(key, JSON.stringify(items), { EX: TTL_CARRITO });
    } catch (err) { console.error(err); }

    return items;
}

// -----------------------------------------------------
// Agregar Producto (Actualiza Mongo + Invalida Redis)
// -----------------------------------------------------
async function agregarProducto(usuarioId, producto) {
    const key = `carrito:${usuarioId}`;
    
    // 1. Traer la versión actual (desde Mongo o Redis, usando nuestra función get)
    let items = await getCarrito(usuarioId);

    // 2. Lógica de negocio (Sumar cantidad o agregar nuevo)
    const index = items.findIndex(p => p.productoId == producto.productoId);
    if (index >= 0) {
        items[index].cantidad += producto.cantidad;
    } else {
        items.push({
            productoId: producto.productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: producto.cantidad
        });
    }

    // 3. GUARDAR EN MONGODB (La verdad absoluta)
    const db = await connectMongo();
    await db.collection("carritos").updateOne(
        { usuarioId: usuarioId },
        { $set: { items: items, ultimoAcceso: new Date() } },
        { upsert: true } // Si no existe, lo crea
    );

    // 4. ACTUALIZAR REDIS (Para que esté fresco)
    // Podríamos borrarlo (del), pero como ya tenemos los datos, mejor los actualizamos
    await client.set(key, JSON.stringify(items), { EX: TTL_CARRITO });

    return items;
}

// -----------------------------------------------------
// Eliminar Producto
// -----------------------------------------------------
async function eliminarProducto(usuarioId, productoId) {
    const key = `carrito:${usuarioId}`;
    let items = await getCarrito(usuarioId);

    // Filtrar
    items = items.filter(p => p.productoId != productoId);

    // Actualizar Mongo
    const db = await connectMongo();
    await db.collection("carritos").updateOne(
        { usuarioId: usuarioId },
        { $set: { items: items } }
    );

    // Actualizar Redis
    await client.set(key, JSON.stringify(items), { EX: TTL_CARRITO });

    return items;
}

// -----------------------------------------------------
// Vaciar Carrito
// -----------------------------------------------------
async function vaciarCarrito(usuarioId) {
    const key = `carrito:${usuarioId}`;
    
    // Borrar de Mongo
    const db = await connectMongo();
    await db.collection("carritos").deleteOne({ usuarioId: usuarioId });

    // Borrar de Redis
    await client.del(key);
    
    return;
}