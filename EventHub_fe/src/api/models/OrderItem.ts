/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Order } from './Order';
import type { Ticket } from './Ticket';
export type OrderItem = {
    id?: number;
    order?: Order;
    ticketTypeId?: number;
    price?: number;
    tickets?: Array<Ticket>;
};

