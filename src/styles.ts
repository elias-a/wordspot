import { makeStyles, createStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => createStyles({
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
        color: theme.palette.secondary.main,
        backgroundColor: theme.palette.primary.contrastText,
        width: '30vw',
        height: '50vh',
        marginLeft: '35vw',
        marginTop: '25vh',
        borderRadius: '5px',
        position: 'relative',
        fontFamily: theme.typography.fontFamily
    },
    header: {
        fontFamily: theme.typography.fontFamily,
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
        backgroundColor: '#A52A2A',
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, 0.3)',
        color: '#fff',
        height: 48, 
        position: 'absolute',
        bottom: '5%'
    },

    navBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '10vh',
        backgroundColor: theme.palette.primary.contrastText,
        color: theme.palette.secondary.main,
        //backgroundColor: theme.palette.secondary.main,
        //color: theme.palette.secondary.contrastText,
        fontFamily: theme.typography.fontFamily,
    },
    logo: {
        display: 'inline-block',
        height: '10vh',
        margin: 0,
        float: 'left',
        fontSize: '50px',
    },
    logout: {
        float: 'right',
        height: '6vh',
        marginTop: '2vh',
        marginRight: '1vw'
    },

    gameLayout: {
        width: '100vw',
        height: '90vh',
        position: 'absolute',
        top: '10vh',
        left: 0,
        backgroundColor: theme.palette.primary.contrastText
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
        border: '1px solid ' + theme.palette.secondary.contrastText,
        backgroundColor: theme.palette.primary.main
    },
    blankTile: {
        display: 'inline-block',
        verticalAlign: 'top',
        border: '1px solid ' + theme.palette.primary.contrastText
    },
    emptyTile: {
        display: 'inline-block',
        verticalAlign: 'top',
        border: '1px solid ' + theme.palette.primary.contrastText
    },
    letter: {
        color: '#fff',
        display: 'inline-block',
        padding: 0,
        margin: 0
    },
    letterClicked: {
        color: '#fff',
        display: 'inline-block',
        backgroundColor: theme.palette.secondary.main
    },
    letterSelected: {
        color: '#fff',
        display: 'inline-block',
        backgroundColor: theme.palette.secondary.main
    },
    letterUsed: {
        color: '#fff',
        display: 'inline-block',
        backgroundColor: theme.palette.primary.light
    },

    scoreTable: {
        color: theme.palette.primary.contrastText
    },
    turn: {
        color: theme.palette.secondary.contrastText,
        textAlign: 'center'
    },

    button: {
        backgroundColor: theme.palette.secondary.light,
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, 0.3)',
        color: theme.palette.secondary.contrastText,
        height: 48, 
        width: '100%',
        padding: '0 30px',
        margin: '20px auto',
        display: 'block'
    }
}));