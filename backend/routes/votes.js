const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
    const { voteableId, voteableType, value } = req.body; 
    const userId = req.user.id;

    if (!voteableId || !voteableType || ![-1, 0, 1].includes(value)) {
        return res.status(400).json({ error: 'Date invalide pentru vot.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const tableName = voteableType === 'post' ? 'posts' : 'comments';
        if (!['posts', 'comments'].includes(tableName)) {
            throw new Error('Invalid voteableType');
        }

        const existingVoteQuery = 'SELECT * FROM votes WHERE user_id = $1 AND voteable_id = $2 AND voteable_type = $3';
        const { rows: existingVotes } = await client.query(existingVoteQuery, [userId, voteableId, voteableType]);
        const existingVote = existingVotes[0];
        
        let voteDifference = 0;

        if (existingVote) {
            if (value === 0) {
                voteDifference = -existingVote.value; 
                await client.query('DELETE FROM votes WHERE id = $1', [existingVote.id]);
            } else {
                voteDifference = value - existingVote.value; 
                await client.query('UPDATE votes SET value = $1 WHERE id = $2', [value, existingVote.id]);
            }
        } else if (value !== 0) {
            voteDifference = value;
            await client.query('INSERT INTO votes (user_id, voteable_id, voteable_type, value) VALUES ($1, $2, $3, $4)', [userId, voteableId, voteableType, value]);
        }

        if (voteDifference !== 0) {
            const updateCountQuery = `UPDATE ${tableName} SET vote_count = vote_count + $1 WHERE id = $2`;
            await client.query(updateCountQuery, [voteDifference, voteableId]);
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Vot înregistrat.' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Eroare la înregistrarea votului:', error);
        res.status(500).json({ error: 'Eroare la înregistrarea votului.' });
    } finally {
        client.release();
    }
});

module.exports = router;
