# Bakery Bliss Application Guide

## Overview

This repository contains a full-stack web application for "Bakery Bliss" - an online bakery shop that allows customers to browse products, build custom cakes, place orders, and track their order status. The application also includes different dashboards for various roles: customers, junior bakers, and main bakers.

The application uses a modern tech stack with React for the frontend, Express for the backend, and a PostgreSQL database with Drizzle ORM for data management. The codebase follows a client-server architecture with shared types between them.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React and uses several key libraries:

1. **Routing**: Uses Wouter for client-side routing
2. **State Management**: Combination of React Hooks and React Query
3. **UI Components**: ShadCN UI library combined with Radix UI primitives
4. **Styling**: Tailwind CSS for styling with a customized theme

The frontend follows a component-based architecture with pages, components, hooks, and utility functions organized in separate directories.

### Backend Architecture

The backend is built with Express.js and follows a RESTful API design:

1. **API Routes**: Organized in server/routes.ts
2. **Database Access**: Abstracted through a storage interface that uses Drizzle ORM
3. **Authentication**: JWT-based authentication system
4. **Real-time Communication**: WebSocket support for chat functionality

### Data Storage

Data is managed using Drizzle ORM with PostgreSQL:

1. **Schema Definition**: Defined in shared/schema.ts using Drizzle's schema builder
2. **Database Connection**: Managed through @neondatabase/serverless

## Key Components

### Frontend Components

1. **Pages**: Individual route components like Home, Products, Login, Register, and role-specific dashboards
2. **UI Components**: Reusable components built with Radix UI primitives
3. **Layout Components**: AppLayout and other structural components
4. **Custom Hooks**: Auth, Cart, Chat, and other state management hooks

### Backend Components

1. **Routes**: API endpoint handlers
2. **Storage Interface**: Database access abstraction
3. **Authentication Middleware**: User authentication and authorization
4. **WebSocket Server**: Real-time chat functionality

### Shared Components

1. **Schema**: Database schema definitions shared between frontend and backend
2. **Types**: TypeScript types for data models

## Data Flow

1. **User Authentication Flow**:
   - User submits credentials via login form
   - Backend validates and returns a JWT token
   - Frontend stores token in localStorage
   - Token is sent with subsequent API requests

2. **Product Browsing Flow**:
   - Frontend fetches products from API
   - User can filter and sort products
   - Add products to cart

3. **Custom Cake Builder Flow**:
   - User selects cake shape, flavor, frosting, and decorations
   - Price is calculated in real-time
   - Custom cake is added to cart

4. **Order Management Flow**:
   - User places order from cart
   - Order is assigned to a baker
   - Order status is updated throughout the process
   - Real-time chat between customer and baker

## External Dependencies

### Frontend Dependencies

- **@radix-ui** components for UI primitives
- **@tanstack/react-query** for data fetching
- **wouter** for client-side routing
- **tailwindcss** for styling
- **clsx** and **class-variance-authority** for conditional styling
- **lucide-react** for icons

### Backend Dependencies

- **express** for the web server
- **jsonwebtoken** and **bcryptjs** for authentication
- **drizzle-orm** for database access
- **ws** for WebSocket support
- **zod** for validation

## Deployment Strategy

The application is configured to be deployed on Replit:

1. **Development**: Uses `npm run dev` to start the development server
2. **Build**: Uses Vite to build the frontend and esbuild for the backend
3. **Production**: Serves the built frontend from static files and runs the backend server

The `.replit` file is configured with necessary modules (nodejs-20, web, postgresql-16) and deployment settings.

## Database Setup

The system uses PostgreSQL with Drizzle ORM:

1. **Schema**: Defined in `shared/schema.ts` with tables for users, products, cakes, orders, etc.
2. **Migration**: Uses Drizzle Kit for database migrations
3. **Connection**: Utilizes Neon Database's serverless PostgreSQL client

The application expects a `DATABASE_URL` environment variable to be set for database connection.

## Getting Started

1. Ensure the environment variable `DATABASE_URL` is set for database connection
2. Run `npm install` to install dependencies
3. For development, run `npm run dev`
4. For production, run `npm run build` followed by `npm run start`
5. To update the database schema, run `npm run db:push`