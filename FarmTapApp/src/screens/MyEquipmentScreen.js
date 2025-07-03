import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    RefreshControl,
    SafeAreaView,
    Alert,
    Switch,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { equipmentAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

// [CHANGED] The color palette is now based on a clean white and green theme
const COLORS = {
    primary: '#4CAF50',
    primaryLight: '#E8F5E9',
    background: '#f8f9fa',
    card: '#FFFFFF',
    text: '#333333',
    textSecondary: '#6E6E6E',
    danger: '#F44336',
    border: '#e0e0e0',
    white: '#FFFFFF',
    shadow: '#9CA3AF',
};


// --- NO CHANGES TO THESE LOW-LEVEL COMPONENTS ---
const ImagePlaceholder = ({ name, style }) => {
    const getInitials = (name) => {
        if (!name) return '?'; const words = name.split(' ').filter(Boolean);
        if (words.length === 0) return '?'; if (words.length === 1) return words[0][0].toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    };
    return (<View style={[style, styles.imagePlaceholder]}><Text style={styles.initialsText}>{getInitials(name)}</Text></View>);
};

const EquipmentGridItem = React.memo(({ item, onPress, onEdit, onDelete, onAvailabilityChange, isUpdating }) => (
    <View style={styles.card}>
        <TouchableOpacity onPress={onPress} disabled={isUpdating}>
            {item.imageUrl?.trim() ? (<Image source={{ uri: item.imageUrl }} style={styles.cardImage} />) : (<ImagePlaceholder name={item.name} style={styles.cardImage} />)}
            <View style={styles.cardContent}><Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text><View style={styles.cardPriceRow}><Text style={styles.cardPrice}>₹{item.rentalPricePerDay}</Text><Text style={styles.cardPriceUnit}> / day</Text></View></View>
        </TouchableOpacity>
        <View style={styles.cardFooter}><View style={styles.availabilityContainer}><Text style={styles.availabilityLabel}>Available</Text><Switch trackColor={{ false: COLORS.border, true: '#A5D6A7' }} thumbColor={item.isAvailable ? COLORS.primary : '#f4f3f4'} onValueChange={onAvailabilityChange} value={item.isAvailable} disabled={isUpdating} /></View><View style={styles.actionButtonsGroup}><TouchableOpacity style={styles.actionButton} onPress={onEdit} disabled={isUpdating}><Ionicons name="create-outline" size={22} color={COLORS.textSecondary} /></TouchableOpacity><TouchableOpacity style={styles.actionButton} onPress={onDelete} disabled={isUpdating}><Ionicons name="trash-outline" size={22} color={COLORS.danger} /></TouchableOpacity></View></View>
    </View>
));

const ScreenState = ({ icon, title, subtitle }) => (
    <View style={styles.stateContainer}><Ionicons name={icon} size={64} color={COLORS.border} /><Text style={styles.stateTitle}>{title}</Text><Text style={styles.stateSubtitle}>{subtitle}</Text></View>
);
// --- END OF UNCHANGED COMPONENTS ---

// [CHANGED] Dashboard now has a white background with styled stat boxes
const DashboardHeader = ({ itemCount, availableCount }) => (
    <View style={styles.header}>
        <Text style={styles.headerTitle}>My Dashboard</Text>
        <View style={styles.statsContainer}>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Items</Text>
                <Text style={styles.statValue}>{itemCount}</Text>
            </View>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Available Now</Text>
                <Text style={styles.statValue}>{availableCount}</Text>
            </View>
        </View>
    </View>
);

const MyEquipmentScreen = () => {
    // --- NO LOGIC CHANGES ---
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const navigation = useNavigation();

    const fetchMyEquipment = useCallback(async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true); setError(null);
        try {
            const response = await equipmentAPI.getMyEquipment();
            setEquipment(response.data.map(item => ({ ...item, isAvailable: item.isAvailable ?? item.available })));
        } catch (err) {
            console.error("Failed to fetch my equipment:", err);
            setError('Failed to load your equipment.');
        } finally { setLoading(false); }
    }, []);

    useFocusEffect(useCallback(() => { fetchMyEquipment(); }, [fetchMyEquipment]));

    const handleDelete = (equipmentId) => {
        Alert.alert("Delete Equipment", "Are you sure you want to permanently delete this item?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    setUpdatingId(equipmentId);
                    try {
                        await equipmentAPI.delete(equipmentId);
                        setEquipment(current => current.filter(item => item.id !== equipmentId));
                    } catch (apiError) { Alert.alert("Error", "Could not delete the equipment."); }
                    finally { setUpdatingId(null); }
                }
            }
        ]);
    };

    const handleAvailabilityToggle = async (equipmentId, newStatus) => {
        setUpdatingId(equipmentId);
        const original = [...equipment];
        setEquipment(equipment.map(item => item.id === equipmentId ? { ...item, isAvailable: newStatus } : item));
        try {
            await equipmentAPI.updateAvailability({ id: equipmentId, isAvailable: newStatus });
        } catch (apiError) {
            setEquipment(original);
            Alert.alert("Error", "Failed to update status.");
        } finally { setUpdatingId(null); }
    };
    // --- END OF LOGIC SECTION ---

    const renderEquipmentItem = ({ item }) => (
        <EquipmentGridItem
            item={item}
            isUpdating={updatingId === item.id}
            onPress={() => navigation.navigate('EquipmentDetail', { equipmentId: item.id })}
            onEdit={() => navigation.navigate('AddEquipment', { equipmentId: item.id })}
            onDelete={() => handleDelete(item.id)}
            onAvailabilityChange={(newStatus) => handleAvailabilityToggle(item.id, newStatus)}
        />
    );

    const ListHeader = () => (
        <Text style={styles.listHeaderTitle}>Your Equipment</Text>
    );

    if (loading && equipment.length === 0) {
        return <View style={styles.stateContainer}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }
    if (error) {
        return <ScreenState icon="cloud-offline-outline" title="An Error Occurred" subtitle={error} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={equipment}
                renderItem={renderEquipmentItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                ListHeaderComponent={
                    <>
                        <DashboardHeader
                            itemCount={equipment.length}
                            availableCount={equipment.filter(item => item.isAvailable).length}
                        />
                        <ListHeader />
                    </>
                }
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={() => fetchMyEquipment(true)} colors={[COLORS.primary]} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <ScreenState icon="file-tray-stacked-outline" title="No Equipment Yet" subtitle="Tap the '+' button to list your first item." />
                }
            />
            {/* [CHANGED] The FAB is now green with a green shadow */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddEquipment')}>
                <Ionicons name="add" size={30} color={COLORS.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // [CHANGED] Header is now white with a bottom border
    header: {
        backgroundColor: COLORS.white,
        padding: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, gap: 16 },
    // [CHANGED] Stat boxes are now styled for a white background
    statBox: {
        flex: 1,
        alignItems: 'flex-start',
        backgroundColor: COLORS.background,
        padding: 16,
        borderRadius: 12,
    },
    statValue: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
    statLabel: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

    listContainer: { paddingBottom: 100 },
    listHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, paddingHorizontal: 16, marginTop: 24, marginBottom: 8 },

    card: {
        flex: 1, backgroundColor: COLORS.card, borderRadius: 16, margin: 8,
        shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1,
        shadowRadius: 12, elevation: 5,
    },
    cardImage: { width: '100%', aspectRatio: 4 / 3, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: COLORS.primaryLight },
    imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
    initialsText: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, opacity: 0.7 },

    cardContent: { padding: 12 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
    cardPriceRow: { flexDirection: 'row', alignItems: 'baseline' },
    cardPrice: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
    cardPriceUnit: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 3 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, paddingTop: 4, borderTopWidth: 1, borderTopColor: COLORS.border },
    availabilityContainer: { flexDirection: 'row', alignItems: 'center' },
    availabilityLabel: { fontSize: 13, color: COLORS.textSecondary, marginRight: 8 },
    actionButtonsGroup: { flexDirection: 'row' },
    actionButton: { padding: 4, marginLeft: 8 },

    // [CHANGED] FAB is now green with a green shadow
    fab: {
        position: 'absolute', bottom: 30, right: 20, width: 60, height: 60,
        borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center',
        alignItems: 'center', elevation: 10, shadowColor: COLORS.primary,
        shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 5 },
    },

    stateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    stateTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center', marginTop: 16 },
    stateSubtitle: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
});

export default MyEquipmentScreen;