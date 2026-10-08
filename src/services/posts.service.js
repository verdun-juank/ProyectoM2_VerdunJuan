const pool = require('../db/database');

const getPosts = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT
                posts.id,
                posts.title,
                posts.content,
                posts.author_id,
                posts.published,
                posts.created_at,
                authors.name AS author_name,
                authors.email AS author_email
             FROM posts
             INNER JOIN authors
                ON posts.author_id = authors.id
             ORDER BY posts.id`
        );

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

const getPostById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                posts.id,
                posts.title,
                posts.content,
                posts.author_id,
                posts.published,
                posts.created_at,
                authors.name AS author_name
             FROM posts
             INNER JOIN authors
                ON posts.author_id = authors.id
             WHERE posts.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Post no encontrado'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const createPost = async (req, res, next) => {
    try {
        const {
            title,
            content,
            author_id,
            published
        } = req.body;

        if (!title || !content || !author_id) {
            return res.status(400).json({
                error: 'title, content y author_id son obligatorios'
            });
        }

        const author = await pool.query(
            `SELECT id
             FROM authors
             WHERE id = $1`,
            [author_id]
        );

        if (author.rows.length === 0) {
            return res.status(400).json({
                error: 'El author no existe'
            });
        }

        const result = await pool.query(
            `INSERT INTO posts
                (title, content, author_id, published)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                title,
                content,
                author_id,
                published ?? false
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};
const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            title,
            content,
            author_id,
            published
        } = req.body;

        if (!title || !content || !author_id) {
            return res.status(400).json({
                error: 'title, content y author_id son obligatorios'
            });
        }

        const author = await pool.query(
            `SELECT id
             FROM authors
             WHERE id = $1`,
            [author_id]
        );

        if (author.rows.length === 0) {
            return res.status(400).json({
                error: 'El author no existe'
            });
        }

        const result = await pool.query(
            `UPDATE posts
             SET title = $1,
                 content = $2,
                 author_id = $3,
                 published = $4
             WHERE id = $5
             RETURNING *`,
            [
                title,
                content,
                author_id,
                published ?? false,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Post no encontrado'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};
const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM posts
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Post no encontrado'
            });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};