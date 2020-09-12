import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
    game: {
        width: '800px',
        height: '800px'
    },
    board: {
        width: '100%',
        height: '100%'
    },
    tile: {
        display: 'inline-block',
        verticalAlign: 'top',
        border: '1px solid #000'
    },
    blankTile: {
        display: 'inline-block',
        verticalAlign: 'top',
        border: '1px solid #fff'
    },
    emptyTile: {
        display: 'inline-block',
        verticalAlign: 'top',
        border: '1px solid #fff'
    },
    letter: {
        display: 'inline-block',
        padding: 0,
        margin: 0
    },
    letterClicked: {
        display: 'inline-block',
        background: 'linear-gradient(45deg, #d8e5ff 30%, #ccddff 90%)'
    },
    letterSelected: {
        display: 'inline-block',
        background: 'linear-gradient(45deg, #80aaff 30%, #4d88ff 90%)'
    },
    turn: {
        textAlign: 'center'
    },
    button: {
        background: 'linear-gradient(45deg, #80aaff 30%, #4d88ff 90%)',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, 0.3)',
        color: '#fff',
        height: 48, 
        width: '100%',
        padding: '0 30px',
        margin: '20px auto',
        display: 'block',
    }
});