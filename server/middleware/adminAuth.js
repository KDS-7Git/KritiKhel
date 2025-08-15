// filepath: d:\WebDev\Janmashtami\games-website\server\middleware\adminAuth.js
const adminAuth = (req, res, next) => {
  const token = req.header('x-admin-token');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Invalid admin token.' });
  }

  next(); // Token is valid, proceed to the route handler
};

module.exports = adminAuth;