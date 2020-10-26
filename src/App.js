// React Core Components
import React from 'react';
import { BrowserRouter as Router, Switch, Route, useHistory } from 'react-router-dom';

// External Libraries
// import socketClient from 'socket.io-client';

// APP COMPONENTS
import Home from './pages/Home';
import Live from './pages/Live';

import './App.css';
import './css/flave.css';

function App() {

  const host = "http://localhost:8000";
  const history = useHistory();

  // useEffect(() => {
  //   const socket = socketClient(host);

  //   // CLEAN UP THE EFFECT on Context Change
  //   return () => socket.disconnect();
  // }, [])


  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path='/live'> <Live /> </Route>
          <Route exact path='/'> <Home /> </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
