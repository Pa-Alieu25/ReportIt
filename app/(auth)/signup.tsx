import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, View, type TextInput } from 'react-native';

import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { InlineMessage } from '@/components/ui/InlineMessage';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { signUp } from '@/lib/auth';
import { isValidEmail, MIN_PASSWORD_LENGTH } from '@/lib/validation';

type Errors = { name?: string; email?: string; password?: string };

export default function SignupScreen() {
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setFormError(null);
    const next: Errors = {};
    if (!name.trim()) next.name = 'Enter your name.';
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!isValidEmail(email)) next.email = 'This email address doesn’t look right.';
    if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      // The root layout's auth listener + Stack.Protected guard handle navigation.
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join your neighbours in getting problems fixed across The Gambia.">
      {formError ? <InlineMessage tone="error" message={formError} className="mb-4" /> : null}

      <Input
        label="Full name"
        icon="user"
        value={name}
        onChangeText={setName}
        error={errors.name}
        maxLength={100}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        placeholder="e.g. Fatou Jallow"
        className="mb-4"
      />
      <Input
        ref={emailRef}
        label="Email"
        icon="mail"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="name@example.com"
        className="mb-4"
      />
      <Input
        ref={passwordRef}
        label="Password"
        icon="lock"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        secureTextEntry
        revealable
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        placeholder="Create a password"
        className="mb-6"
      />

      <Button
        label="Create account"
        size="lg"
        haptic
        loading={submitting}
        loadingLabel="Creating your account…"
        onPress={handleSubmit}
      />

      <View className="mt-6 flex-row items-center justify-center">
        <Text color="muted">Already have an account? </Text>
        <Link href="/login" asChild>
          <Pressable accessibilityRole="link" hitSlop={8} className="justify-center" style={{ minHeight: 44 }}>
            <Text weight="semibold" color="link">
              Sign in
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthLayout>
  );
}
