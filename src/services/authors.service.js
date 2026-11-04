const pool = require("../config/db");

// Crear errores que serán gestionados por el middleware.
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Validar ID.
function isValidId(id) {
    return /^[1-9]\d*$/.test(id) &&
        Number.isSafeInteger(Number(id));
}

// GET /authors
async function getAllAuthors() {
    const result = await pool.query(
        "SELECT * FROM authors ORDER BY id ASC"
    );

    return result.rows;
}

// GET /authors/:id
async function getAuthorById(id) {
    if (!isValidId(id)) {
        throw createError(
            "El ID debe ser un número entero positivo",
            400
        );
    }

    const result = await pool.query(
        "SELECT * FROM authors WHERE id = $1",
        [id]
    );

    if (result.rows.length === 0) {
        throw createError("Autor no encontrado", 404);
    }

    return result.rows[0];
}

// Validaciones para crear y actualizar autores.
function validateAuthor(name, email, bio) {
    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim()
    ) {
        throw createError(
            "El nombre y el email son obligatorios",
            400
        );
    }

    if (
        bio !== undefined &&
        bio !== null &&
        typeof bio !== "string"
    ) {
        throw createError(
            "La biografía debe ser un texto",
            400
        );
    }
}

// POST /authors
async function createAuthor(data) {
    const { name, email, bio } = data;

    validateAuthor(name, email, bio);

    try {
        const result = await pool.query(
            `INSERT INTO authors (name, email, bio)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name.trim(), email.trim(), bio ?? null]
        );

        return result.rows[0];

    } catch (error) {
        if (error.code === "23505") {
            throw createError(
                "Ya existe un autor con ese email",
                409
            );
        }

        if (error.code === "22001") {
            throw createError(
                "El nombre o el email superan la longitud permitida",
                400
            );
        }

        throw error;
    }
}

// PUT /authors/:id
async function updateAuthor(id, data) {
    if (!isValidId(id)) {
        throw createError(
            "El ID debe ser un número entero positivo",
            400
        );
    }

    const { name, email, bio } = data;

    validateAuthor(name, email, bio);

    try {
        const result = await pool.query(
            `UPDATE authors
             SET name = $1, email = $2, bio = $3
             WHERE id = $4
             RETURNING *`,
            [name.trim(), email.trim(), bio ?? null, id]
        );

        if (result.rows.length === 0) {
            throw createError("Autor no encontrado", 404);
        }

        return result.rows[0];

    } catch (error) {
        if (error.code === "23505") {
            throw createError(
                "Ya existe otro autor con ese email",
                409
            );
        }

        if (error.code === "22001") {
            throw createError(
                "El nombre o el email superan la longitud permitida",
                400
            );
        }

        throw error;
    }
}

// DELETE /authors/:id
async function deleteAuthor(id) {
    if (!isValidId(id)) {
        throw createError(
            "El ID debe ser un número entero positivo",
            400
        );
    }

    const result = await pool.query(
        "DELETE FROM authors WHERE id = $1 RETURNING id",
        [id]
    );

    if (result.rows.length === 0) {
        throw createError("Autor no encontrado", 404);
    }

    return result.rows[0].id;
}

module.exports = {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor
};