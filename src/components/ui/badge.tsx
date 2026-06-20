import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        // 12.8px radius per Parker spec
        className={cn(
          "inline-flex items-center rounded-[12.8px] px-3 py-1 text-[14px] font-medium leading-[1.5] font-body transition-colors",
          {
            "bg-ink-black text-paper-white": variant === "default",
            "bg-electric-blue/10 text-electric-blue": variant === "success",
            "bg-ember-orange/10 text-ember-orange": variant === "warning",
            "bg-ember-orange text-paper-white": variant === "destructive",
            "border border-sand text-ink-black bg-parchment": variant === "outline",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
