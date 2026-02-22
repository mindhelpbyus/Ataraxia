import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Camera, X, RotateCcw, Check, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCapture: (imageData: string) => void;
}

export function CameraCaptureDialog({ open, onOpenChange, onCapture }: CameraCaptureDialogProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'permission' | 'notfound' | 'other' | null>(null);

    // Start camera when dialog opens
    useEffect(() => {
        if (open && !capturedImage) {
            startCamera();
        }

        return () => {
            stopCamera();
        };
    }, [open]);

    const startCamera = async () => {
        try {
            setCameraError(null);
            setErrorType(null);
            setIsCameraReady(false);

            // Check if mediaDevices is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setErrorType('other');
                setCameraError('Camera access is not supported in your browser.');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraReady(true);
            }
        } catch (error: any) {
            // Silently handle the error in console, show user-friendly message in UI

            // Determine error type
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setErrorType('permission');
                setCameraError('Camera access was denied. Please grant camera permission to continue.');
                toast.error('Camera permission required');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                setErrorType('notfound');
                setCameraError('No camera found on your device.');
                toast.error('No camera detected');
            } else {
                setErrorType('other');
                setCameraError('Unable to access camera. Please try again.');
                toast.error('Camera access failed');
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraReady(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data as base64
            const imageData = canvas.toDataURL('image/jpeg', 0.9);
            setCapturedImage(imageData);
            stopCamera();
            toast.success('Photo captured!');
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        startCamera();
    };

    const confirmPhoto = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            handleClose();
        }
    };

    const handleClose = () => {
        stopCamera();
        setCapturedImage(null);
        setCameraError(null);
        setErrorType(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Take Profile Photo
                    </DialogTitle>
                    <DialogDescription>
                        {capturedImage
                            ? 'Review your photo and confirm or retake'
                            : 'Position yourself in the frame and click capture'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Camera View / Captured Image */}
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                        {!capturedImage ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                {!isCameraReady && !cameraError && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                        <div className="text-center text-white">
                                            <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                                            <p>Starting camera...</p>
                                        </div>
                                    </div>
                                )}
                                {cameraError && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-6">
                                        <div className="text-center text-white max-w-md">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                                            <h3 className="text-lg font-semibold mb-2">
                                                {errorType === 'permission' && 'Camera Permission Required'}
                                                {errorType === 'notfound' && 'Camera Not Found'}
                                                {errorType === 'other' && 'Camera Error'}
                                            </h3>
                                            <p className="text-sm mb-4">{cameraError}</p>

                                            {errorType === 'permission' && (
                                                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4 text-left">
                                                    <div className="flex gap-2 mb-2">
                                                        <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                                        <div className="text-sm">
                                                            <p className="font-medium mb-2 text-blue-300">How to enable camera:</p>
                                                            <ol className="list-decimal list-inside space-y-1 text-blue-100">
                                                                <li>Click the camera icon in your browser's address bar</li>
                                                                <li>Select "Allow" for camera access</li>
                                                                <li>Click "Try Again" below</li>
                                                            </ol>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    onClick={handleClose}
                                                    variant="outline"
                                                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                                                    size="sm"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={startCamera}
                                                    className="bg-[#F97316] hover:bg-[#ea6b0f] text-white"
                                                    size="sm"
                                                >
                                                    Try Again
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Hidden canvas for capturing */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Action Buttons */}
                    {!cameraError && (
                        <div className="flex justify-center gap-3">
                            {!capturedImage ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                        className="border-gray-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={capturePhoto}
                                        disabled={!isCameraReady}
                                        className="bg-[#F97316] hover:bg-[#ea6b0f] text-white"
                                    >
                                        <Camera className="h-4 w-4 mr-2" />
                                        Capture Photo
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={retakePhoto}
                                        className="border-gray-300"
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Retake
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={confirmPhoto}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Use This Photo
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
