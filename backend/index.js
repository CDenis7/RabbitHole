require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const communityRoutes = require('./routes/communities');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const voteRoutes = require('./routes/votes');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes); 

app.get('/api', (req, res) => {
  res.json({ message: "Salut de la backend-ul forumului!" });
});

app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});
