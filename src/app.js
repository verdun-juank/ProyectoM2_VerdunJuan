const express = require("express");
const pool = require("./config/db");

const authorsRoutes = require("./routes/authors.routes");
const postsRoutes = require("./routes/posts.routes");

const notFoundMiddleware = require("./middlewares/not-found.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// Permite recibir JSON.
app.use(express.json());

// Ruta inicial.
app.get("/", (req, res) => {
    res.status(200).json({
        message: "API REST funcionando correctamente"
    });
});

// Comprobar conexión con PostgreSQL.
app.get("/db-test", async (req, res) => {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
        message: "Conexión con PostgreSQL correcta",
        time: result.rows[0].now
    });
});

// Rutas principales.
app.use("/authors", authorsRoutes);
app.use("/posts", postsRoutes);

// Gestionar rutas inexistentes.
app.use(notFoundMiddleware);

// Gestionar errores generales.
app.use(errorMiddleware);

module.exports = app;