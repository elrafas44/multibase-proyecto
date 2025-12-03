const mongoose = require("mongoose");

async function connectMongo() {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/multibase";
        await mongoose.connect(uri);
        console.log("MongoDB conectado correctamente");
    } catch (error) {
        console.error("Error conectando a MongoDB:", error);
    }
}

connectMongo();

module.exports = mongoose;
