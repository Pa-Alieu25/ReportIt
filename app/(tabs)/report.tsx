import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CategoryTile } from '@/components/ui/CategoryTile';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { InlineMessage } from '@/components/ui/InlineMessage';
import { Input, TextArea } from '@/components/ui/Input';
import { OfflineBanner, useIsOffline } from '@/components/ui/OfflineBanner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Select } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { AREA_ORDER } from '@/constants/area';
import { CATEGORY_META, CATEGORY_ORDER, isCategory } from '@/constants/category';
import { suggestLocation } from '@/constants/locations';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { getCurrentLocation, reverseGeocode, type Coordinates } from '@/lib/location';
import { preparePhotoForUpload } from '@/lib/photos';
import { createReport } from '@/lib/reports';
import { isNonEmpty } from '@/lib/validation';
import { useAuthStore } from '@/store/useAuthStore';
import { colors, radius } from '@/theme';
import type { Area, Category } from '@/types/models';

type Step = 'form' | 'review' | 'success';
type Photo = { uri: string; width?: number; height?: number };
type FormErrors = { category?: string; area?: string; title?: string; description?: string };
type Phase = 'idle' | 'preparing' | 'uploading' | 'saving';

const CATEGORY_ROWS = [CATEGORY_ORDER.slice(0, 3), CATEGORY_ORDER.slice(3, 6), CATEGORY_ORDER.slice(6, 9)];

function Section({
  number,
  title,
  optional,
  children,
}: {
  number: number;
  title: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <View className="mb-7">
      <View className="mb-3 flex-row items-center">
        <View
          className="items-center justify-center rounded-full"
          style={{ width: 26, height: 26, backgroundColor: colors.brand.green800 }}>
          <Text variant="caption" weight="bold" color="inverse">
            {number}
          </Text>
        </View>
        <Text variant="h3" className="ml-2 flex-1" accessibilityRole="header">
          {title}
        </Text>
        {optional ? (
          <Text variant="caption" color="muted">
            Optional
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function SummaryRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View className="flex-row items-start py-2.5">
      <Icon name={icon} size={20} color={colors.brand.teal600} />
      <View className="ml-3 flex-1">
        <Text variant="caption" color="muted">
          {label}
        </Text>
        <Text>{value}</Text>
      </View>
    </View>
  );
}

const NEXT_STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'council',
    title: 'Your report is received',
    body: 'It goes to the team responsible for this kind of problem in your area.',
  },
  {
    icon: 'in-progress',
    title: 'They review and act',
    body: 'You will see the status change as work is planned and carried out.',
  },
  {
    icon: 'bell',
    title: "We'll keep you updated",
    body: 'You get a notification each time the status changes.',
  },
];

export default function ReportScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const offline = useIsOffline();
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState<Step>('form');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [areaSuggested, setAreaSuggested] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [nearTown, setNearTown] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<{ tone: 'error' | 'warning'; text: string } | null>(
    null
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdId, setCreatedId] = useState<string | null>(null);

  // Home's "Popular issues" tiles open this tab with ?category=…&nonce=….
  // The nonce makes a repeat tap re-apply, even after a manual change.
  // Adjusting state during render (not in an effect) avoids a flash.
  const params = useLocalSearchParams<{ category?: string; nonce?: string }>();
  const [appliedNonce, setAppliedNonce] = useState<string | undefined>(undefined);
  if (params.nonce && params.nonce !== appliedNonce) {
    setAppliedNonce(params.nonce);
    if (isCategory(params.category)) setCategory(params.category);
    if (step === 'success') setStep('form');
  }

  const busy = phase !== 'idle';
  const locationLabel = address ?? (nearTown ? `Near ${nearTown}` : null);

  const resetForm = () => {
    setPhoto(null);
    setCategory(null);
    setArea(null);
    setAreaSuggested(false);
    setTitle('');
    setDescription('');
    setCoords(null);
    setAddress(null);
    setNearTown(null);
    setLocationNote(null);
    setErrors({});
    setNotice(null);
    setSubmitError(null);
    setUploadProgress(0);
    setCreatedId(null);
    setStep('form');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const pickPhoto = async (source: 'camera' | 'library') => {
    setNotice(null);
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setNotice(
        source === 'camera'
          ? 'ReportIT needs camera access to take a photo. You can allow it in your phone settings.'
          : 'ReportIT needs photo access to choose a picture. You can allow it in your phone settings.'
      );
      return;
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    const asset = !result.canceled ? result.assets[0] : null;
    if (asset) setPhoto({ uri: asset.uri, width: asset.width, height: asset.height });
  };

  const addCurrentLocation = async () => {
    setLocationNote(null);
    setLocating(true);
    try {
      const position = await getCurrentLocation();
      setCoords(position);
      const suggestion = suggestLocation(position.lat, position.lng);
      if (suggestion) {
        setArea(suggestion.area);
        setAreaSuggested(true);
        setNearTown(suggestion.km < 8 ? suggestion.town : null);
        setErrors((e) => ({ ...e, area: undefined }));
      } else {
        setNearTown(null);
        setLocationNote({
          tone: 'warning',
          text: "You seem to be outside The Gambia, so this report won't appear on the map. Choose the area below.",
        });
      }
      setAddress(await reverseGeocode(position.lat, position.lng));
    } catch (error) {
      setCoords(null);
      setAddress(null);
      setLocationNote({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not find your location. Choose the area below.',
      });
    } finally {
      setLocating(false);
    }
  };

  const clearLocation = () => {
    setCoords(null);
    setAddress(null);
    setNearTown(null);
    setLocationNote(null);
    if (areaSuggested) {
      setArea(null);
      setAreaSuggested(false);
    }
  };

  const goToReview = () => {
    const next: FormErrors = {};
    if (!category) next.category = 'Choose the kind of problem.';
    if (!area) next.area = 'Choose the area where the problem is.';
    if (!isNonEmpty(title)) next.title = 'Give your report a short title.';
    if (!isNonEmpty(description)) next.description = 'Tell us a little more about the problem.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setNotice('Please fill in the highlighted details.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setNotice(null);
    setSubmitError(null);
    setStep('review');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const submit = async () => {
    if (!user || !category || !area) return;
    setSubmitError(null);
    // Tracked locally: the `phase` state in this closure would be stale.
    let stage: Phase = 'idle';
    const enter = (next: Phase) => {
      stage = next;
      setPhase(next);
    };

    try {
      let imageUrl: string | null = null;
      if (photo) {
        enter('preparing');
        const uploadUri = await preparePhotoForUpload(photo);
        enter('uploading');
        setUploadProgress(0);
        imageUrl = await uploadImageToCloudinary(uploadUri, user.uid, setUploadProgress);
      }

      enter('saving');
      const id = await createReport({
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrl,
        location: coords,
        address: locationLabel,
        area,
      });
      setCreatedId(id);
      setStep('success');
    } catch (error) {
      console.error('Failed to submit report:', error);
      setSubmitError(
        (stage as Phase) === 'uploading' && error instanceof Error
          ? error.message
          : "We couldn't send your report. Check your connection and try again."
      );
    } finally {
      setPhase('idle');
    }
  };

  // ---------- Success ----------
  if (step === 'success') {
    return (
      <Screen>
        <ScrollView contentContainerClassName="flex-grow px-6 pb-10 pt-10">
          <View className="items-center">
            <View
              className="items-center justify-center rounded-full"
              style={{ width: 96, height: 96, backgroundColor: colors.status.Resolved.bg }}>
              <Icon name="success" size={52} color={colors.status.Resolved.fg} />
            </View>
            <Text variant="h1" align="center" className="mt-5" accessibilityRole="header">
              Report sent. Thank you!
            </Text>
            <Text color="muted" align="center" className="mt-2">
              You&apos;ve helped make your community better.
            </Text>
          </View>

          <Card className="mt-8">
            <Text variant="h3" className="mb-2">
              What happens next
            </Text>
            {NEXT_STEPS.map((item) => (
              <View key={item.title} className="flex-row items-start py-2.5">
                <View
                  className="items-center justify-center"
                  style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.brand.teal50 }}>
                  <Icon name={item.icon} size={22} color={colors.brand.teal600} />
                </View>
                <View className="ml-3 flex-1">
                  <Text weight="semibold">{item.title}</Text>
                  <Text variant="label" weight="regular" color="muted">
                    {item.body}
                  </Text>
                </View>
              </View>
            ))}
          </Card>

          <View className="mt-8 gap-3">
            {createdId ? (
              <Button
                label="View my report"
                size="lg"
                onPress={() => {
                  const id = createdId;
                  resetForm();
                  router.push(`/report/${id}`);
                }}
              />
            ) : null}
            <Button label="Report another problem" variant="secondary" onPress={resetForm} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  const meta = category ? CATEGORY_META[category] : null;

  return (
    <Screen>
      <ScreenHeader
        title={step === 'form' ? 'Report a problem' : 'Check your report'}
        subtitle={step === 'form' ? 'It takes less than a minute.' : 'Make sure everything looks right.'}
        right={
          step === 'review' && !busy ? (
            <IconButton icon="edit" accessibilityLabel="Edit report" onPress={() => setStep('form')} />
          ) : null
        }
      />
      <OfflineBanner />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-2"
          keyboardShouldPersistTaps="handled">
          {step === 'form' ? (
            <>
              {notice ? <InlineMessage tone="warning" message={notice} className="mb-5" /> : null}

              <Section number={1} title="Add a photo" optional>
                {photo ? (
                  <View>
                    <Image
                      source={{ uri: photo.uri }}
                      style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg }}
                      contentFit="cover"
                      accessibilityLabel="Your photo of the problem"
                    />
                    <View className="mt-3 flex-row gap-3">
                      <View className="flex-1">
                        <Button
                          label="Retake"
                          icon="camera"
                          variant="secondary"
                          onPress={() => pickPhoto('camera')}
                        />
                      </View>
                      <View className="flex-1">
                        <Button label="Remove" icon="close" variant="danger" onPress={() => setPhoto(null)} />
                      </View>
                    </View>
                  </View>
                ) : (
                  <Card padding={20} className="items-center">
                    <View
                      className="items-center justify-center"
                      style={{ width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.brand.teal50 }}>
                      <Icon name="camera" size={28} color={colors.brand.teal600} />
                    </View>
                    <Text align="center" color="secondary" className="mb-4 mt-3">
                      A clear photo helps the council understand and fix the problem faster.
                    </Text>
                    <Button label="Take a photo" icon="camera" haptic onPress={() => pickPhoto('camera')} />
                    <Button
                      label="Choose from gallery"
                      icon="photo"
                      variant="ghost"
                      className="mt-2"
                      onPress={() => pickPhoto('library')}
                    />
                  </Card>
                )}
              </Section>

              <Section number={2} title="What's the problem?">
                <View className="gap-3">
                  {CATEGORY_ROWS.map((row) => (
                    <View key={row.join()} className="flex-row gap-3">
                      {row.map((option) => (
                        <CategoryTile
                          key={option}
                          category={option}
                          selected={category === option}
                          onPress={() => {
                            setCategory(option);
                            setErrors((e) => ({ ...e, category: undefined }));
                          }}
                        />
                      ))}
                    </View>
                  ))}
                </View>
                {errors.category ? (
                  <Text variant="caption" className="mt-2" style={{ color: colors.feedback.error.fg }}>
                    {errors.category}
                  </Text>
                ) : category ? (
                  <Text variant="caption" color="muted" className="mt-2">
                    Selected: {category}
                  </Text>
                ) : null}
              </Section>

              <Section number={3} title="Where is it?">
                {coords ? (
                  <Card padding={14} className="mb-3 flex-row items-center">
                    <Icon name="pin" size={22} color={colors.brand.teal600} />
                    <View className="ml-3 flex-1">
                      <Text weight="medium" numberOfLines={2}>
                        {locationLabel ?? 'Location added'}
                      </Text>
                      <Text variant="caption" color="muted">
                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                      </Text>
                    </View>
                    <IconButton icon="close" accessibilityLabel="Remove location" onPress={clearLocation} />
                  </Card>
                ) : (
                  <Button
                    label="Use my current location"
                    icon="locate"
                    variant="secondary"
                    loading={locating}
                    loadingLabel="Finding you…"
                    onPress={addCurrentLocation}
                    className="mb-3"
                  />
                )}
                {locationNote ? (
                  <InlineMessage tone={locationNote.tone} message={locationNote.text} className="mb-3" />
                ) : null}
                <Select
                  label="Area"
                  sheetTitle="Which area is this in?"
                  options={AREA_ORDER}
                  value={area}
                  onSelect={(value) => {
                    setArea(value);
                    setAreaSuggested(false);
                    setErrors((e) => ({ ...e, area: undefined }));
                  }}
                  placeholder="Choose the area"
                  error={errors.area}
                />
                {areaSuggested && !errors.area ? (
                  <Text variant="caption" color="muted" className="mt-1.5">
                    Filled in from your location. Change it if it&apos;s not right.
                  </Text>
                ) : null}
              </Section>

              <Section number={4} title="Describe it">
                <Input
                  label="Title"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
                  }}
                  error={errors.title}
                  maxLength={120}
                  placeholder={
                    meta ? `e.g. ${meta.shortLabel} problem on Kairaba Avenue` : 'e.g. Pothole on Kairaba Avenue'
                  }
                  className="mb-4"
                />
                <TextArea
                  label="Description"
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    if (errors.description) setErrors((e) => ({ ...e, description: undefined }));
                  }}
                  error={errors.description}
                  maxLength={2000}
                  hint="How big is it? How long has it been there? Any landmark nearby?"
                  placeholder="What did you see?"
                />
              </Section>
            </>
          ) : (
            <>
              {submitError ? <InlineMessage tone="error" message={submitError} className="mb-4" /> : null}
              {offline ? (
                <InlineMessage
                  tone="warning"
                  message="You're offline. Connect to the internet to send your report."
                  className="mb-4"
                />
              ) : null}
              <Card padding={0} className="overflow-hidden">
                {photo ? (
                  <Image
                    source={{ uri: photo.uri }}
                    style={{ width: '100%', aspectRatio: 16 / 10 }}
                    contentFit="cover"
                    accessibilityLabel="Your photo of the problem"
                  />
                ) : null}
                <View className="p-4">
                  <Text variant="h2">{title.trim()}</Text>
                  <Text color="secondary" className="mt-1">
                    {description.trim()}
                  </Text>
                  <View className="mt-3" style={{ borderTopWidth: 1, borderColor: colors.border.default }}>
                    <SummaryRow icon={meta?.icon ?? 'other'} label="Problem" value={category ?? ''} />
                    <SummaryRow icon="council" label="Area" value={area ?? ''} />
                    <SummaryRow
                      icon="pin"
                      label="Location"
                      value={locationLabel ?? (coords ? 'Pinned on the map' : 'Not added')}
                    />
                    {!photo ? <SummaryRow icon="photo" label="Photo" value="Not added" /> : null}
                  </View>
                </View>
              </Card>
            </>
          )}
        </ScrollView>

        {/* Sticky action bar */}
        <View
          className="px-5 pb-3 pt-3"
          style={{ backgroundColor: colors.surface.card, borderTopWidth: 1, borderColor: colors.border.default }}>
          {step === 'form' ? (
            <Button label="Review report" size="lg" onPress={goToReview} />
          ) : (
            <>
              {busy ? (
                <View className="mb-3">
                  <Text variant="caption" color="muted" className="mb-1.5">
                    {phase === 'preparing'
                      ? 'Preparing photo…'
                      : phase === 'uploading'
                        ? `Uploading photo… ${Math.round(uploadProgress * 100)}%`
                        : 'Sending report…'}
                  </Text>
                  <ProgressBar
                    progress={phase === 'uploading' ? uploadProgress * 0.9 : phase === 'saving' ? 0.95 : 0.05}
                    accessibilityLabel="Sending report"
                  />
                </View>
              ) : null}
              <Button
                label="Send report"
                icon="send"
                size="lg"
                haptic
                loading={busy}
                loadingLabel="Sending…"
                disabled={offline}
                onPress={submit}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
