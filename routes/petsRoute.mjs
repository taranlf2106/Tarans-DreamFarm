import express from "express";
import { HTTPCodes } from "../modules/httpConstants.mjs";
import DBManager from '../modules/storageManager.mjs'; // Adjust this path to where your DBManager is located
import authMiddleware from '../modules/authMiddleware.mjs';

const PET_API = express.Router();


// Endpoint for registering a new pet
PET_API.post('/registerPet', authMiddleware, async (req, res) => { // Added authMiddleware to ensure authentication
    // Assuming the authenticated user's ID is stored in req.user.id after successful authentication
    const userId = req.user.id; // Use the authenticated user's ID instead of taking it from the body
    const { petType, petName } = req.body;
    
    if (!petType || !petName) {
        return res.status(HTTPCodes.ClientError.BadRequest).send("Missing required pet information");
    }

    try {
        // No need to check for user existence here since authMiddleware ensures the user is authenticated
        const newPet = await DBManager.createPet({ userId, petType, petName });
        if (newPet) {
            res.status(HTTPCodes.Successful.Created).json(newPet); // Assuming createPet returns the new pet object
        } else {
            res.status(HTTPCodes.ServerError.InternalServerError).send("Failed to register pet");
        }
    } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(HTTPCodes.ServerError.InternalServerError).send("Failed to register pet due to server error");
    }
});

PET_API.get('/user-pets', authMiddleware, async (req, res) => { // Using authMiddleware to ensure only authenticated users can access this endpoint
    const userId = req.user.id; // Use the authenticated user's ID to fetch pets

    try {
        const pets = await DBManager.getPetByUserId(userId);
        if (pets.length > 0) {
            res.status(HTTPCodes.Successful.Ok).json(pets); // Send back the array of pets associated with the authenticated user
        } else {
            res.status(HTTPCodes.ClientError.NotFound).send("No pets found for the user");
        }
    } catch (error) {
        console.error("Error fetching pets:", error);
        res.status(HTTPCodes.ServerError.InternalServerError).send("Failed to fetch pets due to server error");
    }
});

export default PET_API;


