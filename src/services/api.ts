
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('access_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // If unauthorized, clear tokens and redirect to login
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.reload();
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication API
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Login failed');
    }

    return response.json();
  }

  // Raw Materials API
  async getRawMaterials() {
    return this.request<any[]>('/raw-materials');
  }

  async getRawMaterial(id: string) {
    return this.request<any>(`/raw-materials/${id}`);
  }

  async createRawMaterial(data: any) {
    return this.request<any>('/raw-materials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRawMaterial(id: string, data: any) {
    return this.request<any>(`/raw-materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRawMaterial(id: string) {
    return this.request<void>(`/raw-materials/${id}`, {
      method: 'DELETE',
    });
  }

  async getLowStockMaterials(threshold: number = 3) {
    return this.request<any[]>(`/raw-materials/low-stock/${threshold}`);
  }

  // Items API
  async getItems() {
    return this.request<any[]>('/items');
  }

  async getItem(id: string) {
    return this.request<any>(`/items/${id}`);
  }

  async createItem(data: any) {
    return this.request<any>('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(id: string, data: any) {
    return this.request<any>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: string) {
    return this.request<void>(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  async reduceItemQuantity(id: string, quantity: number) {
    return this.request<any>(`/items/${id}/reduce-quantity`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async getLowStockItems(threshold: number = 10) {
    return this.request<any[]>(`/items/low-stock/${threshold}`);
  }

  // Order Materials API
  async getOrderMaterials() {
    return this.request<any[]>('/order-materials');
  }

  async getOrderMaterial(id: string) {
    return this.request<any>(`/order-materials/${id}`);
  }

  async createOrderMaterial(data: any) {
    return this.request<any>('/order-materials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderMaterial(id: string, data: any) {
    return this.request<any>(`/order-materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrderMaterial(id: string) {
    return this.request<void>(`/order-materials/${id}`, {
      method: 'DELETE',
    });
  }

  async getOrderMaterialsByStatus(status: string) {
    return this.request<any[]>(`/order-materials/status/${status}`);
  }

  // Sales API
  async getSales() {
    console.log('📥 Fetching all sales...');
    const sales = await this.request<any[]>('/sales');
    console.log('📋 Sales received:', JSON.stringify(sales, null, 2));
    return sales;
  }

  async getSale(id: string) {
    console.log('📥 Fetching sale:', id);
    const sale = await this.request<any>(`/sales/${id}`);
    console.log('📋 Sale received:', JSON.stringify(sale, null, 2));
    return sale;
    
  }

  async createSale(data: any) {
    console.log('🚀 Creating sale with data:', JSON.stringify(data, null, 2));
    const sale = await this.request<any>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('✅ Sale created:', JSON.stringify(sale, null, 2));
    return sale;
  }

  async updateSale(id: string, data: any) {
    console.log('🔄 Updating sale with data:', JSON.stringify(data, null, 2));
    const sale = await this.request<any>(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    console.log('✅ Sale updated:', JSON.stringify(sale, null, 2));
    return sale;
  }

  async deleteSale(id: string) {
    return this.request<void>(`/sales/${id}`, {
      method: 'DELETE',
    });
  }

  async getSalesByStatus(status: string) {
    return this.request<any[]>(`/sales/status/${status}`);
  }

  // Order Automation API
  async checkOrderDeliveryStatus(orderId: string) {
    return this.request<any>(`/order-materials/${orderId}/check-delivery`);
  }

  async updateOrderStatusIfDelivered(orderId: string, isDelivered: boolean) {
    return this.request<any>(`/order-materials/${orderId}/update-delivery-status`, {
      method: 'POST',
      body: JSON.stringify({ isDelivered }),
    });
  }

  async processOrderInventory(orderId: string) {
    return this.request<any>(`/order-materials/${orderId}/process-inventory`, {
      method: 'POST',
    });
  }

  async getAutomationLogs(tableNames?: string[], recordId?: string, limit: number = 50) {
    const params = new URLSearchParams();
    if (tableNames && tableNames.length > 0) {
      params.append('tables', tableNames.join(','));
    }
    if (recordId) {
      params.append('recordId', recordId);
    }
    params.append('limit', limit.toString());
    
    return this.request<any[]>(`/automation-logs?${params.toString()}`);
  }

  // Dashboard API
  async getDashboardStats() {
    return this.request<any>('/dashboard/stats');
  }

  async getCategoryDistribution() {
    return this.request<any>('/dashboard/category-distribution');
  }

  async getRecentActivity(limit: number = 10) {
    return this.request<any[]>(`/dashboard/recent-activity?limit=${limit}`);
  }

  async getLowStockData(itemThreshold: number = 10, materialThreshold: number = 3) {
    return this.request<any>(`/dashboard/low-stock?itemThreshold=${itemThreshold}&materialThreshold=${materialThreshold}`);
  }

  async getSalesSummary() {
    return this.request<any>('/dashboard/sales-summary');
  }

  // Tracking API
  async getEstafetaTracking(trackingNumber: string) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${baseUrl}/tracking/${trackingNumber.trim()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getDHLTracking(trackingNumber: string) {
    const dhlApiKey = import.meta.env.VITE_DHL_API_KEY;
    if (!dhlApiKey) {
      throw new Error('DHL API key no configurada');
    }

    const response = await fetch(`VITE_API_DHL_URL=${trackingNumber.trim()}`, {
      headers: {
        'DHL-API-Key': dhlApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getTracking(service: string, trackingNumber: string) {
    switch (service) {
      case 'Estafeta':
        return this.getEstafetaTracking(trackingNumber);
      case 'DHL':
        return this.getDHLTracking(trackingNumber);
      default:
        throw new Error(`Servicio de paquetería no soportado: ${service}`);
    }
  }

  // Extras API
  async getExtras() {
    return this.request<any[]>('/extras');
  }

  async createExtra(data: any) {
    return this.request<any>('/extras', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return this.request<any>('/health');
  }
}

export const apiService = new ApiService();
export default apiService;