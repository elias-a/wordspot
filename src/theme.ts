import { createMuiTheme } from '@material-ui/core/styles';

export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#785F43',
      contrastText: '#ffffdd'
    },
    secondary: {
      main: '#2b2218',
      contrastText: '#ffffdd'
    },
  },
  typography: {
    fontFamily: 'Times New Roman',
  }
});