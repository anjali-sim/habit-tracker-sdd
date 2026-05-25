import { useCallback, useEffect, useRef, useState } from "react";
import { useHabitStore } from "../store/habitStore";
import { useCompletionStore } from "../store/completionStore";
import HabitCard from "../components/HabitCard";
import HabitCardSkeleton from "../components/HabitCardSkeleton";
import EmptyState from "../components/EmptyState";
import HabitModal from "../components/HabitModal";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { useDragDrop } from "../utils/useDragDrop";
import { useReminderScheduler } from "../utils/reminder";
import type { ModalState, Toast as ToastType } from "../types";

function DashboardPage() {
  const {
    habits,
    order,
    isLoading,
    error: habitError,
    loadHabits,
    addHabit,
    updateHabit,
    removeHabit,
    reorderHabits,
    clearError: clearHabitError,
  } = useHabitStore();
  const {
    loadCompletions,
    error: completionError,
    clearError: clearCompletionError,
  } = useCompletionStore();
  const [modal, setModal] = useState<ModalState>({ type: "closed" });
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const prevHabitError = useRef<string | null>(null);
  const prevCompletionError = useRef<string | null>(null);
  const cardListRef = useRef<HTMLDivElement>(null);

  const { dragState, dragHandlers, keyboardHandlers, ariaMessage } =
    useDragDrop(order, reorderHabits);

  useEffect(() => {
    loadHabits();
    loadCompletions();
  }, [loadHabits, loadCompletions]);

  useEffect(() => {
    if (habitError && habitError !== prevHabitError.current) {
      setToasts((t) => [
        ...t,
        { id: crypto.randomUUID(), message: habitError, type: "error" },
      ]);
      clearHabitError();
    }
    prevHabitError.current = habitError;
  }, [habitError, clearHabitError]);

  useEffect(() => {
    if (completionError && completionError !== prevCompletionError.current) {
      setToasts((t) => [
        ...t,
        { id: crypto.randomUUID(), message: completionError, type: "error" },
      ]);
      clearCompletionError();
    }
    prevCompletionError.current = completionError;
  }, [completionError, clearCompletionError]);

  const orderedHabits = order
    .map((id) => habits.find((h) => h.id === id))
    .filter((h): h is NonNullable<typeof h> => h !== undefined);

  useReminderScheduler(orderedHabits);

  function handleModalSubmit(input: Parameters<typeof addHabit>[0]) {
    if (modal.type === "add") addHabit(input);
    else if (modal.type === "edit") updateHabit(modal.habitId, input);
    if (!useHabitStore.getState().error) setModal({ type: "closed" });
  }

  function handleConfirmDelete() {
    if (modal.type !== "confirm-delete") return;
    removeHabit(modal.habitId);
    setModal({ type: "closed" });
  }

  const editHabit =
    modal.type === "edit"
      ? habits.find((h) => h.id === modal.habitId)
      : undefined;

  const handleListDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!cardListRef.current) return;
      const cards = Array.from(
        cardListRef.current.querySelectorAll<HTMLDivElement>(
          "[data-habit-card]",
        ),
      );
      const rects = cards.map((c) => c.getBoundingClientRect());
      dragHandlers.onDragOver(e, rects, 0);
    },
    [dragHandlers],
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">HabitFlow</h1>
        <button
          type="button"
          onClick={() => {
            clearHabitError();
            setModal({ type: "add" });
          }}
          className="rounded-lg bg-violet-600 px-4 py-2 min-h-[44px] text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          + Add habit
        </button>
      </header>

      <main className="p-4">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <HabitCardSkeleton />
            <HabitCardSkeleton />
            <HabitCardSkeleton />
          </div>
        )}

        {!isLoading && habitError && (
          <div className="rounded-xl bg-red-950 border border-red-800 p-4 text-red-300 flex items-center justify-between gap-4">
            <span>{habitError}</span>
            <button
              type="button"
              onClick={loadHabits}
              className="shrink-0 rounded-lg bg-red-800 px-3 py-2 min-h-[44px] text-sm text-red-100 hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !habitError && orderedHabits.length === 0 && (
          <EmptyState
            onAddHabit={() => {
              clearHabitError();
              setModal({ type: "add" });
            }}
          />
        )}

        {!isLoading && !habitError && orderedHabits.length > 0 && (
          <div
            ref={cardListRef}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            onDragOver={handleListDragOver}
            onDrop={dragHandlers.onDrop}
          >
            {orderedHabits.map((habit, idx) => (
              <div key={habit.id} className="relative">
                <div
                  className={`absolute -top-2 left-0 right-0 h-0.5 bg-violet-400 rounded transition-opacity ${dragState.overIndex === idx && dragState.draggingId !== habit.id ? "opacity-100" : "opacity-0"}`}
                />
                <div
                  data-habit-card
                  onKeyDown={(e) =>
                    keyboardHandlers.onCardKeyDown(e, habit.id, order)
                  }
                  tabIndex={0}
                  aria-grabbed={dragState.draggingId === habit.id}
                >
                  <HabitCard
                    habit={habit}
                    onEdit={(id) => {
                      clearHabitError();
                      setModal({ type: "edit", habitId: id });
                    }}
                    onDelete={(id) =>
                      setModal({ type: "confirm-delete", habitId: id })
                    }
                    draggable
                    isDragging={dragState.draggingId === habit.id}
                    onDragStart={(e) => dragHandlers.onDragStart(e, habit.id)}
                    onDragEnd={dragHandlers.onDragEnd}
                  />
                </div>
                {idx === orderedHabits.length - 1 && (
                  <div
                    className={`absolute -bottom-2 left-0 right-0 h-0.5 bg-violet-400 rounded transition-opacity ${dragState.overIndex === orderedHabits.length && dragState.draggingId !== habit.id ? "opacity-100" : "opacity-0"}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <div role="status" aria-live="polite" className="sr-only">
        {ariaMessage}
      </div>

      {(modal.type === "add" || modal.type === "edit") && (
        <HabitModal
          mode={modal.type}
          initialValues={
            editHabit
              ? {
                  name: editHabit.name,
                  category: editHabit.category,
                  colorTag: editHabit.colorTag,
                  frequency: editHabit.frequency,
                  hourlyTarget: editHabit.hourlyTarget,
                  reminderTime: editHabit.reminderTime,
                }
              : undefined
          }
          onSubmit={handleModalSubmit}
          onClose={() => {
            clearHabitError();
            setModal({ type: "closed" });
          }}
        />
      )}

      {modal.type === "confirm-delete" && (
        <ConfirmModal
          habitName={habits.find((h) => h.id === modal.habitId)?.name ?? ""}
          onConfirm={handleConfirmDelete}
          onCancel={() => setModal({ type: "closed" })}
        />
      )}

      <Toast
        toasts={toasts}
        onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />
    </div>
  );
}

export default DashboardPage;
