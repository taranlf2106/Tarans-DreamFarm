import express from "express";
import pool from '../modules/db.mjs'; 
import { HTTPCodes } from "../modules/httpConstants.mjs";

const PET_API = express.Router();
PET_API.use(express.json());

// Endpoint for registering a new pet
PET_API.post('/registerPet', async (req, res) => {
    const { userId, petType, petName } = req.body;

    try {
        // Check if the userId exists in the users table to ensure a valid association
        const userCheckQuery = 'SELECT * FROM users WHERE id = $1';
        const userCheckResult = await pool.query(userCheckQuery, [userId]);

        if (userCheckResult.rows.length === 0) {
            // If the user doesn't exist, respond with an error
            return res.status(HTTPCodes.ClientSideErrorRespons.NotFound).json({ message: "User not found" });
        }

        // Insert the new pet into the database
        const insertPetQuery = 'INSERT INTO pets (user_id, pet_type, pet_name) VALUES ($1, $2, $3) RETURNING *';
        const petResult = await pool.query(insertPetQuery, [userId, petType, petName]);
        const newPet = petResult.rows[0];

        // Send back the newly created pet
        res.status(HTTPCodes.SuccesfullRespons.Ok).json(newPet);
    } catch (dbError) {
        console.error("Database error:", dbError);
        res.status(HTTPCodes.ServerSideErrorRespons.InternalServerError).json({ message: "Failed to register pet" });
    }
});

export default PET_API;

