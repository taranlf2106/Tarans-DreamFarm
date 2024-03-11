class User {
    constructor(email, pswHash, name, id) {
        this.email = email;
        this.pswHash = pswHash;
        this.name = name;
        this.id = id;
    }

    async save() {
        try {
            if (this.id == null) {
                return await DBManager.createUser({
                    email: this.email,
                    password: this.pswHash,
                    name: this.name
                });
            } else {
                return await DBManager.updateUser(this.id, {
                    email: this.email,
                    password: this.pswHash,
                    name: this.name
                });
            }
        } catch (error) {
            console.error('Error saving user:', error);
            throw error; // Re-throw to be handled elsewhere if needed
        }
    }

    async delete() {
        try {
            await DBManager.deleteUser(this.id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}

export default User;