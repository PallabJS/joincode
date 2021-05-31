import { db } from "../../settings/firebase/firebase";

export const connectionApi = {
    // Creates a joincode
    createJoincode: async (newRoomName, username) => {
        let res = { success: false, fail: false, data: {}, msg: "" };

        // check if room already exist
        let snap = await db.ref("/joins/" + newRoomName).once("value");

        // create a new room only if noexistent
        if (!snap.val()) {
            // Create a new room
            let setRes = await db
                .ref("/joins/" + newRoomName)
                .set({
                    initiator: username,
                    code: "//Start writing you codes here",
                })
                .then(() => {
                    res.success = true;
                })
                .catch(() => {
                    res.fail = true;
                });
        } else {
            alert("This room already exists, try another one");
        }
        return res;
    },
};
