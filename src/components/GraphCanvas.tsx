import React, { useEffect, useRef, useState } from 'react';
import type { Graph, AlgorithmType, PathStep } from '../types/index.js';
import { dijkstra } from '../algorithms/dijkstra';
import { bfs } from '../algorithms/bfs';
import { dfs } from '../algorithms/dfs';
import { astar } from '../algorithms/astar';
import StepControls from './StepControls';

export interface GraphCanvasProps {
  graph: Graph;
  startNode: string;
  endNode: string;
  algorithm: AlgorithmType;
}

const algorithmMap = {
  dijkstra,
  bfs,
  dfs,
  astar,
};

const GraphCanvas: React.FC<GraphCanvasProps> = ({ graph, startNode, endNode, algorithm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState<PathStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 600 });

  // Adjust canvas size based on container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const maxWidth = Math.min(container.clientWidth - 40, 1200);
        const maxHeight = Math.min(container.clientHeight - 200, 700);
        setCanvasSize({ width: maxWidth, height: maxHeight });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    // Run the selected algorithm
    const algorithmFunction = algorithmMap[algorithm];
    const result = algorithmFunction({ startNode, endNode, graph });
    setSteps(result.steps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [graph, startNode, endNode, algorithm]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentStepData = steps[currentStep];

    // Calculate scale to fit graph
    const padding = 60;
    const scaleX = (canvas.width - padding * 2) / 800;
    const scaleY = (canvas.height - padding * 2) / 600;
    const scale = Math.min(scaleX, scaleY, 1);

    // Draw edges
    graph.edges.forEach(edge => {
      const fromNode = graph.nodes.find(n => n.id === edge.from);
      const toNode = graph.nodes.find(n => n.id === edge.to);
      
      if (!fromNode || !toNode) return;

      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromNode.x * scale + padding, fromNode.y * scale + padding);
      ctx.lineTo(toNode.x * scale + padding, toNode.y * scale + padding);
      ctx.stroke();

      // Draw weight
      const midX = ((fromNode.x + toNode.x) / 2) * scale + padding;
      const midY = ((fromNode.y + toNode.y) / 2) * scale + padding;
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(edge.weight.toString(), midX, midY);
    });

    // Draw path if exists
    if (currentStepData?.path && currentStepData.path.length > 1) {
      for (let i = 0; i < currentStepData.path.length - 1; i++) {
        const fromNode = graph.nodes.find(n => n.id === currentStepData.path[i]);
        const toNode = graph.nodes.find(n => n.id === currentStepData.path[i + 1]);
        
        if (!fromNode || !toNode) continue;

        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(fromNode.x * scale + padding, fromNode.y * scale + padding);
        ctx.lineTo(toNode.x * scale + padding, toNode.y * scale + padding);
        ctx.stroke();
      }
    }

    // Draw nodes
    graph.nodes.forEach(node => {
      const x = node.x * scale + padding;
      const y = node.y * scale + padding;
      
      let fillColor = '#fff';
      let strokeColor = '#333';
      
      if (currentStepData?.visitedNodes.has(node.id)) {
        fillColor = '#E3F2FD';
        strokeColor = '#2196F3';
      }
      
      if (node.id === startNode) {
        fillColor = '#4CAF50';
        strokeColor = '#2E7D32';
      }
      
      if (node.id === endNode) {
        fillColor = '#F44336';
        strokeColor = '#C62828';
      }
      
      if (node.id === currentStepData?.currentNode) {
        fillColor = '#FFC107';
        strokeColor = '#F57C00';
      }

      // Draw circle
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label || node.id.split('-')[1], x, y);

      // Draw distance
      if (currentStepData?.distances.has(node.id)) {
        const distance = currentStepData.distances.get(node.id);
        if (distance !== Infinity) {
          ctx.fillStyle = '#666';
          ctx.font = '10px Arial';
          ctx.fillText(`d:${distance.toFixed(1)}`, x, y - 30);
        }
      }
    });

    // Draw algorithm info
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Algorithm: ${algorithm.toUpperCase()}`, 15, 25);
    
    if (currentStepData) {
      ctx.font = '14px Arial';
      ctx.fillText(`Visited: ${currentStepData.visitedNodes.size}`, 15, canvas.height - 50);
      ctx.fillText(`Path length: ${currentStepData.path.length}`, 15, canvas.height - 30);
      if (currentStepData.distances.get(endNode) !== Infinity) {
        ctx.fillText(`Total distance: ${currentStepData.distances.get(endNode)?.toFixed(1)}`, 15, canvas.height - 10);
      }
    }
  }, [graph, steps, currentStep, startNode, endNode, algorithm, canvasSize]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  return (
    <div ref={containerRef} className="graph-canvas-container">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="graph-canvas"
      />
      <StepControls
        currentStep={currentStep}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onNext={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
        onPrevious={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
        onReset={() => { setCurrentStep(0); setIsPlaying(false); }}
      />
    </div>
  );
};

export default GraphCanvas;