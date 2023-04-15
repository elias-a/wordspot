import { Setter, For, Switch, Match } from "solid-js";
import { createDroppable } from "@thisbeyond/solid-dnd";
import ExtraTileRowComponent from "~/components/ExtraTileRow";
import type { ExtraTile, UserData, ExtraTileRow } from "~/db/game";
import { v4 as uuidv4 } from "uuid";

type UserAreaProps = {
  userData: UserData;
  extraTiles: ExtraTile[];
  extraTile: ExtraTile | undefined;
  clicked: string[];
  setIsConfirmOpen: Setter<boolean>;
};

export default function User(props: UserAreaProps) {
  const droppable = createDroppable("extra-tiles-area");
  const extraTileRows = () => {
    const userExtraTiles = props.extraTile
      ? props.extraTiles.filter(t => t.id !== props.extraTile!.id)
      : props.extraTiles;
    const rows: ExtraTileRow[] = [];

    for (let i = 0; i < userExtraTiles.length; i += 2) {
      rows.push({
        id: uuidv4(),
        tiles: userExtraTiles.slice(i, i + 2),
      });
    }
    
    return rows;
  };

  return (
    <div class="user-area">
      <div class="user-data">
        <div class="user-turn-section">
          <Switch>
            <Match when={props.userData.winner === props.userData.myId}>
              {`You won!`}
            </Match>
            <Match when={props.userData.winner}>
              {`You lost!`}
            </Match>
            <Match when={props.userData.myTurn}>
              {`Your turn!`}
            </Match>
            <Match when={props.userData.opponentTurn}>
              {`${props.userData.opponentName}'s Turn!`}
            </Match>
          </Switch>
        </div>
        <div class="user-token-section">
          <Switch>
            <Match when={props.userData.firstPlayer === props.userData.myId}>
              <div class="user-tokens">
                {`${props.userData.myName} has ${props.userData.myTokens - props.clicked.length} ${(props.userData.myTokens - props.clicked.length) === 1 ? "token" : "tokens"} left`}
              </div>
              <div class="user-tokens">
                {`${props.userData.opponentName} has ${props.userData.opponentTokens} ${props.userData.opponentTokens === 1 ? "token" : "tokens"} left`}
              </div>
            </Match>
            <Match when={props.userData.firstPlayer !== props.userData.myId}>
            <div class="user-tokens">
              {props.userData.opponentName}
            </div>
            <div class="user-tokens">
              {props.userData.opponentTokens}
            </div>
            <div class="user-tokens">
              {props.userData.myName}
            </div>
            <div class="user-tokens">
              {props.userData.myTokens}
            </div>
            </Match>
          </Switch>
        </div>
      </div>
      <div use:droppable id="extra-tiles-area" class="extra-tiles-area">
        <For each={extraTileRows()}>{row => {
          return (
            <ExtraTileRowComponent
              row={row}
              disabled={props.userData.winner !== null}
            />
          );
        }}</For>
      </div>
      <button
        name="start-game"
        class="end-turn-button"
        onClick={() => props.setIsConfirmOpen(true)}
      >
        End Turn
      </button>
    </div>
  );
}
