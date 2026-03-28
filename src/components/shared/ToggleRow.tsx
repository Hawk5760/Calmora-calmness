import { Switch } from "@/components/ui/switch";
import { ReactNode } from "react";

interface ToggleRowProps {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const ToggleRow = ({ icon, title, description, checked, onChange, disabled }: ToggleRowProps) => (
  <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
  </div>
);
