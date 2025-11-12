import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Graph, PathStep, AlgorithmType } from '../types/index.js';
import { dijkstra } from '../algorithms/dijkstra';
import { bfs } from '../algorithms/bfs';
import { dfs } from '../algorithms/dfs';
import { astar } from '../algorithms/astar';
import StepControls from './StepControls';
import ComparisonWarning from './ComparisonWarning';

export interface ComparisonViewProps {
  graph: Graph;
  startNode: string;
  endNode: string;
  algorithm1?: AlgorithmType;
  algorithm2?: AlgorithmType;
  speed: number;
}

const algorithmMap = {
  dijkstra,
  bfs,
  dfs,
  astar,
};

const algorithmNames = {
  dijkstra: "Dijkstra's Algorithm",
  bfs: 'Breadth-First Search',
  dfs: 'Depth-First Search',
  astar: 'A* Algorithm',
};

const ComparisonView: React.FC<ComparisonViewProps> = ({ 
  graph, 
  startNode, 
  endNode,
  algorithm1 = 'dijkstra',
  algorithm2 = 'bfs',
  speed
}) => {
  const canvasLeftRef = useRef<HTMLCanvasElement>(null);
  const canvasRightRef = useRef<HTMLCanvasElement>(null);
  
  const [leftSteps, setLeftSteps] = useState<PathStep[]>([]);
  const [rightSteps, setRightSteps] = useState<PathStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<'left' | 'right' | 'tie' | null>(null);

  // Calculate maxSteps here to avoid "used before declaration" error
  const maxSteps = Math.max(leftSteps.length, rightSteps.length);

  useEffect(() => {
    // Run left algorithm
    const leftResult = algorithmMap[algorithm1]({ startNode, endNode, graph });
    setLeftSteps(leftResult.steps);
    
    // Run right algorithm
    const rightResult = algorithmMap[algorithm2]({ startNode, endNode, graph });
    setRightSteps(rightResult.steps);
    
    setCurrentStep(0);
    setIsPlaying(false);
    setWinner(null);
  }, [graph, startNode, endNode, algorithm1, algorithm2]);

  useEffect(() => {
    // Determine winner when race is complete
    if (currentStep >= maxSteps - 1 && leftSteps.length > 0 && rightSteps.length > 0) {
      const leftFinal = leftSteps[leftSteps.length - 1];
      const rightFinal = rightSteps[rightSteps.length - 1];
      
      // Check if both found a path
      const leftFoundPath = leftFinal.path.length > 0 && leftFinal.path[0] === startNode && leftFinal.path[leftFinal.path.length - 1] === endNode;
      const rightFoundPath = rightFinal.path.length > 0 && rightFinal.path[0] === startNode && rightFinal.path[rightFinal.path.length - 1] === endNode;
      
      // If neither found a path, it's a tie
      if (!leftFoundPath && !rightFoundPath) {
        setWinner('tie');
        return;
      }
      
      // If only one found a path, it wins
      if (leftFoundPath && !rightFoundPath) {
        setWinner('left');
        return;
      }
      
      if (rightFoundPath && !leftFoundPath) {
        setWinner('right');
        return;
      }
      
      // Both found a path - determine winner by who finished first (fewer steps)
      const leftFinishStep = leftSteps.findIndex(step => step.isComplete);
      const rightFinishStep = rightSteps.findIndex(step => step.isComplete);
      
      // If one finished before the other, it wins
      if (leftFinishStep !== -1 && rightFinishStep !== -1) {
        if (leftFinishStep < rightFinishStep) {
          setWinner('left');
          return;
        } else if (rightFinishStep < leftFinishStep) {
          setWinner('right');
          return;
        }
      }
      
      // Both finished at the same step - compare by efficiency (fewer visited nodes)
      const leftVisited = leftFinal.visitedNodes.size;
      const rightVisited = rightFinal.visitedNodes.size;
      
      if (leftVisited < rightVisited) {
        setWinner('left');
      } else if (rightVisited < leftVisited) {
        setWinner('right');
      } else {
        // Same visited nodes = perfect tie
        setWinner('tie');
      }
    }
  }, [currentStep, leftSteps, rightSteps, startNode, endNode, maxSteps]);

  const drawGraph = useCallback((
    canvas: HTMLCanvasElement | null,
    stepData: PathStep | undefined,
    title: string,
    isWinner: boolean,
    isTie: boolean
  ) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 0.45;
    const offsetX = 50;
    const offsetY = 60;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw winner/tie indicator background
    if (isWinner || isTie) {
      ctx.fillStyle = isWinner ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 193, 7, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw border
      ctx.strokeStyle = isWinner ? '#4CAF50' : '#FFC107';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    }

    // Draw title with winner indicator
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 25);
    
    if (isWinner) {
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('🏆 FINISHED FIRST!', canvas.width / 2, 45);
    } else if (isTie) {
      ctx.fillStyle = '#FFC107';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('🤝 TIE!', canvas.width / 2, 45);
    }

    // Create sets for path nodes and edges
    const pathNodesSet = new Set<string>(stepData?.path || []);
    const pathEdgesSet = new Set<string>();
    
    if (stepData?.path && stepData.path.length > 1) {
      for (let i = 0; i < stepData.path.length - 1; i++) {
        const edge1 = `${stepData.path[i]}-${stepData.path[i + 1]}`;
        const edge2 = `${stepData.path[i + 1]}-${stepData.path[i]}`;
        pathEdgesSet.add(edge1);
        pathEdgesSet.add(edge2);
      }
    }

    // ===================================================================
    // LAYER 1: Draw ALL edges that are NOT in the path (background/dimmed)
    // ===================================================================
    graph.edges.forEach(edge => {
      const edgeKey1 = `${edge.from}-${edge.to}`;
      const edgeKey2 = `${edge.to}-${edge.from}`;
      const isInPath = pathEdgesSet.has(edgeKey1) || pathEdgesSet.has(edgeKey2);
      
      if (isInPath) return; // Skip path edges for now
      
      const fromNode = graph.nodes.find(n => n.id === edge.from);
      const toNode = graph.nodes.find(n => n.id === edge.to);
      
      if (!fromNode || !toNode) return;

      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(fromNode.x * scale + offsetX, fromNode.y * scale + offsetY);
      ctx.lineTo(toNode.x * scale + offsetX, toNode.y * scale + offsetY);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw weight (dimmed)
      const midX = ((fromNode.x + toNode.x) / 2) * scale + offsetX;
      const midY = ((fromNode.y + toNode.y) / 2) * scale + offsetY;
      ctx.fillStyle = '#bbb';
      ctx.globalAlpha = 0.4;
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(edge.weight.toString(), midX, midY);
      ctx.globalAlpha = 1;
    });

    // ===================================================================
    // LAYER 2: Draw ALL nodes that are NOT in the path (background/dimmed)
    // ===================================================================
    graph.nodes.forEach(node => {
      // Always show start and end nodes prominently
      if (node.id === startNode || node.id === endNode) return;
      if (pathNodesSet.has(node.id)) return; // Skip path nodes for now
      
      const x = node.x * scale + offsetX;
      const y = node.y * scale + offsetY;

      let fillColor = '#fff';
      let strokeColor = '#333';
      
      if (stepData?.visitedNodes.has(node.id)) {
        fillColor = '#E3F2FD';
        strokeColor = '#2196F3';
      }

      // Draw circle (dimmed)
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label (dimmed)
      ctx.fillStyle = '#999';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label || node.id.split('-')[1], x, y);
      ctx.globalAlpha = 1;
    });

    // ===================================================================
    // LAYER 3: Draw path EDGES (foreground with full opacity and glow)
    // ===================================================================
    if (stepData?.path && stepData.path.length > 1) {
      for (let i = 0; i < stepData.path.length - 1; i++) {
        const fromNode = graph.nodes.find(n => n.id === stepData.path[i]);
        const toNode = graph.nodes.find(n => n.id === stepData.path[i + 1]);
        
        if (!fromNode || !toNode) continue;

        // Draw edge with glow effect
        const edgeColor = isWinner ? '#4CAF50' : isTie ? '#FFC107' : '#2196F3';
        
        // Draw shadow/glow
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(fromNode.x * scale + offsetX, fromNode.y * scale + offsetY);
        ctx.lineTo(toNode.x * scale + offsetX, toNode.y * scale + offsetY);
        ctx.stroke();
        
        // Draw main edge
        ctx.lineWidth = 5;
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 10;
        ctx.shadowColor = edgeColor;
        ctx.beginPath();
        ctx.moveTo(fromNode.x * scale + offsetX, fromNode.y * scale + offsetY);
        ctx.lineTo(toNode.x * scale + offsetX, toNode.y * scale + offsetY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Find the edge to get weight
        const edge = graph.edges.find(e => 
          (e.from === stepData.path[i] && e.to === stepData.path[i + 1]) ||
          (e.to === stepData.path[i] && e.from === stepData.path[i + 1])
        );

        if (edge) {
          const midX = ((fromNode.x + toNode.x) / 2) * scale + offsetX;
          const midY = ((fromNode.y + toNode.y) / 2) * scale + offsetY;
          
          // Draw weight background circle
          ctx.fillStyle = 'white';
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
          ctx.beginPath();
          ctx.arc(midX, midY, 13, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Draw weight text
          ctx.fillStyle = edgeColor;
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(edge.weight.toString(), midX, midY);
        }
      }
    }

    // ===================================================================
    // LAYER 4: Draw path NODES (foreground with full opacity and effects)
    // ===================================================================
    const nodesToHighlight = new Set<string>(pathNodesSet);
    
    // Always show the current node if it exists
    if (stepData?.currentNode) {
      nodesToHighlight.add(stepData.currentNode);
    }
    
    // Always show start and end nodes
    nodesToHighlight.add(startNode);
    nodesToHighlight.add(endNode);
    
    graph.nodes.forEach(node => {
      if (!nodesToHighlight.has(node.id)) return;
      
      const x = node.x * scale + offsetX;
      const y = node.y * scale + offsetY;

      let fillColor = '#fff';
      let strokeColor = '#333';
      let strokeWidth = 3;
      
      // Visited node styling
      if (stepData?.visitedNodes.has(node.id)) {
        fillColor = '#E3F2FD';
        strokeColor = '#2196F3';
      }
      
      // Start node styling
      if (node.id === startNode) {
        fillColor = '#4CAF50';
        strokeColor = '#2E7D32';
        strokeWidth = 4;
      }
      
      // End node styling
      if (node.id === endNode) {
        fillColor = '#F44336';
        strokeColor = '#C62828';
        strokeWidth = 4;
      }
      
      // Current node styling (if not complete)
      if (node.id === stepData?.currentNode && !stepData.isComplete) {
        fillColor = '#FFC107';
        strokeColor = '#F57C00';
        strokeWidth = 4;
      }

      // Draw outer glow
      ctx.shadowBlur = 12;
      ctx.shadowColor = strokeColor;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = strokeColor;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Draw main circle
      ctx.beginPath();
      ctx.arc(x, y, 17, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = node.id === startNode || node.id === endNode ? '#fff' : '#000';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label || node.id.split('-')[1], x, y);
    });

    // ===================================================================
    // LAYER 5: Draw statistics box (always on top)
    // ===================================================================
    if (stepData) {
      const bgColor = isWinner ? 'rgba(76, 175, 80, 0.95)' : isTie ? 'rgba(255, 193, 7, 0.95)' : 'rgba(255, 255, 255, 0.95)';
      
      // Draw shadow
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.fillStyle = bgColor;
      ctx.fillRect(5, canvas.height - 45, 180, 40);
      ctx.shadowBlur = 0;
      
      // Draw border
      ctx.strokeStyle = isWinner ? '#4CAF50' : isTie ? '#FFC107' : '#ccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(5, canvas.height - 45, 180, 40);
      
      // Draw text
      ctx.fillStyle = isWinner || isTie ? '#fff' : '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Visited: ${stepData.visitedNodes.size}`, 10, canvas.height - 30);
      ctx.fillText(`Path length: ${stepData.path.length}`, 10, canvas.height - 15);
    }
  }, [graph, startNode, endNode]);

  useEffect(() => {
    const leftStep = leftSteps[Math.min(currentStep, leftSteps.length - 1)];
    const rightStep = rightSteps[Math.min(currentStep, rightSteps.length - 1)];
    
    drawGraph(
      canvasLeftRef.current, 
      leftStep, 
      algorithmNames[algorithm1],
      winner === 'left',
      winner === 'tie'
    );
    
    drawGraph(
      canvasRightRef.current, 
      rightStep, 
      algorithmNames[algorithm2],
      winner === 'right',
      winner === 'tie'
    );
  }, [drawGraph, leftSteps, rightSteps, currentStep, algorithm1, algorithm2, winner]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= maxSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, maxSteps, speed]);

  return (
    <div className="comparison-view">
      <h2>Algorithm Comparison</h2>
      
      <ComparisonWarning algorithm1={algorithm1} algorithm2={algorithm2} />
      
      <div className="comparison-canvases">
        <div className="canvas-wrapper">
          <canvas
            ref={canvasLeftRef}
            width={450}
            height={400}
            className="comparison-canvas"
          />
        </div>
        
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRightRef}
            width={450}
            height={400}
            className="comparison-canvas"
          />
        </div>
      </div>

      <StepControls
        currentStep={currentStep}
        totalSteps={maxSteps}
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onNext={() => setCurrentStep(prev => Math.min(prev + 1, maxSteps - 1))}
        onPrevious={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
        onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
      />
    </div>
  );
};

export default ComparisonView;