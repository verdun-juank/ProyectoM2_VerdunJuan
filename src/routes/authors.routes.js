const express = require('express');

const {
    getAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    getAuthorPosts
} = require('../services/authors.service');

const router = express.Router();

router.get('/', getAuthors);

router.get('/:id', getAuthorById);

router.get('/:id/posts', getAuthorPosts);

router.post('/', createAuthor);

router.put('/:id', updateAuthor);

router.delete('/:id', deleteAuthor);

module.exports = router;