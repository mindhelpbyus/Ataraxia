import React, { useState } from 'react';
import { BedrockWatermark } from './BedrockWatermark';
import { BedrockLogo } from '../imports/BedrockLogo';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ArrowLeft } from 'lucide-react';

interface WatermarkDemoProps {
  onBack?: () => void;
}

export function WatermarkDemo({ onBack }: WatermarkDemoProps) {
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkOpacity, setWatermarkOpacity] = useState(30);
  const [watermarkSize, setWatermarkSize] = useState(720);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        {onBack && (
          <div>
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-white/50 dark:hover:bg-gray-800/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Bedrock Health Watermark Preview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            See how the watermark looks in different scenarios
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Watermark Controls</CardTitle>
            <CardDescription>Adjust watermark settings to preview different styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setShowWatermark(!showWatermark)}
                variant={showWatermark ? "default" : "outline"}
              >
                {showWatermark ? 'Hide' : 'Show'} Watermark
              </Button>
              <Badge variant="secondary">
                Current Size: {watermarkSize}px
              </Badge>
              <Badge variant="secondary">
                Opacity: {watermarkOpacity}%
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Opacity: {watermarkOpacity}%</label>
              <input
                type="range"
                min="5"
                max="100"
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Size: {watermarkSize}px</label>
              <input
                type="range"
                min="300"
                max="1200"
                step="50"
                value={watermarkSize}
                onChange={(e) => setWatermarkSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Tabs */}
        <Tabs defaultValue="light" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="light">Light Background</TabsTrigger>
            <TabsTrigger value="dark">Dark Background</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="svg">Direct SVG</TabsTrigger>
          </TabsList>

          {/* Light Background Preview */}
          <TabsContent value="light" className="space-y-4">
            <Card className="relative overflow-hidden min-h-[600px] bg-white">
              {showWatermark && (
                <BedrockWatermark 
                  position="center" 
                  opacity={watermarkOpacity} 
                  size={watermarkSize}
                  rotation={-45}
                  variant="full"
                />
              )}
              <CardContent className="relative z-10 p-8 space-y-4">
                <h2 className="text-3xl font-bold">Appointment Schedule</h2>
                <p className="text-gray-600">
                  This is sample content to show how the watermark appears behind text
                  and other elements on a light background.
                </p>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="font-semibold">Appointment {i}</div>
                      <div className="text-sm text-gray-500">Client Name</div>
                      <div className="text-xs text-gray-400">10:00 AM - 11:00 AM</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dark Background Preview */}
          <TabsContent value="dark" className="space-y-4">
            <Card className="relative overflow-hidden min-h-[600px] bg-gray-900 text-white border-gray-800">
              {showWatermark && (
                <BedrockWatermark 
                  position="center" 
                  opacity={watermarkOpacity} 
                  size={watermarkSize}
                  rotation={-45}
                  variant="full"
                />
              )}
              <CardContent className="relative z-10 p-8 space-y-4">
                <h2 className="text-3xl font-bold">Client Dashboard</h2>
                <p className="text-gray-300">
                  This is sample content to show how the watermark appears on a dark background.
                  The watermark should be visible but not overpowering.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {['Today', 'This Week', 'This Month', 'Total'].map((label, i) => (
                    <div key={i} className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400">{label}</div>
                      <div className="text-3xl font-bold mt-2">{(i + 1) * 12}</div>
                      <div className="text-sm text-green-400 mt-1">↑ 12% increase</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Document Preview */}
          <TabsContent value="document" className="space-y-4">
            <Card className="relative overflow-hidden min-h-[600px] bg-white">
              {showWatermark && (
                <BedrockWatermark 
                  position="center" 
                  opacity={watermarkOpacity} 
                  size={watermarkSize}
                  rotation={-45}
                  variant="full"
                />
              )}
              <CardContent className="relative z-10 p-12 space-y-4 max-w-4xl mx-auto">
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-4xl font-bold">Session Notes</h1>
                  <p className="text-gray-500">Confidential Document</p>
                  <Separator className="my-4" />
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Client Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> John Doe</p>
                      <p><strong>Date:</strong> November 11, 2025</p>
                      <p><strong>Session Type:</strong> Individual Therapy</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Session Summary</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
                      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
                      quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Treatment Plan</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Continue weekly sessions</li>
                      <li>Practice mindfulness exercises daily</li>
                      <li>Maintain mood journal</li>
                      <li>Follow-up in 7 days</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
                  © 2025 Bedrock Health Solutions - Confidential
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Direct SVG Preview */}
          <TabsContent value="svg" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Direct SVG Usage</CardTitle>
                <CardDescription>
                  View the watermark files directly and get usage code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Full Logo SVG */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Full Logo Watermark</h3>
                  <div className="relative bg-white border rounded-lg p-8 flex items-center justify-center h-[400px]">
                    <div style={{ width: `${watermarkSize}px`, opacity: watermarkOpacity / 100 }}>
                      <BedrockLogo 
                        variant="full"
                        size={watermarkSize}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-100 p-4 rounded text-xs font-mono overflow-x-auto">
                    {`import { BedrockLogo } from '../imports/BedrockLogo';

<BedrockLogo 
  variant="full"
  size={${watermarkSize}}
  className="opacity-${watermarkOpacity}"
/>`}
                  </div>
                </div>

                <Separator />

                {/* Icon Only SVG */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Icon Only Watermark</h3>
                  <div className="relative bg-white border rounded-lg p-8 flex items-center justify-center h-[400px]">
                    <div style={{ width: `${watermarkSize}px`, opacity: watermarkOpacity / 100 }}>
                      <BedrockLogo 
                        variant="icon"
                        size={watermarkSize}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-100 p-4 rounded text-xs font-mono overflow-x-auto">
                    {`import { BedrockLogo } from '../imports/BedrockLogo';

<BedrockLogo 
  variant="icon"
  size={${watermarkSize}}
  className="opacity-${watermarkOpacity}"
/>`}
                  </div>
                </div>

                <Separator />

                {/* Text Only SVG */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Text Only Watermark</h3>
                  <div className="relative bg-white border rounded-lg p-8 flex items-center justify-center h-[300px]">
                    <div style={{ width: `${watermarkSize}px`, opacity: watermarkOpacity / 100 }}>
                      <BedrockLogo 
                        variant="text"
                        size={watermarkSize}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-100 p-4 rounded text-xs font-mono overflow-x-auto">
                    {`import { BedrockLogo } from '../imports/BedrockLogo';

<BedrockLogo 
  variant="text"
  size={${watermarkSize}}
  className="opacity-${watermarkOpacity}"
/>`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Usage Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Usage Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">React Component Method:</h4>
              <div className="bg-gray-100 p-4 rounded text-sm font-mono overflow-x-auto">
                {`import { BedrockWatermark } from './components/BedrockWatermark';

<BedrockWatermark 
  position="center" 
  opacity={30} 
  size={720}
  rotation={-45}
  variant="full"
/>`}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Direct Logo Component Method:</h4>
              <div className="bg-gray-100 p-4 rounded text-sm font-mono overflow-x-auto">
                {`import { BedrockLogo } from '../imports/BedrockLogo';

<div style={{
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%) rotate(-45deg)',
  opacity: 0.3,
  zIndex: -1,
  pointerEvents: 'none'
}}>
  <BedrockLogo variant="full" size={720} />
</div>`}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">BedrockWatermark Component (Recommended):</h4>
              <div className="bg-gray-100 p-4 rounded text-sm font-mono overflow-x-auto">
                {`import { BedrockWatermark } from './components/BedrockWatermark';

// The BedrockWatermark component handles all positioning & styling
<BedrockWatermark 
  position="center" 
  opacity={30} 
  size={720}
  rotation={-45}
  variant="full"
/>`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default WatermarkDemo;
