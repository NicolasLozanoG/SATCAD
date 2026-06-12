import React, { useState } from 'react';
import { UI } from './components/UI';
import { Canvas3D } from './components/Canvas3D';
import { GraphView } from './components/GraphView';
import { useFactoryStore } from './store/useFactoryStore';

function App() {
  const [activeTool, setActiveTool] = useState(null);
  const { cameraMode } = useFactoryStore();

  return (
    <div className="app-container">
      {cameraMode === 'Graph' ? (
        <GraphView />
      ) : (
        <Canvas3D activeTool={activeTool} setActiveTool={setActiveTool} />
      )}
      <UI activeTool={activeTool} setActiveTool={setActiveTool} />
    </div>
  );
}

export default App;
