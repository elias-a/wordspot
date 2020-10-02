import React from 'react';
import { useStyles } from '../styles';

function Score({ players, tokens }) {
    const styles = useStyles();

    return (
      <table className={styles.scoreTable}>
          <thead>
            <tr>
                <td className={styles.scoreTable} align="center">Player</td>
                <td className={styles.scoreTable} align="center">Tokens</td>
            </tr>
          </thead>
          <tbody>
              <tr>
                <td className={styles.scoreTable} align="center">{players[0].name}</td>
                <td className={styles.scoreTable} align="center">{tokens[0]}</td>
              </tr>
              <tr>
                  <td className={styles.scoreTable} align="center">{players[1].name}</td>
                  <td className={styles.scoreTable} align="center">{tokens[1]}</td>
              </tr>
          </tbody>     
      </table>
    );
}

export default Score;