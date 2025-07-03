import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../services/api';

// Reusable component for displaying information rows.
const InfoRow = ({ icon, label, value, editable, onChangeText, keyboardType = 'default' }) => (
    <View style={styles.infoRow}>
        <Ionicons name={icon} size={22} color="#6C757D" style={styles.icon} />
        <View style={styles.infoTextContainer}>
            <Text style={styles.label}>{label}</Text>
            {editable ? (
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    placeholder={label}
                    placeholderTextColor="#ADB5BD"
                />
            ) : (
                <Text style={styles.valueText}>{value || 'Not set'}</Text>
            )}
        </View>
    </View>
);

// Reusable component for displaying the user's role badge.
const RoleBadge = ({ roles }) => {
    // This logic is for display purposes and uses the 'roles' array.
    const isOwner = roles?.some(role => role.toUpperCase().includes('OWNER'));
    const primaryRole = isOwner ? 'Owner' : roles?.includes('Renter') ? 'Renter' : null;

    if (!primaryRole) return null;

    return (
        <View style={[styles.roleBadge, primaryRole === 'Owner' ? styles.ownerBadge : styles.renterBadge]}>
            <Text style={styles.roleText}>{primaryRole}</Text>
        </View>
    );
};

const ProfileScreen = () => {
    const { user, setUser, logout } = useContext(AuthContext);
    const navigation = useNavigation();

    const [isEditing, setIsEditing] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [profile, setProfile] = useState(user || {});
    const [editedProfile, setEditedProfile] = useState(user || {});

    // [CORRECTED] Reverted to your original logic for determining owner status.
    // This is used for controlling access to features like the Owner Dashboard.
    const isOwner = user?.authorities?.some(auth => auth.authority === 'Owner');

    const fetchProfile = async () => {
        setIsFetching(true);
        try {
            const response = await userAPI.getProfile();
            const data = response.data;
            setUser(data);
            setProfile(data);
            setEditedProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'Could not load your profile data.');
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchProfile);
        return unsubscribe;
    }, [navigation]);

    const handleInputChange = (field, value) => {
        setEditedProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedProfile(profile);
        }
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await userAPI.updateProfile(editedProfile);
            const updatedData = response.data;
            setUser(updatedData);
            setProfile(updatedData);
            Alert.alert('Success', 'Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    if (isFetching) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loaderText}>Loading Profile...</Text>
            </View>
        );
    }

    const displayData = isEditing ? editedProfile : profile;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-outline" size={48} color="#2E7D32" />
                    </View>
                    <Text style={styles.userName}>{displayData.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{displayData.email}</Text>
                    {/* The RoleBadge uses the `roles` array for display, as per original design */}
                    <RoleBadge roles={user?.roles} />
                </View>

                <View style={styles.cardsContainer}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardTitleContainer}>
                                <Ionicons name="person-circle-outline" size={20} color="#2E7D32" />
                                <Text style={styles.cardTitle}>Personal Information</Text>
                            </View>
                            <TouchableOpacity onPress={handleEditToggle} style={styles.editButton}>
                                <Ionicons name={isEditing ? 'close-outline' : 'create-outline'} size={24} color="#2E7D32" />
                            </TouchableOpacity>
                        </View>
                        <InfoRow icon="person-outline" label="Full Name" value={displayData.name} editable={isEditing} onChangeText={text => handleInputChange('name', text)} />
                        <InfoRow icon="mail-outline" label="Email Address" value={displayData.email} editable={false} />
                        <InfoRow icon="call-outline" label="Phone Number" value={displayData.phoneNumber} editable={isEditing} onChangeText={text => handleInputChange('phoneNumber', text)} keyboardType="phone-pad" />
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardTitleContainer}>
                                <Ionicons name="location-outline" size={20} color="#2E7D32" />
                                <Text style={styles.cardTitle}>Address Details</Text>
                            </View>
                        </View>
                        <InfoRow icon="home-outline" label="Village Name" value={displayData.villageName} editable={isEditing} onChangeText={text => handleInputChange('villageName', text)} />
                        <InfoRow icon="map-outline" label="District" value={displayData.district} editable={isEditing} onChangeText={text => handleInputChange('district', text)} />
                        <InfoRow icon="business-outline" label="State" value={displayData.state} editable={isEditing} onChangeText={text => handleInputChange('state', text)} />
                        <InfoRow icon="location-outline" label="Pincode" value={displayData.pincode} editable={isEditing} onChangeText={text => handleInputChange('pincode', text)} keyboardType="number-pad" />
                    </View>

                    {/* This conditional rendering now correctly uses your original logic */}
                    {isOwner && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardTitleContainer}>
                                    <Ionicons name="construct-outline" size={20} color="#2E7D32" />
                                    <Text style={styles.cardTitle}>Owner Dashboard</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('MyEquipment')}>
                                <View style={styles.menuButtonContent}>
                                    <Ionicons name="build-outline" size={20} color="#2E7D32" />
                                    <Text style={styles.menuButtonText}>My Listed Equipment</Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" size={20} color="#ADB5BD" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('AddEquipment')}>
                                <View style={styles.menuButtonContent}>
                                    <Ionicons name="add-circle-outline" size={20} color="#2E7D32" />
                                    <Text style={styles.menuButtonText}>Add New Equipment</Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" size={20} color="#ADB5BD" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.actionsContainer}>
                    {isEditing && (
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
                            {isSaving ? <ActivityIndicator color="white" /> : (
                                <>
                                    <Ionicons name="save-outline" size={20} color="white" />
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContainer: { paddingBottom: 40 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
    loaderText: { marginTop: 15, fontSize: 16, color: '#6C757D' },

    profileHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 60,
        backgroundColor: '#2E7D32',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 4,
        borderColor: '#A5D6A7',
        elevation: 5,
    },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
    userEmail: { fontSize: 14, color: '#D0F0C0', marginTop: 4 },

    roleBadge: { marginTop: 16, paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20 },
    ownerBadge: { backgroundColor: '#FFF8E1', borderColor: '#FFB300', borderWidth: 1 },
    renterBadge: { backgroundColor: '#E1F5FE', borderColor: '#039BE5', borderWidth: 1 },
    roleText: { color: '#333', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },

    cardsContainer: {
        marginTop: -30,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
        paddingBottom: 10,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#37474F', marginLeft: 8 },
    editButton: { padding: 6, borderRadius: 20, backgroundColor: '#E8F5E9' },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.8,
        borderColor: '#E9ECEF',
    },
    icon: { marginRight: 16, width: 22, textAlign: 'center' },
    infoTextContainer: { flex: 1 },
    label: { fontSize: 12, color: '#6C757D', marginBottom: 4 },
    valueText: { fontSize: 16, fontWeight: '500', color: '#37474F' },
    input: { fontSize: 16, color: '#212529', paddingVertical: 4, borderBottomWidth: 1.5, borderBottomColor: '#2E7D32' },

    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 0.8,
        borderColor: '#E9ECEF',
    },
    menuButtonContent: { flexDirection: 'row', alignItems: 'center' },
    menuButtonText: { fontSize: 16, color: '#37474F', marginLeft: 16, fontWeight: '500' },

    actionsContainer: { paddingHorizontal: 16, marginTop: 10 },
    saveButton: {
        backgroundColor: '#388E3C',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 25,
        marginBottom: 12,
        elevation: 2,
    },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 25,
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    logoutText: { color: '#D32F2F', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
});

export default ProfileScreen;