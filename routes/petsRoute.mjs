import express from "express";
import basicAuthMiddleware from '../modules/BasicAuthMiddleware.mjs'; // Adjust this path to where your BasicAuthMiddleware is located
import { HTTPCodes } from "../modules/httpConstants.mjs";
import DBManager from '../modules/storageManager.mjs'; // Adjust this path to where your DBManager is located

const PET_API = express.Router();

PET_API.use(basicAuthMiddleware);


// Endpoint for registering a new pet
PET_API.post('/registerPet', async (req, res) => {
    const { userId, petType, petName } = req.body;
    
    if (!userId || !petType || !petName) {
        return res.status(400).send("Missing required pet information");
    }

    try {

        
        // Validate if user exists
        const userExists = await DBManager.getUserById(userId);
        if (!userExists) {
            return res.status(404).send("User not found");
        }

        // Create the pet
        const newPet = await DBManager.createPet({ userId, petType, petName });
        if (newPet) {
            res.status(200).send(`Pet registered successfully with ID: ${newPet.id}`);
        } else {
            // Handle case where pet couldn't be created
            res.status(500).send("Failed to register pet");
        }
    } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(500).send("Failed to register pet due to server error");
    }
});

export default PET_API;


