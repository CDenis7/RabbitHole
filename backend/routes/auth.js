const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUserQuery = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email';
    const { rows } = await db.query(newUserQuery, [username, email, passwordHash]);
    const user = rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la înregistrare. Este posibil ca email-ul sau username-ul să existe deja.' });
  }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email-ul și parola sunt obligatorii.' });
    }

    try {
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(userQuery, [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Credentiale invalide.' });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credentiale invalide.' });
        }
        
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'A apărut o eroare la login.' });
    }
});


module.exports = router;