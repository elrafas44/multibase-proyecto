const express = require("express");
const app = express();
const cors = require("cors");

// 1. IMPORTAR CONEXIÓN A REDIS
const { connectRedis } = require("./src/db/keyvalue/redis");

// Middlewares
app.use(cors());
app.use(express.json());

// --- DEFINICIÓN DE RUTAS (RECURSOS) ---

// 1. Usuarios (SQL Server)
const usuariosRoutes = require("./src/resources/usuarios/usuarios.routes");
app.use("/api/usuarios", usuariosRoutes);

// 2. Productos (SQL Server + Caché Redis)
const productosRoutes = require("./src/resources/productos/productos.routes");
app.use("/api/productos", productosRoutes);

// 3. Pedidos (MongoDB)
const pedidosRoutes = require("./src/resources/pedidos/pedidos.routes");
app.use("/api/pedidos", pedidosRoutes);

// 4. Actividades (MongoDB)
const actividadesRoutes = require("./src/resources/actividades/actividades.routes");
app.use("/api/actividades", actividadesRoutes);

// 5. Carrito de Compras (Redis)
const carritoRoutes = require("./src/resources/carrito/carrito.routes");
app.use("/api/carrito", carritoRoutes);

// 6. Categorías (SQL Server) - EL NUEVO RECURSO
const categoriasRoutes = require("./src/resources/categorias/categorias.routes");
app.use("/api/categorias", categoriasRoutes);


// --- ARRANQUE DEL SERVIDOR ---
const PORT = 3000;

app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    
    // Conectamos a Redis
    await connectRedis(); 
});