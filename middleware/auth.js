const jwt = require('jsonwebtoken'); // importation du package jsonwebtoken


// METHODE AUTHENTIFICATION VIA TOKEN

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_PASS);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Utilisateur non valide !';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Erreur requête !')
    });
  }
};