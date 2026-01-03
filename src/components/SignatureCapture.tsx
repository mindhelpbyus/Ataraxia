import React, { useRef, useState, useEffect } from 'react';
import { Pencil, RotateCcw, Check, Type } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';

export interface SignatureData {
  type: 'drawn' | 'typed';
  data: string; // Base64 for drawn, text for typed
  timestamp: string;
  fullName: string;
}

interface SignatureCaptureProps {
  signature: SignatureData | null;
  onSignatureChange: (signature: SignatureData | null) => void;
  fullName: string;
  label?: string;
  required?: boolean;
}

export function SignatureCapture({ 
  signature, 
  onSignatureChange, 
  fullName,
  label = "Signature",
  required = true 
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedName, setTypedName] = useState(fullName);
  const [signatureType, setSignatureType] = useState<'drawn' | 'typed'>('drawn');

  useEffect(() => {
    // Initialize canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      // Load existing signature if present
      if (signature && signature.type === 'drawn') {
        const img = new Image();
        img.onload = () => {
          ctx?.drawImage(img, 0, 0);
          setHasDrawn(true);
        };
        img.src = signature.data;
      }
    }
  }, []);

  useEffect(() => {
    if (signature && signature.type === 'typed') {
      setTypedName(signature.fullName);
      setSignatureType('typed');
    }
  }, [signature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    
    // Save signature
    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const signatureData: SignatureData = {
        type: 'drawn',
        data: canvas.toDataURL('image/png'),
        timestamp: new Date().toISOString(),
        fullName: fullName
      };
      onSignatureChange(signatureData);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange(null);
  };

  const handleTypedSignature = () => {
    if (!typedName.trim()) return;

    const signatureData: SignatureData = {
      type: 'typed',
      data: typedName,
      timestamp: new Date().toISOString(),
      fullName: typedName
    };
    onSignatureChange(signatureData);
  };

  const generateTypedSignatureCanvas = (name: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Signature text
      ctx.fillStyle = '#000000';
      ctx.font = 'italic 48px "Brush Script MT", cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    }
    
    return canvas.toDataURL('image/png');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {signature && (
          <Badge variant="default" className="bg-green-600">
            <Check className="h-3 w-3 mr-1" />
            Signed
          </Badge>
        )}
      </div>

      <Tabs value={signatureType} onValueChange={(val) => setSignatureType(val as 'drawn' | 'typed')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drawn" className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Draw Signature
          </TabsTrigger>
          <TabsTrigger value="typed" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Type Signature
          </TabsTrigger>
        </TabsList>

        {/* Draw Signature */}
        <TabsContent value="drawn">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Draw Your Signature</CardTitle>
              <CardDescription>
                Sign with your mouse, trackpad, or finger (on touch devices)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  className="border-2 border-gray-300 rounded-lg w-full cursor-crosshair bg-white touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-muted-foreground">
                      <Pencil className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Sign here</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSignature}
                  disabled={!hasDrawn}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
                
                {hasDrawn && (
                  <Badge variant="secondary">
                    Signature captured
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                By signing, you confirm that this is your legal signature and you agree to the terms and conditions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Type Signature */}
        <TabsContent value="typed">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Type Your Full Legal Name</CardTitle>
              <CardDescription>
                Your typed name will serve as your electronic signature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="typed-name">Full Legal Name</Label>
                <Input
                  id="typed-name"
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="John Doe"
                  className="text-lg"
                />
              </div>

              {typedName && (
                <div className="border-2 border-gray-300 rounded-lg p-6 bg-white">
                  <div 
                    className="text-center font-serif italic text-4xl"
                    style={{ fontFamily: '"Brush Script MT", cursive' }}
                  >
                    {typedName}
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={handleTypedSignature}
                disabled={!typedName.trim()}
                className="w-full bg-[#F97316] hover:bg-[#ea580c]"
              >
                <Check className="h-4 w-4 mr-2" />
                Use This Signature
              </Button>

              <p className="text-xs text-muted-foreground">
                By typing your name, you confirm that this is your legal name and you agree to the terms and conditions. 
                This typed signature is legally binding.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Signature Preview (if signed) */}
      {signature && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-900">
              <Check className="h-5 w-5" />
              Signature Captured
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="bg-white border border-green-200 rounded-lg p-4">
              {signature.type === 'drawn' ? (
                <img src={signature.data} alt="Signature" className="h-20 mx-auto" />
              ) : (
                <div 
                  className="text-center font-serif italic text-3xl"
                  style={{ fontFamily: '"Brush Script MT", cursive' }}
                >
                  {signature.fullName}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              <div>Signed by: {signature.fullName}</div>
              <div>Date: {new Date(signature.timestamp).toLocaleString()}</div>
              <div>Method: {signature.type === 'drawn' ? 'Hand-drawn' : 'Typed'}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
