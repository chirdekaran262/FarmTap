// File: src/screens/AddEquipmentScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { equipmentAPI, uploadAPI } from '../services/api';

// Consistent color palette from App.js
const COLORS = {
  primary: '#2E7D32',
  white: '#FFFFFF',
  background: '#F8F9FA',
  text: '#212529',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  placeholder: '#ced4da',
};

// [NEW] A reusable, beautifully styled input component
const FormInput = ({ icon, label, placeholder, value, onChangeText, keyboardType = 'default', multiline = false, numberOfLines = 1 }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  </View>
);

const AddEquipmentScreen = ({ navigation }) => {
  // --- NO LOGIC CHANGES ---
  const [loading, setLoading] = useState(false);
  const [equipmentData, setEquipmentData] = useState({
    name: '', category: '', description: '',
    rentalPricePerDay: '', isAvailable: true, location: '',
  });
  const [image, setImage] = useState(null);

  const handleInputChange = (field, value) => {
    setEquipmentData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 1,
    });
    if (!result.canceled) { setImage(result.assets[0]); }
  };

  const handleSubmit = async () => {
    if (!equipmentData.name.trim() || !equipmentData.description.trim() || !equipmentData.category.trim() || !equipmentData.rentalPricePerDay.trim()) {
      Alert.alert('Error', 'Please fill in all required fields'); return;
    }
    if (isNaN(equipmentData.rentalPricePerDay) || parseFloat(equipmentData.rentalPricePerDay) <= 0) {
      Alert.alert('Error', 'Please enter a valid rental price'); return;
    }
    setLoading(true);
    try {
      let imageUrl = null;
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append('image', {
          uri: image.uri, type: image.type || 'image/jpeg',
          name: image.fileName || `equipment-${Date.now()}.jpg`,
        });
        const uploadResponse = await uploadAPI.uploadImage(imageFormData);
        if (uploadResponse.data && uploadResponse.data.url) {
          imageUrl = uploadResponse.data.url;
        } else { throw new Error("Image uploaded, but no URL was returned."); }
      }
      const finalEquipmentData = {
        ...equipmentData,
        rentalPricePerDay: parseFloat(equipmentData.rentalPricePerDay),
        imageUrl: imageUrl,
      };
      await equipmentAPI.create(finalEquipmentData);
      Alert.alert('Success', 'Equipment listed successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error("Error adding equipment:", error.response?.data || error.message);
      Alert.alert('Error', 'Failed to list equipment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // --- END OF LOGIC SECTION ---

  return (
    <SafeAreaView style={styles.container}>
      {/* [NEW] Beautiful, branded header for the modal */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf-outline" size={24} color={COLORS.white} />
          <Text style={styles.headerTitle}>List New Equipment</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* [NEW] Improved Image Picker UI */}
          <Text style={styles.label}>Equipment Image</Text>
          {image ? (
            <View>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                <Ionicons name="camera-reverse-outline" size={20} color={COLORS.white} />
                <Text style={styles.changeImageButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
              <Text style={styles.imagePickerText}>Tap to upload an image</Text>
            </TouchableOpacity>
          )}

          {/* [NEW] Using the beautiful FormInput component */}
          <FormInput icon="pricetag-outline" label="Equipment Name *" placeholder="e.g., John Deere 5050D Tractor" value={equipmentData.name} onChangeText={(text) => handleInputChange('name', text)} />
          <FormInput icon="apps-outline" label="Category *" placeholder="e.g., Tractor, Harvester" value={equipmentData.category} onChangeText={(text) => handleInputChange('category', text)} />
          <FormInput icon="document-text-outline" label="Description *" placeholder="Include model, condition, and features..." value={equipmentData.description} onChangeText={(text) => handleInputChange('description', text)} multiline numberOfLines={4} />
          <FormInput icon="cash-outline" label="Price per Day (₹) *" placeholder="e.g., 5000" value={equipmentData.rentalPricePerDay} onChangeText={(text) => handleInputChange('rentalPricePerDay', text)} keyboardType="numeric" />
          <FormInput icon="location-outline" label="Location" placeholder="e.g., Pune, Maharashtra" value={equipmentData.location} onChangeText={(text) => handleInputChange('location', text)} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* [NEW] Fixed Footer for the primary action button */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.submitButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitButtonText}>List My Equipment</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.background
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.primary, paddingTop: 50,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white, marginLeft: 8 },
  closeButton: { padding: 4 },

  formContainer: { paddingHorizontal: 20, paddingVertical: 24 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: COLORS.text },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 14 },

  imagePicker: {
    height: 150, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border,
    borderStyle: 'dashed', backgroundColor: COLORS.white, justifyContent: 'center',
    alignItems: 'center', marginBottom: 24,
  },
  imagePickerText: { marginTop: 8, color: COLORS.textSecondary, fontSize: 16 },
  imagePreview: { width: '100%', height: 200, borderRadius: 12, marginBottom: 24 },
  changeImageButton: {
    position: 'absolute', top: 12, right: 12, flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 20, alignItems: 'center',
  },
  changeImageButtonText: { color: COLORS.white, marginLeft: 6, fontWeight: '600', fontSize: 13 },

  footer: {
    padding: 20, backgroundColor: COLORS.white, borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary, borderRadius: 12, padding: 16,
    alignItems: 'center', justifyContent: 'center', height: 55,
  },
  disabledButton: { backgroundColor: '#a5d6a7' },
  submitButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
});

export default AddEquipmentScreen;