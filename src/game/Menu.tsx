import React from 'react';
import { useAuth } from '../context';
import { useStyles } from '../styles';

function Menu() {
    const { setAuthToken } = useAuth();
    const styles = useStyles();

    const logout = () => {
        localStorage.setItem('token', '');
        setAuthToken('');
    };

    return (
        <div className={styles.navBar}>
            <p
                className={styles.logo}
            >
                Wordspot
            </p>
            <button 
                className={styles.logout}
                onClick={logout}
            >
                Logout
            </button>
        </div>
    );
}

export default Menu;