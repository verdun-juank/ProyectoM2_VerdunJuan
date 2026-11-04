const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET /authors - Listar todos los autores
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM authors ORDER BY id ASC"
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error al listar autores:", error.message);

        res.status(500).json({
            error: "Error al obtener los autores"
        });
    }
});

// GET /authors/:id - Obtener un autor por ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            error: "El ID debe ser un número entero positivo"
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM authors WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Autor no encontrado"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error al obtener el autor:", error.message);

        res.status(500).json({
            error: "Error al obtener el autor"
        });
    }
});

// POST /authors - Crear un autor
router.post("/", async (req, res) => {
    const { name, email, bio } = req.body;

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim()
    ) {
        return res.status(400).json({
            error: "El nombre y el email son obligatorios"
        });
    }

    if (
        bio !== undefined &&
        bio !== null &&
        typeof bio !== "string"
    ) {
        return res.status(400).json({
            error: "La biografía debe ser un texto"
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO authors (name, email, bio)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name.trim(), email.trim(), bio ?? null]
        );

        res.status(201).json({
            message: "Autor creado correctamente",
            author: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "Ya existe un autor con ese email"
            });
        }

        if (error.code === "22001") {
            return res.status(400).json({
                error: "El nombre o el email superan la longitud permitida"
            });
        }

        console.error("Error al crear el autor:", error.message);

        res.status(500).json({
            error: "Error al crear el autor"
        });
    }
});

// PUT /authors/:id - Actualizar un autor
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email, bio } = req.body;

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            error: "El ID debe ser un número entero positivo"
        });
    }

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim()
    ) {
        return res.status(400).json({
            error: "El nombre y el email son obligatorios"
        });
    }

    if (
        bio !== undefined &&
        bio !== null &&
        typeof bio !== "string"
    ) {
        return res.status(400).json({
            error: "La biografía debe ser un texto"
        });
    }

    try {
        const result = await pool.query(
            `UPDATE authors
             SET name = $1, email = $2, bio = $3
             WHERE id = $4
             RETURNING *`,
            [name.trim(), email.trim(), bio ?? null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Autor no encontrado"
            });
        }

        res.status(200).json({
            message: "Autor actualizado correctamente",
            author: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "Ya existe otro autor con ese email"
            });
        }

        if (error.code === "22001") {
            return res.status(400).json({
                error: "El nombre o el email superan la longitud permitida"
            });
        }

        console.error("Error al actualizar el autor:", error.message);

        res.status(500).json({
            error: "Error al actualizar el autor"
        });
    }
});

// DELETE /authors/:id - Eliminar un autor
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
        return res.status(400).json({
            error: "El ID debe ser un número entero positivo"
        });
    }

    try {
        const result = await pool.query(
            "DELETE FROM authors WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Autor no encontrado"
            });
        }

        res.status(200).json({
            message: "Autor eliminado correctamente",
            id: result.rows[0].id
        });
    } catch (error) {
        console.error("Error al eliminar el autor:", error.message);

        res.status(500).json({
            error: "Error al eliminar el autor"
        });
    }
});

module.exports = router;