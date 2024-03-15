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
    const user = await DBManager.getUserById(id); 
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
    const newUser = await DBManager.createUser({ name, email, password }); 
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




USER_API.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
      let updatedUser;
      if (password) {
          
          updatedUser = await DBManager.updateUser(id, { name, email, password });
      } else {
         
          updatedUser = await DBManager.updateUser(id, { name, email });
      }


      if (updatedUser) {
        console.log(updatedUser)
          res.status(200).json(updatedUser); 
      } else {
          res.status(404).send("User not found");
      }
  } catch (error) {
      console.error("Database error:", error);
      res.status(500).send("Failed to update user");
  }
});




// Delete a user
USER_API.delete('delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await DBManager.deleteUser(id); 

   
    if (deletedUser) {
      res.status(HTTPCodes.SuccessfulResponse.Ok).send("User and associated pet(s) deleted successfully!");
    } else {
      res.status(HTTPCodes.ClientSideErrorResponse.NotFound).send("User not found");
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(HTTPCodes.ServerSideErrorResponse.InternalServerError).send("Failed to delete user and associated pet(s)");
  }
});




USER_API.post('/login', async (req, res) => {
  const { email, password } = req.body; 

  try {
      
      const user = await DBManager.findUserByEmail(email);
      
     
      if (!user) {
          return res.status(404).send('User not found');
      }

      
      const match = await bcrypt.compare(password, user.password);
      
     
      if (!match) {
          return res.status(401).send('Invalid credentials');
      }

    
      const { password: _, ...userWithoutPassword } = user;

      
      const pet = await DBManager.getPetByUserId(user.id);

   
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
          res.json(pets);
      } else {
          res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send('No pets found for the user');
      }
  } catch (error) {
      console.error('Error fetching pets by user ID:', error);
      res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).send('An error occurred while fetching pets information');
  }
});

USER_API.get('/protected-user-info', authMiddleware, async (req, res) => {

  res.json({ message: 'Access to protected user information granted.', user: req.user });
});



export default USER_API;


