// backend/routes/comments.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/comments - Crearea unui comentariu nou
router.post('/', authMiddleware, async (req, res) => {
    const { content, postId, parentCommentId } = req.body;
    const userId = req.user.id;
    if (!content || !postId) {
        return res.status(400).json({ error: 'Conținutul și ID-ul postării sunt obligatorii.' });
    }
    try {
        const query = `
            INSERT INTO comments (content, user_id, post_id, parent_comment_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, content, user_id, post_id, parent_comment_id, created_at, vote_count`;
        const { rows } = await db.query(query, [content, userId, postId, parentCommentId || null]);
        const newComment = rows[0];
        const userQuery = 'SELECT username FROM users WHERE id = $1';
        const userResult = await db.query(userQuery, [newComment.user_id]);
        const responsePayload = {
            ...newComment,
            author: userResult.rows[0].username
        };
        res.status(201).json(responsePayload);
    } catch (error) {
        console.error('Eroare la adăugarea comentariului:', error);
        res.status(500).json({ error: 'Eroare la adăugarea comentariului.' });
    }
});

// --- RUTA NOUĂ PENTRU EDITARE ---
// PUT /api/comments/:id - Actualizarea unui comentariu
router.put('/:id', authMiddleware, async (req, res) => {
    const commentId = req.params.id;
    const { content } = req.body;
    const loggedInUserId = req.user.id;

    if (!content) {
        return res.status(400).json({ error: 'Conținutul nu poate fi gol.' });
    }

    try {
        const commentQuery = 'SELECT user_id FROM comments WHERE id = $1';
        const { rows } = await db.query(commentQuery, [commentId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Comentariul nu a fost găsit.' });
        }
        if (rows[0].user_id !== loggedInUserId) {
            return res.status(403).json({ error: 'Nu aveți permisiunea de a edita acest comentariu.' });
        }

        const updateQuery = 'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *';
        const { rows: updatedRows } = await db.query(updateQuery, [content, commentId]);

        res.status(200).json(updatedRows[0]);
    } catch (error) {
        console.error('Eroare la editarea comentariului:', error);
        res.status(500).json({ error: 'A apărut o eroare.' });
    }
});

// --- RUTA NOUĂ PENTRU ȘTERGERE ---
// DELETE /api/comments/:id - Ștergerea unui comentariu
router.delete('/:id', authMiddleware, async (req, res) => {
    const commentId = req.params.id;
    const loggedInUserId = req.user.id;

    try {
        // Permitem ștergerea dacă utilizatorul este autorul comentariului
        const commentQuery = 'SELECT user_id FROM comments WHERE id = $1';
        const { rows } = await db.query(commentQuery, [commentId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Comentariul nu a fost găsit.' });
        }
        if (rows[0].user_id !== loggedInUserId) {
            return res.status(403).json({ error: 'Nu aveți permisiunea de a șterge acest comentariu.' });
        }
        
        await db.query('DELETE FROM comments WHERE id = $1', [commentId]);
        
        res.status(200).json({ message: 'Comentariul a fost șters cu succes.' });

    } catch (error) {
        console.error('Eroare la ștergerea comentariului:', error);
        res.status(500).json({ error: 'A apărut o eroare.' });
    }
});

module.exports = router;
