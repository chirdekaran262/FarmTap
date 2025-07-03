import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    RefreshControl,
    Image,
    Pressable,
    ActivityIndicator,
    SafeAreaView,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

// --- No changes to color palette ---
const COLORS = {
    primary: '#2E7D32',
    primaryLight: '#E8F5E9',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212529',
    textSecondary: '#6B7280',
    white: '#FFFFFF',
    success: '#2E7D32',
    danger: '#C62828',
    border: '#E5E7EB',
};

const HEADER_MAX_HEIGHT = 180;
const HEADER_MIN_HEIGHT = 85;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const EquipmentListScreen = () => {
    // --- NO LOGIC CHANGES ---
    const navigation = useNavigation();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = useContext(AuthContext);
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchEquipment);
        return unsubscribe;
    }, [navigation]);

    const fetchEquipment = async () => {
        if (!refreshing) setLoading(true);
        try {
            const response = await api.get('/equipment');
            setEquipment(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch equipment.');
        } finally {
            setLoading(false); setRefreshing(false);
        }
    };
    const onRefresh = () => {
        setRefreshing(true); fetchEquipment();
    };
    // --- END OF UNCHANGED LOGIC ---

    const DetailItem = ({ iconName, text }) => (
        <View style={styles.detailItem}>
            <Ionicons name={iconName} size={16} color={COLORS.primary} />
            <Text style={styles.detailText} numberOfLines={1}>{text}</Text>
        </View>
    );

    const renderEquipmentItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('EquipmentDetail', { equipmentId: item.id })}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x200.png?text=No+Image' }}
                style={styles.cardImage}
            />
            <View style={styles.statusBadgeContainer}>
                <View style={[styles.statusBadge, { backgroundColor: item.isAvailable ? COLORS.success : COLORS.danger }]}>
                    <Text style={styles.statusBadgeText}>{item.isAvailable ? 'Available' : 'Booked'}</Text>
                </View>
            </View>
            {/* [FIXED] Alignment inside the card is now perfect */}
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.cardPriceAmount}>₹{item.rentalPricePerDay}</Text>
                    <Text style={styles.cardPriceUnit}>/day</Text>
                </View>
                <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.detailsContainer}>
                    <DetailItem iconName="location-outline" text={item.location || 'N/A'} />
                    <DetailItem iconName="person-circle-outline" text={item.ownerName || 'N/A'} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });
    const largeTitleOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
    const largeTitleTranslateY = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [0, -40],
        extrapolate: 'clamp',
    });

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Fetching Equipment...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <View style={styles.smallHeader}>
                    <Text style={styles.smallHeaderTitle}>Explore</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
                        <Ionicons name="person-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
                <Animated.View style={[styles.largeHeader, { opacity: largeTitleOpacity, transform: [{ translateY: largeTitleTranslateY }] }]}>
                    <Text style={styles.greetingText}>Hi, {user?.name || 'Farmer'}!</Text>
                    <Text style={styles.subtitleText}>Find the best farm equipment for your needs.</Text>
                </Animated.View>
            </Animated.View>

            <FlatList
                data={equipment}
                renderItem={renderEquipmentItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT, paddingBottom: 100, paddingHorizontal: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} progressViewOffset={HEADER_MAX_HEIGHT} />}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="leaf-outline" size={60} color={COLORS.border} />
                        <Text style={styles.emptyText}>No equipment found.</Text>
                    </View>
                )}
            />

            {user?.authorities?.some(auth => auth.authority === 'Owner') && (
                <Pressable
                    onPress={() => navigation.navigate('AddEquipment')}
                    style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
                >
                    <Ionicons name="add" size={30} color={COLORS.white} />
                </Pressable>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: COLORS.textSecondary },

    header: {
        position: 'absolute', top: 0, left: 0, right: 0,
        zIndex: 1, paddingHorizontal: 20,
        backgroundColor: COLORS.white,
        // [IMPROVED] Curved bottom edge with a shadow for a modern look
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    smallHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        height: HEADER_MIN_HEIGHT, paddingTop: 15,
    },
    smallHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
    profileButton: {
        backgroundColor: COLORS.primaryLight,
        padding: 8,
        borderRadius: 20,
    },
    largeHeader: { position: 'absolute', top: HEADER_MIN_HEIGHT - 10, left: 20, right: 20 },
    greetingText: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
    subtitleText: { fontSize: 16, color: COLORS.textSecondary, marginTop: 4 },

    card: {
        backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 20,
        shadowColor: '#959DA5', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1, shadowRadius: 15, elevation: 8,
        borderWidth: 1, borderColor: COLORS.border,
    },
    cardImage: { width: '100%', height: 200, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
    statusBadgeContainer: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
    statusBadge: {
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, elevation: 5,
    },
    statusBadgeText: { color: COLORS.white, fontSize: 13, fontWeight: 'bold' },
    cardContent: { paddingHorizontal: 16, paddingVertical: 12 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
    priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
    cardPriceAmount: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
    cardPriceUnit: { fontSize: 15, color: COLORS.textSecondary, marginLeft: 4 },
    cardDescription: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 16 },
    detailsContainer: {
        borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12,
        flexDirection: 'row',
    },
    // [FIXED] Alignment for detail items
    detailItem: {
        flex: 1, // Each item takes up equal space
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8, // Add some space between items
    },
    detailText: { fontSize: 14, color: COLORS.text, marginLeft: 8, flexShrink: 1 },

    fab: {
        position: 'absolute', bottom: 30, right: 20, width: 60, height: 60,
        borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center',
        alignItems: 'center', elevation: 8, shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4,
    },
    fabPressed: { backgroundColor: '#1B5E20' }, // Darker green for pressed state
    emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
    emptyText: { marginTop: 16, fontSize: 18, fontWeight: '600', color: COLORS.textSecondary },
});

export default EquipmentListScreen;