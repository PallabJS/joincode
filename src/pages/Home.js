import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.css';
import Images from 'react-bootstrap/Image';

import '../css/home.css'
import Signup from '../components/Signup';
import Login from '../components/Login';
import Joincode from '../components/Joincode';

import step1 from '../images/step1.png';
import step2 from '../images/step2.png';
import step3 from '../images/step3.png';

function Home() {

    // HISTORY
    let history = useHistory();

    // Login info
    const [loginemail, setLoginemail] = useState('');
    const [loginpassword, setLoginpassword] = useState('');


    // Signup info
    const [username, setUsername] = useState('');
    const [signupemail, setSignupemail] = useState('');
    const [signuppassword, setSignuppassword] = useState('');

    // Redirect on login
    useEffect(() => {
        var login = {};
        login.user = localStorage.getItem('userref');
        login.activeroom = localStorage.getItem('activeroom');
        if (login.user && login.activeroom) {
            history.push('/live');
        }
    }, [])

    return (
        <div id='home'>
            <div className='home_header_container'>
                <div className='home_header'>
                    <Joincode size={30} />
                    <div className='home_intro'>
                        <p className='home_intro'>
                            JoinCode is a free platform for programmers to develop code snippets for your projects. Develop code pieces for your projects collectively, effectively and comfortably.
                        </p>
                        <ul className='home_steps'>
                            <h4 className='flave_title'> JoinCode is just about three steps: </h4>
                            <li style={{ marginLeft: '5%' }}> Create a JoinCode </li>
                            <li style={{ marginLeft: '5%' }}> Develop your code </li>
                            <li style={{ marginLeft: '5%' }}> Take your code to the project </li>
                        </ul>
                    </div>
                    <div className='home_demo'>
                        <div id='demo1'>
                            <h3> Setup </h3>
                            <Images src={step1} fluid />
                        </div>
                        <div id='demo2'>
                            <h3> Develop </h3>
                            <Images src={step2} fluid />
                        </div>
                        <div id='demo2'>
                            <h3> Export </h3>
                            <Images src={step3} fluid />
                        </div>
                    </div>
                </div>

                <div className='home_forms'>
                    <div className='form_container'>
                        <Login
                            loginemail={loginemail}
                            loginpassword={loginpassword}
                            setLoginemail={setLoginemail}
                            setLoginpassword={setLoginpassword}
                        />
                    </div>
                    <br />
                    <div className='form_container'>
                        <Signup
                            signupemail={signupemail}
                            signuppassword={signuppassword}
                            setSignupemail={setSignupemail}
                            setSignuppassword={setSignuppassword}
                            username={username}
                            setUsername={setUsername}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;
