// Utility function to merge classNames conditionally
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}