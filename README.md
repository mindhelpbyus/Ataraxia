# Ataraxia - Frontend Application

Modern React-based frontend application for the Ataraxia healthcare platform, providing interfaces for therapists, clients, and administrators.

## 🚀 Features

- **Authentication System**: Secure login/registration with Cognito integration
- **Therapist Interface**: Profile management, client scheduling, verification workflow
- **Client Interface**: Therapist search, appointment booking, profile management
- **Admin Dashboard**: User management, verification oversight, system monitoring
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Real-time Updates**: WebSocket integration for live notifications

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules, Responsive Design
- **Authentication**: AWS Cognito, JWT tokens
- **State Management**: React Context, Custom hooks
- **API Integration**: Axios, RESTful APIs
- **Build Tool**: Vite with hot reload

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://your-api-gateway-url.amazonaws.com/dev/
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_AWS_REGION=us-west-2
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API services and utilities
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles and themes
```

## 🌐 Key Components

### Authentication
- Secure login/registration flow
- Password reset functionality
- Multi-factor authentication support
- Session management

### Therapist Features
- Comprehensive profile management
- Availability scheduling
- Client communication tools
- Verification document upload

### Client Features
- Advanced therapist search
- Appointment booking system
- Secure messaging
- Treatment progress tracking

## 🔗 Related Repositories

- **Backend**: [Ataraxia-Next](../Ataraxia-Next) - Modern serverless backend
- **Legacy Backend**: [Ataraxia-Backend](../Ataraxia_backend) - Original backend system

## 📚 Documentation

- [API Integration Guide](docs/api-integration.md)
- [Authentication Flow](docs/authentication.md)
- [Component Library](docs/components.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for Ataraxia Healthcare Platform.

## 🆘 Support

For support and questions, please contact the development team or create an issue in this repository.