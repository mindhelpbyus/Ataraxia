/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_URL: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_AWS_REGION: string
  readonly VITE_COGNITO_USER_POOL_ID: string
  readonly VITE_COGNITO_CLIENT_ID: string
  readonly VITE_AUTH_PROVIDER_TYPE: string
  readonly VITE_USE_API_FIRST: string
  readonly VITE_THERAPIST_SERVICE_URL: string
  readonly VITE_VERIFICATION_SERVICE_URL: string
  readonly VITE_CLIENT_SERVICE_URL: string
  readonly VITE_RAZORPAY_KEY_ID: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly DEV: boolean
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}