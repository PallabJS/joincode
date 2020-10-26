import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

// Firebase functions
import { auth, db } from './firebase';
import DatabaseFunctions from './db';

function Login({ loginemail, loginpassword, setLoginemail, setLoginpassword }) {

    const db = new DatabaseFunctions();

    // Login states
    const [error, setError] = useState('');
    let history = useHistory();
    const [show, setShow] = useState(false);

    // Update Login Inputs
    const updateInput = (name, e) => {
        if (name === 'loginemail') {
            setLoginemail(e.target.value);
        }
        if (name === 'loginpassword') {
            setLoginpassword(e.target.value);
        }
        setError('');
    }

    // Validate login input data
    function isLoginFormValid() {
        const emailRegx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (loginemail !== "" && emailRegx.test(loginemail)) {
            return true;
        }
        else
            return false;
    }

    // Login handler firebase
    function login() {
        if (isLoginFormValid()) {
            auth.signInWithEmailAndPassword(loginemail, loginpassword)
                .then(() => {
                    setError(false);
                    localStorage.setItem('userref', db.getName(loginemail));
                    history.push('/live');
                }).catch((error) => {
                    console.log(error);
                    setError(error.message);
                })
        }
        else {
            setError('Email is invalid');
        }
    }

    return (
        <div className='login_container'>
            <h5
                className="flave_header3"
                style={{
                    cursor: 'pointer'
                }}
                onClick={() => { setShow(!show) }}
            > Login to your account </h5>

            {show ?
                (
                    <form action="" className="flave_form">
                        <div className="flave_inputgroup">
                            <label htmlFor=""> Email </label>
                            <input
                                name='loginemail'
                                type="text"
                                className="flave_forminput"
                                value={loginemail}
                                onChange={(e) => { updateInput('loginemail', e) }}
                            />
                        </div>
                        <div className="flave_inputgroup">
                            <label htmlFor=""> Password </label>
                            <input
                                name='loginpassword'
                                type="password"
                                className="flave_forminput"
                                value={loginpassword}
                                onChange={(e) => { updateInput('loginpassword', e) }}
                            />
                        </div>
                        <div className="flave_inputgroup" style={{ justifyContent: 'flex-end' }}>
                            <h6 className='error_display'>
                                {error}
                            </h6>
                            <input
                                type="button"
                                className=" flave_button action_button"
                                value="Login"
                                onClick={login}
                            />
                        </div>
                    </form>
                )
                :
                ("")
            }
        </div>
    )
}

export default Login
