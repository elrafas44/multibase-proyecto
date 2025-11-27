const express = require("express");
const app = express();
const cors = require("cors");

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const usuariosRoutes = require("./src/resources/usuarios/usuarios.routes");
app.use("/api/usuarios", usuariosRoutes);

// Servidor
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const productosRoutes = require("./src/resources/productos/productos.routes");
app.use("/api/productos", productosRoutes);
