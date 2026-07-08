"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null
  return <>{children}</>
}

function DialogTrigger({ children, onClick, ...props }: React.ComponentProps<"button">) {
  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

function DialogOverlay({ className, onClick, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("fixed inset-0 z-50 bg-black/50 animate-in fade-in-0", className)}
      onClick={onClick}
      {...props}
    />
  )
}

interface DialogContentProps extends React.ComponentProps<"div"> {
  showCloseButton?: boolean
  onOpenChange?: (open: boolean) => void
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onOpenChange,
  ...props
}: DialogContentProps) {
  // Walk up through context to find the onOpenChange — pass it via a wrapper
  return (
    <DialogPortal>
      <DialogOverlay onClick={() => onOpenChange?.(false)} />
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-[calc(100%-2rem)] sm:max-w-lg",
          "grid gap-4 rounded-lg border bg-background p-6 shadow-lg",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <button
            onClick={() => onOpenChange?.(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold leading-none", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function DialogClose({ children, onClick, ...props }: React.ComponentProps<"button">) {
  return (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
