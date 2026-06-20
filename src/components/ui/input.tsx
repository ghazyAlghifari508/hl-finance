import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        // 12.8px radius, Fog resting border, Electric Blue focus
        className={cn(
          "flex h-12 w-full rounded-[12.8px] border border-fog bg-paper-white px-4 py-2 text-[16px] text-ink-black font-body transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-fog focus-visible:border-electric-blue focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
