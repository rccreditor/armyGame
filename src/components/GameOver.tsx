import React from 'react';
import { Button } from '@/components/ui/button';

interface GameOverProps {
  score: number;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onRestart }) => {
  return (
    <div className="min-h-screen bg-tactical-dark flex items-center justify-center">
      <div className="text-center">
        <div className="mcq-dialog p-12 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-destructive mb-4">
              MISSION FAILED
            </h1>
            <div className="w-full h-2 bg-destructive/20 rounded mb-6">
              <div className="w-full h-full bg-destructive rounded animate-pulse" />
            </div>
          </div>

          <div className="mb-8">
            <div className="text-4xl font-bold text-destructive mb-2">KIA</div>
            <p className="text-xl text-muted-foreground">
              Killed in Action - Wrong tactical decisions led to mission failure
            </p>
          </div>

          <div className="mb-8">
            <div className="bg-destructive/10 p-6 rounded-lg">
              <div className="text-2xl font-bold text-primary-foreground mb-2">
                FINAL SCORE: {score}
              </div>
              <div className="text-sm text-muted-foreground">
                {score === 0 ? 'No targets eliminated' : `${score} target${score > 1 ? 's' : ''} eliminated before failure`}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-muted-foreground mb-4">
              Learn from your mistakes. Study military tactics and try again.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onRestart}
              className="tactical-button text-xl px-12 py-4"
            >
              RETRY MISSION
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Tip: Answer tactical questions correctly to eliminate targets safely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOver;