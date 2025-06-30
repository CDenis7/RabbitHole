const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // Preluăm token-ul din header-ul 'Authorization'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (token == null) {
    // Dacă nu există token, returnăm o eroare de neautorizat
    return res.sendStatus(401); 
  }

  // Verificăm validitatea token-ului
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Dacă token-ul nu este valid (expirat, corupt etc.), returnăm o eroare
      return res.sendStatus(403); // Forbidden
    }

    // Dacă token-ul este valid, atașăm payload-ul (datele utilizatorului)
    // la obiectul 'req' și trecem la următoarea funcție (controller-ul rutei)
    req.user = user;
    next();
  });
}

module.exports = authMiddleware;
