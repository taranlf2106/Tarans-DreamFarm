import DBManager from './storageManager.mjs';

class Pet {
    constructor() {
        // Adjust these properties to match your pets table schema
        this.id;
        this.petName;
        this.petType;
        this.userId; // Assuming each pet is associated with a user
    }

    // Save a new pet or update an existing one
    async save() {
        if (this.id == null) {
            // If the pet doesn't have an ID, it's new, so create it
            return await DBManager.createPet(this);
        } else {
            // If the pet has an ID, it exists, so update it
            return await DBManager.updatePet(this);
        }
    }

    // Delete the pet
    delete() {
        DBManager.deletePet(this);
    }
}

export default Pet;
