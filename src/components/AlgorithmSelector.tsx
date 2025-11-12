import React from 'react';

const algorithms = [
  { value: 'dijkstra', label: 'Dijkstra\'s Algorithm' },
  { value: 'astar', label: 'A* Algorithm' },
  { value: 'bfs', label: 'Breadth-First Search' },
  { value: 'dfs', label: 'Depth-First Search' },
];

interface AlgorithmSelectorProps {
  selectedAlgorithm: string;
  onAlgorithmChange: (algorithm: string) => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({ selectedAlgorithm, onAlgorithmChange }) => {
  return (
    <div className="algorithm-selector">
      <label htmlFor="algorithm">Select Algorithm:</label>
      <select
        id="algorithm"
        value={selectedAlgorithm}
        onChange={(e) => onAlgorithmChange(e.target.value)}
      >
        {algorithms.map((algorithm) => (
          <option key={algorithm.value} value={algorithm.value}>
            {algorithm.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AlgorithmSelector;