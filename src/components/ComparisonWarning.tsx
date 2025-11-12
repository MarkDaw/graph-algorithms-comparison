import React from 'react';
import './ComparisonWarning.css';

interface ComparisonWarningProps {
  algorithm1: string;
  algorithm2: string;
}

const ComparisonWarning: React.FC<ComparisonWarningProps> = ({ algorithm1, algorithm2 }) => {
  const getWarningInfo = () => {
    const isAlgo1Optimal = algorithm1 === 'dijkstra' || algorithm1 === 'astar';
    const isAlgo2Optimal = algorithm2 === 'dijkstra' || algorithm2 === 'astar';
    
    // Both optimal - fair comparison
    if (isAlgo1Optimal && isAlgo2Optimal) {
      return {
        type: 'success',
        icon: '✅',
        title: 'Fair Race: Both Guarantee Shortest Path',
        message: 'Both algorithms will find the optimal weighted path. The winner will be determined by who finishes first.',
        details: algorithm1 === 'dijkstra' && algorithm2 === 'astar' 
          ? 'A* uses a heuristic to guide search, potentially finishing faster. Dijkstra explores uniformly in all directions.'
          : 'Both use similar strategies to guarantee the shortest path.'
      };
    }
    
    // One optimal, one not - educational comparison
    if ((isAlgo1Optimal && !isAlgo2Optimal) || (!isAlgo1Optimal && isAlgo2Optimal)) {
      const optimalAlgo = isAlgo1Optimal ? algorithm1.toUpperCase() : algorithm2.toUpperCase();
      const nonOptimalAlgo = isAlgo1Optimal ? algorithm2.toUpperCase() : algorithm1.toUpperCase();
      
      return {
        type: 'warning',
        icon: '⚠️',
        title: 'Educational Comparison: Different Guarantees',
        message: `${optimalAlgo} guarantees the shortest weighted path. ${nonOptimalAlgo} does not - it may find a path faster but it might not be optimal.`,
        details: `Winner is determined by: (1) Who finishes first, (2) Path distance, (3) Efficiency (nodes visited). ${nonOptimalAlgo} may "win" by finishing first, but with a longer path.`
      };
    }
    
    // Both non-optimal
    if (!isAlgo1Optimal && !isAlgo2Optimal) {
      return {
        type: 'info',
        icon: 'ℹ️',
        title: 'Educational Race: Neither Guarantees Optimality',
        message: 'BFS and DFS use different exploration strategies but neither considers edge weights.',
        details: 'Winner is determined by who finishes first. The path found may not be the shortest in terms of total weight.'
      };
    }
    
    return null;
  };

  const warning = getWarningInfo();
  
  if (!warning) return null;

  return (
    <div className={`comparison-warning ${warning.type}`}>
      <div className="warning-header">
        <span className="warning-icon">{warning.icon}</span>
        <h3>{warning.title}</h3>
      </div>
      <p className="warning-message">{warning.message}</p>
      {warning.details && (
        <p className="warning-details">
          <strong>Race Rules:</strong> {warning.details}
        </p>
      )}
    </div>
  );
};

export default ComparisonWarning;