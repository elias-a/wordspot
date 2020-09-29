import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './auth/Login';
import Game from './game/Game';

function App() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path='/login'>
            <Login />
          </Route>
          <Route path='/'>
            <Game />
          </Route>
        </Switch>
      </BrowserRouter>
    );
}

export default App;