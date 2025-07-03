// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// We need both authAPI and userAPI, and the main 'api' instance
import { authAPI, userAPI, api } from '../services/api';
import { ActivityIndicator, View } from 'react-native';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // This function remains the same, it correctly initializes the app state
    const checkAuthState = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const userDataString = await AsyncStorage.getItem('userData');

            if (token && userDataString) {
                // If we have a token, set it for all future API calls
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(JSON.parse(userDataString));
            }
        } catch (error) {
            console.error('Failed to load auth state from storage', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthState();
    }, []);


    // --- THIS IS THE MODIFIED LOGIN FUNCTION ---
    const login = async (email, password) => {
        try {
            // Step 1: Call the login endpoint
            const loginResponse = await authAPI.login({ email, password });

            // Step 2: Get the token from the response
            const { token } = loginResponse.data;

            // Validate that we actually got a token
            if (!token) {
                throw new Error('Login successful, but no token received from server.');
            }

            // Step 3 & 4: Store the token and set it for the next API call
            await AsyncStorage.setItem('authToken', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Step 5: Now that we are authenticated, fetch the user's profile
            const profileResponse = await userAPI.getProfile();
            const userData = profileResponse.data;

            // Validate that we got user data
            if (!userData) {
                throw new Error('Authenticated, but failed to fetch user profile.');
            }

            // Step 6 & 7: Store the user data and update the state
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            setUser(userData);

            return { success: true };

        } catch (error) {
            // If anything fails, log the user out completely to be safe
            console.error('Login process failed:', error.response?.data || error.message);
            await logout(); // Clear any partial data (like a token without a user)
            return {
                success: false,
                error: error.response?.data?.message || 'Invalid credentials or server error.',
            };
        }
    };


    const register = async (userData) => {
        // This function is fine as is
        try {
            const response = await authAPI.register(userData);
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Registration error:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed. Please try again.',
            };
        }
    };


    const logout = async () => {
        try {
            // Attempt to log out on the server, but don't block client logout if it fails
            await authAPI.logout().catch(err => console.warn("Server logout failed, but proceeding...", err.message));
        } finally {
            // ALWAYS clear local data and state
            await AsyncStorage.multiRemove(['authToken', 'userData']);
            // Remove the auth header from future requests
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };


    // This part is fine and does not need changes
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const authContextValue = {
        user,
        login,
        register,
        logout,
        isLoading,
        setUser,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};