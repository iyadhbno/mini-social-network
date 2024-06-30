import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    logger.error('No token, authorization denied');
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    logger.error(`Token is not valid: ${error.message}`);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export default auth;