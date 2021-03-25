import React from 'react';
import { Link } from 'react-router-dom';
import { useStyles } from './styles';

function NotFound() {
    const styles = useStyles();

    return (
        <div className={styles.notFoundPage}>
            <div className={styles.notFoundMessage}>
                <h3>{'Page not found!'}</h3>
                <Link to='/'>
                    {'Home'}
                </Link>
            </div>
        </div>
    );
}

export default NotFound;