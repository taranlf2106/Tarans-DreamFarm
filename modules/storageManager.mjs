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
  async createUser({ name, email, password  }) {
    const queryText = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *';
    const values = [name, email, password ];
    try {
      const { rows } = await this.#pool.query(queryText, values);
      return rows[0]; // Excludes password  from the returned user object
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  // Method to update a user by ID
  async updateUser(id, { name, email, password  }) {
    const queryText = 'UPDATE public.users SET name = $1, email = $2, password  = $3 WHERE id = $4 RETURNING id, name, email';
    const values = [name, email, password , id];
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

  async createPet({ userId, petType, petName }) {
    const queryText = 'INSERT INTO pets (user_id, pet_type, pet_name) VALUES ($1, $2, $3) RETURNING *';
    const values = [userId, petType, petName];
    try {
        const { rows } = await this.#pool.query(queryText, values);
        return rows[0];
    } catch (err) {
        console.error('Error creating pet:', err);
        throw err; // Ensure this error is propagated back to the caller
    }
}
}

export default new DBManager();