import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';
import { AREA_ORDER } from '@/constants/area';
import { CATEGORY_ORDER } from '@/constants/category';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { getCurrentLocation, reverseGeocode, type Coordinates } from '@/lib/location';
import { createReport } from '@/lib/reports';
import { isNonEmpty } from '@/lib/validation';
import { useAuthStore } from '@/store/useAuthStore';
import { colors } from '@/theme';
import type { Area, Category } from '@/types/models';

type FormErrors = {
  title?: string;
  description?: string;
  category?: string;
  area?: string;
};

export default function ReportScreen() {
  const user = useAuthStore((state) => state.user);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);

  const [area, setArea] = useState<Area | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [locationCoords, setLocationCoords] = useState<Coordinates | null>(null);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'submitting'>('idle');
  const [success, setSuccess] = useState(false);

  const busy = phase !== 'idle';

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!isNonEmpty(title)) nextErrors.title = 'Title is required.';
    if (!isNonEmpty(description)) nextErrors.description = 'Description is required.';
    if (!category) nextErrors.category = 'Please select a category.';
    if (!area) nextErrors.area = 'Please select an area.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setSubmitError('Camera access is needed to take a photo. You can enable it in your device settings.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setSubmitError(null);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleChooseFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setSubmitError(
        'Photo library access is needed to choose a photo. You can enable it in your device settings.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setSubmitError(null);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocationError(null);
    setLocating(true);
    try {
      const coords = await getCurrentLocation();
      setLocationCoords(coords);
      const address = await reverseGeocode(coords.lat, coords.lng);
      setLocationAddress(address);
    } catch (error) {
      setLocationCoords(null);
      setLocationAddress(null);
      setLocationError(
        error instanceof Error ? error.message : 'Could not access your location.'
      );
    } finally {
      setLocating(false);
    }
  };

  const handleClearLocation = () => {
    setLocationCoords(null);
    setLocationAddress(null);
    setLocationError(null);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSuccess(false);

    if (!validate() || !category || !area) return;

    if (!user) {
      setSubmitError('You must be signed in to submit a report.');
      return;
    }

    try {
      let imageUrl: string | null = null;

      if (photoUri) {
        setPhase('uploading');
        try {
          imageUrl = await uploadImageToCloudinary(photoUri, user.uid);
        } catch (error) {
          setSubmitError(
            error instanceof Error ? error.message : 'Failed to upload photo. Please try again.'
          );
          return;
        }
      }

      setPhase('submitting');
      await createReport({
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrl,
        location: locationCoords,
        address: locationAddress,
        area,
      });

      setTitle('');
      setDescription('');
      setCategory(null);
      setArea(null);
      setPhotoUri(null);
      setLocationCoords(null);
      setLocationAddress(null);
      setLocationError(null);
      setErrors({});
      setSuccess(true);
    } catch (error) {
      console.error('Failed to submit report:', error);
      setSubmitError('Something went wrong submitting your report. Please try again.');
    } finally {
      setPhase('idle');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-10">
        <Text className="mb-1 mt-4 text-3xl font-bold text-gray-900">Report an issue</Text>
        <Text className="mb-6 text-base text-gray-500">
          Let us know what&apos;s happening in your community.
        </Text>

        {success ? (
          <View className="mb-4 rounded-lg border border-primary/30 bg-primary/10 p-3">
            <Text className="text-sm text-primary">Report submitted. Thank you!</Text>
          </View>
        ) : null}

        {submitError ? (
          <View className="mb-4 rounded-lg border border-error/30 bg-error/10 p-3">
            <Text className="text-sm text-error">{submitError}</Text>
          </View>
        ) : null}

        <Text className="mb-1 text-sm font-medium text-gray-700">Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          maxLength={120}
          placeholder="Short summary, e.g. Pothole on Kairaba Avenue"
          placeholderTextColor={colors.text.placeholder}
          className="mb-1 rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900"
        />
        {errors.title ? (
          <Text className="mb-3 text-sm text-error">{errors.title}</Text>
        ) : (
          <View className="mb-3" />
        )}

        <Text className="mb-1 text-sm font-medium text-gray-700">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          maxLength={2000}
          placeholder="Describe the issue in detail"
          placeholderTextColor={colors.text.placeholder}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="mb-1 min-h-[120px] rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-900"
        />
        {errors.description ? (
          <Text className="mb-3 text-sm text-error">{errors.description}</Text>
        ) : (
          <View className="mb-3" />
        )}

        <Text className="mb-1 text-sm font-medium text-gray-700">Category</Text>
        <Select
          sheetTitle="Select a category"
          options={CATEGORY_ORDER}
          value={category}
          onSelect={setCategory}
          placeholder="Select a category"
          className="mb-1"
        />
        {errors.category ? (
          <Text className="mb-3 text-sm text-error">{errors.category}</Text>
        ) : (
          <View className="mb-3" />
        )}

        <Text className="mb-1 text-sm font-medium text-gray-700">Area</Text>
        <Select
          sheetTitle="Which area is this in?"
          options={AREA_ORDER}
          value={area}
          onSelect={setArea}
          placeholder="Select your area"
          className="mb-1"
        />
        {errors.area ? (
          <Text className="mb-3 text-sm text-error">{errors.area}</Text>
        ) : (
          <View className="mb-3" />
        )}

        <View className="mb-1 flex-row items-center gap-2">
          <Text className="text-sm font-medium text-gray-700">Photo</Text>
          <View className="rounded-full bg-accent/15 px-2 py-0.5">
            <Text className="text-xs font-medium text-accent-dark">Optional</Text>
          </View>
        </View>

        {photoUri ? (
          <View className="mb-3">
            <Image source={{ uri: photoUri }} className="mb-2 h-40 w-full rounded-lg" resizeMode="cover" />
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleTakePhoto}
                className="flex-1 items-center rounded-lg border border-primary px-4 py-2.5">
                <Text className="text-sm font-semibold text-primary">Retake</Text>
              </Pressable>
              <Pressable
                onPress={handleChooseFromGallery}
                className="flex-1 items-center rounded-lg border border-primary px-4 py-2.5">
                <Text className="text-sm font-semibold text-primary">Change</Text>
              </Pressable>
              <Pressable
                onPress={() => setPhotoUri(null)}
                className="flex-1 items-center rounded-lg border border-error px-4 py-2.5">
                <Text className="text-sm font-semibold text-error">Remove</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="mb-3 flex-row gap-3">
            <Pressable
              onPress={handleTakePhoto}
              className="flex-1 items-center rounded-lg border border-primary px-4 py-3">
              <Text className="text-sm font-semibold text-primary">Take Photo</Text>
            </Pressable>
            <Pressable
              onPress={handleChooseFromGallery}
              className="flex-1 items-center rounded-lg border border-primary px-4 py-3">
              <Text className="text-sm font-semibold text-primary">Choose from Gallery</Text>
            </Pressable>
          </View>
        )}

        <View className="mb-1 flex-row items-center gap-2">
          <Text className="text-sm font-medium text-gray-700">Location</Text>
          <View className="rounded-full bg-accent/15 px-2 py-0.5">
            <Text className="text-xs font-medium text-accent-dark">Optional</Text>
          </View>
        </View>

        {locationCoords ? (
          <View className="mb-1 flex-row items-center rounded-lg border border-gray-200 px-4 py-3">
            <Icon name="pin" size={20} color={colors.brand.teal600} />
            <Text className="ml-2 flex-1 text-base text-gray-900" numberOfLines={2}>
              {locationAddress ?? `${locationCoords.lat.toFixed(5)}, ${locationCoords.lng.toFixed(5)}`}
            </Text>
          </View>
        ) : null}

        {locationError ? (
          <Text className="mb-1 text-sm text-error">{locationError}</Text>
        ) : null}

        {locationCoords ? (
          <View className="mb-3 flex-row gap-3">
            <Pressable
              onPress={handleUseCurrentLocation}
              disabled={locating}
              className={`flex-1 items-center rounded-lg border border-primary px-4 py-2.5 ${locating ? 'opacity-60' : ''}`}>
              {locating ? (
                <ActivityIndicator color={colors.brand.teal600} />
              ) : (
                <Text className="text-sm font-semibold text-primary">Refresh</Text>
              )}
            </Pressable>
            <Pressable
              onPress={handleClearLocation}
              disabled={locating}
              className="flex-1 items-center rounded-lg border border-error px-4 py-2.5">
              <Text className="text-sm font-semibold text-error">Clear</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleUseCurrentLocation}
            disabled={locating}
            className={`mb-3 flex-row items-center justify-center rounded-lg border border-primary px-4 py-3 ${locating ? 'opacity-60' : ''}`}>
            {locating ? (
              <>
                <ActivityIndicator color={colors.brand.teal600} />
                <Text className="ml-2 text-sm font-semibold text-primary">
                  Getting your location...
                </Text>
              </>
            ) : (
              <>
                <Icon name="locate" size={18} color={colors.brand.teal600} />
                <Text className="ml-2 text-sm font-semibold text-primary">
                  Use my current location
                </Text>
              </>
            )}
          </Pressable>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={busy}
          className={`mt-4 items-center rounded-lg bg-primary px-4 py-3 ${busy ? 'opacity-60' : ''}`}>
          {busy ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#fff" />
              <Text className="text-base font-semibold text-white">
                {phase === 'uploading' ? 'Uploading photo...' : 'Submitting...'}
              </Text>
            </View>
          ) : (
            <Text className="text-base font-semibold text-white">Submit Report</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
