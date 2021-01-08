import React from 'react';
import { Button } from '@material-ui/core';
import { useAuth } from './context';
import { useStyles } from './styles';
import logo from './assets/wordspot-logo.png';

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
            <a href="/">
                <img 
                    src={logo} 
                    alt="Wordspot" 
                    style={{
                        marginLeft: '1vw',
                        height: '15vh'
                    }}
                />
            </a>
            
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