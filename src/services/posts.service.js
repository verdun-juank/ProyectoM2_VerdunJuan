const pool = require("../config/db");

// Crear errores para el middleware global.
function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Validar IDs positivos.
function isValidId(id) {
    return /^[1-9]\d*$/.test(String(id)) &&
        Number.isSafeInteger(Number(id));
}

// GET /posts
async function getAllPosts() {
    const result = await pool.query(
        "SELECT * FROM posts ORDER BY id ASC"
    );

    return result.rows;
}

// GET /posts/:id
async function getPostById(id) {
    if (!isValidId(id)) {
        throw createError(
            "El ID debe ser un entero positivo",
            400
        );
    }

    const result = await pool.query(
        "SELECT * FROM posts WHERE id = $1",
        [id]
    );

    if (result.rows.length === 0) {
        throw createError(
            "Publicación no encontrada",
            404
        );
    }

    return result.rows[0];
}

// GET /posts/author/:authorId
async function getPostsByAuthor(authorId) {
    if (!isValidId(authorId)) {
        throw createError(
            "El ID del autor debe ser un entero positivo",
            400
        );
    }

    // Comprobar que el autor exista.
    const authorResult = await pool.query(
        `SELECT id, name, email, bio, created_at
         FROM authors
         WHERE id = $1`,
        [authorId]
    );

    if (authorResult.rows.length === 0) {
        throw createError("Autor no encontrado", 404);
    }

    // Obtener sus publicaciones.
    const postsResult = await pool.query(
        `SELECT *
         FROM posts
         WHERE author_id = $1
         ORDER BY id ASC`,
        [authorId]
    );

    return {
        author: authorResult.rows[0],
        posts: postsResult.rows
    };
}

// Validar los datos de una publicación.
function validatePost(title, content, author_id, published) {
    if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof content !== "string" ||
        !content.trim() ||
        !isValidId(author_id)
    ) {
        throw createError(
            "El título, el contenido y un author_id válido son obligatorios",
            400
        );
    }

    if (typeof published !== "boolean") {
        throw createError(
            "El campo published debe ser true o false",
            400
        );
    }
}

// POST /posts
async function createPost(data) {
    const {
        title,
        content,
        author_id,
        published = false
    } = data;

    validatePost(title, content, author_id, published);

    try {
        const result = await pool.query(
            `INSERT INTO posts
                (title, content, author_id, published)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                title.trim(),
                content.trim(),
                author_id,
                published
            ]
        );

        return result.rows[0];

    } catch (error) {
        if (error.code === "23503") {
            throw createError(
                "El autor indicado no existe",
                400
            );
        }

        if (error.code === "22001") {
            throw createError(
                "El título supera la longitud máxima permitida",
                400
            );
        }

        throw error;
    }
}

// PUT /posts/:id
async function updatePost(id, data) {
    if (!isValidId(id)) {
        throw createError(
            "El ID de la publicación debe ser un entero positivo",
            400
        );
    }

    const {
        title,
        content,
        author_id,
        published = false
    } = data;

    validatePost(title, content, author_id, published);

    try {
        const result = await pool.query(
            `UPDATE posts
             SET title = $1,
                 content = $2,
                 author_id = $3,
                 published = $4
             WHERE id = $5
             RETURNING *`,
            [
                title.trim(),
                content.trim(),
                author_id,
                published,
                id
            ]
        );

        if (result.rows.length === 0) {
            throw createError(
                "Publicación no encontrada",
                404
            );
        }

        return result.rows[0];

    } catch (error) {
        if (error.code === "23503") {
            throw createError(
                "El autor indicado no existe",
                400
            );
        }

        if (error.code === "22001") {
            throw createError(
                "El título supera la longitud máxima permitida",
                400
            );
        }

        throw error;
    }
}

// DELETE /posts/:id
async function deletePost(id) {
    if (!isValidId(id)) {
        throw createError(
            "El ID debe ser un entero positivo",
            400
        );
    }

    const result = await pool.query(
        "DELETE FROM posts WHERE id = $1 RETURNING id",
        [id]
    );

    if (result.rows.length === 0) {
        throw createError(
            "Publicación no encontrada",
            404
        );
    }

    return result.rows[0].id;
}

module.exports = {
    getAllPosts,
    getPostById,
    getPostsByAuthor,
    createPost,
    updatePost,
    deletePost
};