import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "@/components/ui/use-toast"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Toast utility functions for consistent notifications
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "success" as any,
  })
}

export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "error" as any,
  })
}

export const showToast = (title: string, description?: string, variant: "default" | "destructive" | "success" | "error" = "default") => {
  toast({
    title,
    description,
    variant: variant as any,
  })
}
