import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your Spring Boot backend URL
// const BASE_URL = 'http://10.0.2.2:8081/api'; // For Android emulator use 10.0.2.2:8081
const BASE_URL = 'http://192.168.253.61:8081/api'; // For real device, use your computer's IP

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token from AsyncStorage:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, logout user
            try {
                await AsyncStorage.multiRemove(['authToken', 'userData']);
                // You might want to navigate to login screen here
                // This would require navigation reference or using a global state
            } catch (storageError) {
                console.error('Error clearing storage:', storageError);
            }
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
};

// Equipment API calls
export const equipmentAPI = {
    getAll: () => api.get('/equipment'),
    getById: (id) => api.get(`/equipment/${id}`),
    getMyEquipment: () => api.get('/equipment/equipment'),
    // This will send a JSON object, which is what the backend expects
    create: (equipmentData) => api.post('/equipment', equipmentData),
    update: (id, equipmentData) => api.put(`/equipment/${id}`, equipmentData),
    delete: (id) => api.delete(`/equipment/${id}`),
    search: (query) => api.get(`/equipment/search?q=${query}`),
    getByCategory: (category) => api.get(`/equipment/category/${category}`),
    updateAvailability: (data) =>
        api.put('/equipment/available', data),
};

export const bookingAPI = {
    getAll: () => api.get('/bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    getUserBookings: () => api.get('/bookings/user'),

    create: (bookingData) => api.post('/bookings', bookingData),

    updateStatus: (id, status) => api.put(`/bookings/${id}/status?status=${status}`),


    cancel: (id) => api.delete(`/bookings/${id}`),

    getAvailability: (equipmentId, startDate, endDate) =>
        api.get(`/bookings/availability/${equipmentId}?start=${startDate}&end=${endDate}`),
};

// User API calls
export const userAPI = {
    getAllUsers: () => api.get('/users'),
    getUserById: (id) => api.get(`/users/${id}`),
    createUser: (userData) => api.post('/users', userData),
    deleteUser: (id) => api.delete(`/users/${id}`),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (profileData) => api.put('/users/profile', profileData),
};

// File upload API calls
export const uploadAPI = {
    // This correctly sends multipart/form-data
    uploadImage: (formData) => api.post('/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    uploadDocument: (formData) => api.post('/upload/document', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};

// Categories API calls
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    create: (categoryData) => api.post('/categories', categoryData),
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    delete: (id) => api.delete(`/categories/${id}`),
};

export default api;