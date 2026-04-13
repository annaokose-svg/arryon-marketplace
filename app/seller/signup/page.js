"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSellerProfile } from '../../../lib/auth';

export default function SellerSignupPage() {
  const router = useRouter();
  const nationalityOptions = ['United States', 'United Kingdom', 'Nigeria', 'Kenya', 'South Africa', 'India', 'Canada', 'Australia', 'Ghana', 'Egypt'];
  const idTypeOptions = ['Passport', 'National ID', 'Driver License'];
  const steps = ['Account info', 'Business details', 'Stripe onboarding', 'ID verification', 'Face scan'];
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    password: '',
    nationality: '',
    idType: '',
    idName: '',
    businessName: '',
    businessType: '',
    description: '',
    contactEmail: '',
    location: '',
    category: '',
    stripeAccountId: '',
    bannerFile: null,
    logoFile: null,
    videoFile: null,
    passportFile: null,
    faceFile: null
  });
  const [saving, setSaving] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facePreview, setFacePreview] = useState(null);
  const [stream, setStream] = useState(null);
  const [showFaceScanModal, setShowFaceScanModal] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const progress = Math.round(((step - 1) / (steps.length - 1)) * 100);

  useEffect(() => {
    if (showFaceScanModal) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [showFaceScanModal]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not available in this browser.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStream(mediaStream);
      setCameraError('');
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Unable to access the camera. Please allow camera permission or use a compatible device.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureFacePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'face-scan.png', { type: 'image/png' });
      setForm((prev) => ({ ...prev, faceFile: file }));
      setFacePreview(URL.createObjectURL(blob));
      setCameraError('Face snapshot captured successfully.');
    }, 'image/png');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.email || !form.password || !form.nationality || !form.idType) {
        alert('Please complete your account details, nationality, and ID type.');
        return false;
      }
    }

    if (step === 2) {
      if (!form.businessName || !form.businessType || !form.description || !form.contactEmail) {
        alert('Please complete your business details before continuing.');
        return false;
      }
    }

    if (step === 3) {
      if (!form.stripeAccountId) {
        alert('Please complete Stripe Connect onboarding to verify your bank account.');
        return false;
      }
    }

    if (step === 4) {
      if (!form.idName || !form.passportFile) {
        alert('Please provide the name on your ID and upload your ID document.');
        return false;
      }
    }

    if (step === 5) {
      if (!form.faceFile) {
        alert('Please complete the biometric face verification.');
        return false;
      }
      if (form.idName.trim().toLowerCase() !== form.businessName.trim().toLowerCase()) {
        alert('The name on your ID must match your business name for verification.');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, steps.length));
  };

  const previousStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    if (step < steps.length) {
      nextStep();
      return;
    }

    if (!validateStep()) {
      return;
    }

    setSaving(true);

    try {
      const media = {};
      try {
        if (form.bannerFile) {
          media.bannerUrl = await uploadFile(form.bannerFile);
        }
        if (form.logoFile) {
          media.logoUrl = await uploadFile(form.logoFile);
        }
        if (form.videoFile) {
          media.videoUrl = await uploadFile(form.videoFile);
        }
        if (form.passportFile) {
          media.passportUrl = await uploadFile(form.passportFile);
        }
        if (form.faceFile) {
          media.faceUrl = await uploadFile(form.faceFile);
        }
      } catch (fileError) {
        alert(`File upload error: ${fileError.message}`);
        setSaving(false);
        return;
      }

      await createSellerProfile({
        email: form.email,
        password: form.password,
        nationality: form.nationality,
        idType: form.idType,
        idName: form.idName,
        businessName: form.businessName,
        businessType: form.businessType,
        description: form.description,
        contactEmail: form.contactEmail,
        location: form.location,
        category: form.category,
        stripeAccountId: form.stripeAccountId,
        media,
        featured: true
      });

      router.push('/seller/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Unable to complete seller registration. Please check your details and try again.';

      if (error.message) {
        if (error.message.includes('already exists')) {
          if (error.message.includes('email')) {
            errorMessage = 'A seller account with this email already exists. Please use a different email or try logging in instead.';
          } else if (error.message.includes('business name')) {
            errorMessage = 'This business name is already taken. Please choose a different one.';
          }
        } else if (error.message.includes('Missing')) {
          errorMessage = 'Please fill in all required fields. All verification steps must be completed.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('File size too large')) {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const stepLabel = steps[step - 1];

  return (
    <div className="container py-14">
      <div className="grid gap-10 lg:grid-cols-[0.7fr_0.3fr]">
        <div className="card">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-brand-900">Seller verification</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">Register in a secure step-by-step process</h1>
                <p className="mt-3 text-sm text-slate-600">Complete each step to verify your identity and launch your seller dashboard.</p>
              </div>
              <div className="text-sm font-semibold text-slate-700">{progress}% complete</div>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-brand-900 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase text-slate-500">
              {steps.map((label, index) => (
                <div key={label} className={`rounded-full border px-3 py-1 ${index + 1 === step ? 'border-brand-900 bg-brand-50 text-brand-900' : 'border-slate-200 bg-white'}`}>
                  {index + 1}. {label}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSignup} className="grid gap-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-wide text-slate-500">Step {step}: {stepLabel}</p>
            </div>

            {step === 1 && (
              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-700">
                    Email address
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Password
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      required
                      className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-700">
                    Nationality
                    <select
                      value={form.nationality}
                      onChange={(e) => handleChange('nationality', e.target.value)}
                      required
                      className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                    >
                      <option value="">Select nationality</option>
                      {nationalityOptions.map((nation) => (
                        <option key={nation} value={nation}>{nation}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    ID type
                    <select
                      value={form.idType}
                      onChange={(e) => handleChange('idType', e.target.value)}
                      required
                      className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                    >
                      <option value="">Select ID type</option>
                      {idTypeOptions.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5">
                <label className="space-y-2 text-sm text-slate-700">
                  Business Name
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    required
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Business type
                  <input
                    type="text"
                    value={form.businessType}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                    placeholder="e.g., Retail, Wholesale, Services, Food"
                    required
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Brand description
                  <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows="4"
                    required
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-700">
                    Contact email
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      required
                      className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Shop location
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm text-slate-700">
                  Category
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h2 className="text-xl font-semibold text-slate-900">Bank Account Verification</h2>
                  <p className="mt-3 text-sm text-slate-600">
                    Connect your bank account securely through Stripe. This enables automatic payouts and provides bank-level verification for your seller account.
                  </p>
                  <div className="mt-4 rounded-2xl bg-blue-50 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-900">Why Stripe Connect?</h3>
                        <p className="text-sm text-blue-700">Industry-leading security, instant payouts, and trusted by millions of businesses worldwide.</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/stripe/create-account', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: form.email,
                            businessName: form.businessName,
                            country: form.nationality === 'United States' ? 'US' : 'NG',
                          }),
                        });
                        const data = await response.json();
                        if (data.onboardingUrl) {
                          setForm((prev) => ({ ...prev, stripeAccountId: data.accountId }));
                          window.location.href = data.onboardingUrl;
                        } else {
                          alert('Failed to create Stripe account: ' + data.error);
                        }
                      } catch (error) {
                        alert('Error connecting to Stripe: ' + error.message);
                      }
                    }}
                    className="mt-6 flex items-center justify-center space-x-2 rounded-full bg-indigo-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>Connect Bank Account with Stripe</span>
                  </button>
                  <p className="mt-4 text-xs text-slate-500">
                    You'll be redirected to Stripe's secure onboarding. Complete bank verification to enable payouts.
                  </p>
                </div>
                {form.stripeAccountId && (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">Stripe Account Connected</p>
                        <p className="text-sm text-emerald-700">Account ID: {form.stripeAccountId}</p>
                      </div>
                    </div>
                  </div>
                )
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-5">
                <label className="space-y-2 text-sm text-slate-700">
                  Name on ID
                  <input
                    type="text"
                    value={form.idName}
                    onChange={(e) => handleChange('idName', e.target.value)}
                    required
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Upload ID document
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 10 * 1024 * 1024) {
                        alert('Document must be smaller than 10MB');
                        e.target.value = '';
                        return;
                      }
                      handleChange('passportFile', file || null);
                    }}
                    required
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                  />
                </label>
                <p className="text-sm text-slate-500">Your ID name will be compared to your business name to confirm your identity before verification.</p>
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-5">
                <label className="space-y-2 text-sm text-slate-700">
                  Name on ID
                  <input
                    type="text"
                    value={form.idName}
                    onChange={(e) => handleChange('idName', e.target.value)}
                    required
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Upload ID document
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 10 * 1024 * 1024) {
                        alert('Document must be smaller than 10MB');
                        e.target.value = '';
                        return;
                      }
                      handleChange('passportFile', file || null);
                    }}
                    required
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-brand-500"
                  />
                </label>
                <p className="text-sm text-slate-500">Your ID name will be compared to your business name to confirm your identity before verification.</p>
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <h2 className="text-xl font-semibold text-slate-900">Biometric Verification</h2>
                  <p className="mt-3 text-sm text-slate-600">
                    Complete your identity verification with a secure face scan. This helps prevent fraud and ensures account security.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowFaceScanModal(true)}
                    className="mt-5 rounded-full bg-blue-900 px-8 py-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Start Face Scan Verification
                  </button>
                  {facePreview && (
                    <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-900">✓ Face scan completed</p>
                      <img src={facePreview} alt="Face verification" className="mt-3 h-24 w-24 rounded-full object-cover" />
                    </div>
                  )}
                  <p className="mt-3 text-sm text-slate-500">
                    This secure process is similar to Jumio's biometric verification used by major financial institutions.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={previousStep}
                disabled={step === 1}
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-700 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-brand-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {step < steps.length ? 'Continue' : saving ? 'Verifying…' : 'Complete registration'}
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Why we verify</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">This multi-step process protects buyers and sellers by validating the identity behind every storefront. The face scan and ID comparison create a stronger trust signal for your brand.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
            <p className="font-semibold">What happens next</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
              <li>Choose nationality and ID type first.</li>
              <li>Provide business details and upload your verification document.</li>
              <li>Take a live face snapshot using your device camera.</li>
              <li>Finish registration and access your seller dashboard.</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Face Scan Modal */}
      {showFaceScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Biometric Face Verification</h2>
              <button
                type="button"
                onClick={() => setShowFaceScanModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="mb-4 text-sm text-slate-600">
                  Position your face in the center of the frame and ensure good lighting for verification.
                </div>
                <div className="relative mx-auto h-80 w-80 overflow-hidden rounded-full border-4 border-blue-200 bg-black">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400"></div>
                </div>
                {cameraError && (
                  <p className="mt-4 text-sm text-red-600">{cameraError}</p>
                )}
              </div>

              <div className="flex flex-col items-center space-y-4">
                <button
                  type="button"
                  onClick={captureFacePhoto}
                  className="rounded-full bg-blue-900 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
                >
                  📸 Capture Face
                </button>

                {facePreview && (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-900 mb-2">✓ Face captured successfully</p>
                    <img
                      src={facePreview}
                      alt="Face verification"
                      className="h-24 w-24 rounded-full object-cover mx-auto"
                    />
                  </div>
                )}

                <div className="text-center text-sm text-slate-600">
                  <p className="font-semibold">Verification Requirements:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Clear, well-lit photo</li>
                    <li>• Face centered in frame</li>
                    <li>• No sunglasses or hats</li>
                    <li>• Neutral expression</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowFaceScanModal(false)}
                  className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (facePreview) {
                      setShowFaceScanModal(false);
                      // Move to next step or complete verification
                    } else {
                      alert('Please capture your face before continuing.');
                    }
                  }}
                  className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Complete Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
