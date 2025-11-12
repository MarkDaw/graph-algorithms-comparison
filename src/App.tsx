import { useState } from 'react';
import './App.css';
import type { Graph, AlgorithmType } from './types';
import { generateRandomGraph } from './utils/graphGenerator';
import ControlPanel from './components/ControlPanel';
import ComparisonView from './components/ComparisonView';
import './styles/global.css';

function App() {
  const [graph, setGraph] = useState<Graph>(generateRandomGraph(8, 0.3));
  const [algorithm1, setAlgorithm1] = useState<AlgorithmType>('dijkstra');
  const [algorithm2, setAlgorithm2] = useState<AlgorithmType>('bfs');
  const [startNode, setStartNode] = useState<string>('node-0');
  const [endNode, setEndNode] = useState<string>('node-7');
  const [speed, setSpeed] = useState<number>(300);

  const handleGenerateGraph = (nodeCount: number, density: number) => {
    const newGraph = generateRandomGraph(nodeCount, density);
    setGraph(newGraph);
    setStartNode(newGraph.nodes[0]?.id || '');
    setEndNode(newGraph.nodes[newGraph.nodes.length - 1]?.id || '');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔍 Graph Algorithms Visualizer</h1>
        <p>Compare pathfinding algorithms step by step</p>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <ControlPanel
            onGenerateGraph={handleGenerateGraph}
            algorithm1={algorithm1}
            algorithm2={algorithm2}
            onAlgorithm1Change={setAlgorithm1}
            onAlgorithm2Change={setAlgorithm2}
            startNode={startNode}
            endNode={endNode}
            onStartNodeChange={setStartNode}
            onEndNodeChange={setEndNode}
            nodes={graph.nodes}
            speed={speed}
            onSpeedChange={setSpeed}
          />
        </aside>

        <main className="main-content">
          <ComparisonView
            graph={graph}
            startNode={startNode}
            endNode={endNode}
            algorithm1={algorithm1}
            algorithm2={algorithm2}
            speed={speed}
          />
        </main>
      </div>
      <footer>
      <p>Powered by <a href='https://mardev.es'>mardev.es</a></p>
      </footer>
    </div>
  );
}

export default App;
