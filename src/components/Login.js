import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

// Firebase functions
import firebase from "firebase";
import DatabaseFunctions from "../settings/firebase/db";
import { db, auth } from "../settings/firebase/firebase";

function Login() {
    const dbfns = new DatabaseFunctions();

    // Login info
    const [loginemail, setloginemail] = useState("");
    const [loginpassword, setloginpassword] = useState("");

    // Login ready
    const [ready, setready] = useState(false);

    // Login states
    const [error, setError] = useState("");
    let history = useHistory();
    const [show, setShow] = useState(false);

    // Update Login Inputs
    const updateInput = (name, e) => {
        if (name === "loginemail") {
            setloginemail(e.target.value);
        }
        if (name === "loginpassword") {
            setloginpassword(e.target.value);
        }
        setError("");
    };

    // Validate login input data
    function validateEmail() {
        const emailRegx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (loginemail !== "" && emailRegx.test(loginemail)) {
            return true;
        } else return false;
    }

    // Login handler firebase
    function login() {
        if (validateEmail()) {
            auth.signInWithEmailAndPassword(loginemail, loginpassword)
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
            firebase.auth().onAuthStateChanged((user) => {
                db.ref("/users/" + user.uid).once("value", (snap) => {
                    localStorage.setItem("username", snap.val().username);
                    localStorage.setItem("email", snap.val().email);
                    localStorage.setItem("uid", user.uid);
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
                            value={loginemail}
                            onChange={(e) => {
                                updateInput("loginemail", e);
                            }}
                        />
                    </div>
                    <div className="flave_inputgroup">
                        <label htmlFor=""> Password </label>
                        <input
                            name="loginpassword"
                            type="password"
                            className="flave_forminput"
                            value={loginpassword}
                            onChange={(e) => {
                                updateInput("loginpassword", e);
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
