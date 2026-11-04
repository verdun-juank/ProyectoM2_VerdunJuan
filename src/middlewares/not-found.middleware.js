function notFoundMiddleware(req, res, next) {
    const error = new Error(
        `Ruta ${req.method} ${req.originalUrl} no encontrada`
    );

    error.statusCode = 404;

    next(error);
}

module.exports = notFoundMiddleware;