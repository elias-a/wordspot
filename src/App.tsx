import React, { useState } from 'react';
import { 
  BrowserRouter, 
  Switch, 
  Route
} from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import { AuthContext } from './context';
import { theme } from './theme';
import PrivateRoute from './PrivateRoute';
import Login from './auth/Login';
import Game from './game/Game';
import Dashboard from './Dashboard';
import NotFound from './NotFound';
import { BASE_PATH } from '../config.js';

function App() {
    const existingToken = localStorage.getItem('token');
    const [authToken, setAuthToken] = useState(existingToken);

    const setToken = (token: string) => {
      localStorage.setItem('token', token);
      setAuthToken(token);
    };

    return (
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={{ authToken, setAuthToken: setToken }}>
          <BrowserRouter basename={`${BASE_PATH}`}>
            <Switch>
              <Route exact path='/login' component={Login} />
              <PrivateRoute exact path='/dashboard' component={Dashboard} />
              <PrivateRoute exact path='/game/:id' component={Game} />
              <PrivateRoute exact path='/' component={Dashboard} />
              <PrivateRoute exact path='/404' component={NotFound} />
              <PrivateRoute component={NotFound} />
            </Switch>
          </BrowserRouter>
        </AuthContext.Provider>
      </ThemeProvider>
    );
}

export default App;