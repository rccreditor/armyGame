import React from 'react';
import { Button } from '@/components/ui/button';

interface MissionCompleteProps {
  score: number;
  onRestart: () => void;
  message?: string; // Optional message prop
  rank?: number; // Optional rank prop
}

const MissionComplete: React.FC<MissionCompleteProps> = ({ score, onRestart, message, rank }) => {
  const getRankText = (currentRank: number | undefined) => {
    if (currentRank === undefined) return "Rookie"; // Default for initial state
    switch (currentRank) {
      case 0: return "Rookie";
      case 1: return "Soldier";
      case 2: return "Sergeant";
      case 3: return "Captain";
      case 4: return "Major";
      case 5: return "Colonel";
      case 6: return "General";
      default: return "Veteran"; // For ranks beyond General, if applicable
    }
  };

  return (
    <div className="min-h-screen bg-tactical-dark flex items-center justify-center">
      <div className="text-center">
        <div className="mcq-dialog p-12 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-primary-foreground mb-4">
              {message || "MISSION COMPLETE"}
            </h1>
            {rank !== undefined && (
              <p className="text-3xl font-semibold text-green-500 mb-4">
                Congrats Rank Up! You are now a {getRankText(rank)}!
              </p>
            )}
            <div className="w-full h-2 bg-primary/20 rounded mb-6">
              <div className="w-full h-full bg-primary rounded animate-pulse" />
            </div>
          </div>

          <div className="mb-8">
            <div className="score-display text-8xl mb-4">{score}</div>
            <p className="text-2xl text-primary-foreground">TARGETS ELIMINATED</p>
          </div>

          {rank !== undefined && (
            <div className="mb-8">
              <p className="text-2xl text-green-400">Rank: {getRankText(rank)}</p>
            </div>
          )}

          <div className="mb-8">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-3xl font-bold text-primary-foreground">{score}/5</div>
                <div className="text-sm text-muted-foreground">ACCURACY</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-3xl font-bold text-primary-foreground">
                  {score === 5 ? 'PERFECT' : score >= 4 ? 'EXCELLENT' : score >= 2 ? 'GOOD' : 'FAIR'}
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
              {message && message.includes("all levels") ? "PLAY AGAIN" : "NEXT MISSION"}
            </Button>
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionComplete;