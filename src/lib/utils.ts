import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '';
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 });
}