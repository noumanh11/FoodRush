export type UserRole = 'user' | 'restaurant' | 'admin';

export interface User {
 id: string;
 email: string;
 name: string;
 role: UserRole;
 phone?: string;
 createdAt: string;
}

export interface Restaurant {
 id: string;
 name: string;
 description?: string;
 cuisine?: string;
 address?: string;
 phone?: string;
 imageUrl?: string;
 isOpen: boolean;
 rating?: number;
 ownerId: string;
 menuItems?: MenuItem[];
 createdAt: string;
}

export interface MenuItem {
 id: string;
 name: string;
 description?: string;
 price: number;
 category?: string;
 imageUrl?: string;
 isAvailable: boolean;
 restaurantId: string;
}

export type OrderStatus =
 | 'pending'
 | 'confirmed'
 | 'preparing'
 | 'ready'
 | 'delivered'
 | 'cancelled';

export interface OrderItem {
 id: string;
 menuItemId: string;
 menuItemName: string;
 quantity: number;
 unitPrice: number;
 subtotal: number;
}

export interface Order {
 id: string;
 status: OrderStatus;
 totalAmount: number;
 deliveryAddress?: string;
 notes?: string;
 userId: string;
 restaurantId: string;
 restaurant?: Restaurant;
 user?: User;
 items: OrderItem[];
 createdAt: string;
 updatedAt: string;
}

export interface CartItem {
 menuItem: MenuItem;
 quantity: number;
}