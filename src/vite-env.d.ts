/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Shared HTTP API Gateway (backend-initial + billing_payment)
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_URL: string
  // video-service backend (LiveKit rooms/tokens/transcripts)
  readonly VITE_VIDEO_API_BASE_URL: string
  // AWS Cognito (ap-south-1, same pool as backend-initial)
  readonly VITE_AWS_REGION: string
  readonly VITE_COGNITO_USER_POOL_ID: string
  readonly VITE_COGNITO_CLIENT_ID: string
  // Misc
  readonly VITE_LIVEKIT_URL: string
  readonly VITE_RAZORPAY_KEY_ID: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly DEV: boolean
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'iso-639-1';
declare module 'langs';