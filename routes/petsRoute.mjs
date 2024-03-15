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

const petTypeToImageUrl = {
    cat: '/images/cat.png',
    dog: '/images/dog.png',
    squirrel: '/images/squirrel.png',
    deer: '/images/deer.png',
    // Add more mappings as necessary
    default: '/images/default.png', // Default image
};

PET_API.get('/user-pets/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    console.log(`Fetching pets for user ID: ${userId}`);

    try {
        const pets = await DBManager.getPetByUserId(userId);
        console.log(`Pets found for user ID ${userId}:`, pets);

        if (pets.length > 0) {
            const petsWithImages = pets.map(pet => {
                // Use static mapping to get image URL, fallback to default if not found
                const imageUrl = petTypeToImageUrl[pet.pet_type] || petTypeToImageUrl.default;
                return { ...pet, imageUrl };
            });

            res.status(HTTPCodes.SuccesfullRespons.Ok).json(petsWithImages);
        } else {
            res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send("No pets found for the user");
        }
    } catch (error) {
        console.error("Error fetching pets:", error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).send("Failed to fetch pets due to server error");
    }
});


PET_API.get('/user-pets/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    console.log(`Fetching pets for user ID: ${userId}`);

    try {
        const authToken = req.headers.authorization; // Retrieve authorization token from request headers
        const pets = await DBManager.getPetByUserId(userId, authToken); // Pass authorization token to the function

        console.log(`Pets found for user ID ${userId}:`, pets);

        if (pets.length > 0) {
            const petsWithImages = pets.map(pet => {
                // Use static mapping to get image URL, fallback to default if not found
                const imageUrl = petTypeToImageUrl[pet.pet_type] || petTypeToImageUrl.default;
                return { ...pet, imageUrl };
            });

            res.status(HTTPCodes.SuccessfulResponse.Ok).json(petsWithImages);
        } else {
            res.status(HTTPCodes.ClientSideErrorResponse.NotFound).send("No pets found for the user");
        }
    } catch (error) {
        console.error("Error fetching pets:", error);
        res.status(HTTPCodes.ServerErrorResponse.InternalServerError).send("Failed to fetch pets due to server error");
    }
});

PET_API.put('/update/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { petName, petType } = req.body;

    try {
        const updatedPet = await DBManager.updatePet(id, { petName, petType });
        if (updatedPet) {
            const imageUrl = petTypeToImageUrl[updatedPet.pet_type] || petTypeToImageUrl.default;
            const petWithImage = { ...updatedPet, imageUrl };
            res.status(HTTPCodes.SuccesfullRespons.Ok).json(petWithImage);
        } else {
            res.status(HTTPCodes.ClientSideErrorRespons.NotFound).send("Pet not found");
        }
    } catch (error) {
        console.error(new Date().toISOString(), "Database error:", error);
        res.status(HTTPCodes.ServerErrorRespons.InternalError).send("Failed to update pet");
    }
});


// Delete a pet
PET_API.delete('/delete/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
      const deletedPet = await DBManager.deletePet(id);
      if (deletedPet) {
        res.status(HTTPCodes.SuccessfulResponse.Ok).send("Pet deleted successfully!");
      } else {
        res.status(HTTPCodes.ClientSideErrorResponse.NotFound).send("Pet not found");
      }
    } catch (error) {
      console.error("Database error:", error);
      res.status(HTTPCodes.ServerSideErrorResponse.InternalServerError).send("Failed to delete pet");
    }
  });
  
  
export default PET_API;



