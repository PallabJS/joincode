import { db } from "./firebase";

export default class DatabaseFunctions {
    // Update Users count
    updateUsersCount(action) {
        let userscount = 0;
        // Get total user count
        db.ref("/info/totalusers").once("value", (snap) => {
            userscount = snap.val();
            if (action === "add") {
                db.ref("/info")
                    .child("totalusers")
                    .set(Number(userscount) + 1);
            }
            if (action === "remove") {
                db.ref("/info")
                    .child("totalusers")
                    .set(Number(userscount) - 1);
            }
        });
    }

    // Create a new user entry
    createUser(data) {
        if (data.username != "" && data.email != "") {
            db.ref("/users/" + data.uid).set({
                username: data.username,
                email: data.email,
            });
            this.updateUsersCount("add");
        }
    }
}
