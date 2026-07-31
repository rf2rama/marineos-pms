# MarineOS PMS

MarineOS Planned Maintenance System (PMS) is a modern web application for managing vessel operations, maintenance, crew requisitions, and voyage planning.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

## Getting Started

This project is structured as an npm monorepo (workspaces). Follow these steps to get the development environment running:

### 1. Install Dependencies
Open your terminal, navigate to the root of the project (where this README is located), and install the dependencies:
```bash
npm install
```

### 2. Run the Development Server
The project contains multiple apps within its workspaces. You can run them using the built-in npm scripts.

To run the main **Management** application (default):
```bash
npm run dev
```
*(This is equivalent to running `npm run dev:management`)*

To run the **Crew** application:
```bash
npm run dev:crew
```

### 3. Access the Application
Once the server starts, it will provide a local URL in the terminal (typically `http://localhost:3000` or `http://localhost:5173`). Open that URL in your web browser to access the app.

## Build for Production
To build all workspaces for production:
```bash
npm run build
```

## Troubleshooting
- **Port already in use**: If you see an error that port 3000 or 5173 is in use, either stop the existing process or let Vite automatically assign the next available port.
- **Missing dependencies**: If you encounter errors about missing modules after pulling new code, run `npm install` again.
- **Server crash**: If the development server unexpectedly exits (e.g., due to a syntax error during live-reloading), simply press `Ctrl+C` and run `npm run dev` again.
