import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
    res.cookie('jwt', token, {
        httpOnly: true,  //prevent XSS attacks
        secure: process.env.NODE_ENV === 'development' ? false : true, //set to true in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return token;
};
