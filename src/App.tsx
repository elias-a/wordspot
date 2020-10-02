import React, { useState } from 'react';
import { 
  BrowserRouter, 
  Switch, 
  Route
} from 'react-router-dom';
import { AuthContext } from './context';
import PrivateRoute from './PrivateRoute';
import Login from './auth/Login';
import Game from './game/Game';

function App() {
    const existingToken = localStorage.getItem('token');
    const [authToken, setAuthToken] = useState(existingToken);

    const setToken = (token: string) => {
      localStorage.setItem('token', token);
      setAuthToken(token);
    };

    return (
      <AuthContext.Provider value={{ authToken, setAuthToken: setToken }}>
        <BrowserRouter>
          <Switch>
            <Route exact path='/login' component={Login} />
            <PrivateRoute exact path='/' component={Game} />
          </Switch>
        </BrowserRouter>
      </AuthContext.Provider>
    );
}

export default App;