import bcrypt from 'bcrypt';
import DBManager from './storageManager.mjs';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        console.log("[Auth Middleware] No auth header found or header does not start with Basic.");
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    try {
        const user = await DBManager.findUserByEmail(email);
        if (!user) {
            console.log(`[Auth Middleware] User not found with email: ${email}`);
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log(`[Auth Middleware] Password does not match for user: ${email}`);
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log(`[Auth Middleware] Authentication successful for user: ${email}`);
        req.user = user; // Attach the user object to the request for downstream use
        next();
    } catch (error) {
        console.log(`[Auth Middleware] Error during authentication for user: ${email}`, error);
        return res.status(500).json({ message: 'An error occurred during authentication.' });
    }
};

export default authMiddleware;


