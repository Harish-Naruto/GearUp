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
- Secure authentication and authorization using JWT and/or Supabase Auth.
- Containerized deployment with Docker for easy setup and scaling.

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: WebSocket or Redis Pub/Sub for notifications and messaging
- **Storage**: MinIO or AWS S3-compatible storage for documents and images
- **Deployment**: Docker & Docker Compose

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Docker & Docker Compose (optional)
- Supabase account and project for backend services

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Harish-Naruto/GearUp.git
cd GearUp
```
2. Install dependencies:
   ```bash
   npm install && cd ./server && npm install
   ```
3. Start the backend and frontend servers:
   ```bash
   npm run dev
   ```  
