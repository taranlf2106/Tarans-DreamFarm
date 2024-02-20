import dotenv from 'dotenv/config';
import express from 'express' // Express is installed using npm
import USER_API from './routes/usersRoute.mjs'; // This is where we have defined the API for working with users.
import SuperLogger from './modules/superLogger.mjs';
import pool from './modules/db.mjs';

const server = express();
server.use(express.json());
server.use('/user', USER_API);

/*
async function testDbConnection() {
    try {
      const { rows } = await pool.query('SELECT NOW()');
      console.log('Current time from PostgreSQL:', rows[0]);
    } catch (error) {
      console.error('Error testing the database connection:', error);
    }
  }
  */
  //testDbConnection();
// Selecting a port for the server to use.
const port = (process.env.PORT || 8080);
server.set('port', port);

const logger = new SuperLogger();
server.use(logger.createAutoHTTPRequestLogger());

server.use(express.json());
// Defining a folder that will contain static files.
server.use(express.static('public'));

// Telling the server to use the USER_API (all urls that uses this code will have to have the /user after the base address)
server.use("/user", USER_API);

// A get request handler example)
server.get("/", (req, res, next) => {
     //req.originalUrl;
res.status(200).send(JSON.stringify({ msg: "These are not the droids...." })).end();

});

// Start the server 
server.listen(server.get('port'), function () {
    console.log('server running', server.get('port'));
});




