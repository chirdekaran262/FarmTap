// screens/EquipmentDetailScreen.js

import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image,
    TouchableOpacity, Alert, ActivityIndicator, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Centralized and refined color palette
const COLORS = {
    primary: '#2E7D32', // A richer green
    primaryLight: '#E8F5E9',
    text: '#212529',
    textSecondary: '#6C757D',
    white: '#FFFFFF',
    lightGray: '#F1F3F5',
    border: '#E9ECEF',
    background: '#F8F9FA',
};

// --- NO LOGIC CHANGES IN THIS SECTION ---
const EquipmentDetailScreen = ({ route, navigation }) => {
    const { equipmentId } = route.params || {};
    const { user } = useContext(AuthContext);

    const [equipment, setEquipment] = useState(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerTarget, setDatePickerTarget] = useState('start');

    useEffect(() => {
        if (!equipmentId) {
            Alert.alert("Error", "Equipment ID was not provided.");
            navigation.goBack();
            return;
        }

        const fetchEquipmentDetails = async () => {
            setFetchLoading(true);
            try {
                const response = await api.get(`/equipment/${equipmentId}`);
                setEquipment(response.data);
            } catch (error) {
                console.error("Failed to fetch equipment details:", error.response?.data || error.message);
                Alert.alert("Error", "Could not load equipment details.");
                navigation.goBack();
            } finally {
                setFetchLoading(false);
            }
        };

        fetchEquipmentDetails();
    }, [equipmentId, navigation]);

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (event.type === 'set' && selectedDate) {
            if (datePickerTarget === 'start') {
                setStartDate(selectedDate);
                if (selectedDate >= endDate) {
                    const newEndDate = new Date(selectedDate);
                    newEndDate.setDate(newEndDate.getDate() + 1);
                    setEndDate(newEndDate);
                }
            } else {
                setEndDate(selectedDate);
            }
        }
    };

    const showDatepickerFor = (target) => {
        setDatePickerTarget(target);
        setShowDatePicker(true);
    };

    const minEndDate = useMemo(() => {
        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        return nextDay;
    }, [startDate]);

    const totalBookingDays = useMemo(() => {
        if (endDate > startDate) {
            const diffTime = Math.abs(endDate - startDate);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return 1; // Default to 1 day to show a price
    }, [startDate, endDate]);

    const totalBookingPrice = useMemo(() => {
        return (totalBookingDays * (equipment?.rentalPricePerDay || 0)).toFixed(2);
    }, [totalBookingDays, equipment]);

    const handleCreateBooking = async () => {
        if (endDate <= startDate) {
            Alert.alert("Invalid Dates", "The end date must be after the start date.");
            return;
        }

        const bookingData = {
            equipmentId: equipment.id,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        };

        setBookingLoading(true);
        try {
            await api.post('/bookings', bookingData);
            Alert.alert(
                "Booking Request Sent!",
                "The owner will review your request. You can check the status in 'My Bookings'.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error("Booking creation failed:", error.response?.data || error.message);
            Alert.alert("Booking Failed", "This equipment might be unavailable for the selected dates. Please try again.");
        } finally {
            setBookingLoading(false);
        }
    };

    if (fetchLoading) {
        return <View style={styles.centerContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    if (!equipment) {
        return <View style={styles.centerContainer}><Text>Equipment not found.</Text></View>;
    }

    const isOwner = user?.id === equipment.ownerId;
    // --- END OF UNCHANGED LOGIC ---

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
                <Image
                    source={{ uri: equipment.imageUrl || 'https://via.placeholder.com/400x300.png?text=No+Image' }}
                    style={styles.image}
                />

                <View style={styles.detailsCard}>
                    {/* --- Header Section --- */}
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>{equipment.name}</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.price}>₹{equipment.rentalPricePerDay}</Text>
                            <Text style={styles.priceUnit}>/ day</Text>
                        </View>
                    </View>

                    {/* --- Tags Section --- */}
                    <View style={styles.tagsContainer}>
                        <InfoTag icon="person-circle-outline" text={equipment.ownerName || 'N/A'} />
                        <InfoTag icon="location-outline" text={equipment.location || 'N/A'} />
                        <InfoTag icon="layers-outline" text={equipment.type || 'N/A'} />
                    </View>

                    {/* --- Description Section --- */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{equipment.description}</Text>
                    </View>

                    {/* --- Booking Section (Conditional) --- */}
                    {!isOwner && equipment.isAvailable && (
                        <View style={styles.infoSection}>
                            <Text style={styles.sectionTitle}>Request to Book</Text>
                            <View style={styles.datePickerRow}>
                                <TouchableOpacity onPress={() => showDatepickerFor('start')} style={styles.datePickerInput}>
                                    <Text style={styles.datePickerLabel}>START DATE</Text>
                                    <Text style={styles.datePickerText}>{startDate.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => showDatepickerFor('end')} style={styles.datePickerInput}>
                                    <Text style={styles.datePickerLabel}>END DATE</Text>
                                    <Text style={styles.datePickerText}>{endDate.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.totalPriceContainer}>
                                <View>
                                    <Text style={styles.priceLabel}>Total ({totalBookingDays} day{totalBookingDays > 1 ? 's' : ''})</Text>
                                    <Text style={styles.priceValue}>₹{totalBookingPrice}</Text>
                                </View>
                                <Ionicons name="receipt-outline" size={32} color={COLORS.primary} />
                            </View>
                        </View>
                    )}
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={datePickerTarget === 'start' ? startDate : endDate}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        minimumDate={datePickerTarget === 'end' ? minEndDate : new Date()}
                    />
                )}
            </ScrollView>

            <View style={styles.footer}>
                {isOwner ? (
                    <View style={styles.ownerNotice}><Text style={styles.ownerNoticeText}>This is your equipment.</Text></View>
                ) : !equipment.isAvailable ? (
                    <View style={styles.ownerNotice}><Text style={styles.ownerNoticeText}>Currently unavailable for booking.</Text></View>
                ) : bookingLoading ? (
                    <ActivityIndicator size="large" color={COLORS.white} style={styles.bookButton} />
                ) : (
                    <TouchableOpacity style={styles.bookButton} onPress={handleCreateBooking}>
                        <Text style={styles.bookButtonText}>Confirm Booking Request</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const InfoTag = ({ icon, text }) => (
    <View style={styles.tag}>
        <Ionicons name={icon} size={16} color={COLORS.primary} />
        <Text style={styles.tagText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContentContainer: { paddingBottom: 120 }, // Space for the fixed footer

    image: { width: '100%', height: 300, backgroundColor: COLORS.lightGray },

    detailsCard: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30, // Overlap the image
        paddingTop: 24,
        paddingHorizontal: 20,
    },

    headerSection: {
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
    priceRow: { flexDirection: 'row', alignItems: 'flex-end' },
    price: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary },
    priceUnit: { fontSize: 16, color: COLORS.textSecondary, marginLeft: 5, paddingBottom: 3 },

    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: 20,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 10,
        marginBottom: 10,
    },
    tagText: { marginLeft: 8, fontSize: 14, color: COLORS.primary, fontWeight: '500' },

    infoSection: { marginTop: 10, marginBottom: 20 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
    description: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 26 },

    datePickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    datePickerInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 16,
        flex: 1,
        marginHorizontal: 5,
        backgroundColor: COLORS.background,
    },
    datePickerLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    datePickerText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 6 },

    totalPriceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 12,
        marginTop: 10,
    },
    priceLabel: { fontSize: 16, color: COLORS.primary, fontWeight: '500' },
    priceValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Safe area for iOS
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    bookButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 55,
    },
    bookButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
    ownerNotice: {
        backgroundColor: COLORS.lightGray,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        width: '100%',
        height: 55,
        justifyContent: 'center',
    },
    ownerNoticeText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '500' },
});

export default EquipmentDetailScreen;