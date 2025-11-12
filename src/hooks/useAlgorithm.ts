import { useState, useEffect } from 'react';
import { Graph, Node, Edge } from '../algorithms/types';

const useAlgorithm = (graph: Graph, algorithm: string) => {
    const [path, setPath] = useState<Node[]>([]);
    const [visitedNodes, setVisitedNodes] = useState<Node[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(0);

    useEffect(() => {
        if (isRunning) {
            executeAlgorithm();
        }
    }, [isRunning, currentStep]);

    const executeAlgorithm = () => {
        switch (algorithm) {
            case 'Dijkstra':
                // Call Dijkstra's algorithm implementation
                break;
            case 'A*':
                // Call A* algorithm implementation
                break;
            case 'BFS':
                // Call BFS algorithm implementation
                break;
            case 'DFS':
                // Call DFS algorithm implementation
                break;
            default:
                break;
        }
    };

    const startAlgorithm = () => {
        setIsRunning(true);
        setCurrentStep(0);
    };

    const stopAlgorithm = () => {
        setIsRunning(false);
    };

    const nextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    return {
        path,
        visitedNodes,
        isRunning,
        startAlgorithm,
        stopAlgorithm,
        nextStep,
    };
};

export default useAlgorithm;