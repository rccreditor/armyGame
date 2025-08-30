import React from 'react';
import { Button } from '@/components/ui/button';

interface MissionCompleteProps {
  score: number;
  onRestart: () => void;
}

const MissionComplete: React.FC<MissionCompleteProps> = ({ score, onRestart }) => {
  return (
    <div className="min-h-screen bg-tactical-dark flex items-center justify-center">
      <div className="text-center">
        <div className="mcq-dialog p-12 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-primary-foreground mb-4">
              MISSION COMPLETE
            </h1>
            <div className="w-full h-2 bg-primary/20 rounded mb-6">
              <div className="w-full h-full bg-primary rounded animate-pulse" />
            </div>
          </div>

          <div className="mb-8">
            <div className="score-display text-8xl mb-4">{score}</div>
            <p className="text-2xl text-primary-foreground">TARGETS ELIMINATED</p>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-3xl font-bold text-primary-foreground">{score}/4</div>
                <div className="text-sm text-muted-foreground">ACCURACY</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-3xl font-bold text-primary-foreground">
                  {score === 4 ? 'PERFECT' : score >= 3 ? 'EXCELLENT' : score >= 2 ? 'GOOD' : 'FAIR'}
                </div>
                <div className="text-sm text-muted-foreground">RATING</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onRestart}
              className="tactical-button text-xl px-12 py-4"
            >
              REPLAY MISSION
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Mission 1 Complete • More missions coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionComplete;