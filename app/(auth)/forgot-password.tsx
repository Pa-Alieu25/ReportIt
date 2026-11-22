import { useRouter } from 'expo-router';
import { useState } from 'react';

import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { InlineMessage } from '@/components/ui/InlineMessage';
import { Input } from '@/components/ui/Input';
import { sendPasswordReset } from '@/lib/auth';
import { isValidEmail } from '@/lib/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setFormError(null);
    if (!email.trim()) return setError('Enter your email address.');
    if (!isValidEmail(email)) return setError('This email address doesn’t look right.');
    setError(null);

    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      showBack
      title="Reset your password"
      subtitle="Enter the email you signed up with and we'll send you a link to choose a new password.">
      {sent ? (
        <>
          <InlineMessage
            tone="success"
            title="Check your email"
            message={`If an account exists for ${email.trim()}, a reset link is on its way. It can take a few minutes, so check your spam folder too.`}
            className="mb-6"
          />
          <Button label="Back to sign in" size="lg" onPress={() => router.back()} />
          <Button
            label="Send again"
            variant="ghost"
            className="mt-2"
            loading={submitting}
            onPress={handleSubmit}
          />
        </>
      ) : (
        <>
          {formError ? <InlineMessage tone="error" message={formError} className="mb-4" /> : null}
          <Input
            label="Email"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            error={error}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            placeholder="name@example.com"
            className="mb-6"
          />
          <Button
            label="Send reset link"
            icon="send"
            size="lg"
            loading={submitting}
            loadingLabel="Sending…"
            onPress={handleSubmit}
          />
        </>
      )}
    </AuthLayout>
  );
}
