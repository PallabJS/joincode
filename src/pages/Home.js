import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { auth, db } from "../settings/firebase/firebase";

import "bootstrap/dist/css/bootstrap.css";
import Images from "react-bootstrap/Image";

import "../css/home.css";
import Signup from "../components/Signup";
import Login from "../components/Login";
import Joincode from "../components/Joincode";

function Home() {
    return (
        <div id="home">
            <div className="home_header_container">
                <div className="home_header">
                    <Joincode size={30} />
                    <div className="home_intro">
                        <p className="home_intro">
                            JoinCode is a free platform for programmers to develop code snippets for your projects.
                            Develop code pieces for your projects collectively, effectively and comfortably.
                        </p>
                        <ul className="home_steps">
                            <h4 className="flave_title"> JoinCode is just about three steps: </h4>
                            <li style={{ marginLeft: "5%" }}> Create a JoinCode </li>
                            <li style={{ marginLeft: "5%" }}> Develop your code </li>
                            <li style={{ marginLeft: "5%" }}> Take your code to the project </li>
                        </ul>
                    </div>
                    <div className="home_demo">
                        <div id="demo1">
                            <h3> Setup </h3>
                            <Images src={"/images/step1.png"} fluid />
                        </div>
                        <div id="demo2">
                            <h3> Develop </h3>
                            <Images src={"/images/step2.png"} fluid />
                        </div>
                        <div id="demo2">
                            <h3> Export </h3>
                            <Images src={"/images/step3.png"} fluid />
                        </div>
                    </div>
                </div>

                <div className="home_forms">
                    <div className="form_container">
                        <Login />
                    </div>
                    <br />
                    <div className="form_container">
                        <Signup />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
