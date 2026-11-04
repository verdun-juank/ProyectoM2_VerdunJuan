require("dotenv").config({ path: ".env.test" });

const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/db");

describe("API de autores", () => {
    let authorId;

    const authorData = {
        name: "Gabriel García Márquez",
        email: `gabriel${Date.now()}@example.com`,
        bio: "Escritor y periodista colombiano"
    };

    afterAll(async () => {
        if (authorId) {
            await pool.query(
                "DELETE FROM authors WHERE id = $1",
                [authorId]
            );
        }

        await pool.end();
    });

    test("POST /authors - Crear un autor", async () => {
        const response = await request(app)
            .post("/authors")
            .send(authorData);

        expect(response.statusCode).toBe(201);
        expect(response.body.author.name).toBe(authorData.name);
        expect(response.body.author.email).toBe(authorData.email);

        authorId = response.body.author.id;
    });

    test("GET /authors/:id - Obtener un autor", async () => {
        const response = await request(app)
            .get(`/authors/${authorId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(authorId);
        expect(response.body.name).toBe(authorData.name);
    });

    test("GET /authors/:id - Autor inexistente", async () => {
        const response = await request(app)
            .get("/authors/2147483647");

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe("Autor no encontrado");
    });
});