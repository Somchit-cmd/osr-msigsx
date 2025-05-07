import { FilterParams, RequestStatus } from "@/types";

export function formatDate(date: any) {
  if (!date) return "";
  // Firestore Timestamp object
  if (typeof date.toDate === "function") {
    return date.toDate().toLocaleString(); // or .toLocaleDateString() for just the date
  }
  // ISO string or Date object
  return new Date(date).toLocaleString();
}

export function getStatusBadgeClass(status: RequestStatus): string {
  switch (status) {
    case 'approved':
      return 'badge-success';
    case 'pending':
      return 'badge-warning';
    case 'rejected':
      return 'badge-danger';
    case 'fulfilled':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-gray-200 text-gray-600';
    default:
      return '';
  }
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function generateFilterQuery(params: FilterParams): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
}

export function getRandomColor(): string {
  const colors = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
