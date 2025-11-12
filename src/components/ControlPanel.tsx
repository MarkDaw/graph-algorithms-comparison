import React, { useState } from 'react';
import type { AlgorithmType, Node } from '../types';
import './ControlPanel.css';

interface ControlPanelProps {
  onGenerateGraph: (nodeCount: number, density: number) => void;
  algorithm1: AlgorithmType;
  algorithm2: AlgorithmType;
  onAlgorithm1Change: (algorithm: AlgorithmType) => void;
  onAlgorithm2Change: (algorithm: AlgorithmType) => void;
  startNode: string;
  endNode: string;
  onStartNodeChange: (nodeId: string) => void;
  onEndNodeChange: (nodeId: string) => void;
  nodes: Node[];
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const algorithms: { value: AlgorithmType; label: string }[] = [
  { value: 'dijkstra', label: "Dijkstra's Algorithm" },
  { value: 'astar', label: 'A* Algorithm' },
  { value: 'bfs', label: 'Breadth-First Search' },
  { value: 'dfs', label: 'Depth-First Search' },
];

const speeds = [
  { value: 1000, label: 'Very Slow (1s)' },
  { value: 500, label: 'Slow (0.5s)' },
  { value: 300, label: 'Normal (0.3s)' },
  { value: 150, label: 'Fast (0.15s)' },
  { value: 50, label: 'Very Fast (0.05s)' },
];

const getAlgorithmInfo = (algo: AlgorithmType) => {
  const info = {
    dijkstra: {
      badge: '⚖️ Weighted',
      tooltip: 'Finds shortest path considering edge weights'
    },
    astar: {
      badge: '🎯 Heuristic',
      tooltip: 'Optimized shortest path with heuristic'
    },
    bfs: {
      badge: '📊 Unweighted',
      tooltip: 'Ignores edge weights, explores level by level'
    },
    dfs: {
      badge: '🔍 Depth-First',
      tooltip: 'Does not guarantee shortest path'
    }
  };
  return info[algo];
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  onGenerateGraph,
  algorithm1,
  algorithm2,
  onAlgorithm1Change,
  onAlgorithm2Change,
  startNode,
  endNode,
  onStartNodeChange,
  onEndNodeChange,
  nodes,
  speed,
  onSpeedChange,
}) => {
  const [nodeCount, setNodeCount] = useState(50);
  const [density, setDensity] = useState(0.02);

  return (
    <div className="control-panel">
      <h2>⚙️ Control Panel</h2>
      
      <div className="control-section">
        <h3>📊 Graph Generation</h3>
        <div className="control-group">
          <label htmlFor="node-count">
            Nodes: <strong>{nodeCount}</strong>
          </label>
          <input
            type="range"
            id="node-count"
            min="3"
            max="50"
            value={nodeCount}
            onChange={(e) => setNodeCount(Number(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label htmlFor="density">
            Edge Density: <strong>{density.toFixed(2)}</strong>
          </label>
          <input
            type="range"
            id="density"
            min="1"
            max="1"
            step="0.01"
            value={density}
            onChange={(e) => setDensity(Number(e.target.value))}
          />
        </div>
        
        <button
          className="btn btn-primary"
          onClick={() => onGenerateGraph(nodeCount, density)}
        >
          🔄 Generate New Graph
        </button>
      </div>

      <div className="control-section">
        <h3>🤖 Algorithm Selection</h3>
        
        <div className="control-group">
          <label htmlFor="algorithm1">
            <span className="algorithm-label left">Left Algorithm:</span>
          </label>
          <select
            id="algorithm1"
            value={algorithm1}
            onChange={(e) => onAlgorithm1Change(e.target.value as AlgorithmType)}
          >
            {algorithms.map((algo) => (
              <option key={algo.value} value={algo.value}>
                {algo.label}
              </option>
            ))}
          </select>
          <span className="algorithm-badge" title={getAlgorithmInfo(algorithm1).tooltip}>
            {getAlgorithmInfo(algorithm1).badge}
          </span>
        </div>
        
        <div className="control-group">
          <label htmlFor="algorithm2">
            <span className="algorithm-label right">Right Algorithm:</span>
          </label>
          <select
            id="algorithm2"
            value={algorithm2}
            onChange={(e) => onAlgorithm2Change(e.target.value as AlgorithmType)}
          >
            {algorithms.map((algo) => (
              <option key={algo.value} value={algo.value}>
                {algo.label}
              </option>
            ))}
          </select>
          <span className="algorithm-badge" title={getAlgorithmInfo(algorithm2).tooltip}>
            {getAlgorithmInfo(algorithm2).badge}
          </span>
        </div>
      </div>

      <div className="control-section">
        <h3>⚡ Animation Speed</h3>
        <div className="control-group">
          <label htmlFor="speed">
            Speed:
          </label>
          <select
            id="speed"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
          >
            {speeds.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="control-section">
        <h3>🎯 Start & End Nodes</h3>
        <div className="control-group">
          <label htmlFor="start-node">
            🟢 Start Node:
          </label>
          <select
            id="start-node"
            value={startNode}
            onChange={(e) => onStartNodeChange(e.target.value)}
          >
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                Node {node.label || node.id.split('-')[1]}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="end-node">
            🔴 End Node:
          </label>
          <select
            id="end-node"
            value={endNode}
            onChange={(e) => onEndNodeChange(e.target.value)}
          >
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                Node {node.label || node.id.split('-')[1]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="control-section info-section">
        <h3>ℹ️ Legend</h3>
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#4CAF50' }}></div>
            <span>Start Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#F44336' }}></div>
            <span>End Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#FFC107' }}></div>
            <span>Current Node</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#E3F2FD', border: '2px solid #2196F3' }}></div>
            <span>Visited</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;