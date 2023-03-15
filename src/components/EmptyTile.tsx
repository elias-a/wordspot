import { createDroppable } from "@thisbeyond/solid-dnd";

type EmptyTileProps = {
  id: string;
};

export default function EmptyTile(props: EmptyTileProps) {
  const droppable = createDroppable(props.id);

  return <div use:droppable class="empty-tile" />;
}
