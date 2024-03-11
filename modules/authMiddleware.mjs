import bcrypt from 'bcrypt';
import DBManager from './storageManager.mjs';

const authMiddleware = async (req, res, next) => {
  // Extract the Authorization header
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    console.log('No or invalid Authorization header');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');
  console.log('Email:', email);

  try {
    const user = await DBManager.findUserByEmail(email);
    console.log('User:', user);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('Authentication successful');
    req.user = user; // Add the user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'An error occurred during authentication.' });
  }
};

export default authMiddleware;
