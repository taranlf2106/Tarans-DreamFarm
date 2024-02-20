import pg from 'pg';
import SuperLogger from './superLogger.mjs';

if (process.env.DB_CONNECTINGSTRING == 'undefined') {
    throw ("You forgot the db conntevting string")
}

class DBManager {

    #credentials = {};

    constructor(connectionString) {
        this.#credentials = {
            connectionString,
            ssl: (process.env.DB_SSL == 'true') ? process.env.DB_SSL : false
        };
    }

    async updateUser(user) {

        const client = new pg.Client(this.#credentials);
        await client.connect();
        
        try {
            await client.connect();
            const output = await client.query('Update "public"."users" SET "name" = $1, "email" = $2, "pswhash" = $3 where "id" = $4', [user.name, user.email, user.pswHash, user.id]);
        } catch (err) {
        } finally {
            await client.end();
        }
    }

    async deleteUser(user) {

        const client = new pg.Client(this.#credentials);
      
        
        try {
            await client.connect();
            const output = await client.query('DELETE FROM "public"."users" WHERE "id" = $1', [user.id]);

        } catch (err) {
        } finally {
            client.end();
        }
        return user;
    }

    async createUser(user) {

        const client = new pg.Client(this.#credentials);
        
        try {
            await client.connect();
            const output = await client.query('INSERT INTO "public"."users" ("name", "email", "pswhash") VALUES ($1, $2, $3) RETURNING "id"', [user.name, user.email, user.pswHash]);
           console.log("createuser is entered");
            if (output.rows.length == 1) {
                user.id = output.rows[0].id;
            }

        } catch (err) {
            console.error(error);
        } finally {
            client.end();
        }
        return user;
    }
};

export default new DBManager(process.env.DB_CONNECTINGSTRING);