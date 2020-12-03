import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom';

import firebase from 'firebase';
import DatabaseFunctions from './db';
import { db, auth } from './firebase';

function Signup() {

    const history = useHistory();

    // Some Database functions
    const dbfns = new DatabaseFunctions();

    // Signup info
    const [username, setusername] = useState('');
    const [signupemail, setsignupemail] = useState('');
    const [signuppassword, setsignuppassword] = useState('');

    // Signup states
    const [error, setError] = useState('');
    const [show, setShow] = useState(false);
    const [ready, setready] = useState(false);

    // Update Signup Inputs
    const updateInput = (name, e) => {
        if (name === 'username') {
            setusername(e.target.value)
        }
        if (name === 'signupemail') {
            setsignupemail(e.target.value)
        }
        if (name === 'signuppassword') {
            setsignuppassword(e.target.value);
        }
        setError('');
    }

    // Validate Email Address
    function checkSignupForm() {
        const emailRegx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (signupemail !== "" && emailRegx.test(signupemail)) {
            return true;
        }
        else {
            return false;
        }
    }
    function clearState() {
        setTimeout(() => {
            setusername("");
            setsignupemail("");
            setsignuppassword("");
        }, 1000);
    }

    // Signup handler firebase
    function signup() {
        if (checkSignupForm()) {
            auth.createUserWithEmailAndPassword(signupemail, signuppassword)
                .then((user) => {
                    setError(false);
                    setready(true);
                    setError("Signup Successful");
                }).catch((error) => {
                    setError(error.message);
                })
        }
        else {
            setError(true);
        }
    }

    useEffect(() => {
        if (ready) {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    // create user entry
                    dbfns.createUser({
                        uid: user.uid,
                        username: username,
                        email: signupemail
                    });
                    db.ref('/users/' + user.uid).once('value', (snap) => {
                        localStorage.setItem('username', snap.val().username);
                        localStorage.setItem('email', snap.val().email);
                        localStorage.setItem('uid', user.uid);

                        clearState();
                        history.push('/live');
                    })
                }
            });
        }
    }, [ready])

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
