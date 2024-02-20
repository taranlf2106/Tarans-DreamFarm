import DBManager from './storageManager.mjs';


class User {

    constructor() {
        ///TODO: Are these the correct fields for your project?
        this.email;
        this.pswHash;
        this.name;
        this.id;
    }

    async save() {
        if (this.id == null) {
            return await DBManager.createUser(this);
        }else{
            return await DBManager.updateUser(this);
        }
    
}

delete() {

    DBManager.deleteUser(this);
    
    }
}

export default User;