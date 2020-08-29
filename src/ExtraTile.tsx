import React, { useRef } from 'react';
import { useStyles } from './styles';
import { useDrag } from 'react-dnd';
import Letter from './Letter';

function ExtraTile({ 
    id, 
    letters, 
    width, 
    height,
    disabled,
    placeToken
}) {
    const extraLetters = letters.map(letter => letter.letter);
    const ref = useRef(null);
    const styles = useStyles();

    const [, drag] = useDrag({
        item: { 
            id: id, 
            type: 'ExtraTile'
        },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    drag(ref);

    return (
        <div 
            className={styles.tile} 
            style={{ width: width, height: height }} 
            ref={ref}
        >
            {letters.map((letter, index: number) => {
                return <Letter 
                    id={id*4+index+1}
                    letter={letter}
                    placeToken={placeToken}
                    disabled={disabled}
                />;
            }
            )}
        </div>
    );
}

export default ExtraTile;