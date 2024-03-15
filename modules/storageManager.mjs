import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt, { compare } from 'bcrypt';

dotenv.config();

const { Pool } = pg;

class DBManager {
  #pool;

  constructor() {
    this.#pool = new Pool({
      connectionString: process.env.DB_CONNECTIONSTRING,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }

  async query(text, params) {
    const client = await this.pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      client.release();
    }
  }

  async createUser({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 12); 
    const queryText = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *';
    const values = [name, email, hashedPassword]; 
    try {
        const { rows } = await this.#pool.query(queryText, values);
        return rows[0]; 
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
}


  
  async updateUser(id, { name, email, password }) {
    console.log('Updating user with ID:', id);
    const hashedPassword = await bcrypt.hash(password, 12); 
    const queryText = 'UPDATE public.users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, name, email';
    const values = [name, email, hashedPassword, id]; 
    try {
      const { rows } = await this.#pool.query(queryText, values);
      return rows[0];
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
}


  async deleteUser(id) {
    try {
     
      const deletePetsQuery = 'DELETE FROM public.pets WHERE user_id = $1';
      await this.#pool.query(deletePetsQuery, [id]);
  
     
      const deleteUserQuery = 'DELETE FROM public.users WHERE id = $1 RETURNING *'; 
      const { rows } = await this.#pool.query(deleteUserQuery, [id]);
      
      return rows[0]; 
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }
  

  
  async getUsers() {
    const queryText = 'SELECT id, name, email FROM public.users';
    try {
      const { rows } = await this.#pool.query(queryText);
      return rows;
    } catch (err) {
      console.error('Error retrieving users:', err);
      throw err;
    }
  }

  async getUserById(id) {
    const queryText = 'SELECT * FROM users WHERE id = $1';
    const values = [id];
    try {
        const { rows } = await this.#pool.query(queryText, values);
        return rows.length > 0 ? rows[0] : null;
    } catch (err) {
        console.error('Error retrieving user by ID:', err);
        throw err;
    }
}

async findUserByEmail(email) {
  const queryText = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  try {
    const { rows } = await this.#pool.query(queryText, values);
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error('Error retrieving user by email:', err);
    throw err;
  }
}


  async createPet({ userId, petType, petName }) {
    const queryText = 'INSERT INTO pets (user_id, pet_type, pet_name) VALUES ($1, $2, $3) RETURNING *';
    const values = [userId, petType, petName];
    try {
        const { rows } = await this.#pool.query(queryText, values);
        return rows[0];
    } catch (err) {
        console.error('Error creating pet:', err);
        throw err; 
    }
}

async getPetByUserId(userId) {
  const queryText = 'SELECT * FROM pets WHERE user_id = $1';
  const values = [userId];
  try {
      const { rows } = await this.#pool.query(queryText, values);
      return rows; 
  } catch (err) {
      console.error('Error retrieving pets by user ID:', err);
      throw err;
  }
}

async updatePet(id, { petName, petType }) {
  const queryText = 'UPDATE pets SET pet_name = $1, pet_type = $2 WHERE id = $3 RETURNING *';
  const values = [petName, petType, id];
  try {
    const { rows } = await this.#pool.query(queryText, values);
    return rows.length > 0 ? rows[0] : null; 
  } catch (err) {
    console.error('Error updating pet:', err);
    throw err;
  }
}

}

export default new DBManager();