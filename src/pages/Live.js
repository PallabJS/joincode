import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { socket } from "../components/socket";

import Joincode from "../components/Joincode";
import jsbeautify from 'js-beautify';

import "../css/live.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Brightness1 from "@material-ui/icons/Brightness1";

import { db, auth } from "../components/firebase";

function Live() {
    const history = useHistory();

    // Errors
    const [error, setError] = useState("code...");
    const [initiator, setinitiator] = useState();
    const [contributors, setcontributors] = useState([]);

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
    var [code, setCode] = useState("");
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
    function updateCode(e) {
        setCode(e.target.value);
        socket.emit("codeupdate", {
            room: activeroom,
            code: e.target.value,
        });
        if (activeroom) {
            db.ref("/joins/" + activeroom + "/code/").set({
                code: e.target.value,
            });
        }
    }

    // UPDATE USERS LIST
    function updateUsers() {
        console.log("Updating users");
        db.ref("/joins/" + activeroom + "/initiator/").once("value", (snap) => {
            if (snap.val()) {
                setinitiator(snap.val());
            }
        });
        db.ref("/joins/" + activeroom + "/contributors/").once(
            "value",
            (snap) => {
                if (snap.val()) {
                    setcontributors(Object.keys(snap.val()));
                }
            }
        );
    }

    // LOG OUT
    const logOut = () => {
        auth.signOut();
        localStorage.clear();
        history.push("/");
    };

    // RUN CODE
    const runCode = () => {
        console.log("--- Evaluating ---");
        try {
            eval(code);
        }
        catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        setUserref(localStorage.getItem("userref"));
        console.log("Refreshed");

        // INITIALIZE PREVIOUS SESSION
        var active = localStorage.getItem("codeactive");
        var room = localStorage.getItem("activeroom");
        // Load the session and live coding
        setCodeactive(active);
        setactiveroom(room);

        if (activeroom) {
            // USERS UPDATE
            updateUsers();

            socket.emit("refresh-catchup", {
                user: localStorage.getItem("userref"),
                room: localStorage.getItem("activeroom"),
                status: localStorage.getItem("status"),
            });

            // load code from database
            db.ref("/joins/" + activeroom + "/code/").once("value", (snap) => {
                setCode(snap.val().code);
            });

            // UPDATE USERS COLLABORATIONS
            db.ref("/joins/" + activeroom + "/contributors/").on(
                "child_added",
                (snap) => {
                    var u_temp = contributors;
                    u_temp.push(snap.val());
                    setcontributors(u_temp);
                }
            );
            // UPDATE USERS COLLABORATIONS
            db.ref("/joins/" + activeroom + "/contributors/").on(
                "child_removed",
                (snap) => {
                    var u_temp = [];
                    u_temp = contributors.filter((item) => {
                        return snap.val() !== item;
                    });
                    setcontributors(u_temp);
                }
            );
        }
    }, [activeroom]);

    // RUN ONCE ON MOUNTING
    useEffect(() => {
        // HANDLE JOIN REQUEST
        socket.on("requestaccess", (data) => {
            console.log("requestaccess");
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

        // CODE BEAUTIFIER ON enter key
        document.getElementById('code').addEventListener('keyup', (e) => {
            var code_element = document.getElementById('code');
            setCode(code_element.value);
            if (e.shiftKey && e.key == "Alt") {
                setCode(jsbeautify(code_element.value));
            }
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
                                style={{
                                    margin: "5px",
                                    borderRadius: "10px",
                                    fontSize: "var(--small)",
                                    padding: "5px",
                                    width: "100%",
                                    flex: 3,
                                    border: "none",
                                    outline: "none",
                                }}
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
                            <li>{initiator ? initiator + " (Lead)" : ""}</li>
                            {contributors.map((user) => {
                                return <li> {user} </li>;
                            })}
                        </ul>
                    </div>
                </div>
                <div className="code_space">
                    <div className="live_header">
                        <div className="live_header_logo">
                            <Joincode size={25} />
                        </div>

                        <button
                            className="btn btn-danger button"
                            onClick={logOut}
                        >
                            Leave
                        </button>
                    </div>
                    <div>
                        <button
                            className="btn btn-success button"
                            onClick={runCode}
                        >
                            Run
                        </button>
                    </div>
                    <div className="codearea">
                        {/* <div className='linecount'>
							{lines.map((item) => {
								return (
									<div> {item} </div>
								)
							})}
						</div> */}
                        <textarea
                            id="code"
                            className={
                                "code " +
                                (codeactive === "on"
                                    ? "objectactive"
                                    : "objectpassive")
                            }
                            value={code}
                            onChange={(e) => {
                                updateCode(e);
                            }}
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Live;
