require("dotenv").config();

const express = require("express");
const pool = require("./config/db");
const authorsRoutes = require("./routes/authors.routes");
const postsRoutes = require("./routes/posts.routes");

const app = express();

// Permite recibir y procesar JSON en las solicitudes.
app.use(express.json());

app.use("/authors", authorsRoutes);
app.use("/posts", postsRoutes);

// Ruta inicial para comprobar que la API funciona.
app.get("/", (req, res) => {
    res.json({
        message: "API REST funcionando correctamente"
    });
});

// Comprobar la conexión con PostgreSQL.
app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Conexión con PostgreSQL correcta",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Error al conectar con PostgreSQL:", error.message);

        res.status(500).json({
            error: "No se pudo conectar con la base de datos"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});