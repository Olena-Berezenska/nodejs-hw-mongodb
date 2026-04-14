// src/services/auth.js

import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret';

export const registerUser = async (payload) => {
  const { email, password, name } = payload;

  // Перевірка на існування користувача з таким email
  const existingUser = await UsersCollection.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  // Хешування пароля
  const hashedPassword = await bcrypt.hash(password, 10);

  // Створення користувача
  const user = await UsersCollection.create({
    name,
    email,
    password: hashedPassword,
  });

  // Повернення користувача БЕЗ пароля
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
export const loginUserService = async (email, password) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(401, 'Email or password is wrong');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    throw createHttpError(401, 'Email or password is wrong');

  const accessToken = jwt.sign({ userId: user._id }, ACCESS_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, {
    expiresIn: '30d',
  });

  await SessionsCollection.deleteOne({ userId: user._id });

  // Save new session
  await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

export const refreshSessionService = async (refreshToken) => {
  // Перевірка наявності refresh токена
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }

  // Пошук активної сесії
  const session = await SessionsCollection.findOne({ refreshToken });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  // Перевірка дати закінчення refresh токена
  if (session.refreshTokenValidUntil < new Date()) {
    await SessionsCollection.deleteOne({ _id: session._id });
    throw createHttpError(401, 'Refresh token expired');
  }

  // Верифікація refresh токена
  let userId;
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    userId = decoded.userId;
  } catch (err) {
    await SessionsCollection.deleteOne({ _id: session._id });
    throw createHttpError(401, 'Invalid refresh token');
  }

  // Генерація нових токенів
  const newAccessToken = jwt.sign({ userId }, ACCESS_SECRET, {
    expiresIn: '15m',
  });

  const newRefreshToken = jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: '30d',
  });

  // Видалення старої сесії та створення нової
  await SessionsCollection.deleteOne({ _id: session._id });

  await SessionsCollection.create({
    userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutService = async (refreshToken) => {
  // Перевірка наявності refresh токена
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }

  // Видалення сесії за refresh токеном
  const result = await SessionsCollection.deleteOne({ refreshToken });

  if (result.deletedCount === 0) {
    throw createHttpError(401, 'Session not found');
  }
};
