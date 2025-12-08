const { createClient } = require('redis');
require('dotenv').config();

// Crear el cliente usando la variable de entorno o localhost por defecto
const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.log('Redis Client Error', err));

// Función para conectar (llamarla en tu index.js o app.js principal al iniciar el servidor)
async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
        console.log("Conectado a Redis");
    }
}

module.exports = { client, connectRedis };