const pool = require("../../src/config/db");

jest.mock("../../src/config/db", () => ({
    query: jest.fn()
}));

const authorsService = require("../../src/services/authors.service");

describe("Authors Service - Tests unitarios", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getAllAuthors - Obtener todos los autores", async () => {
        const authors = [
            { id: 1, name: "Ana García" },
            { id: 2, name: "Carlos Ruiz" }
        ];

        pool.query.mockResolvedValue({
            rows: authors
        });

        const result = await authorsService.getAllAuthors();

        expect(result).toEqual(authors);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test("getAuthorById - Obtener un autor existente", async () => {
        const author = {
            id: 1,
            name: "Ana García",
            email: "ana@example.com"
        };

        pool.query.mockResolvedValue({
            rows: [author]
        });

        const result = await authorsService.getAuthorById("1");

        expect(result).toEqual(author);
        expect(pool.query).toHaveBeenCalledWith(
            "SELECT * FROM authors WHERE id = $1",
            ["1"]
        );
    });

    test("getAuthorById - Autor inexistente", async () => {
        pool.query.mockResolvedValue({
            rows: []
        });

        await expect(
            authorsService.getAuthorById("999")
        ).rejects.toMatchObject({
            message: "Autor no encontrado",
            statusCode: 404
        });
    });

    test("getAuthorById - ID inválido", async () => {
        await expect(
            authorsService.getAuthorById("abc")
        ).rejects.toMatchObject({
            message: "El ID debe ser un número entero positivo",
            statusCode: 400
        });

        expect(pool.query).not.toHaveBeenCalled();
    });

    test("createAuthor - Crear un autor correctamente", async () => {
        const author = {
            id: 1,
            name: "Ana García",
            email: "ana@example.com",
            bio: "Desarrolladora"
        };

        pool.query.mockResolvedValue({
            rows: [author]
        });

        const result = await authorsService.createAuthor({
            name: " Ana García ",
            email: " ana@example.com ",
            bio: "Desarrolladora"
        });

        expect(result).toEqual(author);

        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO authors"),
            ["Ana García", "ana@example.com", "Desarrolladora"]
        );
    });

    test("createAuthor - Datos obligatorios faltantes", async () => {
        await expect(
            authorsService.createAuthor({
                name: "",
                email: "ana@example.com"
            })
        ).rejects.toMatchObject({
            message: "El nombre y el email son obligatorios",
            statusCode: 400
        });

        expect(pool.query).not.toHaveBeenCalled();
    });

    test("createAuthor - Email duplicado", async () => {
        const databaseError = new Error("Email duplicado");
        databaseError.code = "23505";

        pool.query.mockRejectedValue(databaseError);

        await expect(
            authorsService.createAuthor({
                name: "Ana García",
                email: "ana@example.com",
                bio: null
            })
        ).rejects.toMatchObject({
            message: "Ya existe un autor con ese email",
            statusCode: 409
        });
    });
});
