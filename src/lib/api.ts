import axios from "axios";

// Base API Configuration for Laravel Backend
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Example API Service methods
export const menuService = {
  getCategories: () => api.get("/categories"),
  getMenus: (categoryId?: string) => api.get("/menus", { params: { category_id: categoryId } }),
};

export const orderService = {
  createOrder: (data: any) => api.post("/orders", data),
  getOrderStatus: (queueNumber: string) => api.get(`/orders/${queueNumber}/status`),
  // Admin methods
  getAllOrders: () => api.get("/admin/orders"),
  updateOrderStatus: (id: string, status: string) => api.patch(`/admin/orders/${id}/status`, { status }),
};
