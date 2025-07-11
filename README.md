# Three.js Warehouse Layout Editor

This project is a 3D warehouse layout editor built with React and [react-three/fiber](https://github.com/pmndrs/react-three-fiber). It allows users to visually create, edit, and manage warehouse layouts by placing and manipulating cubes representing items within a bounded 3D space.

## Features

- Interactive 3D scene with draggable, resizable cubes representing warehouse items.
- Add, delete, and update item properties such as SKU, quantity, category, and color.
- Undo and redo changes to the layout.
- Import and export warehouse layouts as JSON files.
- Multiple saved layouts with easy switching.
- Snap cubes to a grid for precise placement.
- Camera controls with keyboard and mouse for easy navigation.
- Visual warehouse bounds with walls and grid.
- Background music and sound effects.
- Top-down map view for layout overview.
- Responsive toolbar with controls for layout management.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd threejs-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the app.

## Usage

- Use the toolbar to add new cubes (items) or delete selected ones.
- Click on cubes to select and edit their properties.
- Drag cubes around the 3D scene; snapping to grid is enabled by default.
- Use keyboard shortcuts:
  - Ctrl+Z / Cmd+Z: Undo
  - Ctrl+Y / Cmd+Y: Redo
  - Ctrl+C / Cmd+C: Copy selected cube
  - Ctrl+V / Cmd+V: Paste copied cube
- Import and export layouts using JSON files to save or load warehouse configurations.
- Toggle background music and sound effects from the toolbar.
- Switch between different saved layouts using the layout switcher.
- Use the top-down map view for a bird’s eye perspective of the layout.

## Project Structure

- `src/App.js`: Main React component managing state and layout logic.
- `src/components/SceneContents.js`: 3D scene rendering cubes, walls, and controls.
- `src/components/Toolbar.js`: UI controls for adding, deleting, importing, exporting, and toggling features.
- `src/components/ItemEditor.js`: Editor for item properties.
- `src/components/DimensionEditor.js`: Editor for cube dimensions.
- `src/components/TopDownMapView.js`: Top-down map visualization.
- `src/hooks/useCameraControls.js`: Custom hook for keyboard camera navigation.
- `public/sounds/`: Audio assets for background music and sound effects.

## Dependencies

- React
- @react-three/fiber
- @react-three/drei
- Three.js

## License

This project is licensed under the MIT License.

---

For more information on React and react-three/fiber, please refer to their official documentation.
