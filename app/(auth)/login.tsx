import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, View, type TextInput } from 'react-native';

import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { InlineMessage } from '@/components/ui/InlineMessage';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { signIn } from '@/lib/auth';
import { isValidEmail } from '@/lib/validation';

type Errors = { email?: string; password?: string };

export default function LoginScreen() {
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setFormError(null);
    const next: Errors = {};
    if (!email.trim()) next.email = 'Enter your email address.';
    else if (!isValidEmail(email)) next.email = 'This email address doesn’t look right.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      // The root layout's auth listener + Stack.Protected guard handle navigation.
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to report problems and follow their progress.">
      {formError ? <InlineMessage tone="error" message={formError} className="mb-4" /> : null}

      <Input
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
        secureTextEntry
        revealable
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
        placeholder="Your password"
      />

      <View className="mb-6 mt-1 items-end">
        <Link href="/forgot-password" asChild>
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            className="justify-center"
            style={{ minHeight: 44 }}>
            <Text variant="label" weight="semibold" color="link">
              Forgot password?
            </Text>
          </Pressable>
        </Link>
      </View>

      <Button label="Sign in" size="lg" loading={submitting} loadingLabel="Signing in…" onPress={handleSubmit} />

      <View className="mt-6 flex-row items-center justify-center">
        <Text color="muted">New to ReportIT? </Text>
        <Link href="/signup" asChild>
          <Pressable accessibilityRole="link" hitSlop={8} className="justify-center" style={{ minHeight: 44 }}>
            <Text weight="semibold" color="link">
              Create an account
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthLayout>
  );
}
