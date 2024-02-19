import express, { response } from "express";
import User from "../modules/user.mjs";
import { HTTPCodes } from "../modules/httpConstants.mjs";
import pool from '../modules/db.mjs';
import SuperLogger from "../modules/superLogger.mjs";
import fs from "fs";



const USER_API = express.Router();
USER_API.use(express.json());

let users = [];

try{
    const data = fs.readFileSync('users.json', 'utf8');
    users = JSON.parse(data);

}catch(err){
    console.error("Failed to read users from file, starting with an emty array.", err);
}

// Password verification function
function verifyPassword(userPassword, storedPasswordHash) {
    // Simplified for demonstration
    return userPassword === storedPasswordHash;
}



USER_API.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    
    if (user && verifyPassword(password, user.pswHash)) {
        res.status(HTTPCodes.SuccesfullRespons.Ok).send({ message: "Login successful" });
    } else {
        res.status(HTTPCodes.ClientSideErrorRespons.Unauthorized).send("Invalid email or password");
    }
});

function saveUsers(callback) {
    fs.writeFile('users.json', JSON.stringify(users, null, 2), 'utf8', err => {
        if (err) {
            console.error("Error writing users to file:", err);
            if (callback) callback(err);
        } else {
            if (callback) callback(null);
        }
    });
}

let lastId = users.length > 0 ? Math.max(...users.map(user => user.id)) : 0;


USER_API.get('/:id', (req, res, next) => {
    SuperLogger.log("Demo of logging tool");
    SuperLogger.log("A important msg", SuperLogger.LOGGING_LEVELS.DEBUG);

    // Tip: All the information you need to get the id part of the request can be found in the documentation 
    // https://expressjs.com/en/guide/routing.html (Route parameters)

    /// TODO: 
    // Return user object
})

USER_API.get('/', (req, res, next) => {
    res.status(HTTPCodes.SuccesfullRespons.Ok).send(users).end();
})

//USER_API.post('/', (req, res, next) => {

    USER_API.post('/', async (req, res) => {
        const { name, email, password } = req.body;

        
    
        const existsResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existsResult.rows.length) {
            return res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("User already exists");
        }
      
        // Insert new user
        try {
            const insertResult = await pool.query(
                'INSERT INTO users (name, email, pswHash) VALUES ($1, $2, $3) RETURNING id',
                [name, email, password] // Consider hashing the password before storing it
            );
            const newUser = insertResult.rows[0];
            res.status(HTTPCodes.SuccesfullRespons.Ok).send({ id: newUser.id, name, email });
        } catch (err) {
            console.error("Error saving user to database:", err);
            res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).send("Failed to save user");
        }
    });


    // This is using javascript object destructuring.
    // Recomend reading up https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#syntax
    // https://www.freecodecamp.org/news/javascript-object-destructuring-spread-operator-rest-parameter/
    //const { name, email, password } = req.body;

/*     if (name != "" && email != "" && password != "") {
        const user = new User();
        user.name = name;
        user.email = email;
        console.log(users)
        ///TODO: Do not save passwords.
        user.pswHash = password;
        const exists = users.some(user => user.email === email);


        ///TODO: Does the user exist?

        if (!exists) {
            const id = ++lastId;
            const user = { id, name, email, password };
            
            users.push(user);
            saveUsers();
            
            res.status(HTTPCodes.SuccesfullRespons.Ok).send(users).end();
        } else {
            res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send ("Bruker eksisterer allerede").end();
        }
    } else {
        res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("Mangler data felt").end();
    }

}); */

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
