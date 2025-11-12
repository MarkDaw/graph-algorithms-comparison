import type { Graph, Node, PathStep } from '../types/index.js';

export const drawGraph = (
  ctx: CanvasRenderingContext2D,
  graph: Graph,
  width: number,
  height: number,
  currentStep?: PathStep,
  startNode?: string,
  endNode?: string
): void => {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw edges
  graph.edges.forEach(edge => {
    const fromNode = graph.nodes.find(n => n.id === edge.from);
    const toNode = graph.nodes.find(n => n.id === edge.to);
    
    if (!fromNode || !toNode) return;

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.stroke();

    // Draw weight
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(edge.weight.toString(), midX, midY);
  });

  // Draw path if exists
  if (currentStep?.path && currentStep.path.length > 1) {
    for (let i = 0; i < currentStep.path.length - 1; i++) {
      const fromNode = graph.nodes.find(n => n.id === currentStep.path[i]);
      const toNode = graph.nodes.find(n => n.id === currentStep.path[i + 1]);
      
      if (!fromNode || !toNode) continue;

      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
    }
  }

  // Draw nodes
  graph.nodes.forEach(node => {
    drawNode(ctx, node, currentStep, startNode, endNode);
  });
};

const drawNode = (
  ctx: CanvasRenderingContext2D,
  node: Node,
  currentStep?: PathStep,
  startNode?: string,
  endNode?: string
): void => {
  let fillColor = '#fff';
  let strokeColor = '#333';
  
  if (currentStep?.visitedNodes.has(node.id)) {
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
  
  if (node.id === currentStep?.currentNode) {
    fillColor = '#FFC107';
    strokeColor = '#F57C00';
  }

  // Draw circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
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
  ctx.fillText(node.label || node.id.split('-')[1], node.x, node.y);

  // Draw distance
  if (currentStep?.distances.has(node.id)) {
    const distance = currentStep.distances.get(node.id);
    if (distance !== Infinity) {
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.fillText(`d:${distance}`, node.x, node.y - 30);
    }
  }
};