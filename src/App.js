// React Core Components
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, useHistory } from "react-router-dom";

// FIREBASE STUFFS
// Firebase functions
import { auth, db } from "./settings/firebase/firebase";

// APP COMPONENTS
import Home from "./pages/Home";
import Live from "./pages/Live";

import "./App.css";
import "./css/flave.css";

function App() {
    const history = useHistory();
    const [userAgent, setUserAgent] = useState(window.navigator.userAgent);

    window.addEventListener("load", () => {
        setUserAgent(window.navigator.userAgent);
        checkDevice();
    });

    function checkDevice() {
        // CHECK MEDIA
        if (/(Android)+|(iPhone)+/g.test(userAgent)) {
            console.log("android");
            let notSupportedMessage = document.createElement("h6");
            notSupportedMessage.innerHTML = "Your device is not supported. Please switch to desktop";
            notSupportedMessage.style.marginTop = "45vh";
            notSupportedMessage.style.textAlign = "center";

            document.body.innerHTML = "";
            document.body.appendChild(notSupportedMessage);
            window.stop();
        }
    }

    useEffect(() => {
        checkDevice();
    }, [userAgent]);

    return (
        <div className="App">
            <Router>
                <Switch>
                    <Route path="/live">
                        {" "}
                        <Live auth={auth} db={db} />{" "}
                    </Route>
                    <Route exact path="/">
                        {" "}
                        <Home auth={auth} db={db} />{" "}
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
