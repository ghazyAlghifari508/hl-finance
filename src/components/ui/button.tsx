import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-[9999px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer font-body",
          {
            // Primary Pill Button - Electric Blue
            "bg-electric-blue text-paper-white hover:bg-electric-blue/90 active:scale-[0.98]": variant === "primary",
            // Ember CTA Button - Orange (also used for destructive actions)
            "bg-ember-orange text-paper-white hover:bg-ember-orange/90 active:scale-95": variant === "secondary",
            // Ghost Pill Button - Border Ink Black
            "border border-ink-black bg-transparent text-ink-black hover:bg-parchment active:scale-[0.98]": variant === "ghost",

            // Sizes
            "h-12 px-6 text-[16px]": size === "default",
            "h-9 px-4 text-[14px]": size === "sm",
            "h-14 px-8 text-[18px]": size === "lg",
            "h-12 w-12 rounded-full": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
