import { UsersCollection } from '../db/models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { sendEmail } from '../utils/sendEmail.js';

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-secret';
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret';
const APP_DOMAIN = process.env.APP_DOMAIN || 'http://localhost:3000';

export const registerUser = async (payload) => {
  const { email, password, name } = payload;


  const existingUser = await UsersCollection.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }


  const hashedPassword = await bcrypt.hash(password, 10);


  const user = await UsersCollection.create({
    name,
    email,
    password: hashedPassword,
  });


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

  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }


  const session = await SessionsCollection.findOne({ refreshToken });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }


  if (session.refreshTokenValidUntil < new Date()) {
    await SessionsCollection.deleteOne({ _id: session._id });
    throw createHttpError(401, 'Refresh token expired');
  }


  let userId;
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    userId = decoded.userId;
  } catch (err) {
    await SessionsCollection.deleteOne({ _id: session._id });
    throw createHttpError(401, 'Invalid refresh token');
  }


  const newAccessToken = jwt.sign({ userId }, ACCESS_SECRET, {
    expiresIn: '15m',
  });

  const newRefreshToken = jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: '30d',
  });


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

  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token is missing');
  }


  const result = await SessionsCollection.deleteOne({ refreshToken });

  if (result.deletedCount === 0) {
    throw createHttpError(401, 'Session not found');
  }
};

export const sendResetEmailService = async (email) => {

  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }


  const resetToken = jwt.sign({ email }, JWT_SECRET, {
    expiresIn: '5m',
  });


  const resetLink = `${APP_DOMAIN}/reset-password?token=${resetToken}`;


  const htmlContent = `
    <h2>Скидання пароля</h2>
    <p>Ви запросили скидання пароля для вашого акаунту.</p>
    <p>Натисніть на посилання нижче для скидання пароля:</p>
    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
      Скинути пароль
    </a>
    <p>Це посилання дійсне протягом 5 хвилин.</p>
    <p>Якщо ви не запитували скидання пароля, ігноруйте цей лист.</p>
  `;

  try {

    await sendEmail(email, 'Скидання пароля', htmlContent);
  } catch (error) {
    throw createHttpError(500, 'Failed to send the email, please try again later.');
  }
};

export const resetPasswordService = async (token, newPassword) => {

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const { email } = decoded;


  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }


  const hashedPassword = await bcrypt.hash(newPassword, 10);


  await UsersCollection.findOneAndUpdate(
    { _id: user._id },
    { password: hashedPassword }
  );


  await SessionsCollection.deleteMany({ userId: user._id });
};
