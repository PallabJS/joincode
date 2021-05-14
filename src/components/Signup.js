import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useSnackbar } from "notistack";

import firebase from "firebase";
import DatabaseFunctions from "../settings/firebase/db";
import { db, auth } from "../settings/firebase/firebase";

function Signup() {
    // Hooks
    const history = useHistory();
    const { enqueueSnackbar } = useSnackbar();

    // Some Database functions
    const dbfns = new DatabaseFunctions();

    // Signup info
    const [signupcreds, setSignupcreds] = useState({
        email: "",
        password: "",
        username: "",
    });

    // Signup states
    const [error, setError] = useState("");
    const [show, setShow] = useState(false);

    // Update Signup Inputs
    const updateInput = (name, e) => {
        if (name === "username") {
            setSignupcreds({
                ...signupcreds,
                username: e.target.value,
            });
        }
        if (name === "email") {
            setSignupcreds({
                ...signupcreds,
                email: e.target.value,
            });
        }
        if (name === "password") {
            setSignupcreds({
                ...signupcreds,
                password: e.target.value,
            });
        }
        setError("");
    };

    // Validate Email Address
    function checkSignupForm() {
        const emailRegx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (signupcreds.email !== "" && emailRegx.test(signupcreds.email)) {
            return true;
        } else {
            return false;
        }
    }
    function clearState() {
        setTimeout(() => {
            setSignupcreds({ email: "", password: "", username: "" });
        }, 1000);
    }

    // Signup handler firebase
    function signup() {
        if (checkSignupForm()) {
            // Check username
            if (!signupcreds.username) {
                setError("Please choose a valid username");
                return false;
            }
            // Check password
            if (!signupcreds.password) {
                setError("Enter a password");
                return false;
            } else {
                if (signupcreds.password.length < 6) {
                    setError("Choose a stronger password(length >= 6 characters)");
                    return false;
                }
            }

            // Finally process signup
            auth.createUserWithEmailAndPassword(signupcreds.email, signupcreds.password)
                .then((res) => {
                    let user = res.user;
                    setError(false);

                    // create user entry
                    dbfns.createUser({
                        uid: user.uid,
                        username: signupcreds.username,
                        email: signupcreds.email,
                    });

                    enqueueSnackbar("Signup successful", { variant: "success" });
                })
                .catch((error) => {
                    setError(error.message);
                });
        } else {
            setError("Invalid email address");
        }
    }

    db.ref("/info/totalusers").once("value", (snap) => {
        console.log(snap.val());
    });

    return (
        <div className="signup_container">
            <h5
                className="flave_header3"
                style={{
                    cursor: "pointer",
                }}
                onClick={() => {
                    setShow(!show);
                }}
            >
                Sign Up for a new account
            </h5>
            {show ? (
                <form action="" className="flave_form">
                    <div className="flave_inputgroup">
                        <label htmlFor=""> Username </label>
                        <input
                            name="username"
                            type="text"
                            className="flave_forminput"
                            value={signupcreds.username}
                            onChange={(e) => {
                                updateInput("username", e);
                            }}
                        />
                    </div>
                    <div className="flave_inputgroup">
                        <label htmlFor=""> Email </label>
                        <input
                            name="signupemail"
                            type="email"
                            className="flave_forminput"
                            value={signupcreds.email}
                            onChange={(e) => {
                                updateInput("email", e);
                            }}
                        />
                    </div>
                    <div className="flave_inputgroup">
                        <label htmlFor=""> Password </label>
                        <input
                            name="signuppassword"
                            type="password"
                            className="flave_forminput"
                            value={signupcreds.password}
                            onChange={(e) => {
                                updateInput("password", e);
                            }}
                        />
                    </div>
                    <div className="flave_inputgroup" style={{ justifyContent: "flex-end" }}>
                        <h6 className="error_display">{error}</h6>
                        <input type="button" className=" flave_button action_button" value="Signup" onClick={signup} />
                    </div>
                </form>
            ) : (
                ""
            )}
        </div>
    );
}

export default Signup;
