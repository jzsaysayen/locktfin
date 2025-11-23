'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackPage() {
  const router = useRouter();
  const [trackId, setTrackId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    setError('');

    if (!trackId.trim()) {
      setError('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    // Navigate to tracking page
    router.push(`/track/${trackId.trim()}`);
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      setCameraError('');
      setLoading(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLoading(false);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please check permissions or use image upload instead.');
      setScanning(false);
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
    setCameraError('');
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      setLoading(false);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        await processQRImage(blob);
      }
      setLoading(false);
    }, 'image/png');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    await processQRImage(file);
    setLoading(false);
  };

  const processQRImage = async (imageBlob: Blob) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);
      
      img.onload = async () => {
        alert('QR Code scanning requires a QR code library. Please enter the tracking ID manually for now.');
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (err) {
      console.error('QR processing error:', err);
      setError('Failed to process QR code. Please try again or enter manually.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <div className="inline-block p-3 sm:p-4 bg-blue-600 rounded-full mb-3 sm:mb-4">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">Track Your Order</h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">Enter your tracking ID or scan QR code</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mx-2 sm:mx-0">
          <div className="p-4 sm:p-8">
            {/* Manual Entry */}
            {!scanning && (
              <>
                <div className="mb-6 sm:mb-8">
                  <label className="block text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                    Tracking ID
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={trackId}
                      onChange={(e) => {
                        setTrackId(e.target.value.toUpperCase());
                        setError('');
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="LL-XXXXX-XXXX"
                      disabled={loading}
                      className="flex-1 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg font-mono disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Loading...</span>
                        </>
                      ) : (
                        'Track'
                      )}
                    </button>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="relative my-6 sm:my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                  </div>
                </div>

                {/* QR Code Options */}
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-sm font-semibold text-gray-900 text-center mb-3 sm:mb-4">
                    Scan QR Code
                  </p>

                  {/* Camera Scan Button */}
                  <button
                    onClick={startCamera}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold">Open Camera</span>
                  </button>

                  {/* Upload Image Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold">Upload QR Image</span>
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {cameraError && (
                  <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-yellow-800">{cameraError}</p>
                  </div>
                )}
              </>
            )}

            {/* Camera View */}
            {scanning && (
              <div className="space-y-3 sm:space-y-4">
                {loading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-blue-800">Starting camera...</p>
                  </div>
                )}
                
                <div className="relative bg-black rounded-lg sm:rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-64 sm:h-80 object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {/* Scanning Frame Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 sm:w-64 sm:h-64 border-4 border-white rounded-lg shadow-lg">
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
                    </div>
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={captureImage}
                    disabled={loading}
                    className="flex-1 px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>📸 Capture & Scan</>
                    )}
                  </button>
                  <button
                    onClick={stopCamera}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-blue-800 text-center">
                    📷 Position the QR code within the frame and tap `Capture & Scan`
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mx-2 sm:mx-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
            📱 How to Track Your Order
          </h3>
          <ul className="space-y-2 text-sm sm:text-base text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
              <span>Enter your tracking ID from your order confirmation email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
              <span>Or scan the QR code using your phone camera</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
              <span>You can also upload a screenshot of your QR code</span>
            </li>
          </ul>
        </div>

        {/* Demo Note */}
        <div className="mt-4 sm:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mx-2 sm:mx-0">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Note:</strong> QR code scanning is currently in demo mode. For full functionality, a QR code library like <code className="bg-yellow-100 px-1 py-0.5 rounded text-xs">jsqr</code> needs to be installed. For now, please use manual tracking ID entry.
          </p>
        </div>
      </div>
    </div>
  );
}