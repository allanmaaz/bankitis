import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | { toString(): string }): string {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(numericAmount || 0);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 8) return acc;
  const prefix = acc.slice(0, 3);
  const suffix = acc.slice(-4);
  return `${prefix}•••••${suffix}`;
}

export function maskUpiId(upi: string): string {
  if (!upi || !upi.includes('@')) return upi;
  const [user, handle] = upi.split('@');
  if (user.length <= 2) return `${user.charAt(0)}*@${handle}`;
  return `${user.slice(0, 2)}***${user.slice(-1)}@${handle}`;
}

