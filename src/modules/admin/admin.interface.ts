
import { IOrderWithUser, OrderStatus } from '../order/order.interface';
import { IPaginationResult } from '../../shared/interfaces/common.interface';

export interface IUpdateOrderStatusInput {
  orderStatus: OrderStatus;
}

export interface IAdminOrdersResponse extends IPaginationResult<IOrderWithUser> {}

export interface IOrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  totalRevenue: number;
}