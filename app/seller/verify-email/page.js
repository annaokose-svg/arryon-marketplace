"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setStatus('success');
          setTimeout(() => router.push('/seller/signup'), 3000);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [token, router]);

  return (
    <div className="container py-14">
      <div className="mx-auto max-w-md text-center">
        {status === 'verifying' && <p>Verifying your email...</p>}
        {status === 'success' && (
          <div>
            <h1 className="text-2xl font-semibold text-green-600">Email Verified!</h1>
            <p>You can now complete your seller registration.</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <h1 className="text-2xl font-semibold text-red-600">Verification Failed</h1>
            <p>The link may be invalid or expired. Please try registering again.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="container py-14">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}