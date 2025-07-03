import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons'; // <-- Import icons

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        aadharNumber: '',
        villageName: '',
        district: '',
        state: '',
        pincode: '',
        role: '',
        profileImageUrl: '',
    });
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRegister = async () => {
        // Basic validation (no logic change)
        const requiredFields = ['name', 'email', 'password', 'phoneNumber', 'role'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            Alert.alert('Error', `Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        if (formData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        const result = await register(formData);
        setLoading(false);

        if (result.success) {
            Alert.alert('Success', result.message, [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } else {
            Alert.alert('Registration Failed', result.error);
        }
    };

    // Helper component for cleaner JSX
    const InputField = ({ iconName, placeholder, value, onChangeText, keyboardType, secureTextEntry }) => (
        <View style={styles.inputContainer}>
            <Icon name={iconName} size={20} color="#888" style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#999"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
            />
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create an Account</Text>
                    <Text style={styles.subtitle}>Let's get you started with FarmTap.</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    <InputField iconName="person-outline" placeholder="Full Name *" value={formData.name} onChangeText={(v) => handleInputChange('name', v)} />
                    <InputField iconName="mail-outline" placeholder="Email *" value={formData.email} onChangeText={(v) => handleInputChange('email', v)} keyboardType="email-address" />
                    <InputField iconName="lock-closed-outline" placeholder="Password *" value={formData.password} onChangeText={(v) => handleInputChange('password', v)} secureTextEntry />
                    <InputField iconName="call-outline" placeholder="Phone Number *" value={formData.phoneNumber} onChangeText={(v) => handleInputChange('phoneNumber', v)} keyboardType="phone-pad" />

                    <View style={styles.pickerInputContainer}>
                        <Icon name="person-circle-outline" size={20} color="#888" style={styles.inputIcon} />
                        <RNPickerSelect
                            placeholder={{ label: "Select Your Role *", value: null, color: '#999' }}
                            items={[
                                { label: 'Farmer', value: 'Farmer' },
                                { label: 'Equipment Owner', value: 'Owner' },
                            ]}
                            onValueChange={(value) => handleInputChange('role', value)}
                            style={pickerSelectStyles}
                            value={formData.role}
                            useNativeAndroidPickerStyle={false} // Important for custom styling on Android
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Address Details (Optional)</Text>
                    <InputField iconName="card-outline" placeholder="Aadhar Number" value={formData.aadharNumber} onChangeText={(v) => handleInputChange('aadharNumber', v)} keyboardType="numeric" />
                    <InputField iconName="home-outline" placeholder="Village Name" value={formData.villageName} onChangeText={(v) => handleInputChange('villageName', v)} />
                    <InputField iconName="map-outline" placeholder="District" value={formData.district} onChangeText={(v) => handleInputChange('district', v)} />
                    <InputField iconName="location-outline" placeholder="State" value={formData.state} onChangeText={(v) => handleInputChange('state', v)} />
                    <InputField iconName="navigate-outline" placeholder="Pincode" value={formData.pincode} onChangeText={(v) => handleInputChange('pincode', v)} keyboardType="numeric" />


                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.registerButtonText}>Register</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => !loading && navigation.navigate('Login')}
                    >
                        <Text style={styles.loginLinkText}>
                            Already have an account? <Text style={{ fontWeight: 'bold' }}>Log In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA', // A softer background color
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2E7D32', // A darker, richer green
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    formContainer: {
        marginHorizontal: 20,
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F8FA',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    pickerInputContainer: { // Style for the picker to match inputs
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F8FA',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 50,
    },
    registerButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 25,
        alignItems: 'center',
    },
    loginLinkText: {
        color: '#555',
        fontSize: 15,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 12, // Ensure it aligns vertically
    },
    inputAndroid: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    placeholder: {
        color: '#999',
    },
    iconContainer: { // Style for the dropdown arrow
        top: 20,
        right: 15,
    },
});

export default RegisterScreen;