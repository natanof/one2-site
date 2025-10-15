// API Service - Handles all API calls to the backend
// Detecta automaticamente se está em desenvolvimento ou produção
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000/api' 
  : '/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let message = 'Ocorreu um erro ao processar sua solicitação';
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        message = data.message || message;
      } else {
        const text = await response.text();
        if (text) message = text;
      }
    } catch {}
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json();
};

// Device Models API
const DeviceModels = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/models${query ? `?${query}` : ''}`);
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/models/${id}`);
    return handleResponse(response);
  },
  
  create: async (modelData) => {
    const response = await fetch(`${API_BASE_URL}/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modelData)
    });
    return handleResponse(response);
  },
  
  update: async (id, modelData) => {
    const response = await fetch(`${API_BASE_URL}/models/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modelData)
    });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/models/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Common Issues API
const CommonIssues = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/common-issues${query ? `?${query}` : ''}`);
    return handleResponse(response);
  },
  
  getByDeviceModel: async (deviceModelId) => {
    const response = await fetch(`${API_BASE_URL}/common-issues/device-model/${deviceModelId}`);
    return handleResponse(response);
  },
  
  create: async (issueData) => {
    const response = await fetch(`${API_BASE_URL}/common-issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData)
    });
    return handleResponse(response);
  },
  
  update: async (id, issueData) => {
    const response = await fetch(`${API_BASE_URL}/common-issues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData)
    });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/common-issues/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Stock API
const Stock = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/stock`);
    return handleResponse(response);
  },
  
  create: async (itemData) => {
    const response = await fetch(`${API_BASE_URL}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    return handleResponse(response);
  },
  
  update: async (id, itemData) => {
    const response = await fetch(`${API_BASE_URL}/stock/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/stock/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Services API
const Services = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/services`);
    return handleResponse(response);
  },
  
  create: async (serviceData) => {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData)
    });
    return handleResponse(response);
  },
  
  update: async (id, serviceData) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData)
    });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Orders API
const Orders = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`);
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    return handleResponse(response);
  },
  
  create: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return handleResponse(response);
  },
  
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Export all API modules
export { DeviceModels, CommonIssues, Stock, Services, Orders };
