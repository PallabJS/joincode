import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { socket } from "../components/socket";

import Joincode from "../components/Joincode";
import jsbeautify from 'js-beautify';

import { ControlledEditor } from "@monaco-editor/react";

import "../css/live.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import $ from 'jquery';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/resizable';
import '../css/resizable.css';
import 'jquery-ui/ui/widgets/mouse.js';

import { db, auth } from "../components/firebase";


function Live() {
    const history = useHistory();

    // Errors
    const [error, setError] = useState("code...");
    const [initiator, setinitiator] = useState("");
    const [contributors, setcontributors] = useState({});

    // USER DETAIL
    const [userref, setUserref] = useState();

    // CREATE INSTANCE MODAL
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [newroom, setnewroom] = useState("");
    const [activeroom, setactiveroom] = useState("");

    // JOIN A JoinCode
    const [joinroom, setjoinroom] = useState("");

    const handleChange = (e) => {
        setnewroom(e.target.value);
    };

    // Code State
    var [code, setCode] = useState(" ");
    var [codeactive, setCodeactive] = useState("off");

    // CREATE A NEW JOINCODE
    function createActivity() {
        // check if room already exist
        db.ref("/joins/" + newroom).once("value", (snap) => {
            if (!snap.val()) {
                // Create a room
                db.ref("/joins/" + newroom).set({
                    initiator: localStorage.getItem("userref"),
                    code: "",
                });
                handleClose();
                setactiveroom(newroom);
                setCodeactive("on");
            } else {
                alert("Room already exists");
            }
        });
    }

    // ENTER A JOINCODE
    function enterJoin() {
        var data = {
            user: userref,
            room: joinroom,
        };
        socket.emit("joinroom", data);
        setjoinroom("");
    }

    // UPDATE CODE
    function updateCode(e, value) {
        setCode(value);

        // ALL DYNAMIC DB UPDATES HAPPENS HERE
        if (activeroom) {
            db.ref("/joins/" + activeroom + "/code/code").set(value).catch(error => {
                console.log(error.message);
            })
            socket.emit("codeupdate", activeroom);
        }
    }

    // SAVE THE CODE
    function saveCode() {
        db.ref('/joins/' + activeroom + '/code/').child('save').set(code);
    }

    // LOAD LAST SAVED CODE
    function loadSavedCode() {
        db.ref('/joins/' + activeroom + '/code/').child('save').once('value', code => {
            setCode(code.val());
        })
    }

    // UPDATE USERS LIST
    function updateUsers() {
        db.ref("/joins/" + activeroom + "/initiator/").once("value", (snap) => {
            if (snap.val()) {
                setinitiator(snap.val());
            }
        });
        db.ref("/joins/" + activeroom + "/contributors/").once("value",
            (snap) => {
                if (snap.val()) {
                    setcontributors(snap.val());
                }
            }
        );
    }

    // LOG OUT
    const logOut = () => {
        auth.signOut();
        db.ref('/joins/' + activeroom + '/contributors/' + userref).child('status').set('offline');
        socket.emit('leavenotice', activeroom);
        localStorage.clear();
        history.push("/");
    };

    // RUN CODE
    const runCode = () => {
        console.clear();
        console.log("Evaluating");
        try {
            eval(code);
        }
        catch (e) {
            console.log(e);
        }
    }

    useEffect(function () {
        setUserref(localStorage.getItem("userref"));

        // INITIALIZE PREVIOUS SESSION
        var active = localStorage.getItem("codeactive");
        var room = localStorage.getItem("activeroom");
        // Load the session and live coding
        setCodeactive(active);
        setactiveroom(room);

        // Once and whenever someone gets into collaboration
        if (activeroom !== "" && userref !== "") {
            socket.emit("onlinestatus", { user: userref, room: activeroom });
        }

        if (activeroom) {
            // USERS UPDATE
            updateUsers();

            // Enforce fast refresh
            socket.emit("refresh-catchup", {
                user: localStorage.getItem("userref"),
                room: localStorage.getItem("activeroom"),
                status: localStorage.getItem("status"),
            });
        }

        // DATABASE EVENTS
        // load code from database
        db.ref("/joins/" + activeroom + "/code/code/").once("value", (snap) => {
            if (snap.val()) {
                setCode(snap.val());
            }
        });

        // UPDATE USERS COLLABORATIONS ON NEW JOIN
        db.ref("/joins/" + activeroom + "/contributors/").on(
            "child_added",
            (snap) => {
                setcontributors(snap.val());
            }
        );
        // UPDATE USERS COLLABORATIONS ON LEAVE
        db.ref("/joins/" + activeroom + "/contributors/").on(
            "child_removed",
            (snap) => {
                if (snap.val()) {
                    setcontributors(snap.val());
                }
            }
        );

    }, [activeroom]);

    let fakekey = 0;


    // RUN ONCE ON MOUNTING
    useEffect(function () {

        // Avail active room inside the useeffect;
        var activeroom = localStorage.getItem('activeroom');

        // CLEAR CONSOLE ON LOAD
        setTimeout(() => {
            console.clear();
            console.log("Welcome to JoinCode");
        }, 1000);

        // HANDLE JOIN REQUEST
        socket.on("requestaccess", (data) => {
            db.ref("/joins/" + data.room).once("value", (snap) => {
                if (snap.val().initiator === localStorage.getItem("userref")) {
                    var access = window.confirm(
                        data.user + " wants to collaborate to " + data.room
                    );
                    var res = {
                        access: access,
                        user: data.user,
                        room: data.room,
                    };
                    socket.emit("requestaccess-response", res);
                }
            });
        });

        // HANDLE REQUEST APPROVED
        socket.on("requestapproved", (data) => {
            localStorage.setItem("codeactive", "on");
            localStorage.setItem("activeroom", data.room);
            localStorage.setItem("status", "joined");
            setactiveroom(data.room);
            setCodeactive("on");
            window.location.reload();
        });

        // HANDLE NOSUCHROOM
        socket.on("nosuchroom", () => {
            alert("Room does not exist, Create one instead!");
        });


        // CODE UPDATE NOTIFY
        socket.on("codeupdate", (code) => {
            // GET THE CODE FROM DATABASE AND SET IT
            db.ref("/joins/" + activeroom + "/code/code/").once("value", (snap) => {
                if (snap.val()) {
                    setCode(snap.val());
                }
            });
        });

        // UPDATE ONLINE USERS
        socket.on('onlineuserschangenotify', () => {
            db.ref('/joins/' + activeroom + '/contributors/').once('value', (snap) => {
                if (snap.val()) {
                    setcontributors(snap.val());
                }
            })
        })

        // UPDATE USERS ON ANY CHANGE
        db.ref('/joins/' + activeroom + '/contributors/').on('value', (snap) => {
            updateUsers();
        })

        // STATIC CODES FOR CSS
        document.getElementsByClassName("activity_header")[0].addEventListener('click', () => {
            $('.activity_inner').toggleClass('show');
            $('.code').toggleClass('code_height');
        })

        $('#resizer').on('mousedown', function (e) {
            var position = $(this).position();
            var top = position.top;
            var left = position.left;
            console.log(left);
            console.log($('.activity_space').width());
        });

        $('.activity_space').resizable({
            minWidth: 150,

        });

        $('.activity_space').on('resize', function () {
            let activity_space_width = $(this).width();
            if (activity_space_width < 300) {
                console.log('flipped');
                $('.join_room_input').css('flex-direction', 'column');
                $('join_inputtext').css('width', '10px !important');
                $('.joinbutton').css('margin-top', '5px');
            }
            else {
                $('.join_room_input').css('flex-direction', 'row');
                $('.joinbutton').css('margin-top', '0px');
            }
        })


        // document.getElementsByClassName('.code')[0].addEventListener('click', function () {
        //     console.log("scrolled");
        // })

    }, []);

    return (
        <div className="live">
            {/* MODAL */}
            <Modal show={show}>
                <Modal.Header>
                    <Modal.Title> Create a new JoinCode </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="newinstance">
                        <h5>Give it a unique name</h5>
                        <input
                            className="text_input"
                            type="text"
                            placeholder="eg. mypersonal-12"
                            value={newroom}
                            onChange={(e) => {
                                handleChange(e);
                            }}
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={createActivity}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="live_body">
                <div className="activity_space">
                    <h3 className="activity_header"> Activity </h3>
                    <div className='activity_inner'>
                        <div className="createactivitybutton">
                            <button
                                className="btn btn-info button"
                                onClick={handleShow}
                                style={{
                                    width: "100%",
                                    margin: "0px",
                                }}
                            >
                                Create a New JoinCode
                        </button>
                            <div className="join_room_input">
                                <input
                                    type="text"
                                    value={joinroom}
                                    placeholder='Enter a room'
                                    onChange={(e) => {
                                        setjoinroom(e.target.value);
                                    }}
                                    className='join_inputtext'
                                />
                                <button
                                    className="btn btn-success button joinbutton"
                                    onClick={enterJoin}>
                                    Join
                                </button>
                            </div>
                        </div>
                        <div className="activity">
                            <h4 className="flave_title"> Active JoinCode </h4>
                            {activeroom ? (
                                <h4 className='active_joincode'>
                                    {activeroom}
                                </h4>
                            ) : (
                                    ""
                                )}
                            <ul className="user_lists">
                                <h4 className="flave_title"> Developers </h4>
                                {
                                    Object.keys(contributors).map((user) => {
                                        return (
                                            <li key={fakekey++}>
                                                {(contributors && (contributors[user].status == 'online')) ?
                                                    (<div className='online_mark'></div>)
                                                    :
                                                    (<div className='offline_mark'></div>)
                                                }
                                                <h5>
                                                    {user}
                                                    {user == initiator ? "(Lead)" : ""}
                                                </h5>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={"code_space " + (codeactive === "on" ? "objectactive" : "objectpassive")}>
                    <div className="live_header">
                        <div className="live_header_logo">
                            <Joincode size={18} />
                        </div>

                        <button
                            className="btn btn-danger button margin_around"
                            onClick={logOut}
                        >
                            Leave
                        </button>
                    </div>
                    <div className='codeinteracts'>
                        <button
                            className="btn btn-success button margin_around"
                            onClick={runCode}>
                            Run
                        </button>

                        <button
                            className="btn btn-info button margin_around"
                            onClick={() => { setCode(jsbeautify(code)) }}>
                            Pretify Code
                        </button>

                        <button
                            className="btn btn-secondary button margin_around"
                            style={{
                                float: 'right',
                                marginRight: "10px",
                                clear: 'right',
                            }}
                            onClick={loadSavedCode}>
                            Load Last Saved
                        </button>

                        <button
                            className="btn btn-primary button margin_around"
                            style={{
                                float: 'right',
                                marginRight: "10px"
                            }}
                            onClick={saveCode}>
                            Save
                        </button>
                    </div>

                    <h5 className='lead joincode_header'> {activeroom} </h5>

                    {/* <textarea className='code'
                        value={code}
                        onChange={(e,) => { updateCode(e) }}>
                    </textarea> */}

                    <ControlledEditor
                        className='code'
                        language="javascript"
                        options={{
                            minimap: {
                                enabled: false,
                            },
                            fontSize: '16pt',
                            folding: false,
                            scrollbar: {
                                horizontal: 'hidden',
                                vertical: 'hidden',
                            },
                            hover: {
                                enabled: false
                            },
                            lineDecorationsWidth: '20',
                            lineNumbers: "on",
                            mouseWheelZoom: true,
                            renderIndentGuides: false,
                            wordWrap: 'on',
                        }}
                        value={code}
                        onChange={(e, value) => { updateCode(e, value) }}

                    />

                </div>
            </div >
        </div >
    );
}

export default Live;
