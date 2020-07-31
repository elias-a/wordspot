import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
    board: {
        width: '800px',
        height: '800px'
    },
    tile: {
        display: 'inline-block',
        verticalAlign: 'top',
        border: '1px solid #000'
    },
    letter: {
        width: '49%',
        height: '49%',
        display: 'inline-block'
    },
    letterClicked: {
        width: '49%',
        height: '49%',
        display: 'inline-block',
        background: 'linear-gradient(45deg, #80aaff 30%, #4d88ff 90%)'
    },
    turn: {
        textAlign: 'center'
    },
    clicked: {
        backgroundColor: '#80aaff'
    },
    container: {
        backgroundColor: '#fff',
        border: '4px solid #e6eeff',
        width: '50%',
        padding: '10px',
        margin: '40px auto',
    },
    data: {
        backgroundColor: '#99bbff',
        width: '90%',
        margin: '10px auto',
        padding: '10px',
        fontSize: '24px',
        color: '#fff',
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