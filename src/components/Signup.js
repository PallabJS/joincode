import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom';

import firebase from 'firebase';
import DatabaseFunctions from './db';
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


function Signup(props) {

    const { showmodal, setShowmodal } = props

    const styles = useStyles()

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


    // Handle modal
    function handleClose() {
        setShowmodal(false)
    }


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
            <Dialog className={styles.modal} open={showmodal} onClose={handleClose} maxWidth='xs'>
                <DialogTitle id="form-dialog-title"> Signup for a new account </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <div className={styles.root}>
                            <TextField
                                type='text'
                                variant='outlined'
                                size='small'
                                label='Username'
                                value={username}
                                fullWidth='on'
                                onChange={(e) => { updateInput('username', e) }}
                            />
                            <TextField
                                type='text'
                                variant='outlined'
                                size='small'
                                label='Password'
                                value={signupemail}
                                fullWidth='on'
                                onChange={(e) => { updateInput('signupemail', e) }}
                            />
                            <TextField
                                type='text'
                                variant='outlined'
                                size='small'
                                label='Email address'
                                value={signuppassword}
                                fullWidth='on'
                                onChange={(e) => { updateInput('signuppassword', e) }}
                            />
                        </div>
                    </DialogContentText>
                    <Button
                        value="Login"
                        onClick={signup}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined' color="primary">
                        Back to home
                    </Button>
                    <Button onClick={signup} variant='outlined' color='primary'>
                        Signup
                    </Button>
                </DialogActions>
            </Dialog>


        </div >
    )
}

export default Signup
