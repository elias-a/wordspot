import React, { useState, useEffect } from 'react';
import Score from './Score';
import Turn from './Turn';
import { useStyles } from './styles';
import { Container } from '@material-ui/core';

function ScoreBoard() {
    const styles = useStyles();

    return (
        <Container className={styles.container}>
            <Score />
            <Turn />
        </Container>
    );
}

export default ScoreBoard;