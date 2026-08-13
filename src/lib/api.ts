import axios from "axios";
import { getApiUrl } from "./utils";

// Base API Configuration for Laravel Backend
export const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// API Service methods
export const menuService = {
  getMenus: (isAdmin?: boolean) => api.get("/menus", { params: isAdmin ? { admin: true } : {} }),
};

export const orderService = {
  createOrder: (data: { items: Array<{ menu_id: string | number; qty: number; notes?: string }>; customer_name?: string; payment_method?: string }) => 
    api.post("/checkout", data),
  getAllOrders: () => api.get("/orders"),
  updateOrderStatus: (id: number, status: string) => api.put(`/orders/${id}/status`, { status }),
};
