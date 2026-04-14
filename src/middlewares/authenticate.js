import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access-secret';

export const authenticate = (req, res, next) => {
  // Читання заголовка Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(createHttpError(401, 'Authorization header is missing'));
  }

  // Перевірка формату Bearer токена
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(createHttpError(401, 'Invalid authorization header format'));
  }

  const token = parts[1];

  try {
    // Верифікація токена
    const decoded = jwt.verify(token, ACCESS_SECRET);

    // Додавання користувача до req
    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (err) {
    // Перевірка на протермінований токен
    if (err.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Access token expired'));
    }

    // Інші помилки JWT
    return next(createHttpError(401, 'Invalid access token'));
  }
};
