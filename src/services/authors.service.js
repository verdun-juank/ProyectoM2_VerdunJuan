const pool = require('../db/database');

const getAuthors = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM authors
             ORDER BY id`
        );

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

const getAuthorById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM authors
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Author no encontrado'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const createAuthor = async (req, res, next) => {
    try {
        const { name, email, bio } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: 'name y email son obligatorios'
            });
        }

        const existingAuthor = await pool.query(
            `SELECT id
             FROM authors
             WHERE email = $1`,
            [email]
        );

        if (existingAuthor.rows.length > 0) {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        const result = await pool.query(
            `INSERT INTO authors (name, email, bio)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, email, bio || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const updateAuthor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, bio } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                error: 'name y email son obligatorios'
            });
        }

        const existingAuthor = await pool.query(
            `SELECT id
             FROM authors
             WHERE email = $1
             AND id != $2`,
            [email, id]
        );

        if (existingAuthor.rows.length > 0) {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        const result = await pool.query(
            `UPDATE authors
             SET name = $1,
                 email = $2,
                 bio = $3
             WHERE id = $4
             RETURNING *`,
            [name, email, bio || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Author no encontrado'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const deleteAuthor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM authors
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Author no encontrado'
            });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const getAuthorPosts = async (req, res, next) => {
    try {
        const { id } = req.params;

        const author = await pool.query(
            `SELECT id
             FROM authors
             WHERE id = $1`,
            [id]
        );

        if (author.rows.length === 0) {
            return res.status(404).json({
                error: 'Author no encontrado'
            });
        }

        const result = await pool.query(
            `SELECT *
             FROM posts
             WHERE author_id = $1
             ORDER BY id`,
            [id]
        );

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    getAuthorPosts
};

