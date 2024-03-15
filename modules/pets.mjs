import DBManager from './storageManager.mjs';

class Pet {
    constructor() {
        
        this.id;
        this.petName;
        this.petType;
        this.userId; 
    }

   
    async save() {
        if (this.id == null) {
            
            return await DBManager.createPet(this);
        } else {
          
            return await DBManager.updatePet(this);
        }
    }

    // Delete the pet
    delete() {
        DBManager.deletePet(this);
    }
}

export default Pet;
