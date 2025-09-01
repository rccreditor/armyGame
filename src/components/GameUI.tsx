import React from 'react';

interface GameUIProps {
  score: number;
  health: number;
}

const GameUI: React.FC<GameUIProps> = ({ score, health }) => {
  return (
    <>
      {/* Mission Status */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="mcq-dialog px-6 py-3">
          <h2 className="text-xl font-bold text-primary-foreground text-center">
            MISSION 1: THE FIRST CONTACT
          </h2>
        </div>
      </div>

      {/* Health Bar */}
      <div className="absolute top-4 left-4 z-10">
        <div className="game-ui">
          <div className="text-sm font-bold mb-2">HEALTH</div>
          <div className="health-bar w-48 h-4">
            <div 
              className="health-fill"
              style={{ width: `${health}%` }}
            />
          </div>
          <div className="text-xs mt-1">{health}/100</div>
        </div>
      </div>

      {/* Score Display */}
      <div className="absolute top-4 right-4 z-10">
        <div className="game-ui text-right">
          <div className="text-sm font-bold mb-2">SCORE</div>
          <div className="score-display">{score}</div>
          <div className="text-xs">TARGETS ELIMINATED</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="mcq-dialog px-4 py-2">
          <p className="text-sm text-primary-foreground text-center">
            Aim and click on enemies to engage. Answer questions correctly to eliminate targets.
          </p>
        </div>
      </div>
    </>
  );
};

export default GameUI;