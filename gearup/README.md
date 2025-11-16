# GearUp — Vehicle Service Management Platform

GearUp is a full-stack web application designed to digitize and streamline vehicle repair services. The platform connects vehicle owners with garages, allowing seamless booking, management, and execution of repair orders.

## User Roles & Features

### Customer
- Browse and search for garages offering various repair services.
- Book vehicle repair orders online with detailed service descriptions.
- Track the status of ongoing repair orders in real-time.
- Manage user profile and view order history.

### Garage Manager
- Register and manage their garage/shop details and service offerings.
- Receive and manage incoming vehicle repair orders.
- Assign jobs to workers and oversee workflow progress.
- Get real-time notifications of new bookings and order updates.
- Manage garage profile and operational hours.

### Worker
- View assigned repair tasks and accept or reject jobs.
- Update job status and progress in real-time.
- Communicate with garage managers and customers if needed.
- Track completed jobs and performance metrics.

## Key Features
- Real-time booking and notification system using WebSockets.
- Role-based access control for customers, garage managers, and workers.
- Comprehensive dashboards tailored to each user role.
- Secure authentication and authorization using JWT and Supabase Auth.
- Responsive design with modern UI components.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Material-UI
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: Socket.IO for notifications and messaging
- **Authentication**: Supabase Auth with JWT tokens
- **Styling**: Tailwind CSS, Bootstrap, Styled Components
- **Development**: ESLint, Prettier, Nodemon

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Supabase account and project for backend services

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Harish-Naruto/GearUp.git
cd GearUp/gearup
```

2. **Install frontend dependencies:**

```bash
npm install
```

3. **Install backend dependencies:**

```bash
cd src/server
npm install
cd ../..
```

4. **Configure Environment Variables:**

Create a `.env` file in the root of the `gearup` folder with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Backend Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# Logging
LOG_LEVEL=info
```

Replace the placeholder values with your actual Supabase credentials.

5. **Set up the database:**

Configure your Supabase database with the necessary tables. You can find migration files in `src/supabase/migrations/`.

### Running the Application

#### Development Mode

1. **Start the backend server:**

```bash
cd src/server
npm run dev
```

The backend server will start on `http://localhost:3000`

2. **In a new terminal, start the frontend development server:**

```bash
# From the gearup directory
npm run dev
```

The frontend will start on `http://localhost:5173`

#### Production Build

1. **Build the frontend:**

```bash
npm run build
```

2. **Preview the production build:**

```bash
npm run preview
```

## Project Structure

```
gearup/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, and other assets
│   ├── components/      # Reusable React components
│   │   ├── common/      # Common components (buttons, forms, etc.)
│   │   └── ...
│   ├── contexts/        # React Context providers (Auth, Theme, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Layout components (MainLayout, DashboardLayout)
│   ├── lib/             # Utility libraries and helpers
│   ├── pages/           # Page components
│   │   ├── auth/        # Authentication pages
│   │   ├── dashboard/   # Dashboard pages
│   │   ├── bookings/    # Booking management pages
│   │   ├── garages/     # Garage listing and details
│   │   ├── manager/     # Manager-specific pages
│   │   ├── worker/      # Worker-specific pages
│   │   └── ...
│   ├── server/          # Backend Express.js application
│   │   ├── config/      # Server configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── middlewares/ # Express middlewares
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic services
│   │   ├── utils/       # Utility functions
│   │   └── validations/ # Request validation schemas
│   ├── styles/          # Global styles
│   ├── supabase/        # Supabase migrations and configuration
│   ├── utils/           # Frontend utility functions
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── .gitignore
├── package.json
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md
```

## Available Scripts

### Frontend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

### Backend

- `npm run dev` - Start backend server with nodemon (auto-reload)
- `npm start` - Start backend server in production mode
- `npm test` - Run backend tests
- `npm run lint` - Run ESLint on backend code
- `npm run format` - Format code with Prettier

## API Endpoints

The backend API provides the following main endpoints:

- `/api/auth/*` - Authentication and user management
- `/api/bookings/*` - Booking creation and management
- `/api/garages/*` - Garage listing and details
- `/api/users/*` - User profile management
- `/api/workers/*` - Worker assignment and management
- `/health` - Health check endpoint

For detailed API documentation, refer to the backend route files in `src/server/routes/`.

## Features in Development

- Payment integration for booking transactions
- Advanced reporting and analytics
- Mobile application (React Native)
- Email notification system
- Review and rating system

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing code style and includes appropriate tests.

## Troubleshooting

### Common Issues

**Frontend won't start:**
- Ensure Node.js version is 18 or higher
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Check if port 5173 is already in use

**Backend connection errors:**
- Verify your `.env` file has correct Supabase credentials
- Ensure the backend server is running on port 3000
- Check CORS_ORIGIN matches your frontend URL

**Database errors:**
- Confirm your Supabase project is active
- Run the migrations in `src/supabase/migrations/`
- Check database connection credentials

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/Harish-Naruto/GearUp/issues).

---

**Built with ❤️ for the vehicle service industry**
