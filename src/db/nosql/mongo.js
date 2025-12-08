const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB;

let client;
let db;

async function connectMongo() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db(dbName);
        console.log("Conectado a MongoDB");
    }
    return db;
}

module.exports = {
    connectMongo
};
