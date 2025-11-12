import { useState, useEffect } from 'react';

const useStepByStep = (algorithm, graph, startNode, endNode) => {
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                setCurrentStep((prevStep) => {
                    if (prevStep < steps.length - 1) {
                        return prevStep + 1;
                    } else {
                        clearInterval(interval);
                        setIsRunning(false);
                        return prevStep;
                    }
                });
            }, 1000); // Adjust the speed of the step-by-step execution here

            return () => clearInterval(interval);
        }
    }, [isRunning, steps]);

    const startAlgorithm = () => {
        const result = algorithm(graph, startNode, endNode);
        setSteps(result);
        setCurrentStep(0);
        setIsRunning(true);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prevStep) => prevStep + 1);
        }
    };

    const previousStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prevStep) => prevStep - 1);
        }
    };

    const reset = () => {
        setSteps([]);
        setCurrentStep(0);
        setIsRunning(false);
    };

    return {
        steps,
        currentStep,
        isRunning,
        startAlgorithm,
        nextStep,
        previousStep,
        reset,
    };
};

export default useStepByStep;