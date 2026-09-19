const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    // For prototyping we allow bypass if no JWT secret is set
    if (!process.env.JWT_SECRET) return next();
    
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token is invalid or expired' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Prototyping bypass
    if (!req.user || !process.env.JWT_SECRET) return next();
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `User role ${req.user.role} is not authorized` });
    }
    next();
  };
};
