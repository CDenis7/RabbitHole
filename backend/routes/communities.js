// backend/routes/communities.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/communities/sidebar - Preluare comunități populare și recente
router.get('/sidebar', async (req, res) => {
    try {
        const popularQuery = `
            SELECT c.id, c.name, c.image_url, COUNT(m.id) AS member_count
            FROM communities c
            LEFT JOIN memberships m ON c.id = m.community_id
            GROUP BY c.id
            ORDER BY member_count DESC, c.created_at DESC
            LIMIT 5;
        `;
        const popularResult = await db.query(popularQuery);
        const recentQuery = `
            SELECT id, name, image_url 
            FROM communities 
            ORDER BY created_at DESC 
            LIMIT 5;
        `;
        const recentResult = await db.query(recentQuery);
        res.json({
            popular: popularResult.rows,
            recent: recentResult.rows
        });
    } catch (error) {
        console.error('Error fetching sidebar communities:', error);
        res.status(500).json({ error: 'Failed to fetch sidebar data.' });
    }
});

// POST /api/communities - Crearea unei noi comunități
router.post('/', authMiddleware, async (req, res) => {
    const { name, description, imageUrl } = req.body;
    const ownerId = req.user.id;
    if (!name) { return res.status(400).json({ error: 'Numele comunității este obligatoriu.' }); }
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const communityQuery = 'INSERT INTO communities (name, description, image_url, owner_id) VALUES ($1, $2, $3, $4) RETURNING *';
        const { rows } = await client.query(communityQuery, [name, description, imageUrl, ownerId]);
        const newCommunity = rows[0];
        const membershipQuery = 'INSERT INTO memberships (user_id, community_id, role) VALUES ($1, $2, $3)';
        await client.query(membershipQuery, [ownerId, newCommunity.id, 'owner']);
        await client.query('COMMIT');
        res.status(201).json(newCommunity);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Eroare internă la crearea comunității.' });
    } finally {
        client.release();
    }
});

// GET /api/communities - Obținerea listei de comunități
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM communities ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Eroare la preluarea comunităților.' });
    }
});

// GET /api/communities/:id - Obținerea detaliilor unei comunități (MODIFICAT)
router.get('/:id', async (req, res) => {
    try {
        const communityQuery = `
            SELECT 
                c.*, 
                (SELECT COUNT(*) FROM memberships m WHERE m.community_id = c.id)::int AS member_count
            FROM communities c 
            WHERE c.id = $1
        `;
        const { rows } = await db.query(communityQuery, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Community not found.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching community details:', error);
        res.status(500).json({ error: 'An error occurred.' });
    }
});

// GET /api/communities/:id/posts - Preluarea postărilor
router.get('/:id/posts', async (req, res) => {
    const communityId = req.params.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    try {
        const totalPostsQuery = await db.query('SELECT COUNT(*) FROM posts WHERE community_id = $1', [communityId]);
        const totalPosts = parseInt(totalPostsQuery.rows[0].count, 10);
        const totalPages = Math.ceil(totalPosts / limit);
        const query = `SELECT p.*, u.username AS author, c.name AS community_name, c.owner_id AS community_owner_id FROM posts p JOIN users u ON p.user_id = u.id JOIN communities c ON p.community_id = c.id WHERE p.community_id = $1 ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`;
        const { rows } = await db.query(query, [communityId, limit, offset]);
        res.json({ posts: rows, page, totalPages, totalPosts });
    } catch (error) {
        res.status(500).json({ error: 'Eroare la preluarea postărilor pentru această comunitate.' });
    }
});

// POST /api/communities/:id/join - Alăturare
router.post('/:id/join', authMiddleware, async (req, res) => {
    const communityId = req.params.id;
    const userId = req.user.id;
    try {
        const existingMembership = await db.query('SELECT * FROM memberships WHERE user_id = $1 AND community_id = $2', [userId, communityId]);
        if (existingMembership.rows.length > 0) return res.status(409).json({ error: 'Sunteți deja membru.' });
        const insertQuery = 'INSERT INTO memberships (user_id, community_id, role) VALUES ($1, $2, $3) RETURNING *';
        const { rows } = await db.query(insertQuery, [userId, communityId, 'member']);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'A apărut o eroare.' });
    }
});

// DELETE /api/communities/:id/leave - Părăsire
router.delete('/:id/leave', authMiddleware, async (req, res) => {
    const communityId = req.params.id;
    const userId = req.user.id;
    try {
        const communityQuery = 'SELECT owner_id FROM communities WHERE id = $1';
        const communityRes = await db.query(communityQuery, [communityId]);
        if (communityRes.rows.length > 0 && communityRes.rows[0].owner_id === userId) {
            return res.status(400).json({ error: 'Proprietarul nu poate părăsi comunitatea.' });
        }
        const deleteQuery = 'DELETE FROM memberships WHERE user_id = $1 AND community_id = $2';
        const result = await db.query(deleteQuery, [userId, communityId]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Nu sunteți membru.' });
        res.status(200).json({ message: 'Ați părăsit comunitatea.' });
    } catch (error) {
        res.status(500).json({ error: 'A apărut o eroare.' });
    }
});

// GET /api/communities/:id/members - Preluare membri
router.get('/:id/members', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT u.id, u.username, m.role FROM memberships m JOIN users u ON m.user_id = u.id WHERE m.community_id = $1 ORDER BY m.role, u.username`;
        const { rows } = await db.query(query, [id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Eroare la preluarea membrilor.' });
    }
});

// DELETE /api/communities/:id/members/:memberId - Eliminare membru
router.delete('/:id/members/:memberId', authMiddleware, async (req, res) => {
    const communityId = req.params.id;
    const memberIdToRemove = req.params.memberId;
    const loggedInUserId = req.user.id;
    try {
        const communityQuery = 'SELECT owner_id FROM communities WHERE id = $1';
        const { rows } = await db.query(communityQuery, [communityId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Comunitatea nu a fost găsită.' });
        const communityOwnerId = rows[0].owner_id;
        if (loggedInUserId !== communityOwnerId) return res.status(403).json({ error: 'Nu aveți permisiunea.' });
        if (Number(memberIdToRemove) === communityOwnerId) return res.status(400).json({ error: 'Proprietarul nu poate fi eliminat.' });
        const deleteQuery = 'DELETE FROM memberships WHERE user_id = $1 AND community_id = $2';
        const result = await db.query(deleteQuery, [memberIdToRemove, communityId]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Membrul nu a fost găsit.' });
        res.status(200).json({ message: 'Membrul a fost eliminat.' });
    } catch (error) {
        res.status(500).json({ error: 'A apărut o eroare.' });
    }
});

module.exports = router;
