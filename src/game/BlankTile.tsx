import React, { useRef } from 'react';
import { useStyles } from '../styles';
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
    let style;
    if (addTileFlag) {
        style = styles.tile;
    } else if (id < 0) {
        style = styles.blankTileScore;
    } else {
        style = styles.blankTile;
    }

    const [, drop] = useDrop({
        accept: 'ExtraTile',
        drop(item: any) {
            if (!ref.current) {
                return;
            }

            const hoverRow = row;
            const hoverCol = col;

            const extraTileIndex = item.id;
            const blankTileIndex = id;

            moveTile({
                blankTileIndex,
                extraTileIndex,
                hoverRow, 
                hoverCol
            });

            item.id = id;
        }
    });

    drop(ref);

    return (
        <div 
            className={style} 
            style={{ width: width, height: height }}
            ref={ref}
        ></div>
    );
}

export default BlankTile;