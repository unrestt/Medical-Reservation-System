const jwt = require('jsonwebtoken');

// Weryfikacja tokenu JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Brak dostępu, token nie został dostarczony.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    req.user = decoded; // Zapisujemy zdekodowane dane (m.in. userId, role) w obiekcie requesta
    next();
  } catch (err) {
    res.status(401).json({ error: 'Nieprawidłowy lub wygasły token.' });
  }
};

// Sprawdzanie wymaganych ról (RBAC)
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Odmowa dostępu: brak odpowiednich uprawnień.' });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
