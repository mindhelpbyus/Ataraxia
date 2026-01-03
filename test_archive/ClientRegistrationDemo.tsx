import React from 'react';
import { ClientSelfRegistrationForm } from './ClientSelfRegistrationForm';

// This component demonstrates the client self-registration flow
// In production, this would be accessed via the registration link sent to the client's email

export function ClientRegistrationDemo() {
  // Parse URL params to get client info (sent via registration link)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || '';
  
  // In production, decode token from backend to get client info
  // For demo purposes, using hardcoded values
  const clientInfo = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    token: token
  };

  return (
    <ClientSelfRegistrationForm
      clientEmail={clientInfo.email}
      clientPhone={clientInfo.phone}
      clientFirstName={clientInfo.firstName}
      clientLastName={clientInfo.lastName}
      registrationToken={clientInfo.token}
      onComplete={() => {
        console.log('Registration completed!');
      }}
    />
  );
}
