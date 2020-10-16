import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import {
    Grid,
    Box,
    TextField,
    Button,
    Typography
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useAuth } from '../context';
import { useStyles } from '../styles';

const INITIAL_USER = {
    username: '',
    password: ''
};

function Login() {
    const [user, setUser] = useState(INITIAL_USER);
    const [loggedIn, setLoggedIn] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState("");
    const { setAuthToken } = useAuth();
    const styles = useStyles();

    useEffect(() => {
        Object.values(user).every(param => param !== '') ?
            setDisabled(false) : setDisabled(true);
    }, [user]);

    const handleChange = (event: any) => {
        const { id, value } = event.target;
        setUser(prevState => ({ ...prevState, [id]: value }));
    }

    const handleSubmit = () => {
        axios.post('/api/login', user).then(res => {
            if (res.data.status) {
                setAuthToken(res.data.token);
                setLoggedIn(true);
                localStorage.setItem('player', res.data.player);
                setError("");
            } else {
                localStorage.setItem('token', '');
                localStorage.setItem('player', '');
                setError(res.data.error);
                setLoggedIn(false);
            }
        });
    }

    if (loggedIn) {
        return <Redirect to="/" />;
    }

    return (
        <Grid className={styles.container}>
            <Box className={styles.login}>
                <Typography variant="h3" className={styles.header}>
                    {"Wordspot"}
                </Typography>
                {error ? <Alert severity="error">{error}</Alert> : <></>}
                <div className={styles.input}>
                    <TextField 
                        id="username" 
                        label="Username" 
                        value={user.username}
                        variant="outlined" 
                        required
                        fullWidth
                        onChange={handleChange}
                        inputProps={{
                            autoComplete: 'off'
                        }}
                    />
                </div>
                <div className={styles.input}>
                    <TextField 
                        id="password" 
                        type="password"
                        label="Password" 
                        value={user.password}
                        variant="outlined" 
                        required
                        fullWidth
                        onChange={handleChange}
                        inputProps={{
                            autoComplete: 'off'
                        }}
                    />
                </div>
                <Button
                    className={styles.submit}
                    disabled={disabled}
                    onClick={handleSubmit}
                >
                    {"Login"}
                </Button>
            </Box>
        </Grid>
    );
}

export default Login;