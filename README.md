# 🧁 Bakery Bliss - Artisan Bakery Management System

<div align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-ff69b4.svg?style=for-the-badge&logo=heart" alt="Made with Love">
  <img src="https://img.shields.io/badge/React-18.2.0-61dafb.svg?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178c6.svg?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express-4.18-000000.svg?style=for-the-badge&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791.svg?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
</div>

---

## 🍰 Welcome to Bakery Bliss

> *"Where every order is crafted with love and every bite tells a story of artisan excellence"*

**Bakery Bliss** is a comprehensive, full-stack bakery management system that revolutionizes how artisan bakeries operate. From custom cake creation to seamless order management, our platform brings the warmth of traditional baking into the digital age.

---

## ✨ Key Features

### 🎂 **Custom Cake Builder**
- **Interactive Design Studio**: Drag-and-drop interface for cake customization
- **Real-time Preview**: See your creation come to life instantly
- **Layer Management**: 2-layer and 3-layer cake options
- **Design Elements**: Butterflies, roses, strawberries, and more
- **Color Themes**: Green, pink, red color schemes

### 👥 **Multi-Role User Management**
- **🛍️ Customers**: Browse, order, and track custom cakes
- **👨‍🍳 Junior Bakers**: Handle assigned orders and communicate with customers
- **🧑‍🍳 Main Bakers**: Oversee operations, manage teams, and approve applications
- **👑 Administrators**: System oversight and user management

### 💬 **Advanced Communication System**
- **Customer-Baker Chat**: Direct communication for order clarification
- **Junior-Main Baker Chat**: Professional collaboration channels
- **Real-time Messaging**: Instant updates and notifications
- **Order-Specific Discussions**: Context-aware conversations

### 📊 **Baker Earnings & Payment System**
- **Transparent Earnings**: Real-time tracking of baker compensation
- **Order-Based Payments**: Fair distribution system
- **Performance Metrics**: Track completed orders and earnings
- **Financial Dashboard**: Comprehensive earning insights

### 🚀 **Career Progression System**
- **Baker Applications**: Customer to Junior Baker pathway
- **Promotion System**: Junior Baker to Main Baker advancement
- **Skill Assessment**: Order completion requirements
- **Team Management**: Main Baker oversight capabilities

---

## 🛠️ Technology Stack

### **Frontend Arsenal** 🎨
```typescript
⚛️  React 18.2.0          // Modern UI framework
🔷  TypeScript 5.0         // Type-safe development
🎨  Tailwind CSS 3.4       // Utility-first styling
🧩  Shadcn/UI             // Beautiful component library
🔄  React Query (TanStack) // Server state management
🛣️  Wouter               // Lightweight routing
📝  React Hook Form       // Form management
🎭  Framer Motion         // Smooth animations
```

### **Backend Foundation** ⚙️
```typescript
🚀  Express.js 4.18       // Web application framework
🔷  TypeScript 5.0        // Type-safe backend
🗄️  PostgreSQL 15        // Robust relational database
🔧  Drizzle ORM          // Type-safe database operations
🔐  JWT Authentication   // Secure user sessions
📝  Express Validator    // Input validation
🌐  CORS                 // Cross-origin resource sharing
```

### **Development Tools** 🔨
```bash
⚡  Vite 5.0             # Lightning-fast build tool
📦  npm                  # Package management
🔄  Hot Module Reload    # Instant development feedback
🎨  PostCSS              # CSS processing
📱  Responsive Design    # Mobile-first approach
```

---

## 🏗️ System Architecture

```mermaid
graph TB
    A[🌐 Frontend - React + TypeScript] --> B[🔗 API Layer - Express.js]
    B --> C[🗄️ Database - PostgreSQL]
    B --> D[🔐 Authentication - JWT]
    B --> E[📁 File Storage - Local/Cloud]
    
    F[👥 User Roles] --> G[🛍️ Customer]
    F --> H[👨‍🍳 Junior Baker]
    F --> I[🧑‍🍳 Main Baker]
    F --> J[👑 Admin]
    
    K[🎂 Core Features] --> L[Custom Cake Builder]
    K --> M[Order Management]
    K --> N[Chat System]
    K --> O[Payment Tracking]
    K --> P[User Progression]
```

---

## 🚀 Getting Started

### Prerequisites
```bash
📋 Node.js 18.0+ 
🗄️ PostgreSQL 15+
📦 npm or yarn
```

### Installation

1. **Clone the Sweet Repository** 🍯
```bash
git clone https://github.com/yourusername/bakery-bliss.git
cd bakery-bliss
```

2. **Install Dependencies** 📦
```bash
# Install all dependencies
npm install
```

3. **Environment Setup** 🔧
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
DATABASE_URL="postgresql://user:password@localhost:5432/bakery_bliss"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

4. **Database Setup** 🗄️
```bash
# Run database migrations
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

5. **Launch the Bakery** 🚀
```bash
# Start development server
npm run dev

# Server runs on http://localhost:5000
# Frontend runs on http://localhost:5173
```

---

## 📁 Project Structure

```
🏠 bakery-bliss/
├── 🎨 client/                    # Frontend React application
│   ├── 🏠 public/               # Static assets
│   ├── 📱 src/
│   │   ├── 🧩 components/       # Reusable UI components
│   │   ├── 📄 pages/           # Application pages
│   │   ├── 🔧 hooks/           # Custom React hooks
│   │   ├── 📚 lib/             # Utility functions
│   │   └── 🎨 styles/          # CSS and styling
├── ⚙️ server/                   # Backend Express application
│   ├── 🛣️ routes.ts            # API endpoints
│   ├── 💾 storage.ts           # Database operations
│   ├── 🗄️ db.ts               # Database connection
│   └── 🔐 auth.ts             # Authentication logic
├── 🤝 shared/                   # Shared types and schemas
├── 🗄️ drizzle/                 # Database schema and migrations
└── ⚙️ Configuration files
```

---

## 🎯 Core Features Deep Dive

### 🎂 Custom Cake Builder
The heart of Bakery Bliss - an intuitive, visual cake design system that allows customers to create their dream cakes.

**Features:**
- **Visual Editor**: Real-time cake preview with drag-and-drop interface
- **Layer Selection**: Choose between 2-layer and 3-layer designs
- **Design Library**: Extensive collection of decorative elements
- **Color Schemes**: Professionally curated color combinations
- **Save & Share**: Save designs and share with friends

### 👥 Role-Based Access Control
Sophisticated user management system supporting four distinct roles:

#### 🛍️ **Customer Features**
- Browse product catalog
- Create custom cake orders
- Track order progress
- Chat with assigned bakers
- Leave reviews and ratings

#### 👨‍🍳 **Junior Baker Features**
- View assigned orders
- Update order status
- Chat with customers
- Apply for promotion
- Track earnings

#### 🧑‍🍳 **Main Baker Features**
- Oversee all operations
- Manage junior baker teams
- Approve customer applications
- Handle complex orders
- Monitor team performance

#### 👑 **Administrator Features**
- User management
- System configuration
- Application approvals
- Analytics and reporting
- Platform oversight

### 💬 Real-Time Communication
Advanced chat system facilitating seamless communication:

- **Order-Specific Chats**: Contextual conversations tied to specific orders
- **Role-Based Access**: Appropriate communication channels for each user type
- **Message History**: Complete conversation records
- **Typing Indicators**: Real-time interaction feedback
- **File Sharing**: Share images and documents

---

## 🔒 Security Features

- **🛡️ JWT Authentication**: Secure token-based authentication
- **🔐 Password Hashing**: Bcrypt encryption for user passwords
- **⚡ Rate Limiting**: API endpoint protection
- **🌐 CORS Configuration**: Secure cross-origin requests
- **✅ Input Validation**: Comprehensive data validation
- **🔍 SQL Injection Prevention**: Parameterized queries

---

## 📊 Database Schema

Our robust PostgreSQL schema supports complex bakery operations:

### Core Tables
- **👥 Users**: User authentication and profiles
- **🎂 Products**: Bakery product catalog
- **📋 Orders**: Order management and tracking
- **💬 Chats**: Communication system
- **💰 Baker Earnings**: Payment tracking
- **🏢 Baker Teams**: Team organization
- **📝 Applications**: Role progression system

---

## 🧪 Testing Strategy

```bash
# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# End-to-End Tests
npm run test:e2e

# Test Coverage
npm run test:coverage
```

---

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configurations
- **Development**: Full debugging and hot reload
- **Staging**: Production-like environment for testing
- **Production**: Optimized build with monitoring

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **🍴 Fork the repository**
2. **🌿 Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **💾 Commit your changes**: `git commit -m 'Add amazing feature'`
4. **📤 Push to branch**: `git push origin feature/amazing-feature`
5. **🎯 Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow commit message conventions

---

## 📝 API Documentation

### Authentication Endpoints
```typescript
POST /api/auth/login     // User login
POST /api/auth/register  // User registration
POST /api/auth/logout    // User logout
GET  /api/auth/me        // Get current user
```

### Order Management
```typescript
GET    /api/orders           // Get all orders
POST   /api/orders           // Create new order
GET    /api/orders/:id       // Get specific order
PATCH  /api/orders/:id       // Update order
DELETE /api/orders/:id       // Cancel order
```

### Custom Cake Builder
```typescript
GET  /api/cake-builder/shapes      // Get available shapes
GET  /api/cake-builder/flavors     // Get available flavors
GET  /api/cake-builder/decorations // Get decorations
POST /api/custom-cakes             // Save custom design
```

---

## 🌟 Future Enhancements

### 🔮 Roadmap
- **📱 Mobile App**: React Native implementation
- **🤖 AI Integration**: Smart cake design suggestions
- **📊 Advanced Analytics**: Business intelligence dashboard
- **🌍 Multi-language**: Internationalization support
- **💳 Payment Gateway**: Stripe/PayPal integration
- **📦 Inventory Management**: Stock tracking system

---

## 🐛 Known Issues & Solutions

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running
2. **Environment Variables**: Verify .env configuration
3. **Port Conflicts**: Check if ports 5000/5173 are available

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Design Inspiration**: Modern bakery aesthetics
- **Community**: Open source contributors
- **Technologies**: Amazing tools that made this possible
- **Feedback**: Beta users and testers

---

## 📞 Support & Contact

- **📧 Email**: support@bakerybliss.com
- **💬 Discord**: [Join our community](https://discord.gg/bakerybliss)
- **🐛 Issues**: [GitHub Issues](https://github.com/yourusername/bakery-bliss/issues)
- **📖 Documentation**: [Full Docs](https://docs.bakerybliss.com)

---

<div align="center">
  <h3>🧁 Made with Love, Powered by Code 🧁</h3>
  <p><i>"Baking the future, one commit at a time"</i></p>
  
  <img src="https://img.shields.io/badge/⭐-Star%20this%20repository-yellow.svg?style=for-the-badge" alt="Star Repository">
</div>
