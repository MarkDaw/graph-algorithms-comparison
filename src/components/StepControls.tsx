import React from 'react';

interface StepControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
}

const StepControls: React.FC<StepControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onReset,
}) => {
  return (
    <div className="step-controls">
      <div className="step-info">
        <span>Step: {currentStep + 1} / {totalSteps}</span>
      </div>
      
      <div className="step-buttons">
        <button
          className="btn btn-control"
          onClick={onReset}
          disabled={currentStep === 0}
        >
          ⏮️ Reset
        </button>
        
        <button
          className="btn btn-control"
          onClick={onPrevious}
          disabled={currentStep === 0 || isPlaying}
        >
          ⏪ Previous
        </button>
        
        {isPlaying ? (
          <button
            className="btn btn-control btn-pause"
            onClick={onPause}
          >
            ⏸️ Pause
          </button>
        ) : (
          <button
            className="btn btn-control btn-play"
            onClick={onPlay}
            disabled={currentStep >= totalSteps - 1}
          >
            ▶️ Play
          </button>
        )}
        
        <button
          className="btn btn-control"
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1 || isPlaying}
        >
          ⏩ Next
        </button>
      </div>
    </div>
  );
};

export default StepControls;