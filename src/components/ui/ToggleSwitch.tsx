import { cn } from '@/lib/cn';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch = ({ checked, onChange, disabled = false }: ToggleSwitchProps) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    className={cn(
      "w-11 h-6 rounded-full border-none relative transition-colors duration-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-background",
      checked && !disabled ? "bg-emerald-500" : "bg-white/10",
      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
    )}
    aria-checked={checked}
    role="switch"
  >
    <div 
      className={cn(
        "w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all duration-300 shadow-sm",
        checked ? "left-[23px]" : "left-[3px]"
      )} 
    />
  </button>
);
