// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/';
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// POST /api/posts - Creează o postare
router.post('/', authMiddleware, upload.array('files', 10), async (req, res) => {
    const { title, communityId, body } = req.body;
    const userId = req.user.id;
    if (!title || !communityId) {
        return res.status(400).json({ error: 'Titlul și comunitatea sunt obligatorii.' });
    }
    const mediaFiles = req.files ? req.files.map(file => ({ type: file.mimetype.startsWith('image/') ? 'image' : 'video', url: `/uploads/${file.filename}` })) : [];
    try {
        const query = `INSERT INTO posts (title, body, media, user_id, community_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const { rows } = await db.query(query, [title, body || null, JSON.stringify(mediaFiles), userId, communityId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Eroare internă la crearea postării.' });
    }
});

// GET /api/posts/feed - Preluarea feed-ului cu sortare
router.get('/feed', async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || 'new'; // 'new' este implicit

    let orderByClause = 'ORDER BY p.created_at DESC';
    if (sort === 'top') {
        orderByClause = 'ORDER BY p.vote_count DESC';
    }

    try {
        const totalPostsQuery = await db.query('SELECT COUNT(*) FROM posts');
        const totalPosts = parseInt(totalPostsQuery.rows[0].count, 10);
        const totalPages = Math.ceil(totalPosts / limit);

        const query = `
            SELECT 
                p.*, 
                u.username AS author, 
                c.name AS community_name, 
                c.owner_id AS community_owner_id,
                COALESCE(cc.comment_count, 0)::int AS comment_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN communities c ON p.community_id = c.id
            LEFT JOIN (
                SELECT post_id, COUNT(*) AS comment_count
                FROM comments
                GROUP BY post_id
            ) cc ON p.id = cc.post_id
            ${orderByClause}
            LIMIT $1 OFFSET $2
        `;
        const { rows } = await db.query(query, [limit, offset]);
        res.json({ posts: rows, page, totalPages, totalPosts });
    } catch (error) {
        res.status(500).json({ error: 'Eroare la preluarea postărilor.' });
    }
});

// PUT /api/posts/:id - Actualizarea unei postări
router.put('/:id', authMiddleware, upload.array('files', 10), async (req, res) => {
    const postId = req.params.id;
    const { title, body, existingMedia, filesToDelete } = req.body;
    const loggedInUserId = req.user.id;
    try {
        const postQuery = 'SELECT user_id FROM posts WHERE id = $1';
        const postResult = await db.query(postQuery, [postId]);
        if (postResult.rows.length === 0) return res.status(404).json({ error: 'Postarea nu a fost găsită.' });
        if (postResult.rows[0].user_id !== loggedInUserId) return res.status(403).json({ error: 'Nu aveți permisiunea.' });
        
        if (filesToDelete) {
            const toDelete = JSON.parse(filesToDelete);
            toDelete.forEach(fileUrl => {
                const filePath = path.join(__dirname, '..', fileUrl);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
        }
        let finalMedia = existingMedia ? JSON.parse(existingMedia) : [];
        if (req.files) {
            const newMedia = req.files.map(file => ({ type: file.mimetype.startsWith('image/') ? 'image' : 'video', url: `/uploads/${file.filename}` }));
            finalMedia.push(...newMedia);
        }
        const updateQuery = 'UPDATE posts SET title = $1, body = $2, media = $3, updated_at = NOW() WHERE id = $4 RETURNING *';
        const { rows } = await db.query(updateQuery, [title, body || null, JSON.stringify(finalMedia), postId]);
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'A apărut o eroare la actualizarea postării.' });
    }
});

// DELETE /api/posts/:id - Ștergerea unei postări
router.delete('/:id', authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const loggedInUserId = req.user.id;
    try {
        const postQuery = `SELECT p.user_id, c.owner_id AS community_owner_id, p.media FROM posts p JOIN communities c ON p.community_id = c.id WHERE p.id = $1`;
        const { rows } = await db.query(postQuery, [postId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Postarea nu a fost găsită.' });
        const post = rows[0];
        if (loggedInUserId !== post.user_id && loggedInUserId !== post.community_owner_id) {
            return res.status(403).json({ error: 'Nu aveți permisiunea.' });
        }
        if (post.media) {
            post.media.forEach(file => {
                const filePath = path.join(__dirname, '..', file.url);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
        }
        await db.query('DELETE FROM posts WHERE id = $1', [postId]);
        res.status(200).json({ message: 'Postarea a fost ștearsă.' });
    } catch (error) {
        res.status(500).json({ error: 'A apărut o eroare.' });
    }
});

// GET /api/posts/:id - Preluarea detaliilor unei postări
router.get('/:id', async (req, res) => {
    try {
        const postQuery = `SELECT p.*, u.username AS author, c.name AS community_name FROM posts p JOIN users u ON p.user_id = u.id JOIN communities c ON p.community_id = c.id WHERE p.id = $1`;
        const postResult = await db.query(postQuery, [req.params.id]);
        if (postResult.rows.length === 0) return res.status(404).json({ error: 'Postarea nu a fost găsită.' });
        const post = postResult.rows[0];
        const commentsQuery = `SELECT c.*, u.username as author FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at ASC`;
        const commentsResult = await db.query(commentsQuery, [req.params.id]);
        const commentsMap = {};
        const commentTree = [];
        commentsResult.rows.forEach(comment => { commentsMap[comment.id] = { ...comment, children: [] }; });
        commentsResult.rows.forEach(comment => {
            if (comment.parent_comment_id) {
                if (commentsMap[comment.parent_comment_id]) {
                    commentsMap[comment.parent_comment_id].children.push(commentsMap[comment.id]);
                }
            } else {
                commentTree.push(commentsMap[comment.id]);
            }
        });
        post.comments = commentTree;
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'A apărut o eroare.' });
    }
});


module.exports = router;
