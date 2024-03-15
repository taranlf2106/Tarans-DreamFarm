import express, { response } from "express";
import User from "../modules/user.mjs";
import {HTTPCodes, HTTPMethods} from "../modules/httpConstants.mjs";
import fs from "fs";
import pool from '../modules/db.mjs'; 
import DBManager from '../modules/storageManager.mjs';
import bcrypt from 'bcrypt';
import authMiddleware from '../modules/authMiddleware.mjs';



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


 // Fetch a user's information
 USER_API.get('/details/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await DBManager.getUserById(id);
    const pets = await DBManager.getPetByUserId(id);
    if (user) {
      res.status(200).json({ user, pets });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user and pets:", error);
    res.status(500).send("Failed to retrieve user details");
  }
});



// Update a user by ID
// Update a user by ID
// Update a user by ID
USER_API.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
      let updatedUser;
      if (password) {
          // If password is provided, update all details including the password
          updatedUser = await DBManager.updateUser(id, { name, email, password });
      } else {
          // If password is not provided, update only name and email
          updatedUser = await DBManager.updateUser(id, { name, email });
      }
      if (updatedUser) {
          res.status(200).json(updatedUser); // Send updated user object in response
      } else {
          res.status(404).send("User not found");
      }
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Failed to update user");
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


// Assuming you have session management set up with express-session or a similar package
USER_API.post('/login', async (req, res) => {
  const { email, password } = req.body; // Extracting email and password from request body

  try {
      // Attempt to find the user by their email
      const user = await DBManager.findUserByEmail(email);
      
      // If no user is found with the provided email
      if (!user) {
          return res.status(404).send('User not found');
      }

      // Compare the plaintext password with the hashed password stored in the database
      const match = await bcrypt.compare(password, user.password);
      
      // If passwords do not match
      if (!match) {
          return res.status(401).send('Invalid credentials');
      }

      // If passwords match, proceed with the login process
      // For security, don't send the password hash back to the client
      const { password: _, ...userWithoutPassword } = user;

      // Respond with the user data (excluding the password)
      const pet = await DBManager.getPetByUserId(user.id);

      // For security, don't send the password hash back to the client

      // Respond with the user data (excluding the password) and pet information
      res.json({ user: userWithoutPassword, pet });
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('An error occurred during login');
  }
});

USER_API.get('/my-pets', authMiddleware, async (req, res) => {
  // Using the authenticated user's ID from the session
  const userId = req.user.id;
  try {
      const pets = await DBManager.getPetByUserId(userId);
      if (pets.length > 0) {
          res.json(pets); // Send the pet information back to the client
      } else {
          res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send('No pets found for the user');
      }
  } catch (error) {
      console.error('Error fetching pets by user ID:', error);
      res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).send('An error occurred while fetching pets information');
  }
});

USER_API.get('/protected-user-info', authMiddleware, async (req, res) => {
  // This route is protected, so you can access user details safely here
  res.json({ message: 'Access to protected user information granted.', user: req.user });
});



export default USER_API;


