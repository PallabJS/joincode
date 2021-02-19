import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

// Firebase functions
import firebase from 'firebase';
import { db, auth } from './firebase';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@material-ui/core';

import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
        }
    },
    modal: {
        backgroundColor: 'rgba(100,100,100,0.5)',
    }

}))

function Login(props) {


    const { showmodal, setShowmodal } = props

    const styles = useStyles()

    // Login info
    const [loginemail, setloginemail] = useState('');
    const [loginpassword, setloginpassword] = useState('');

    // Login ready
    const [ready, setready] = useState(false);

    // Login states
    const [error, setError] = useState('');
    let history = useHistory();
    const [show, setShow] = useState(false);

    // Update Login Inputs
    const updateInput = (name, e) => {
        if (name === 'loginemail') {
            setloginemail(e.target.value);
        }
        if (name === 'loginpassword') {
            setloginpassword(e.target.value);
        }
        setError('');
    }

    // Handle modal
    function handleClose() {
        setShowmodal(false)
    }



    // Validate login input data
    function validateEmail() {
        const emailRegx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (loginemail !== "" && emailRegx.test(loginemail)) {
            return true;
        }
        else
            return false;
    }

    // Login handler firebase
    function login() {
        if (validateEmail()) {
            auth.signInWithEmailAndPassword(loginemail, loginpassword)
                .then((e) => {
                    setready(true);
                    setError(false);
                }).catch((error) => {
                    setError(error.message);
                })
        }
        else {
            setError('Please enter a valid email address');
        }
    }

    useEffect(() => {
        if (ready) {
            firebase.auth().onAuthStateChanged(user => {
                db.ref('/users/' + user.uid).once('value', (snap) => {
                    localStorage.setItem('username', snap.val().username);
                    localStorage.setItem('email', snap.val().email);
                    localStorage.setItem('uid', user.uid);
                    history.push('/live');
                })
            })
        }
    }, [ready]);

    return (
        <div className={'login_container '}>
            <Dialog className={styles.modal} open={showmodal} onClose={handleClose} maxWidth='xs'>
                <DialogTitle id="form-dialog-title"> Log into your account </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <div className={styles.root}>
                            <TextField
                                type='text'
                                variant='outlined'
                                size='small'
                                label='Email address'
                                value={loginemail}
                                fullWidth='on'
                                onChange={(e) => { updateInput('loginemail', e) }}
                            />
                            <TextField
                                type="password"
                                variant='outlined'
                                size='small'
                                label='Password'
                                value={loginpassword}
                                fullWidth='on'
                                onChange={(e) => { updateInput('loginpassword', e) }}
                            />
                        </div>
                    </DialogContentText>
                    <Button
                        value="Login"
                        onClick={login}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined' color="primary">
                        Back to home
                    </Button>
                    <Button onClick={handleClose} variant='outlined' color="primary">
                        Login
                    </Button>
                </DialogActions>
            </Dialog>
        </div >
    )
}

export default Login
