const pool = require("../../src/config/db");

jest.mock("../../src/config/db", () => ({
    query: jest.fn()
}));

const postsService = require("../../src/services/posts.service");

describe("Posts Service - Tests unitarios", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getAllPosts - Obtener todas las publicaciones", async () => {
        const posts = [
            { id: 1, title: "Introducción a Node.js" },
            { id: 2, title: "APIs REST" }
        ];

        pool.query.mockResolvedValue({
            rows: posts
        });

        const result = await postsService.getAllPosts();

        expect(result).toEqual(posts);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("getPostById - Obtener una publicación existente", async () => {
        const post = {
            id: 1,
            title: "Introducción a Node.js",
            author_id: 1
        };

        pool.query.mockResolvedValue({
            rows: [post]
        });

        const result = await postsService.getPostById("1");

        expect(result).toEqual(post);
        expect(pool.query).toHaveBeenCalledWith(
            "SELECT * FROM posts WHERE id = $1",
            ["1"]
        );
    });

    test("getPostById - Publicación inexistente", async () => {
        pool.query.mockResolvedValue({
            rows: []
        });

        await expect(
            postsService.getPostById("999")
        ).rejects.toMatchObject({
            message: "Publicación no encontrada",
            statusCode: 404
        });
    });

    test("getPostById - ID inválido", async () => {
        await expect(
            postsService.getPostById("abc")
        ).rejects.toMatchObject({
            message: "El ID debe ser un entero positivo",
            statusCode: 400
        });

        expect(pool.query).not.toHaveBeenCalled();
    });

    test("getPostsByAuthor - Obtener publicaciones de un autor", async () => {
        const author = {
            id: 1,
            name: "Jorge Luis Borges"
        };

        const posts = [
            { id: 1, title: "Ficciones", author_id: 1 },
            { id: 2, title: "El Aleph", author_id: 1 }
        ];

        pool.query
            .mockResolvedValueOnce({
                rows: [author]
            })
            .mockResolvedValueOnce({
                rows: posts
            });

        const result = await postsService.getPostsByAuthor("1");

        expect(result).toEqual({
            author,
            posts
        });

        expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test("getPostsByAuthor - Autor inexistente", async () => {
        pool.query.mockResolvedValue({
            rows: []
        });

        await expect(
            postsService.getPostsByAuthor("999")
        ).rejects.toMatchObject({
            message: "Autor no encontrado",
            statusCode: 404
        });

        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("createPost - Crear una publicación correctamente", async () => {
        const post = {
            id: 1,
            title: "Ficciones",
            content: "Una colección de cuentos.",
            author_id: 1,
            published: true
        };

        pool.query.mockResolvedValue({
            rows: [post]
        });

        const result = await postsService.createPost({
            title: " Ficciones ",
            content: " Una colección de cuentos. ",
            author_id: 1,
            published: true
        });

        expect(result).toEqual(post);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO posts"),
            ["Ficciones", "Una colección de cuentos.", 1, true]
        );
    });

    test("createPost - Publicación con datos inválidos", async () => {
        await expect(
            postsService.createPost({
                title: "",
                content: "Contenido",
                author_id: 1
            })
        ).rejects.toMatchObject({
            statusCode: 400
        });

        expect(pool.query).not.toHaveBeenCalled();
    });

    test("createPost - Autor inexistente", async () => {
        const databaseError = new Error("Foreign key violation");
        databaseError.code = "23503";

        pool.query.mockRejectedValue(databaseError);

        await expect(
            postsService.createPost({
                title: "Nueva publicación",
                content: "Contenido de prueba",
                author_id: 999,
                published: false
            })
        ).rejects.toMatchObject({
            message: "El autor indicado no existe",
            statusCode: 400
        });
    });

    test("updatePost - Actualizar una publicación", async () => {
        const post = {
            id: 1,
            title: "Ficciones actualizado",
            content: "Contenido actualizado",
            author_id: 1,
            published: true
        };

        pool.query.mockResolvedValue({
            rows: [post]
        });

        const result = await postsService.updatePost("1", {
            title: "Ficciones actualizado",
            content: "Contenido actualizado",
            author_id: 1,
            published: true
        });

        expect(result).toEqual(post);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("updatePost - Publicación inexistente", async () => {
        pool.query.mockResolvedValue({
            rows: []
        });

        await expect(
            postsService.updatePost("999", {
                title: "Ficciones",
                content: "Contenido",
                author_id: 1,
                published: false
            })
        ).rejects.toMatchObject({
            message: "Publicación no encontrada",
            statusCode: 404
        });
    });

    test("deletePost - Eliminar una publicación", async () => {
        pool.query.mockResolvedValue({
            rows: [{ id: 1 }]
        });

        const result = await postsService.deletePost("1");

        expect(result).toBe(1);
        expect(pool.query).toHaveBeenCalledWith(
            "DELETE FROM posts WHERE id = $1 RETURNING id",
            ["1"]
        );
    });

    test("deletePost - Publicación inexistente", async () => {
        pool.query.mockResolvedValue({
            rows: []
        });

        await expect(
            postsService.deletePost("999")
        ).rejects.toMatchObject({
            message: "Publicación no encontrada",
            statusCode: 404
        });
    });
});
