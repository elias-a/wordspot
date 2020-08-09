import React, { useRef } from 'react';
import { useStyles } from './styles';
import { useDrop } from 'react-dnd';

function BlankTile({ 
    id, 
    row, 
    col, 
    moveTile,
    addTileFlag, 
    width, 
    height
}) {
    const ref = useRef(null);
    const styles = useStyles();

    const [, drop] = useDrop({
        accept: 'ExtraTile',
        hover(item) {
            if (!ref.current) {
                return;
            }

            const hoverRow = row;
            const hoverCol = col;
            if (id === item.id) {
                return;
            }

            const extraLetters = item.letters;
            const extraTile = item.id;

            moveTile({
                extraTile,
                extraLetters,
                hoverRow, 
                hoverCol
            });

            item.id = id;
        }
    });

    drop(ref);

    return (
        <div 
            className={addTileFlag ? styles.tile : styles.blankTile } 
            style={{ width: width, height: height }}
            ref={ref}
        >{"row: "}{row}{", col: "}{col}</div>
    );
}

export default BlankTile;