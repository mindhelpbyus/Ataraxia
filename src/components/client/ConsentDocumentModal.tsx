import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, PenTool, Check, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface ConsentDocument {
    id: string;
    title: string;
    content: string;
    signatureFields: {
        id: string;
        label: string;
        required: boolean;
    }[];
}

interface ConsentDocumentModalProps {
    document: ConsentDocument;
    isOpen: boolean;
    onClose: () => void;
    onSigned: (documentId: string) => void;
}

export function ConsentDocumentModal({ document, isOpen, onClose, onSigned }: ConsentDocumentModalProps) {
    const signatureCanvasRef = useRef<SignatureCanvas>(null);
    const [zoom, setZoom] = useState(100);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [currentSignatureField, setCurrentSignatureField] = useState<string | null>(null);
    const [signatures, setSignatures] = useState<Record<string, string>>({});
    const [documentSigned, setDocumentSigned] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Check if document is already signed
            const stored = localStorage.getItem('clientConsentDocuments');
            if (stored) {
                const signedDocs = JSON.parse(stored);
                if (signedDocs.includes(document.id)) {
                    setDocumentSigned(true);
                }
            }

            // Auto-fill date field with today's date
            const todayDate = new Date().toISOString().split('T')[0];
            setSignatures((prev) => ({
                ...prev,
                date: todayDate,
            }));
        }
    }, [isOpen, document.id]);

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 10, 150));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 10, 80));
    };

    const handleOpenSignatureModal = (fieldId: string) => {
        setCurrentSignatureField(fieldId);
        setShowSignatureModal(true);
    };

    const handleSaveSignature = () => {
        if (signatureCanvasRef.current && currentSignatureField) {
            if (signatureCanvasRef.current.isEmpty()) {
                toast.error('Please draw your signature before saving');
                return;
            }

            const signatureData = signatureCanvasRef.current.toDataURL();
            setSignatures((prev) => ({
                ...prev,
                [currentSignatureField]: signatureData,
            }));
            setShowSignatureModal(false);
            setCurrentSignatureField(null);
        }
    };

    const handleClearSignature = () => {
        signatureCanvasRef.current?.clear();
    };

    const handleSignDocument = () => {
        const requiredFields = document.signatureFields.filter((f) => f.required);
        const allRequiredSigned = requiredFields.every((f) => signatures[f.id]);

        if (!allRequiredSigned) {
            toast.error('Please complete all required signature fields');
            return;
        }

        // Mark document as signed
        setDocumentSigned(true);

        // Save to localStorage
        const stored = localStorage.getItem('clientConsentDocuments');
        const signedDocs = stored ? JSON.parse(stored) : [];
        if (!signedDocs.includes(document.id)) {
            signedDocs.push(document.id);
            localStorage.setItem('clientConsentDocuments', JSON.stringify(signedDocs));
        }

        // Save signature data for this document
        Object.keys(signatures).forEach((key) => {
            if (signatures[key]) {
                localStorage.setItem(`consent_${document.id}_signature_${key}`, signatures[key]);
            }
        });

        const signedDate = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
        localStorage.setItem(`consent_${document.id}_date`, signedDate);

        toast.success('Document signed successfully!');
        onSigned(document.id);

        // Close modal after signing
        setTimeout(() => {
            onClose();
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Main Document Modal */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold">{document.title}</h2>
                            {documentSigned && (
                                <span className="text-sm text-green-600 flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    Signed
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleZoomOut}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-600 min-w-[50px] text-center">
                                {zoom}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors ml-2"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Document Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div
                            style={{
                                fontSize: `${zoom}%`,
                                transition: 'font-size 0.2s',
                            }}
                            className="prose max-w-none"
                        >
                            <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                                {document.content}
                            </div>
                        </div>

                        {/* Signature Fields */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-base font-semibold mb-4">Signature Required</h3>
                            <div className="space-y-4">
                                {document.signatureFields.map((field) => (
                                    <div key={field.id}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.label}
                                            {field.required && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </label>
                                        {field.id === 'date' ? (
                                            <input
                                                type="date"
                                                value={signatures[field.id] || new Date().toISOString().split('T')[0]}
                                                onChange={(e) =>
                                                    setSignatures((prev) => ({
                                                        ...prev,
                                                        [field.id]: e.target.value,
                                                    }))
                                                }
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                                            />
                                        ) : (
                                            <div className="relative">
                                                {signatures[field.id] ? (
                                                    <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                                                        <img
                                                            src={signatures[field.id]}
                                                            alt="Signature"
                                                            className="max-h-20"
                                                        />
                                                        <button
                                                            onClick={() => handleOpenSignatureModal(field.id)}
                                                            className="mt-2 text-sm text-[#F97316] hover:text-[#ea6b0f]"
                                                        >
                                                            Change Signature
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenSignatureModal(field.id)}
                                                        className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-md hover:border-[#F97316] transition-colors flex flex-col items-center justify-center gap-2 text-gray-600"
                                                    >
                                                        <PenTool className="w-5 h-5" />
                                                        <span className="text-sm">Click to sign</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={handleSignDocument}
                                disabled={documentSigned}
                                className={`mt-6 w-full ${documentSigned
                                    ? 'bg-green-600 hover:bg-green-600 cursor-not-allowed'
                                    : 'bg-[#F97316] hover:bg-[#ea6b0f]'
                                    }`}
                            >
                                {documentSigned ? (
                                    <span className="flex items-center gap-2 justify-center">
                                        <Check className="w-5 h-5" />
                                        Document Signed
                                    </span>
                                ) : (
                                    'Sign Document'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Signature Canvas Modal */}
            {showSignatureModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Draw Your Signature</h2>
                                <button
                                    onClick={() => {
                                        setShowSignatureModal(false);
                                        setCurrentSignatureField(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="bg-gray-50 mb-6 rounded-lg overflow-hidden shadow-inner">
                                <SignatureCanvas
                                    ref={signatureCanvasRef}
                                    canvasProps={{
                                        className: 'w-full h-[400px] border-2 border-gray-200 rounded-lg cursor-crosshair',
                                    }}
                                    backgroundColor="rgb(249, 250, 251)"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Button
                                    onClick={handleClearSignature}
                                    variant="outline"
                                >
                                    Clear
                                </Button>
                                <Button
                                    onClick={handleSaveSignature}
                                    className="bg-[#F97316] hover:bg-[#ea6b0f]"
                                >
                                    Save Signature
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
