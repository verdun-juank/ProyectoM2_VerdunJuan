const express = require("express");
const router = express.Router();

const authorsService = require("../services/authors.service");

// GET /authors - Listar autores.
router.get("/", async (req, res) => {
    const authors = await authorsService.getAllAuthors();

    res.status(200).json(authors);
});

// GET /authors/:id - Obtener un autor.
router.get("/:id", async (req, res) => {
    const author = await authorsService.getAuthorById(
        req.params.id
    );

    res.status(200).json(author);
});

// POST /authors - Crear un autor.
router.post("/", async (req, res) => {
    const author = await authorsService.createAuthor(req.body);

    res.status(201).json({
        message: "Autor creado correctamente",
        author
    });
});

// PUT /authors/:id - Actualizar un autor.
router.put("/:id", async (req, res) => {
    const author = await authorsService.updateAuthor(
        req.params.id,
        req.body
    );

    res.status(200).json({
        message: "Autor actualizado correctamente",
        author
    });
});

// DELETE /authors/:id - Eliminar un autor.
router.delete("/:id", async (req, res) => {
    const id = await authorsService.deleteAuthor(
        req.params.id
    );

    res.status(200).json({
        message: "Autor eliminado correctamente",
        id
    });
});

module.exports = router;