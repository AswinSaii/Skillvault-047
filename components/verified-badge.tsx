import { ShieldCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function VerifiedBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>This institution is officially verified by SkillVault</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
