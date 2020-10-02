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
    const existingTokens = localStorage.getItem('token');
    const [authTokens, setAuthTokens] = useState(existingTokens);

    const setTokens = (token: string) => {
      localStorage.setItem('token', token);
      setAuthTokens(token);
    };

    return (
      <AuthContext.Provider value={{ authTokens, setAuthTokens: setTokens }}>
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