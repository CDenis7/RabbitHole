const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    try {
        const searchTerm = `%${q}%`;

        const communitiesQuery = `
            SELECT id, name, image_url 
            FROM communities 
            WHERE name ILIKE $1 
            LIMIT 5
        `;
        const communitiesResult = await db.query(communitiesQuery, [searchTerm]);


        const usersQuery = `
            SELECT id, username 
            FROM users 
            WHERE username ILIKE $1 
            LIMIT 5
        `;
        const usersResult = await db.query(usersQuery, [searchTerm]);

 
        const postsQuery = `
            SELECT p.*, u.username as author, c.name as community_name 
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN communities c ON p.community_id = c.id
            WHERE p.title ILIKE $1 OR p.body ILIKE $1
            ORDER BY p.created_at DESC
            LIMIT 10
        `;
        const postsResult = await db.query(postsQuery, [searchTerm]);

        res.json({
            holes: communitiesResult.rows,
            users: usersResult.rows,
            posts: postsResult.rows
        });

    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'An error occurred during the search.' });
    }
});

module.exports = router;
