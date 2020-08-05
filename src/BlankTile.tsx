import React, { createRef, RefObject } from 'react';
import { useStyles } from './styles';
import { useDrag, useDrop } from 'react-dnd';

function BlankTile({ id, addTileFlag, width, height }) {
    const ref = createRef();
    const styles = useStyles();

    const [, connectDrag] = useDrag({
        item: { id, type: 'BlankTile' }
    });
    const [, connectDrop] = useDrop({
        accept: 'BlankTile'
    });

    connectDrag(ref);
    connectDrop(ref);

    return (
        <div 
            className={addTileFlag ? styles.tile : styles.blankTile } 
            style={{ width: width, height: height }}
            ref={ref as RefObject<HTMLDivElement>}
        ></div>
    );
}

export default BlankTile;