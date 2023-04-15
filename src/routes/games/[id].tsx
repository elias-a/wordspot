import {
  Show,
  createSignal,
  createEffect,
  JSXElement,
} from "solid-js";
import { Portal } from "solid-js/web";
import { useRouteData, RouteDataArgs, useParams } from "solid-start";
import { createServerData$, createServerAction$  } from "solid-start/server";
import { FormError } from "solid-start/data";
import {
  DragDropProvider,
  DragDropSensors,
  DragEventHandler,
  DragOverlay,
  Draggable,
} from "@thisbeyond/solid-dnd";
import Header from "~/components/Header";
import Board from "~/components/Board";
import User from "~/components/User";
import MovingExtraTile from "~/components/MovingExtraTile";
import NotFound from "../[...404]";
import { getGame, endTurn, PlacedExtraTile } from "~/db/game";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      droppable: boolean;
      draggable: boolean;
    }
  }
}

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    async ({ id }, { request }) => await getGame(id, request),
    { key: () => { return { id: params.id } } }
  );
}

export default function Game() {
  const params = useParams();
  const game = useRouteData<typeof routeData>();
  const [clicked, setClicked] = createSignal<string[]>([], { equals: false });
  const [selected, setSelected] = createSignal<string[]>([], { equals: false });
  const [extraTile, setExtraTile] = createSignal<PlacedExtraTile>();
  const [isConfirmOpen, setIsConfirmOpen] = createSignal(false);
  const [_, { Form }] = createServerAction$(async (form: FormData) => {
    const formGameId = form.get("gameId");
    const formPlayerId = form.get("playerId");
    const formClicked = form.get("clicked");
    const formSelected = form.get("selected");
    const formExtraTile = form.get("extraTile");
    const formBoard = form.get("board");
    
    if (
      typeof formGameId !== "string" ||
      typeof formPlayerId !== "string" ||
      typeof formClicked !== "string" ||
      typeof formSelected !== "string" ||
      typeof formExtraTile !== "string" ||
      typeof formBoard !== "string"
    ) {
      throw new FormError(`Form not submitted correctly.`);
    }

    const gameId = formGameId;
    const playerId = formPlayerId;
    const clicked = JSON.parse(formClicked);
    const selected = JSON.parse(formSelected);
    const extraTile = formExtraTile !== "undefined"
      ? JSON.parse(formExtraTile)
      : undefined;
    const board = JSON.parse(formBoard);

    await endTurn(gameId, playerId, clicked, selected, extraTile, board);
  });

  createEffect(() => {
    if (game() && game()!.userData.myTokens >= 0) {
      setClicked([]);
      setSelected([]);
      setExtraTile(undefined);
      setIsConfirmOpen(false);
    }
  });

  const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
    if (draggable && droppable && game()) {
      const draggableId = draggable.id.toString();
      const droppableId = droppable.id.toString();

      if (extraTile()) {
        const letters = extraTile()!.letters.map(l => l.id);

        const updatedClicked: string[] = [];
        clicked().forEach(l => {
          if (!letters.includes(l)) {
            updatedClicked.push(l);
          }
        });

        setClicked(updatedClicked);
      }

      if (droppableId === "extra-tiles-area") {
        setExtraTile(undefined);
      } else {
        const selectedExtraTile = game()!.extraTiles
          .find(t => t.id === draggableId);
        if (selectedExtraTile) {
          setExtraTile({
            ...selectedExtraTile,
            tileId: droppableId,
          });
        } else {
          setExtraTile(undefined);
        }
      }
    }
  };
  
  return (
    <DragDropProvider onDragEnd={onDragEnd}>
      <DragDropSensors />
      <div class="app">
        <div class="authentication-screen" />
        <Show when={game()} fallback={<NotFound />}>
          <Header name={game()!.userData.myName} />
          <div class="content">
            <Board
              board={game()!.board}
              extraTile={extraTile()}
              clicked={clicked()}
              setClicked={setClicked}
              selected={selected()}
              setSelected={setSelected}
              disabled={
                game()!.userData.myTokens - clicked().length === 0 ||
                game()!.userData.winner !== null
              }
            />
            <User
              userData={game()!.userData}
              extraTiles={game()!.extraTiles}
              extraTile={extraTile()}
              clicked={clicked()}
              setIsConfirmOpen={setIsConfirmOpen}
            />
          </div>
          <DragOverlay>
            {((draggable: Draggable) => {
              return (
                <MovingExtraTile
                  tile={game()!.extraTiles.find(tile => tile.id === draggable!.id.toString())!}
                />
              );
            }) as JSXElement}
          </DragOverlay>
          <Show when={isConfirmOpen()}>
            <Portal>
              <div class="confirm-modal-overlay">
                <div class="confirm-modal">
                  <div class="header"></div>
                  <div class="confirm-message">
                    <Show
                      when={clicked().length + selected().length >= 3}
                      fallback={<p>{`Are you sure you want to end your turn without making a move? Your word must include at least 3 letters. If you end your turn now, you will be given 2 tokens and 1 extra tile.`}</p>}
                    >
                      <p>{`Are you sure you want to end your turn?`}</p>
                    </Show>
                  </div>
                  <div class="confirm-buttons">
                    <button
                      id="cancel-end-turn"
                      class="end-turn-button confirm-button"
                      onClick={() => setIsConfirmOpen(false)}
                    >
                      Cancel
                    </button>
                    <Form>
                      <input
                        type="hidden"
                        name="gameId"
                        value={params.id}
                      />
                      <input
                        type="hidden"
                        name="playerId"
                        value={game()!.userData.playerId}
                      />
                      <input
                        type="hidden"
                        name="clicked"
                        value={JSON.stringify(clicked())}
                      />
                      <input
                        type="hidden"
                        name="selected"
                        value={JSON.stringify(selected())}
                      />
                      <input
                        type="hidden"
                        name="extraTile"
                        value={extraTile() ? JSON.stringify(extraTile()) : undefined}
                      />
                      <input
                        type="hidden"
                        name="board"
                        value={JSON.stringify(game()!.board)}
                      />
                      <button
                        name="start-game"
                        type="submit"
                        class="end-turn-button confirm-button"
                      >
                        End Turn
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            </Portal>
          </Show>
        </Show>
      </div>
    </DragDropProvider>
  );
}
