import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    RefreshControl, Alert, Platform, Modal, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
// Make sure you import `bookingAPI` from your service file
import { bookingAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const BookingsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = useCallback(async () => {
        try {
            const response = await bookingAPI.getUserBookings();
            setBookings(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch your bookings.');
            console.error('Fetch bookings error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchBookings();
        }, [fetchBookings])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            // Your backend expects uppercase status (e.g., CONFIRMED)
            await bookingAPI.updateStatus(bookingId, newStatus);
            setModalVisible(false);
            Alert.alert('Success', `Booking status updated to ${newStatus.toLowerCase()}.`);
            setLoading(true);
            await fetchBookings();
        } catch (error) {
            Alert.alert('Error', 'Failed to update booking status.');
            console.error('Update status error:', error.response?.data || error.message);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // This now correctly calls the DELETE endpoint via your api service
                            await bookingAPI.cancel(bookingId);
                            setModalVisible(false);
                            Alert.alert('Success', 'Booking cancelled successfully');
                            setLoading(true);
                            await fetchBookings();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel booking.');
                            console.error('Cancel booking error:', error.response?.data || error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleViewDetails = () => {
        if (selectedBooking && selectedBooking.equipment) {
            setModalVisible(false);
            navigation.navigate('EquipmentDetail', {
                equipment: selectedBooking.equipment,
            });
        } else {
            Alert.alert("Error", "Equipment details are not available for this booking.");
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#FF9800'; // Orange
            case 'approved': return '#4CAF50'; // Green
            case 'rejected': return '#F44336'; // Red
            default: return '#757575'; // Gray
        }
    };

    // CORRECTED: Aligned with backend enum
    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'time-outline';
            case 'approved': return 'checkmark-circle-outline';
            case 'rejected': return 'close-circle-outline';
            default: return 'help-circle-outline';
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (selectedTab === 'all') return true;
        return booking.status?.toLowerCase() === selectedTab;
    });

    const handleBookingPress = (booking) => {
        setSelectedBooking(booking);
        setModalVisible(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    const calculateDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : 1;
    };

    const renderBookingItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.bookingCard, { borderLeftColor: getStatusColor(item.status) }]}
            onPress={() => handleBookingPress(item)}
        >
            <View style={styles.bookingHeader}>
                <Text style={styles.equipmentName}>{item.equipment?.name || 'Equipment'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Ionicons
                        name={getStatusIcon(item.status)}
                        size={12}
                        color="#fff"
                        style={styles.statusIcon}
                    />
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="sunny-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                        {calculateDays(item.startDate, item.endDate)} day(s)
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>₹{item.totalPrice?.toFixed(2) || '0.00'}</Text>
                </View>
                {item.farmer && item.equipment?.owner && (
                    <View style={styles.detailRow}>
                        <Ionicons name="people-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>
                            {user?.id === item.equipment.owner.id ? `Rented by: ${item.farmer.name}` : `Owner: ${item.equipment.owner.name}`}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    // CORRECTED: Tabs now match the backend statuses
    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tab, selectedTab === tab && styles.activeTab]}
                    onPress={() => setSelectedTab(tab)}
                >
                    <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderBookingModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Booking Details</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {selectedBooking && (
                        <View style={styles.modalBody}>
                            <Text style={styles.modalEquipmentName}>{selectedBooking.equipment?.name}</Text>
                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalLabel}>Status:</Text>
                                <Text style={[styles.modalValue, { color: getStatusColor(selectedBooking.status) }]}>
                                    {selectedBooking.status}
                                </Text>
                            </View>
                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalLabel}>Duration:</Text>
                                <Text style={styles.modalValue}>
                                    {formatDate(selectedBooking.startDate)} - {formatDate(selectedBooking.endDate)}
                                </Text>
                            </View>
                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalLabel}>Total Price:</Text>
                                <Text style={styles.modalValue}>₹{selectedBooking.totalPrice?.toFixed(2)}</Text>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.actionButton, styles.detailsButton]} onPress={handleViewDetails}>
                                    <Ionicons name="information-circle-outline" size={16} color="#fff" />
                                    <Text style={styles.actionButtonText}>View Equipment</Text>
                                </TouchableOpacity>

                                {/* Owner Actions */}
                                {user?.id === selectedBooking.equipment?.owner?.id && selectedBooking.status?.toUpperCase() === 'PENDING' && (
                                    <>
                                        <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={() => handleStatusUpdate(selectedBooking.id, 'APPROVED')}>
                                            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
                                            <Text style={styles.actionButtonText}>Approve</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleStatusUpdate(selectedBooking.id, 'REJECTED')}>
                                            <Ionicons name="close-circle-outline" size={16} color="#fff" />
                                            <Text style={styles.actionButtonText}>Reject</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {/* Farmer Actions */}
                                {user?.id === selectedBooking.farmer?.id && (selectedBooking.status?.toUpperCase() === 'PENDING' || selectedBooking.status?.toUpperCase() === 'APPROVED') && (
                                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => handleCancelBooking(selectedBooking.id)}>
                                        <Ionicons name="trash-bin-outline" size={16} color="#fff" />
                                        <Text style={styles.actionButtonText}>Cancel My Booking</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Bookings</Text>
            </View>
            {renderTabs()}
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={filteredBookings}
                    renderItem={renderBookingItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16, flexGrow: 1 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="file-tray-stacked-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No bookings found here.</Text>
                        </View>
                    }
                />
            )}
            {renderBookingModal()}
        </View>
    );
};

// Styles remain the same
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingTop: Platform.OS === 'android' ? 25 : 50, // Added Android safe area
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 8, // Adjusted for scrollview
        paddingVertical: 8,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#e9ecef',
    },
    activeTab: {
        backgroundColor: '#4CAF50',
    },
    tabText: {
        fontSize: 14,
        color: '#495057',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: '600',
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: '#4CAF50', // Default color, will be overridden
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    equipmentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusIcon: {
        marginRight: 4,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    bookingDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
        minHeight: 300,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        width: '100%',
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalBody: {
        gap: 15,
    },
    modalEquipmentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    modalLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    modalValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    modalActions: {
        flexDirection: 'column',
        gap: 10,
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 20,
    },
    actionButton: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    detailsButton: {
        backgroundColor: '#2196F3',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#e63946',
    },
    cancelButton: {
        backgroundColor: '#FF9800',
    },
});

export default BookingsScreen;