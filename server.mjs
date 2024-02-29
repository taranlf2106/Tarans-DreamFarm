import dotenv from 'dotenv';
import express from 'express' // Express is installed using npm
import USER_API from './routes/usersRoute.mjs'; // This is where we have defined the API for working with users.
import petsRoute from './routes/petsRoute.mjs';
import SuperLogger from './modules/superLogger.mjs';
import pool from './modules/db.mjs';
import PET_API from './routes/petsRoute.mjs'; 




const server = express();
server.use(express.json());


// Function to test database connection
async function testDbConnection() {
    try {
        const { rows } = await pool.query('SELECT NOW()'); // Use the pool variable
        console.log('Database connection successful. Current time:', rows[0].now);
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
}

// Immediately test DB connection when server starts
testDbConnection();


const port = (process.env.PORT || 8080);
server.set('port', port);

const logger = new SuperLogger();
server.use(logger.createAutoHTTPRequestLogger());

server.use(express.json());
// Defining a folder that will contain static files.
server.use(express.static('public'));

// Telling the server to use the USER_API (all urls that uses this code will have to have the /user after the base address)
server.use("/user", USER_API);
server.use('/pets', PET_API);


// A get request handler example)
server.get("/", (req, res, next) => {
     //req.originalUrl;
res.status(200).send(JSON.stringify({ msg: "These are not the droids...." })).end();

});

// Start the server 
server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});




