import { ShieldCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  message?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "subtle" | "inline"
  className?: string
}

export function VerifiedBadge({ 
  message = "This institution is officially verified by SkillVault",
  size = "md",
  variant = "default",
  className
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "text-[8px] px-1.5 py-0.5",
    md: "text-[10px] px-2 py-0.5",
    lg: "text-xs px-2.5 py-1"
  }

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5"
  }

  const variantClasses = {
    default: "bg-primary/10 text-primary rounded-full",
    subtle: "bg-green-50 text-green-700 rounded-full dark:bg-green-900/20 dark:text-green-400",
    inline: "text-green-600 dark:text-green-400"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center gap-1 font-bold uppercase tracking-wider",
            sizeClasses[size],
            variantClasses[variant],
            className
          )}>
            <ShieldCheck className={iconSizes[size]} />
            {variant !== "inline" && "Verified"}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

