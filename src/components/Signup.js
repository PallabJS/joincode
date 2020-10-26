import React, { useState } from 'react'

// Firebase functions
import { auth, db } from './firebase';
import DatabaseFunctions from './db';

function Signup({ username, setUsername, signupemail, signuppassword, setSignupemail, setSignuppassword }) {

    // Some Database functions
    const db = new DatabaseFunctions();

    // Signup states
    const [error, setError] = useState('');
    const [show, setShow] = useState(false);

    // Update Signup Inputs
    const updateInput = (name, e) => {
        if (name === 'username') {
            setUsername(e.target.value)
        }
        if (name === 'signupemail') {
            setSignupemail(e.target.value)
        }
        if (name === 'signuppassword') {
            setSignuppassword(e.target.value);
        }
        setError('');
    }

    // Validate Signup input data
    function checkSignupForm() {
        const emailRegx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (signupemail !== "" && emailRegx.test(signupemail)) {
            return true;
        }
        else {
            return false;
        }
    }

    // Signup handler firebase
    function signup() {
        if (checkSignupForm()) {
            auth.createUserWithEmailAndPassword(signupemail, signuppassword)
                .then(() => {
                    setError(false);

                    // create user entry
                    db.createUser({
                        username: username,
                        email: signupemail
                    });
                }).catch((error) => {
                    setError(true);
                    setError('Email already taken');
                })
        }
        else {
            setError(true);
        }
    }

    return (
        <div className='signup_container'>
            <h5
                className="flave_header3"
                style={{
                    cursor: 'pointer'
                }}
                onClick={() => { setShow(!show) }}
            > Sign Up for a new account </h5>
            {show
            ?
            (<form action="" className="flave_form">
                <div className="flave_inputgroup">
                    <label htmlFor=""> Username </label>
                    <input
                        name='username'
                        type="text"
                        className="flave_forminput"
                        value={username}
                        onChange={(e) => { updateInput('username', e) }}
                    />
                </div>
                <div className="flave_inputgroup">
                    <label htmlFor=""> Email </label>
                    <input
                        name='signupemail'
                        type="email"
                        className="flave_forminput"
                        value={signupemail}
                        onChange={(e) => { updateInput('signupemail', e) }}
                    />
                </div>
                <div className="flave_inputgroup">
                    <label htmlFor=""> Password </label>
                    <input
                        name='signuppassword'
                        type="password"
                        className="flave_forminput"
                        value={signuppassword}
                        onChange={(e) => { updateInput('signuppassword', e) }}
                    />
                </div>
                <div className="flave_inputgroup" style={{ justifyContent: 'flex-end' }} >
                    <h6 className='error_display'>
                        {error}
                    </h6>
                    <input
                        type="button"
                        className=" flave_button action_button"
                        value="Signup"
                        onClick={signup}
                    />
                </div>
            </form>)
                :
                ("")
                }
        </div >
    )
}

export default Signup
