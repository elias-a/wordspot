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
        color: '#3b2f21',
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
        backgroundColor: '#993300',
        "&:hover": {
            backgroundColor: '#993300'
        },
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
        color: '#3b2f21',
        fontFamily: theme.typography.fontFamily
    },
    logo: {
        display: 'inline-block',
        height: '10vh',
        margin: 0,
        paddingLeft: '1vw',
        float: 'left',
        fontSize: '50px',
    },
    logout: {
        float: 'right',
        height: '6vh',
        marginTop: '2vh',
        marginRight: '1vw',
        backgroundColor: '#993300',
        "&:hover": {
            backgroundColor: '#993300'
        },
        border: 0,
        borderRadius: 3,
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, 0.3)',
        color: '#fff'
    },

    dashboardLayout: {
        width: '100vw',
        height: '90vh',
        position: 'absolute',
        top: '10vh',
        left: 0,
        backgroundColor: theme.palette.primary.contrastText
    },
    startGameBtn: {
        backgroundColor: '#993300',
        "&:hover": {
            backgroundColor: '#993300'
        },
        border: 0,
        borderRadius: 3,
        color: '#fff',
        height: 48, 
        width: '40%',
        padding: '0 30px',
        margin: '20px auto',
        display: 'block'
    },
    gamesList: {
        width: '40%',
        margin: '20px auto'
    },
    gameLink: {
        display: 'block',
        margin: '30px auto'
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
        width: '80%',
        height: '100%',
        display: 'inline-block'
    },
    scoreBoard: {
        backgroundColor: '#3b2f21', 
        width: '18vw',
        minWidth: '200px', 
        height: '80%',
        display: 'inline-block',
        margin: '0 1vw',
        marginTop: '10vh',
        verticalAlign: 'top',
        overflow: 'hidden'
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
        margin: 0,
        "&:hover": {
            backgroundColor: theme.palette.secondary.main
        }
    },
    letterClicked: {
        color: '#fff',
        display: 'inline-block',
        backgroundColor: '#4b3c2a',
        "&:hover": {
            backgroundColor: theme.palette.secondary.main
        }
    },
    letterSelected: {
        color: '#fff',
        display: 'inline-block',
        backgroundColor: theme.palette.secondary.main,
        "&:hover": {
            backgroundColor: theme.palette.secondary.main
        }
    },
    letterUsed: {
        color: '#fff',
        display: 'inline-block',
        backgroundColor: theme.palette.secondary.main,
        "&:hover": {
            backgroundColor: theme.palette.secondary.main
        }
    },

    scoreTable: {
        width: '100%',
        borderBottom: '1px solid #fff',
        borderCollapse: 'collapse'
    },
    tableCell: {
        color: '#fff',
        width: '50%',
        height: '40px', 
        margin: 0,
        padding: 0,
        textAlign: 'center',
        borderBottom: '1px solid #fff',
        borderCollapse: 'collapse'
    },
    turn: {
        color: '#fff',
        textAlign: 'center'
    },
    extraTileContainer: {
        minHeight: '150px',
        maxHeight: '150px',
        overflowX: 'hidden',
        overflowY: 'auto'
    },
    extraTile: {
        display: 'inline-block',
        verticalAlign: 'top',
        border: '1px solid ' + theme.palette.secondary.contrastText,
        backgroundColor: theme.palette.primary.main,
        marginTop: '5px',
        marginLeft: '40px'
    },
    blankTileScore: {
        display: 'inline-block',
        verticalAlign: 'top',
        border: '1px solid ' + theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
        marginTop: '5px',
        marginLeft: '40px'
    },

    button: {
        backgroundColor: '#993300',
        "&:hover": {
            backgroundColor: '#993300'
        },
        border: 0,
        borderRadius: 3,
        color: '#fff',
        height: 48, 
        width: '70%',
        padding: '0 30px',
        margin: '20px auto',
        display: 'block'
    }
}));