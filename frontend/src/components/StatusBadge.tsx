import { OrderStatus } from '@/types';

const labels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-${status}`}>{labels[status]}</span>;
}