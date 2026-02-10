import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {ENV} from '../lib/env.js';

export async function socketAuthMiddleware(socket, next) {
    try {
        // Try token from client-provided auth first (used when client can read token)
        let token = socket.handshake.auth?.token;

        // Fallback: try to read httpOnly cookie named 'jwt' from handshake headers
        if (!token) {
            const cookieHeader = socket.handshake.headers?.cookie;
            if (cookieHeader) {
                const cookies = cookieHeader.split(';').map(c => c.trim());
                for (const c of cookies) {
                    const [name, ...valParts] = c.split('=');
                    if (name === 'token') {
                        token = decodeURIComponent(valParts.join('='));
                        break;
                    }
                }
            }
        }

        if (!token) {
            return next(new Error('Authentication error: Token not provided'));
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        const userId = decoded.userId || decoded.id || decoded._id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.user = user; // Attach user to socket object
        socket.userId = user._id.toString(); // Attach userId to socket object
        console.log(`Socket authenticated: ${user.fullname} (${user._id})`);
        next();
    } catch (error) {
        console.error('Socket authentication error:', error.message || error);
        next(new Error('Authentication error: ' + (error.message || error)));
    }
}