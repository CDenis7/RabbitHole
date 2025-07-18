const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:username', async (req, res) => {
    const { username } = req.params;

    try {

        const userQuery = 'SELECT id, username, created_at FROM users WHERE username = $1';
        const userResult = await db.query(userQuery, [username]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Utilizatorul nu a fost găsit.' });
        }
        const user = userResult.rows[0];
        const postsQuery = `
            SELECT p.*, c.name as community_name
            FROM posts p
            JOIN communities c ON p.community_id = c.id
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC
        `;
        const postsResult = await db.query(postsQuery, [user.id]);

        const commentsQuery = `
            SELECT c.*, p.title as post_title, p.id as post_id
            FROM comments c
            JOIN posts p ON c.post_id = p.id
            WHERE c.user_id = $1
            ORDER BY c.created_at DESC
        `;
        const commentsResult = await db.query(commentsQuery, [user.id]);

        res.json({
            user,
            posts: postsResult.rows,
            comments: commentsResult.rows
        });

    } catch (error) {
        console.error(`Eroare la preluarea profilului pentru ${username}:`, error);
        res.status(500).json({ error: 'A apărut o eroare la preluarea profilului.' });
    }
});

module.exports = router;
