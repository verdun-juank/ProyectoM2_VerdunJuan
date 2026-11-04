require("dotenv").config({ path: ".env.test" });

const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");

describe("API de publicaciones", () => {
    let authorId;
    let postId;

    beforeAll(async () => {
        // Crear un autor para utilizarlo en las pruebas.
        const result = await pool.query(
            `INSERT INTO authors (name, email, bio)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [
                "Jorge Luis Borges",
                `borges${Date.now()}@example.com`,
                "Escritor argentino"
            ]
        );

        authorId = result.rows[0].id;
    });

    afterAll(async () => {
        // Eliminar el autor y sus publicaciones.
        if (authorId) {
            await pool.query(
                "DELETE FROM authors WHERE id = $1",
                [authorId]
            );
        }

        await pool.end();
    });

    test("POST /posts - Crear una publicación", async () => {
        const response = await request(app)
            .post("/posts")
            .send({
                title: "Ficciones",
                content: "Una colección de cuentos publicada en 1944.",
                author_id: authorId,
                published: true
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.post.title).toBe("Ficciones");
        expect(response.body.post.author_id).toBe(authorId);

        postId = response.body.post.id;
    });

    test("GET /posts/author/:authorId - Obtener publicaciones del autor", async () => {
        const response = await request(app)
            .get(`/posts/author/${authorId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.author.id).toBe(authorId);
        expect(response.body.posts.length).toBeGreaterThan(0);
        expect(response.body.posts[0].author_id).toBe(authorId);
    });

    test("POST /posts - Autor inexistente", async () => {
        const response = await request(app)
            .post("/posts")
            .send({
                title: "Publicación de prueba",
                content: "Contenido de prueba",
                author_id: 2147483647,
                published: false
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("El autor indicado no existe");
    });

    test("DELETE /posts/:id - Publicación inexistente", async () => {
        const response = await request(app)
            .delete("/posts/2147483647");

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Publicación no encontrada");
    });
});