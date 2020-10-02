import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles({
    container: {
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${"../static/wordspot.jpg"})`,
        backgroundSize: 'cover',
        position: 'absolute',
        top: 0,
        left: 0
    },
    login: {
        backgroundColor: '#fff',
        width: '30vw',
        height: '50vh',
        marginLeft: '35vw',
        marginTop: '25vh',
        borderRadius: '5px',
        position: 'relative',
        fontFamily: 'Times New Roman'
    },
    header: {
        fontFamily: 'Times New Roman',
        textAlign: 'center'
    },
    input: {
        width: '60%',
        margin: 'auto',
        marginTop: '10%'
    },
    submit: {
        width: '60%',
        marginLeft: '20%',
        background: 'linear-gradient(45deg, #80aaff 30%, #4d88ff 90%)',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, 0.3)',
        color: '#fff',
        height: 48, 
        position: 'absolute',
        bottom: '5%'
    },

    gameLayout: {
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0
    },
    game: {
        width: '100%',
        height: '100%'
    },
    board: {
        width: '75%',
        height: '100%',
        display: 'inline-block'
    },
    scoreBoard: {
        width: '24%',
        height: '100%',
        display: 'inline-block',
        margin: 0,
        verticalAlign: 'top'
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
    letterUsed: {
        display: 'inline-block',
        background: 'linear-gradient(45deg, #a6c3ff 30%, #b2ccff 90%)'
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
        display: 'block'
    }
});