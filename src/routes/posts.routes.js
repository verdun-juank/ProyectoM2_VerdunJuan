const express = require("express");
const router = express.Router();

const postsService = require("../services/posts.service");

// GET /posts - Listar publicaciones.
router.get("/", async (req, res) => {
    const posts = await postsService.getAllPosts();

    res.status(200).json(posts);
});

// GET /posts/author/:authorId
router.get("/author/:authorId", async (req, res) => {
    const result = await postsService.getPostsByAuthor(
        req.params.authorId
    );

    res.status(200).json(result);
});

// GET /posts/:id - Obtener publicación.
router.get("/:id", async (req, res) => {
    const post = await postsService.getPostById(
        req.params.id
    );

    res.status(200).json(post);
});

// POST /posts - Crear publicación.
router.post("/", async (req, res) => {
    const post = await postsService.createPost(req.body);

    res.status(201).json({
        message: "Publicación creada correctamente",
        post
    });
});

// PUT /posts/:id - Actualizar publicación.
router.put("/:id", async (req, res) => {
    const post = await postsService.updatePost(
        req.params.id,
        req.body
    );

    res.status(200).json({
        message: "Publicación actualizada correctamente",
        post
    });
});

// DELETE /posts/:id - Eliminar publicación.
router.delete("/:id", async (req, res) => {
    const id = await postsService.deletePost(
        req.params.id
    );

    res.status(200).json({
        message: "Publicación eliminada correctamente",
        id
    });
});

module.exports = router;