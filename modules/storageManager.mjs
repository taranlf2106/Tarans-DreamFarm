import pg from 'pg';
import dotenv from 'dotenv';

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

  // Method to add a new user
  async createUser({ name, email, pswHash}) {
    // Assuming your users table also has columns for petType and petName
    const queryText = 'INSERT INTO public.users (name, email, pswHash, pettype, petName) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, petType, petName';
    const values = [name, email, pswHash];
    try {
      const { rows } = await this.#pool.query(queryText, values);
      return rows[0]; // This now includes petType and petName in the returned user object
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
}

  // Method to update a user by ID
  async updateUser(id, { name, email, pswHash }) {
    const queryText = 'UPDATE public.users SET name = $1, email = $2, pswHash = $3 WHERE id = $4 RETURNING id, name, email';
    const values = [name, email, pswHash, id];
    try {
      const { rows } = await this.#pool.query(queryText, values);
      return rows[0];
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }

  // Method to delete a user by ID
  async deleteUser(id) {
    const queryText = 'DELETE FROM public.users WHERE id = $1 RETURNING id';
    try {
      const { rows } = await this.#pool.query(queryText, [id]);
      return rows[0];
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }

  // Method to retrieve all users
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
}

export default new DBManager();