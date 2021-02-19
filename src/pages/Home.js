import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom';

import firebase from 'firebase';
import { Button } from '@material-ui/core'

import 'bootstrap/dist/css/bootstrap.css';
import Images from 'react-bootstrap/Image';

import '../css/home.css'
import '../css/flave.css'

import Signup from '../components/Signup';
import Login from '../components/Login';
import Joincode from '../components/Joincode';

import step1 from '../images/step1.png';
import step2 from '../images/step2.png';
import step3 from '../images/step3.png';


function Home() {

    // HISTORY
    let history = useHistory();

    // Modal state
    let [modal, setModal] = useState("")
    let [showmodal, setShowmodal] = useState(false)


    function handleModal(type) {
        if (type === 'login') {
            setShowmodal(true)
            setModal(<Login showmodal={true} setShowmodal={setShowmodal} />)
        }
        if (type === 'signup') {
            setShowmodal(true)
            setModal(<Signup showmodal={true} setShowmodal={setShowmodal} />)
        }
    }

    console.log(firebase.auth().currentUser);
    // Redirect on login
    useEffect(() => {

        // Clear Console
        setTimeout(() => {
            console.clear();
            console.log("Welcome to JoinCode");
        }, 300);
        setTimeout(() => {
            console.clear();
            console.log("Welcome to JoinCode");
        }, 1000);
    });

    return (
        <div id='home'>

            <div className='home_header_container'>
                <div className='home_header'>
                    <Joincode size={30} />
                    <div className='home_intro'>
                        <p className='home_intro'>
                            JoinCode is a free platform for programmers to develop code snippets for your projects. Develop code pieces for your projects collectively, effectively and comfortably.
                        </p>
                    </div>
                    <div className='home_demo'>
                        <div id='demo1'>
                            <h5> Setup </h5>
                            <p style={{ marginLeft: '5%' }}> First, create a JoinCode </p>
                            <Images src={step1} fluid />
                        </div>
                        <div id='demo2'>
                            <h5> Develop </h5>
                            <p style={{ marginLeft: '5%' }}> Second, develop code with your team </p>
                            <Images src={step2} fluid />
                        </div>


                        <div id='demo2'>
                            <h5> Export </h5>
                            <p style={{ marginLeft: '5%' }}> Download the file and merge it to you project </p>
                            <Images src={step3} fluid />
                        </div>
                    </div>
                </div>
            </div>
            <div className='home_bottom_bar'>
                <Button className='button' onClick={() => handleModal('login')} variant='contained' color='primary'> Login </Button>
                <Button className='button' onClick={() => handleModal('signup')} variant='contained' color='primary'> Signup </Button>
            </div>

            { showmodal ? modal : ""}

        </div >
    )
}

export default Home;
