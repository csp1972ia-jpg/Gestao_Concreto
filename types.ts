export enum UserRole {
  ADMIN = 'ADMIN',
  CONSULTANT = 'CONSULTANT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export enum OrderStatus {
  PENDING = 'PENDENTE',
  APPROVED = 'APROVADO',
  REJECTED = 'REPROVADO',
  ADJUSTMENT = 'AJUSTE PENDENTE'
}

export interface Branch {
  id: string;
  name: string;
  trucks: number;
  goalPerTruck: number;
}

export interface Order {
  id: string;
  requestDate: string; // ISO Date
  requestTime: string;
  clientName: string;
  contactName: string;
  phone: string;
  branchId: string;
  volume: number;
  dischargeType: 'BOMBEADO' | 'CONVENCIONAL';
  pump: string;
  partnerPump: string;
  concreteDate: string; // Data Concretagem
  observation: string;
  consultantId: string;
  consultantName: string;
  fck: string;
  contract: string;
  status: OrderStatus;
  adminNote?: string;
  history: OrderHistory[];
}

export interface OrderHistory {
  date: string;
  action: string;
  user: string;
}

export interface DashboardMetrics {
  totalVolume: number;
  approvedCount: number;
  pendingCount: number;
  volumeByBranch: { name: string; value: number }[];
  statusDistribution: { name: string; value: number }[];
}