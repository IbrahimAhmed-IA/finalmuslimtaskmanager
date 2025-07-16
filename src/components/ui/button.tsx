import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useAppSettings } from "@/context/app-settings-context"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",
        // Advanced mode variants with dark backgrounds
        advancedDefault: "bg-blue-600 text-white hover:bg-blue-700",
        advancedDestructive: "bg-red-600 text-white hover:bg-red-700",
        advancedOutline: "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700",
        advancedSecondary: "bg-slate-700 text-slate-200 hover:bg-slate-600",
        advancedGhost: "text-slate-300 hover:bg-slate-800 hover:text-white",
        advancedLink: "text-blue-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size, asChild = false, ...props }, ref) => {
    const { settings } = useAppSettings()
    const isAdvancedMode = settings?.advancedMode

    // Map regular variants to advanced variants in advanced mode
    let finalVariant = variant
    if (isAdvancedMode) {
      switch (variant) {
        case "default":
          finalVariant = "advancedDefault"
          break
        case "destructive":
          finalVariant = "advancedDestructive"
          break
        case "outline":
          finalVariant = "advancedOutline"
          break
        case "secondary":
          finalVariant = "advancedSecondary"
          break
        case "ghost":
          finalVariant = "advancedGhost"
          break
        case "link":
          finalVariant = "advancedLink"
          break
      }
    }

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant: finalVariant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
