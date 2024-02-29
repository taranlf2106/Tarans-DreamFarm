import express, { response } from "express";
import User from "../modules/user.mjs";
import {HTTPCodes, HTTPMethods} from "../modules/httpConstants.mjs";
import fs from "fs";
import pool from '../modules/db.mjs'; 



const USER_API = express.Router();
USER_API.use(express.json());


// User retrieval by ID - assuming this remains the same, just as an example
USER_API.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(result.rows[0]);
        } else {
            res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send("User not found");
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).send("Failed to retrieve user");
    }
});

USER_API.post('/register', async (req, res) => {
    const { name, email, password } = req.body; // Remove pettype and petname from destructuring

    try {
        // Check if user already exists
        const userCheckQuery = 'SELECT * FROM users WHERE email = $1';
        const checkResult = await pool.query(userCheckQuery, [email]);
        if (checkResult.rows.length > 0) {
            return res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).json({ message: "User already exists in database" });
        }

        // Insert new user into database
        const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *'; // Remove pettype and petname from query
        const userResult = await pool.query(insertUserQuery, [name, email, password]);
        const newUser = userResult.rows[0];

        // Send back the newly created user
        res.status(HTTPCodes.SuccesfullRespons.Ok).json(newUser);
    } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).json({ message: "Failed to save user to database" });
    }
});

// Add pet details to an existing user

USER_API.post('/register/pet', async (req, res) => {
    const { userId } = req.params;
    const { pettype, petname } = req.body;

    try {
        // Insert pet details for the specified user
        const insertPetQuery = 'UPDATE users SET pettype = $1, petname = $2 WHERE id = $3 RETURNING *'; // Assuming you have columns for pet details in the users table
        const result = await pool.query(insertPetQuery, [pettype, petname, userId]);

        if (result.rows.length > 0) {
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(result.rows[0]);
        } else {
            res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send("User not found");
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).send("Failed to add pet details");
    }
});

// User update
USER_API.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    
    try {
        const updateQuery = 'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *';
        const result = await pool.query(updateQuery, [name, email, password, id]);
        if (result.rows.length > 0) {
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(result.rows[0]);
        } else {
            res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send("User not found");
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).send("Failed to update user");
    }
});

// User deletion
USER_API.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const deleteQuery = 'DELETE FROM users WHERE id = $1 RETURNING *';
        const result = await pool.query(deleteQuery, [id]);
        if (result.rows.length > 0) {
            res.status(HTTPCodes.SuccesfullRespons.Ok).send("User deleted successfully!");
        } else {
            res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send("User not found");
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).send("Failed to delete user");
    }
});

export default USER_API;


    // This is using javascript object destructuring.
    // Recomend reading up https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#syntax
    // https://www.freecodecamp.org/news/javascript-object-destructuring-spread-operator-rest-parameter/

    // Tip: All the information you need to get the id part of the request can be found in the documentation 
    // https://expressjs.com/en/guide/routing.html (Route parameters)
    /// TODO: 
    // Return user object