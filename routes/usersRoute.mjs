import express, { response } from "express";
import User from "../modules/user.mjs";
import {HTTPCodes, HTTPMethods} from "../modules/httpConstants.mjs";
import fs from "fs";



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

USER_API.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = users.some(user => user.email === email);
    if (userExists) {
        return res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("User already exists");
    }

    // Create new user
    const newUser = { id: users.length + 1, name, email, password };
    users.push(newUser);
    saveUsers(); // Save the updated users array to the file

    res.status(HTTPCodes.SuccesfullRespons.Ok).send(newUser); // Respond with the created user
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