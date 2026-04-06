# GameShop Website 🎮

A modern, responsive e-commerce platform for buying and selling video games, built with Angular and Firebase.

## 📋 Overview

GameShop is a full-featured web application designed to provide users with an intuitive interface to browse, search, and purchase video games. The project leverages modern web technologies with a focus on performance and user experience.

### Tech Stack
- **Frontend Framework**: Angular 20.3.0
- **Styling**: SCSS (37.4% of codebase)
- **Language**: TypeScript (32.3% of codebase)
- **Markup**: HTML (30.3% of codebase)
- **UI Components**: Angular Material
- **Backend**: Firebase
- **Testing**: Jasmine + Karma
- **Package Manager**: npm

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed
- Angular CLI globally installed (`npm install -g @angular/cli`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aintira11/game_shop.git
cd game_shop
```

2. Install dependencies:
```bash
npm install
```

### Development Server

Start the local development server:
```bash
npm start
```
or
```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload when you modify source files.

## 📦 Project Structure

```
game_shop/
├── src/
│   ├── app/              # Angular application
│   ├── assets/           # Static assets
│   ├── styles.scss       # Global styles
│   └── main.ts           # Entry point
├── public/               # Public assets
├── angular.json          # Angular CLI config
├── tsconfig.json         # TypeScript config
├── firebase.json         # Firebase config
├── package.json          # Dependencies
└── README.md
```

## 🛠️ Available Commands

### Development
```bash
npm start           # Start development server
npm run watch       # Build in watch mode
```

### Production
```bash
npm run build       # Build for production (optimized)
```

### Testing
```bash
npm test            # Run unit tests with Karma
ng e2e              # Run end-to-end tests
```

### Code Generation
```bash
# Generate a new component
ng generate component component-name

# Generate other schematics (services, pipes, directives, etc.)
ng generate --help
```

## 📝 Development Notes

- **Styling**: SCSS is configured as the default stylesheet language for components
- **Formatting**: Prettier is configured with 100-character line width and single quotes
- **HTML Parser**: Uses Angular parser for HTML formatting
- **Performance**: Configured with production build optimizations and size budgets

## 🔧 Build Configuration

### Production Budgets
- Initial bundle: Max 3MB (warning at 1MB)
- Component styles: Max 12kB per component (warning at 10kB)
- Output hashing enabled for cache busting

### Development Features
- Source maps enabled
- No optimization for faster builds
- License extraction disabled

## 🔐 Firebase Integration

The project is configured with Firebase for:
- Backend services
- Authentication
- Data storage
- Hosting (optional)

Ensure your Firebase configuration is properly set in `firebase.json` and `.firebaserc`.

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [Angular Material](https://material.angular.io)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 License

This project is private. See the repository settings for more information.

## 👨‍💻 Author

Created by [@aintira11](https://github.com/aintira11)

---

**Last Updated**: October 2025
