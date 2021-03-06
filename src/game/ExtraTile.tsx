import React, { useRef } from 'react';
import { useStyles } from '../styles';
import { useDrag } from 'react-dnd';
import Letter from './Letter';

function ExtraTile({ 
    id,
    tileId, 
    letters, 
    width, 
    height,
    disabled,
    canDrag,
    placeToken
}) {
    const ref = useRef(null);
    const styles = useStyles();
    const style = tileId < 0 ? styles.extraTile : styles.tile;

    const [, drag] = useDrag({
        item: { 
            id: id, 
            type: 'ExtraTile'
        },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        }),
        canDrag: () => {
            return canDrag;
        }
    });

    drag(ref);

    return (
        <div 
            className={style} 
            style={{ width: width, height: height }}
            ref={ref}
        >
            {letters.map((letter, index: number) => {
                return <Letter 
                    id={tileId*4+index}
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