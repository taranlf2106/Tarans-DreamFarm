import express, { response } from "express";
import User from "../modules/user.mjs";
import {HTTPCodes, HTTPMethods} from "../modules/httpConstants.mjs";
import fs from "fs";
import pool from '../modules/db.mjs'; 
import DBManager from '../modules/storageManager.mjs';



const USER_API = express.Router();

// User retrieval by ID
USER_API.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await DBManager.getUserById(id); // Assuming getUserById exists in DBManager
    if (user) {
      res.status(HTTPCodes.SuccesfullRespons.Ok).json(user);
    } else {
      res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send("User not found");
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).send("Failed to retrieve user");
  }
});

// Register new user
USER_API.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await DBManager.createUser({ name, email, password }); // Adjust according to actual method parameters
    res.status(HTTPCodes.SuccesfullRespons.Ok).json(newUser);
  } catch (error) {
    console.error("Database error:", error);
    res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).json({ message: "Failed to save user to database" });
  }
});

// Update a user
USER_API.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
    const updatedUser = await DBManager.updateUser(id, { name, email, password }); // Adjust according to actual method parameters
    if (updatedUser) {
      res.status(HTTPCodes.SuccesfullRespons.Ok).json(updatedUser);
    } else {
      res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send("User not found");
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).send("Failed to update user");
  }
});

// Delete a user
USER_API.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await DBManager.deleteUser(id); // Assuming deleteUser exists in DBManager
    if (deletedUser) {
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