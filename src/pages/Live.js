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

import { db, auth } from "../components/firebase";

function Live() {
    const history = useHistory();

    // Errors
    const [error, setError] = useState("code...");
    const [initiator, setinitiator] = useState();
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

    // UPDATE CODE comes from <code>
    function updateCode(e) {
        setCode(e.target.value);

        // ALL DYNAMIC DB UPDATES HAPPENS here
        socket.emit("codeupdate", activeroom);
        if (activeroom) {
            db.ref("/joins/" + activeroom + "/code/code").set(e.target.value).catch(error => {
                console.log(error.message);
            })
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

    // LOAD CODE
    const loadCodeOnce = () => {
        console.log("code loading...");
        db.ref("/joins/" + activeroom + "/code/code/").once("value", (snap) => {
            if (snap.val()) {
                setCode(snap.val());
            }
        });
    }

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

    useEffect(() => {
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
    useEffect(() => {

        // CLEAR CONSOLE ON LOAD
        setTimeout(() => {
            console.clear();
            console.log("Welcome to JoinCode");
        }, 500);

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
        });

        // HANDLE NOSUCHROOM
        socket.on("nosuchroom", () => {
            alert("Room does not exist, Create one instead!");
        });

        // CODE UPDATE
        socket.on("codeupdate", (code) => {
            setCode(code);
        });

        // UPDATE ONLINE USERS
        socket.on('onlineuserschangenotify', () => {
            var activeroom = localStorage.getItem('activeroom');
            setTimeout(() => {
                db.ref('/joins/' + activeroom + '/contributors/').once('value', (snap) => {
                    setcontributors(snap.val());
                })
            }, 3000);
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
        console.log('refreshing now');

        $(document).ready(() => {
            loadCodeOnce();
        })
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
                                    onChange={(e) => {
                                        setjoinroom(e.target.value);
                                    }}
                                    className='join_inputtext'
                                />
                                <button
                                    className="btn btn-success button"
                                    onClick={enterJoin}
                                    style={{
                                        fontSize: "12pt",
                                        margin: "5px",
                                        width: "100%",
                                        padding: "5px",
                                        flex: 1,
                                        border: "2px solid rgb(100,100,100)",
                                    }}
                                >
                                    Join
                            </button>
                            </div>
                        </div>
                        <div className="activity">
                            <h4 className="flave_title"> Active JoinCode </h4>
                            {activeroom ? (
                                <h4
                                    style={{
                                        marginBottom: "10px",
                                        backgroundColor: "green",
                                        color: "white",
                                        padding: "5px",
                                        margin: "0 10px",
                                        borderRadius: "10px",
                                        textAlign: "center",
                                    }}
                                >
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
                                                <h5>
                                                    {user}
                                                    {user == initiator ? "(Lead)" : ""}
                                                </h5>
                                                {(contributors && (contributors[user].status == 'online')) ?
                                                    (<div className='online_mark'></div>)
                                                    :
                                                    ("")
                                                }
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
                            className="btn btn-danger button"
                            onClick={logOut}
                        >
                            Leave
                        </button>
                    </div>
                    <div className='codeinteracts'>
                        <button
                            className="btn btn-success button"
                            onClick={runCode}>
                            Run
                        </button>

                        <button
                            className="btn btn-info button"
                            onClick={() => { setCode(jsbeautify(code)) }}>
                            Prettify Code
                        </button>

                        <button
                            className="btn btn-info button"
                            style={{
                                float: 'right',
                                marginRight: "10px",
                                clear: 'right',
                            }}
                            onClick={loadSavedCode}>
                            Load Last Saved
                        </button>

                        <button
                            className="btn btn-primary button"
                            style={{
                                float: 'right',
                                marginRight: "10px"
                            }}
                            onClick={saveCode}>
                            Save
                        </button>
                    </div>

                    <h5 className='lead joincode_header'> {activeroom} </h5>

                    <textarea className='code'
                        value={code}
                        onChange={(e) => { updateCode(e) }}>
                    </textarea>

                </div>
            </div >
        </div >
    );
}

// HTML TO DATABASE READY
function htmlToString(streamclass) {
    let finalcode = "";
    let codeblocks = document.getElementsByClassName(streamclass);
    for (let i = 0; i < codeblocks.length; i++) {
        finalcode = finalcode + " " + codeblocks[i].innerText;
    }
    return finalcode;
}



export default Live;
