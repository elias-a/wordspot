import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TextField,
    Button
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useStyles } from '../styles';

const INITIAL_USER = {
    username: '',
    password: ''
};

function Login() {
    const [user, setUser] = useState(INITIAL_USER);
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState("");
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
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('player', res.data.player);
                setError("");
            } else {
                setError(res.data.error);
            }
        });
    }

    return (
        <div>
            {error ? <Alert severity="error">{error}</Alert> : <></>}
            <TextField 
                id="username" 
                label="Username" 
                value={user.username}
                variant="outlined" 
                required
                onChange={handleChange}
            />
            <TextField 
                id="password" 
                type="password"
                label="Password" 
                value={user.password}
                variant="outlined" 
                required
                onChange={handleChange}
            />
            <Button
                className={styles.button}
                disabled={disabled}
                onClick={handleSubmit}
            >
                {"Login"}
            </Button>
        </div>
    );
}

export default Login;