import express from "express";
import HTTPCodes from "../modules/httpConstants.mjs";
import DBManager from '../modules/storageManager.mjs';
import authMiddleware from '../modules/authMiddleware.mjs';

const PET_API = express.Router();

// Endpoint for registering a new pet
PET_API.post('/registerPet', authMiddleware, async (req, res) => {
    // Use the authenticated user's ID
    const { petType, petName } = req.body;
    
    if (!petType || !petName) {
        return res.status(HTTPCodes.ClientSideErrorRespons.BadRequest).send("Missing required pet information");
    }

    try {
        const newPet = await DBManager.createPet({ userId: req.user.id, petType, petName });
        if (newPet) {
            res.status(HTTPCodes.SuccesfullRespons.Created).json(newPet);
        } else {
            res.status(HTTPCodes.ServerErrorRespons.InternalError).send("Failed to register pet");
        }
    } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).send("Failed to register pet due to server error");
    }
});

PET_API.get('/user-pets', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    console.log(`Fetching pets for user ID: ${userId}`);

    try {
        const pets = await DBManager.getPetByUserId(userId);
        console.log(`Pets found for user ID ${userId}:`, pets);

        if (pets.length > 0) {
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(pets);
        } else {
            res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send("No pets found for the user");
        }
    } catch (error) {
        console.error("Error fetching pets:", error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).send("Failed to fetch pets due to server error");
    }
});


export default PET_API;



