import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-accent to-accent-light text-white",
        secondary:
          "bg-surface-sunken text-text-secondary [a&]:hover:bg-card-secondary",
        destructive:
          "bg-error/10 text-error border-error/20",
        outline:
          "border-border-strong text-text-secondary [a&]:hover:bg-surface-sunken",
        ghost: "text-text-secondary [a&]:hover:bg-surface-sunken",
        link: "text-info underline-offset-4 [a&]:hover:underline",
        success: "bg-success/10 text-success border-success/20",
        warning: "bg-warning/10 text-warning border-warning/20",
        info: "bg-info-bg text-info border-info/20",
        accent: "bg-accent-bg text-accent border-accent/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
