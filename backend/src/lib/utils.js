import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {ENV} from "./env.js"   //check this path


export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
        expiresIn: '30d',
    });
    res.cookie('token', token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return token;
};
