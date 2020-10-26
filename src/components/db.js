import { db } from './firebase';

export default class DatabaseFunctions {

    constructor() {
        this.userscount = 0;
        this.getUsersCount();
    }

    // Get total user count
    getUsersCount() {
        db.ref('/info/totalusers').once('value', (snap) => {
            this.userscount = snap.val();
        })
    }

    // Update Users count
    updateUsersCount(action) {
        if (action === 'add') {
            db.ref('/info').set({ 'totalusers': Number(this.userscount) + Number(1) });
        }
        if (action === 'remove') {
            db.ref('/info').set({ 'totalusers': Number(this.userscount) - Number(1) });
        }
    }

    // Create a new user entry
    createUser(data) {
        db.ref('/users/' + this.getName(data.email)).set({
            username: data.username,
            email: data.email
        })
        this.updateUsersCount('add');
    }

    // Get the name of the user from email
    getName(email) {
        var name = email.split('');
        var index = name.indexOf('@');

        name = name.slice(0, index);
        name = name.filter((item => {
            return (item !== ".")
        }))
        return (name.join(''));
    }
}