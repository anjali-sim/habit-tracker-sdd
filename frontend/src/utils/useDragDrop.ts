import { useCallback, useEffect, useRef, useState } from "react";
import type { HabitOrder } from "../types";

interface DragState {
  draggingId: string | null;
  overIndex: number | null;
}

interface DragHandlers {
  onDragStart: (e: React.DragEvent<HTMLDivElement>, habitId: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (
    e: React.DragEvent<HTMLDivElement>,
    cardRects: DOMRect[],
    listTop: number,
  ) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

interface KeyboardHandlers {
  onCardKeyDown: (
    e: React.KeyboardEvent<HTMLDivElement>,
    habitId: string,
    order: HabitOrder,
  ) => void;
}

interface UseDragDropReturn {
  dragState: DragState;
  dragHandlers: DragHandlers;
  keyboardHandlers: KeyboardHandlers;
  ariaMessage: string;
}

export function useDragDrop(
  order: HabitOrder,
  reorderHabits: (newOrder: HabitOrder) => void,
): UseDragDropReturn {
  const [dragState, setDragState] = useState<DragState>({
    draggingId: null,
    overIndex: null,
  });
  const [ariaMessage, setAriaMessage] = useState("");
  const [keyboardMoveId, setKeyboardMoveId] = useState<string | null>(null);
  const didDropRef = useRef(false);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const clearDrag = useCallback(() => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
    setDragState({ draggingId: null, overIndex: null });
  }, []);

  useEffect(() => {
    if (!dragState.draggingId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        clearDrag();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dragState.draggingId, clearDrag]);

  const onDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, habitId: string) => {
      didDropRef.current = false;
      e.dataTransfer.setData("text/plain", habitId);
      e.dataTransfer.effectAllowed = "move";

      const card = e.currentTarget as HTMLDivElement;
      const rect = card.getBoundingClientRect();
      const ghost = card.cloneNode(true) as HTMLDivElement;
      ghost.style.cssText = `position:fixed;top:-200px;left:0;width:${rect.width}px;opacity:0.6;pointer-events:none;z-index:9999;`;
      document.body.appendChild(ghost);
      ghostRef.current = ghost;
      e.dataTransfer.setDragImage(ghost, rect.width / 2, rect.height / 2);

      setDragState({ draggingId: habitId, overIndex: null });
    },
    [],
  );

  const onDragEnd = useCallback(
    (_e: React.DragEvent<HTMLDivElement>) => {
      if (!didDropRef.current) {
        clearDrag();
      }
      didDropRef.current = false;
    },
    [clearDrag],
  );

  const onDragOver = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      cardRects: DOMRect[],
      _listTop: number,
    ) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const y = e.clientY;
      let insertIndex = cardRects.length;
      for (let i = 0; i < cardRects.length; i++) {
        const mid = cardRects[i].top + cardRects[i].height / 2;
        if (y < mid) {
          insertIndex = i;
          break;
        }
      }
      setDragState((s) =>
        s.overIndex === insertIndex ? s : { ...s, overIndex: insertIndex },
      );
    },
    [],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const habitId = e.dataTransfer.getData("text/plain");
      const { overIndex } = dragState;
      if (!habitId || overIndex === null) {
        clearDrag();
        return;
      }
      didDropRef.current = true;
      const without = order.filter((id) => id !== habitId);
      const newOrder = [
        ...without.slice(0, overIndex),
        habitId,
        ...without.slice(overIndex),
      ];
      reorderHabits(newOrder);
      clearDrag();
    },
    [dragState, order, reorderHabits, clearDrag],
  );

  const onCardKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLDivElement>,
      habitId: string,
      currentOrder: HabitOrder,
    ) => {
      const idx = currentOrder.indexOf(habitId);
      if (idx === -1) return;

      if (e.key === " " && !keyboardMoveId) {
        e.preventDefault();
        setKeyboardMoveId(habitId);
        setAriaMessage(
          `Move mode: '${currentOrder[idx]}', position ${idx + 1} of ${currentOrder.length}`,
        );
        return;
      }
      if (!keyboardMoveId || keyboardMoveId !== habitId) return;

      if (e.key === "ArrowUp" && idx > 0) {
        e.preventDefault();
        const newOrder = [...currentOrder];
        [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
        reorderHabits(newOrder);
        setAriaMessage(
          `'${habitId}' moving to position ${idx} of ${currentOrder.length}`,
        );
      } else if (e.key === "ArrowDown" && idx < currentOrder.length - 1) {
        e.preventDefault();
        const newOrder = [...currentOrder];
        [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
        reorderHabits(newOrder);
        setAriaMessage(
          `'${habitId}' moving to position ${idx + 2} of ${currentOrder.length}`,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        setKeyboardMoveId(null);
        setAriaMessage(`'${habitId}' moved to position ${idx + 1}`);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setKeyboardMoveId(null);
        setAriaMessage("Move cancelled");
      }
    },
    [keyboardMoveId, reorderHabits],
  );

  return {
    dragState,
    dragHandlers: { onDragStart, onDragEnd, onDragOver, onDrop },
    keyboardHandlers: { onCardKeyDown },
    ariaMessage,
  };
}
