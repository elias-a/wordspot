import React from 'react';
import { useStyles } from '../styles';

function Score({ players, tokens }) {
    const styles = useStyles();

    return (
      <table className={styles.scoreTable}>
          <thead>
            <tr>
                <th className={styles.tableCell}>Player</th>
                <th className={styles.tableCell}>Tokens</th>
            </tr>
          </thead>
          <tbody>
              <tr>
                <td className={styles.tableCell}>{players[0].name}</td>
                <td className={styles.tableCell}>{tokens[0]}</td>
              </tr>
              <tr>
                  <td className={styles.tableCell}>{players[1].name}</td>
                  <td className={styles.tableCell}>{tokens[1]}</td>
              </tr>
          </tbody>     
      </table>
    );
}

export default Score;