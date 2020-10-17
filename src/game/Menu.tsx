import React from 'react';
import { Button } from '@material-ui/core';
import { useAuth } from '../context';
import { useStyles } from '../styles';

function Menu() {
    const { setAuthToken } = useAuth();
    const styles = useStyles();

    const logout = () => {
        localStorage.setItem('token', '');
        localStorage.setItem('player', '');
        setAuthToken('');
    };

    return (
        <div className={styles.navBar}>
            <p
                className={styles.logo}
            >
                Wordspot
            </p>
            <Button 
                className={styles.logout}
                onClick={logout}
            >
                Logout
            </Button>
        </div>
    );
}

export default Menu;