# SatCAD (Proyecto-SatCAD)

SatCAD is a web-based visualization and planning tool for the game **Satisfactory**. It allows users to view and manage factory layouts and blueprints using both a 3D Canvas and a 2D Node-based Graph View.

## Features

- **3D Visualization:** View your factory blueprints in 3D using `Three.js` and `@react-three/fiber`.
- **Node-based Graph View:** Plan and analyze your factory layouts using a node-based graph interface powered by `React Flow` (`@xyflow/react`).
- **Satisfactory File Parsing:** Reads and parses Satisfactory game files directly using `@etothepii/satisfactory-file-parser`.
- **State Management:** Fast and lightweight state management using `Zustand`.

## Technologies Used

- **React 19**
- **Vite**
- **Three.js** (`@react-three/fiber`, `@react-three/drei`)
- **React Flow** (`@xyflow/react`)
- **Zustand**
- **Dagre** (for automatic graph layout)
- **Lucide React** (for icons)

## How to Use

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) and `npm` installed on your machine.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/NicolasLozanoG/SATCAD.git
   cd SATCAD
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

To start the local development server, run:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the port specified in your console).

### Building for Production

To build the project for production, run:
```bash
npm run build
```
The built files will be output to the `dist/` directory. You can preview the production build using:
```bash
npm run preview
```

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
