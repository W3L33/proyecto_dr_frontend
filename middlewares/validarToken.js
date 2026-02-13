const jwt = require('jsonwebtoken');

module.exports = function validarToken(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ error: 'No autorizado' });

  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 🔑 aquí viaja el rol
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
