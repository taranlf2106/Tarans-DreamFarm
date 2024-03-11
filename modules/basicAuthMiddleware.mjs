// authMiddleware.mjs
import bcrypt from 'bcrypt';
// Make sure this path correctly points to where your DBManager (storageManager.mjs) is located
import DBManager from './storageManager.mjs';

export const basicAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).send('Missing or invalid Authorization header');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    try {
        const user = await DBManager.findUserByEmail(email);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send('Invalid credentials');
        }

        req.user = user; // Attach user to request
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).send('An error occurred during authentication');
    }
};

export default basicAuthMiddleware;