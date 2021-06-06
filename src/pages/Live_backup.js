import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { socket } from "../settings/socket/socket";

// Firebase
import firebase from "firebase";
import { db, auth } from "../settings/firebase/firebase";

// App
import Joincode from "../components/Joincode";
import jsbeautify from "js-beautify";

// db api
import { connectionApi } from "../api/connection/connectionapi";

// UI Libraries
import { ControlledEditor } from "@monaco-editor/react";

// Customs
import "../css/live.css";
import "../css/brand.css";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import $ from "jquery";
import "jquery-ui/ui/core";
import "jquery-ui/ui/effect";
import "jquery-ui/ui/widgets/resizable";
import "../css/resizable.css";
import "jquery-ui/ui/widgets/mouse.js";

// Functions
import { decodeAuth } from "../functions/authfunctions";

function Live() {
    const history = useHistory();

    // USERS LIVE
    const [initiator, setinitiator] = useState("");
    const [contributors, setcontributors] = useState({});

    // USER DETAIL
    const [user, setUser] = useState({
        uid: "",
        username: "",
        email: "",
    });

    // CREATE INSTANCE MODAL
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [newroom, setnewroom] = useState("");
    const [activeroom, setActiveroom] = useState("");

    // JOIN A JoinCode
    const [joinroom, setjoinroom] = useState("");

    // Code State
    const [code, setCode] = useState("");
    const [codeactive, setCodeactive] = useState(false);

    // CREATE JOINCODE HANDLER
    function handleCreateJoincode() {
        connectionApi.createJoincode(newroom, user.username).then((res) => {
            if (res.success) {
                handleClose();
                handleJoin();
            } else {
                alert(`could not create joincode - '${newroom}'`);
            }
        });
    }

    // ENTER A JOINCODE
    function handleJoin() {
        var data = {
            userId: user.uid,
            room: joinroom,
            userName: user.username,
        };
        socket.emit("joinroom", data);

        setnewroom("");
        setjoinroom("");
    }

    // UPDATE CODE
    function updateCode(e, value) {
        setCode(value);

        // ALL DYNAMIC DB UPDATES HAPPENS HERE
        console.log("updating code for : ", activeroom);
        db.ref("/joins/" + activeroom + "/code/code")
            .set(value)
            .catch((error) => {
                console.log("Server error please reresh the page");
            });
    }

    // SAVE THE CODE
    function saveCode() {
        db.ref("/joins/" + activeroom + "/code/")
            .child("save")
            .set(code, () => {
                indicateSave();
            });
    }

    // Save indication
    function indicateSave() {
        setTimeout(() => {
            $("#savebutton").animate(
                {
                    backgroundColor: "rgb(20, 230, 20)",
                },
                100
            );
        }, 0);
        setTimeout(() => {
            $("#savebutton").animate({
                    backgroundColor: "rgb(20, 130, 239)",
                }, 100);
            }, 300);
    }

    // LOAD LAST SAVED CODE
    function loadSavedCode() {
        db.ref("/joins/" + activeroom + "/code/")
            .child("save")
            .once("value", (code) => {
                setCode(code.val());
            });
    }

    // UPDATE USERS LIST
    function updateUsers() {
        db.ref("/joins/" + activeroom + "/initiator/").once("value", (snap) => {
            if (snap.val()) {
                setinitiator(snap.val());
            }
        });
        db.ref("/joins/" + activeroom + "/contributors/").once("value", (snap) => {
            if (snap.val()) {
                setcontributors(snap.val());
            }
        });
    }

    // LOG OUT
    const logOut = () => {
        console.log("room: ", activeroom);
        auth.signOut().then(() => {
            db.ref("/joins/" + activeroom + "/contributors/" + user.username)
                .child("status")
                .set("offline");
            localStorage.clear();
            history.push("/");
        });
    };

    // RUN CODE
    const runCode = () => {
        console.clear();
        console.log("Evaluating");
        try {
            eval(code);
        } catch (e) {
            console.log(e);
        }
    };

    // Maintain the activity_space content on resize
    function toggleInputOrient(checkWidth) {
        if (checkWidth < 300) {
            $(".join_room_input").css("flex-direction", "column");
            $("join_inputtext").css("width", "10px !important");
            $(".joinbutton").css("margin-top", "5px");
        } else {
            $(".join_room_input").css("flex-direction", "row");
            $(".joinbutton").css("margin-top", "0px");
        }
    }

    // SET LOGGED IN USER
    useEffect(() => {
        let user = decodeAuth(localStorage.getItem("user"));
        console.log(user)
        db.ref("users")
            .child(user.uid)
            .once("value", (snap) => {
                setUser({ ...user, username: snap.val().username });
            });
    }, []);

    useEffect(() => {
        // INITIALIZE PREVIOUS SESSION
        let active = localStorage.getItem("codeactive");
        let room = localStorage.getItem("activeroom");

        // If previously active was true and activeroom was set, then restore session
        if (room && active) {
            // Load the session and live coding
            setCodeactive(active);
            setActiveroom(room);
        }
    });

    // When user gets into a room
    useEffect(() => {
        if (activeroom && codeactive) {
            // SET ROOM INITIATOR AND CONTRIBUTORS
            updateUsers();

            // Keep joined on refresh
            socket.emit("refresh-catchup", {
                userid: user.uid,
                username: user.username,
                room: activeroom,
                status: localStorage.getItem("status"),
            });

            // Synchronize code from the database
            db.ref("/joins/" + activeroom + "/code/code").on("value", (snap) => {
                if (snap.val()) {
                    setCode(snap.val());
                }
            });

            // UPDATE USERS ON ANY CHANGE
            db.ref("/joins/" + activeroom + "/contributors/").on("value", (snap) => {
                updateUsers();
            });

            // UPDATE USERS COLLABORATIONS ON NEW JOIN
            db.ref("/joins/" + activeroom + "/contributors/").on("child_added", (snap) => {
                setcontributors(snap.val());
            });
            // UPDATE USERS COLLABORATIONS ON LEAVE
            db.ref("/joins/" + activeroom + "/contributors/").on("child_removed", (snap) => {
                if (snap.val()) {
                    setCode(snap.val());
                }
            });

            // Update Online status of contributors
            db.ref("/joins/" + activeroom + "/contributors/").on("value", (snap) => {
                if (snap.val()) {
                    setcontributors(snap.val());
                }
            });

            // load code from database
            db.ref("/joins/" + activeroom + "/code/code/").once("value", (snap) => {
                if (snap.val()) {
                    setCode(snap.val());
                }
            });

            // // Online status
            // db.ref("/joins/" + activeroom + "/contributors/" + localStorage.getItem("username"))
            //     .child("status")
            //     .set("online");
        }

        return function () {
            db.ref("/joins/" + activeroom + "/code/")
                .child("code")
                .off();
        };
    }, [activeroom, codeactive]);

    let fakekey = 0;

    // RUN ONCE ON MOUNT
    useEffect(function () {
        // localstorage error
        if (localStorage.getItem("uid") == false) {
            logOut();
        }

        // CLEAR CONSOLE ON LOAD
        setTimeout(() => {
            // console.clear();
            console.log("Welcome to JoinCode");
        }, 500);

        // HANDLE JOIN REQUEST(only the initiator gets this access)
        socket.on("request_for_initiator_access", (data) => {
            console.log(data);
            db.ref("/joins/" + data.room).once("value", (snap) => {
                if (snap.val().initiator === user.username) {
                    let access = window.confirm(data.username + " wants to collaborate to " + data.room);
                    data.access = access;
                    // socket.emit("requestaccess-response", data);
                }
            });
        });

        // HANDLE REQUEST APPROVED
        socket.on("requestapproved", (data) => {
            localStorage.setItem("codeactive", "on");
            localStorage.setItem("activeroom", data.room);
            localStorage.setItem("status", "joined");
            setActiveroom(data.room);
            setCodeactive(true);
            window.location.reload();
        });

        // HANDLE NOSUCHROOM
        socket.on("nosuchroom", () => {
            alert("Room does not exist, Create one instead!");
        });

        // ACTIVITY SPACE DYNAMICS
        // activity space width
        let as_width = $(".activity_space").outerWidth();

        // resizable active_space
        $(".activity_space").resizable({
            minWidth: 220,
            handles: "e",
            resize: () => {
                as_width = $(".activity_space").outerWidth();
                toggleInputOrient(as_width);
            },
            stop: () => {
                as_width = $(".activity_space").outerWidth();
                toggleInputOrient(as_width);
            },
        });

        $(".activity_header").on("click", () => {
            console.log(window.innerWidth);
            if (window.innerWidth < 900) {
                $(".activity_inner").toggle();
            }
        });

        window.onresize = () => {
            if (window.innerWidth > 900) {
                $(".activity_inner").show();
            }
        };
    }, []);

    // HANDLE SAVE BUTTON ACTION
    useEffect(() => {
        // CTRL+S save
        document.getElementsByClassName("code")[0].addEventListener("keydown", function (e) {
            if (e.ctrlKey && e.key == "s") {
                e.preventDefault();
                saveCode();
            }
        });
        return function () {
            try {
                document.getElementsByClassName("code")[0].removeEventListener("keydown", () => {});
            } catch (e) {}
        };
    }, [code]);

    return (
        <div className="live">
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
                                setnewroom(e.target.value);
                                setjoinroom(e.target.value);
                            }}
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCreateJoincode}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="live_body">
                <div className="activity_space">
                    <h3 className="activity_header"> Activity </h3>
                    <div className="activity_inner">
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
                                    placeholder="Enter a room"
                                    onChange={(e) => {
                                        setjoinroom(e.target.value);
                                    }}
                                    className="join_inputtext"
                                />
                                <button className="btn btn-success button joinbutton" onClick={handleJoin}>
                                    Join
                                </button>
                            </div>
                        </div>
                        <div className="activity">
                            <h4 className="flave_title"> Active JoinCode </h4>
                            {activeroom ? <h4 className="active_joincode">{activeroom}</h4> : ""}
                            <h4 className="flave_title"> Developers </h4>
                            <ul className="user_lists">
                                {Object.keys(contributors).map((user) => {
                                    return (
                                        <li key={fakekey++}>
                                            {contributors && contributors[user].status == "online" ? (
                                                <div className="online_mark"></div>
                                            ) : (
                                                <div className="offline_mark"></div>
                                            )}
                                            <h5>
                                                {contributors ? user : ""}
                                                {user == initiator ? " (Lead)" : ""}
                                            </h5>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={"code_space " + (codeactive === "on" ? "objectactive" : "objectpassive")}>
                    <div className="live_header">
                        <div className="live_header_logo">
                            <Joincode size={18} />
                        </div>

                        <button className="btn btn-danger button margin_around" onClick={logOut}>
                            Leave
                        </button>
                    </div>
                    <div className="codeinteracts">
                        <button className="btn btn-success button margin_around" onClick={runCode}>
                            Run
                        </button>

                        <button
                            className="btn btn-info button margin_around"
                            onClick={() => {
                                setCode(jsbeautify(code));
                            }}
                        >
                            Pretify Code
                        </button>

                        <button
                            id="loadbutton"
                            className="btn btn-secondary button margin_around"
                            style={{
                                float: "right",
                                marginRight: "10px",
                                clear: "right",
                            }}
                            onClick={loadSavedCode}
                        >
                            Load Last Saved
                        </button>

                        <button
                            id="savebutton"
                            className="btn btn-primary button margin_around"
                            style={{
                                float: "right",
                                marginRight: "10px",
                            }}
                            onClick={saveCode}
                        >
                            Save
                        </button>
                    </div>

                    <h5 className="lead joincode_header"> {activeroom} </h5>

                    {/* <textarea className='code'
                        value={code}
                        onChange={(e,) => { updateCode(e) }}>
                    </textarea> */}

                    <ControlledEditor
                        className="code"
                        language="javascript"
                        options={{
                            minimap: {
                                enabled: false,
                            },
                            fontSize: "16pt",
                            folding: false,
                            scrollbar: {
                                horizontal: "hidden",
                                vertical: "hidden",
                            },
                            hover: {
                                enabled: false,
                            },
                            lineDecorationsWidth: "20",
                            lineNumbers: "on",
                            mouseWheelZoom: true,
                            renderIndentGuides: false,
                            wordWrap: "bounded",
                            automaticLayout: true,
                        }}
                        value={code}
                        onChange={(e, value) => {
                            updateCode(e, value);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default Live;
