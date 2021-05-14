import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { socket } from "../settings/socket/socket";

import firebase from "firebase";

import Joincode from "../components/Joincode";
import jsbeautify from "js-beautify";

import { ControlledEditor } from "@monaco-editor/react";

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

import { db, auth } from "../settings/firebase/firebase";

function Live() {
    const history = useHistory();

    // USERS LIVE
    const [initiator, setinitiator] = useState("");
    const [contributors, setcontributors] = useState({});

    // USER DETAIL
    const [username, setusername] = useState("");

    // CREATE INSTANCE MODAL
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [newroom, setnewroom] = useState("");
    const [activeroom, setactiveroom] = useState("");

    // JOIN A JoinCode
    const [joinroom, setjoinroom] = useState("");

    // Code State
    const [code, setCode] = useState("");
    const [codeactive, setCodeactive] = useState("off");

    // CREATE A NEW JOINCODE
    function createJoincode() {
        // check if room already exist
        db.ref("/joins/" + newroom).once("value", (snap) => {
            if (!snap.val()) {
                // Create a room
                db.ref("/joins/" + newroom)
                    .set({
                        initiator: localStorage.getItem("username"),
                        code: "//Start writing you codes here",
                    })
                    .then(() => {
                        handleClose();
                        enterJoin();
                    });
            } else {
                alert("Room already exists");
            }
        });
    }

    // ENTER A JOINCODE
    function enterJoin() {
        var data = {
            userid: localStorage.getItem("uid"),
            room: joinroom,
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
            $("#savebutton").animate(
                {
                    backgroundColor: "rgb(20, 130, 239)",
                },
                100
            );
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
            db.ref("/joins/" + activeroom + "/contributors/" + username)
                .child("status")
                .set("offline");
            localStorage.removeItem("uid");
            localStorage.removeItem("username");
            localStorage.removeItem("email");
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

    //////////////////////////////      ACTIVE ROOM USEEFFECT     ///////////////////////////////////
    useEffect(
        function () {
            setusername(localStorage.getItem("username"));

            // INITIALIZE PREVIOUS SESSION
            let active = localStorage.getItem("codeactive");
            let room = localStorage.getItem("activeroom");

            // Load the session and live coding
            setCodeactive(active);
            setactiveroom(room);

            if (activeroom) {
                // USERS UPDATE
                updateUsers();

                // Keep joined on refresh
                socket.emit("refresh-catchup", {
                    userid: localStorage.getItem("uid"),
                    username: localStorage.getItem("username"),
                    room: localStorage.getItem("activeroom"),
                    status: localStorage.getItem("status"),
                });

                // Synchronize code with the database
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

                // Online status
                db.ref("/joins/" + activeroom + "/contributors/" + localStorage.getItem("username"))
                    .child("status")
                    .set("online");
            }

            return function () {
                db.ref("/joins/" + activeroom + "/code/")
                    .child("code")
                    .off();
            };
        },
        [activeroom]
    );

    let fakekey = 0;

    // RUN ONCE ON MOUNT
    useEffect(function () {
        // localstorage error
        if (localStorage.getItem("uid") == false) {
            logOut();
        }
        // // Check user state
        // firebase.auth().onAuthStateChanged(user => {
        //     if (!user) {
        //         document.body.innerHTML = `
        //         <div style="width: fit-content; min-height: 200px; padding: 20px; margin: 50px auto; border-radius: 5px; border: 2px solid var(--bg)">

        //                     <div style= "font-size: 20pt;
        //                     padding: 0px 10px;
        //                     border-radius: 2px;
        //                     color: black;
        //                     background-color: rgb(200, 200, 200);
        //                     width: 100%;
        //                     text-align: center;
        //                     ">
        //             <code
        //                 style= "color: yellow;
        //                         font-size: 25pt;
        //                         font-weight: 1000;
        //                         font-family: 'Cursive';"
        //             >J</code>oin<code
        //                 style= "color: blue;
        //                         font-size: 25pt;
        //                         font-weight: 1000;
        //                         font-family: 'Cursive';"
        //             >C</code>ode
        //         </div>

        //             <h1 style="padding: 5px; text-align: center; background-color: "var(--black); color: var(--white) "> Redirecting to Homepage </h1>
        //             <p style="text-align: center; font-size: var(--font_normal)"> Login to use Join Code. Thanks for being a JoinCoder!  </p>
        //         </div>`

        //         setTimeout(() => {
        //             history.push('/');
        //             window.location.reload();
        //         }, 1);
        //     }
        // })

        // CLEAR CONSOLE ON LOAD
        setTimeout(() => {
            console.clear();
            console.log("Welcome to JoinCode");
        }, 500);

        // HANDLE JOIN REQUEST
        socket.on("requestaccess", (data) => {
            db.ref("/joins/" + data.room).once("value", (snap) => {
                if (snap.val().initiator === localStorage.getItem("username")) {
                    let access = window.confirm(data.username + " wants to collaborate to " + data.room);
                    data.access = access;
                    socket.emit("requestaccess-response", data);
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
                    <Button variant="primary" onClick={createJoincode}>
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
                                <button className="btn btn-success button joinbutton" onClick={enterJoin}>
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
