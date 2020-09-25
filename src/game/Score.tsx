import React from 'react';
import { 
    Table, 
    TableHead, 
    TableBody, 
    TableRow,
    TableCell 
} from '@material-ui/core';
import { useStyles } from '../styles';

function Score({ players, tokens }) {
    const styles = useStyles();

    return (
      <Table>
          <TableHead>
            <TableRow>
                <TableCell align="center">Player</TableCell>
                <TableCell align="center">Tokens</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              <TableRow>
                <TableCell align="center">{players[0].name}</TableCell>
                <TableCell align="center">{tokens[0]}</TableCell>
              </TableRow>
              <TableRow>
                  <TableCell align="center">{players[1].name}</TableCell>
                  <TableCell align="center">{tokens[1]}</TableCell>
              </TableRow>
          </TableBody>     
      </Table>
    );
}

export default Score;