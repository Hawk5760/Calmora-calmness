import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    return { score, checks };
  };

  const { score, checks } = getPasswordStrength(password);
  
  const getStrengthLevel = () => {
    if (score < 2) return { label: 'Weak', color: 'destructive' };
    if (score < 4) return { label: 'Fair', color: 'accent' };
    if (score < 5) return { label: 'Good', color: 'secondary' };
    return { label: 'Strong', color: 'primary' };
  };

  const strengthLevel = getStrengthLevel();

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password strength:</span>
        <span className={cn(
          "text-sm font-medium",
          strengthLevel.color === 'destructive' && "text-destructive",
          strengthLevel.color === 'accent' && "text-accent-foreground",
          strengthLevel.color === 'secondary' && "text-secondary-foreground",
          strengthLevel.color === 'primary' && "text-primary"
        )}>
          {strengthLevel.label}
        </span>
      </div>
      
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              level <= score ? (
                strengthLevel.color === 'destructive' ? "bg-destructive" :
                strengthLevel.color === 'accent' ? "bg-accent" :
                strengthLevel.color === 'secondary' ? "bg-secondary" :
                "bg-primary"
              ) : "bg-muted"
            )}
          />
        ))}
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div className={cn("flex items-center", checks.length && "text-primary")}>
          <span className="mr-2">{checks.length ? "✓" : "○"}</span>
          At least 8 characters
        </div>
        <div className={cn("flex items-center", checks.hasLower && "text-primary")}>
          <span className="mr-2">{checks.hasLower ? "✓" : "○"}</span>
          One lowercase letter
        </div>
        <div className={cn("flex items-center", checks.hasUpper && "text-primary")}>
          <span className="mr-2">{checks.hasUpper ? "✓" : "○"}</span>
          One uppercase letter
        </div>
        <div className={cn("flex items-center", checks.hasNumber && "text-primary")}>
          <span className="mr-2">{checks.hasNumber ? "✓" : "○"}</span>
          One number
        </div>
        <div className={cn("flex items-center", checks.hasSpecial && "text-primary")}>
          <span className="mr-2">{checks.hasSpecial ? "✓" : "○"}</span>
          One special character
        </div>
      </div>
    </div>
  );
};