import React, { useRef } from 'react';
import { useStyles } from './styles';
import { Button } from '@material-ui/core';
import { useDrag } from 'react-dnd';

function ExtraTile({ id, letters }) {
    const extraLetters = letters.map(letter => letter.letter);
    const ref = useRef(null);
    const styles = useStyles();

    const [{ isDragging }, drag] = useDrag({
        item: { 
            id: id, 
            type: 'ExtraTile',
            letters: extraLetters
        },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    drag(ref);

    return (
        <div className={styles.extraTile} ref={ref}>
            {letters.map((letter, index) => 
                <Button className={styles.letter} disabled>
                    {letter.letter}
                </Button>
            )}
        </div>
    );
}

export default ExtraTile;