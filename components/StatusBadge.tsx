import React from 'react';
import { OrderStatus } from '../types';

export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case OrderStatus.APPROVED:
        return 'bg-green-100 text-green-700 border-green-200';
      case OrderStatus.REJECTED:
        return 'bg-red-100 text-red-700 border-red-200';
      case OrderStatus.ADJUSTMENT:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case OrderStatus.PENDING:
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStyles()}`}>
      {status}
    </span>
  );
};