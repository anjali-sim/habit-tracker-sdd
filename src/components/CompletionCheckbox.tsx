interface CompletionCheckboxProps {
  habitId: string;
  habitName: string;
  date: string;
  checked: boolean;
  onChange: () => void;
}

function CompletionCheckbox({
  habitName,
  checked,
  onChange,
}: CompletionCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={
        checked
          ? `Mark ${habitName} as incomplete`
          : `Mark ${habitName} as complete`
      }
      onClick={onChange}
      className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border-2 transition-all ${
        checked
          ? "bg-violet-600 border-violet-600 text-white"
          : "border-zinc-600 text-transparent hover:border-violet-500"
      }`}
    >
      <span className="text-lg" aria-hidden="true">
        {checked ? "✓" : "○"}
      </span>
    </button>
  );
}

export default CompletionCheckbox;
