import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access-secret';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(createHttpError(401, 'Authorization header is missing'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(createHttpError(401, 'Invalid authorization header format'));
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Access token expired'));
    }

    return next(createHttpError(401, 'Invalid access token'));
  }
};
