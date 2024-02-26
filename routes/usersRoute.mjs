import express, { response } from "express";
import User from "../modules/user.mjs";
import {HTTPCodes, HTTPMethods} from "../modules/httpConstants.mjs";
import fs from "fs";
import pool from '../modules/db.mjs'; 



const USER_API = express.Router();
USER_API.use(express.json());

let users = [];

try {
    const data = fs.readFileSync('users.json', 'utf8');
    users = JSON.parse(data);
} catch (err) {
    console.error("Failed to read users from file, starting with an empty array.", err);
}


function saveUsers() {
    fs.writeFile('users.json', JSON.stringify(users), 'utf8', (err) => {
        if (err) {
            console.error("Error writing users to file:", err);
        }
    });
}

function getLastId() {
    return users.reduce((maxId, user) => Math.max(maxId, user.id), 0);
}

USER_API.get('/:id', (req, res, next) => {


})

USER_API.get('/', (req, res) => {
    res.status(HTTPCodes.SuccesfullRespons.Ok).send(users).end();
})

USER_API.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists in the JSON array
    const existsJson = users.some(user => user.email === email);
    if (existsJson) {
        return res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("User already exists in JSON");
    }

    // Check if user already exists in the database
    try {
        const userCheckQuery = 'SELECT * FROM users WHERE email = $1';
        const checkResult = await pool.query(userCheckQuery, [email]);
        if (checkResult.rows.length > 0) {
            return res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("User already exists in database");
        }

        // Since user does not exist, proceed to insert into the database
        // Note: Adjust the table name and column names as per your database schema
        const insertQuery = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *';
        const { rows } = await pool.query(insertQuery, [name, email, password]);
        const newUserDb = rows[0]; // New user from database

        // Assuming you still want to keep the local JSON storage as well
        const newUserJson = { id: users.length + 1, name, email, password };
        users.push(newUserJson);
        saveUsers(); // Save the updated users array to the file

        // Respond with the created user details from the database
        res.status(HTTPCodes.SuccesfullRespons.Ok).json(newUserDb);
    } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).send("Failed to save user to database");
    }
});


USER_API.put('/:id', (req, res) => {
    /// TODO: Edit user()
    const userId = parseInt(req.params.id, 10);
    const { name, email, password } = req.body;
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        users[userIndex].name = name !== undefined ? name : users[userIndex].name;
        users[userIndex].email = email !== undefined ? email : users[userIndex].email;

        saveUsers();

        res.status(HTTPCodes.SuccesfullRespons.Ok).send("User updated successfully!").end();
    }else{
        res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("User not found!").end();
    }
})

USER_API.delete('/:id', (req, res) => {
   const userId = parseInt(req.params.id, 10);
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);

        saveUsers();

        res.status(HTTPCodes.SuccesfullRespons.Ok).send("User deleted successfully!").end();
    }else{
        res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("User not found!").end();}

});

export default USER_API

    // This is using javascript object destructuring.
    // Recomend reading up https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#syntax
    // https://www.freecodecamp.org/news/javascript-object-destructuring-spread-operator-rest-parameter/

    // Tip: All the information you need to get the id part of the request can be found in the documentation 
    // https://expressjs.com/en/guide/routing.html (Route parameters)
    /// TODO: 
    // Return user object