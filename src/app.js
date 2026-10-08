const express = require('express');

const authorsRoutes = require('./routes/authors.routes');
const postsRoutes = require('./routes/posts.routes');

const errorMiddleware = require('./middlewares/error.middleware.js');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'API REST funcionando correctamente'
    });
});

app.use('/authors', authorsRoutes);
app.use('/posts', postsRoutes);

app.use(errorMiddleware);

module.exports = app;