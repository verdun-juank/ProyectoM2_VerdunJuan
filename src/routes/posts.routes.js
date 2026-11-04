const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Validar que un ID sea un entero positivo.
function isValidId(id) {
    return /^[1-9]\d*$/.test(id) &&
        Number.isSafeInteger(Number(id));
}

// GET /posts - Listar todas las publicaciones
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM posts ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error al listar publicaciones:", error.message);

        res.status(500).json({
            error: "Error al obtener las publicaciones"
        });
    }
});

// GET /posts/author/:authorId
// Listar las publicaciones de un autor junto con sus datos
router.get("/author/:authorId", async (req, res) => {
    const { authorId } = req.params;

    if (!isValidId(authorId)) {
        return res.status(400).json({
            error: "El ID del autor debe ser un entero positivo"
        });
    }

    try {
        // Comprobar que el autor exista.
        const authorResult = await pool.query(
            "SELECT id, name, email, bio, created_at FROM authors WHERE id = $1",
            [authorId]
        );

        if (authorResult.rows.length === 0) {
            return res.status(404).json({
                error: "Autor no encontrado"
            });
        }

        // Obtener sus publicaciones.
        const postsResult = await pool.query(
            `SELECT *
             FROM posts
             WHERE author_id = $1
             ORDER BY id ASC`,
            [authorId]
        );

        res.status(200).json({
            author: authorResult.rows[0],
            posts: postsResult.rows
        });
    } catch (error) {
        console.error(
            "Error al obtener publicaciones del autor:",
            error.message
        );

        res.status(500).json({
            error: "Error al obtener las publicaciones del autor"
        });
    }
});

// GET /posts/:id - Obtener una publicación por ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            error: "El ID debe ser un entero positivo"
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM posts WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Publicación no encontrada"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(
            "Error al obtener publicación:",
            error.message
        );

        res.status(500).json({
            error: "Error al obtener la publicación"
        });
    }
});

// POST /posts - Crear una publicación
router.post("/", async (req, res) => {
    const { title, content, author_id, published = false } = req.body;

    if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof content !== "string" ||
        !content.trim() ||
        !isValidId(String(author_id ?? ""))
    ) {
        return res.status(400).json({
            error: "El título, el contenido y un author_id válido son obligatorios"
        });
    }

    if (typeof published !== "boolean") {
        return res.status(400).json({
            error: "El campo published debe ser true o false"
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO posts (title, content, author_id, published)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [title.trim(), content.trim(), author_id, published]
        );

        res.status(201).json({
            message: "Publicación creada correctamente",
            post: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                error: "El autor indicado no existe"
            });
        }

        if (error.code === "22001") {
            return res.status(400).json({
                error: "El título supera la longitud máxima permitida"
            });
        }

        console.error("Error al crear publicación:", error.message);

        res.status(500).json({
            error: "Error al crear la publicación"
        });
    }
});

// PUT /posts/:id - Actualizar una publicación
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, content, author_id, published = false } = req.body;

    if (!isValidId(id)) {
        return res.status(400).json({
            error: "El ID de la publicación debe ser un entero positivo"
        });
    }

    if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof content !== "string" ||
        !content.trim() ||
        !isValidId(String(author_id ?? ""))
    ) {
        return res.status(400).json({
            error: "El título, el contenido y un author_id válido son obligatorios"
        });
    }

    if (typeof published !== "boolean") {
        return res.status(400).json({
            error: "El campo published debe ser true o false"
        });
    }

    try {
        const result = await pool.query(
            `UPDATE posts
             SET title = $1,
                 content = $2,
                 author_id = $3,
                 published = $4
             WHERE id = $5
             RETURNING *`,
            [title.trim(), content.trim(), author_id, published, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Publicación no encontrada"
            });
        }

        res.status(200).json({
            message: "Publicación actualizada correctamente",
            post: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                error: "El autor indicado no existe"
            });
        }

        if (error.code === "22001") {
            return res.status(400).json({
                error: "El título supera la longitud máxima permitida"
            });
        }

        console.error("Error al actualizar publicación:", error.message);

        res.status(500).json({
            error: "Error al actualizar la publicación"
        });
    }
});

// DELETE /posts/:id - Eliminar una publicación
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            error: "El ID debe ser un entero positivo"
        });
    }

    try {
        const result = await pool.query(
            "DELETE FROM posts WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Publicación no encontrada"
            });
        }

        res.status(200).json({
            message: "Publicación eliminada correctamente",
            id: result.rows[0].id
        });
    } catch (error) {
        console.error(
            "Error al eliminar publicación:",
            error.message
        );

        res.status(500).json({
            error: "Error al eliminar la publicación"
        });
    }
});

module.exports = router;