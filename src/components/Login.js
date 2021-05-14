import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

// Firebase functions
import firebase from "firebase";
import DatabaseFunctions from "../settings/firebase/db";
import { db, auth } from "../settings/firebase/firebase";
import { encodeAuth } from "../functions/authfunctions";

function Login() {
    // React hooks
    let history = useHistory();

    // Login info
    const [logincreds, setLogincreds] = useState({
        email: "",
        password: "",
    });

    // Login ready
    const [ready, setready] = useState(false);

    // Login states
    const [error, setError] = useState("");
    const [show, setShow] = useState(false);

    // Update Login Inputs
    const updateInput = (name, e) => {
        if (name === "email") {
            setLogincreds({
                ...logincreds,
                email: e.target.value,
            });
        }
        if (name === "password") {
            setLogincreds({
                ...logincreds,
                password: e.target.value,
            });
        }
        setError("");
    };

    // Validate login input data
    function validateEmail() {
        const emailRegx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (logincreds.email !== "" && emailRegx.test(logincreds.email)) {
            return true;
        } else return false;
    }

    // Login handler firebase
    function login() {
        if (validateEmail()) {
            auth.signInWithEmailAndPassword(logincreds.email, logincreds.password)
                .then((e) => {
                    setready(true);
                    setError(false);
                })
                .catch((error) => {
                    setError(error.message);
                });
        } else {
            setError("Please enter a valid email address");
        }
    }

    useEffect(() => {
        if (ready) {
            // catch user login event
            firebase.auth().onAuthStateChanged((user) => {
                db.ref("/users/" + user.uid).once("value", (snap) => {
                    // using email and uid to construct a token
                    let bAuth = encodeAuth(snap.val().email, user.uid);
                    localStorage.setItem("user", bAuth);
                    history.push("/live");
                });
            });
        }
    }, [ready]);

    return (
        <div className="login_container">
            <h5
                className="flave_header3"
                style={{
                    cursor: "pointer",
                }}
                onClick={() => {
                    setShow(!show);
                }}
            >
                Login to your account
            </h5>

            {show ? (
                <form action="" className="flave_form">
                    <div className="flave_inputgroup">
                        <label htmlFor=""> Email </label>
                        <input
                            name="loginemail"
                            type="text"
                            className="flave_forminput"
                            value={logincreds.email}
                            onChange={(e) => {
                                updateInput("email", e);
                            }}
                        />
                    </div>
                    <div className="flave_inputgroup">
                        <label htmlFor=""> Password </label>
                        <input
                            name="loginpassword"
                            type="password"
                            className="flave_forminput"
                            value={logincreds.password}
                            onChange={(e) => {
                                updateInput("password", e);
                            }}
                        />
                    </div>
                    <div className="flave_inputgroup" style={{ justifyContent: "flex-end" }}>
                        <h6 className="error_display">{error}</h6>
                        <input type="button" className=" flave_button action_button" value="Login" onClick={login} />
                    </div>
                </form>
            ) : (
                ""
            )}
        </div>
    );
}

export default Login;
