import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Target, Award, Shield } from 'lucide-react';

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen bg-tactical-dark flex items-center justify-center">
      <div className="text-center max-w-4xl px-6">
        <div className="mcq-dialog p-12">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-7xl font-bold text-primary-foreground mb-4">
              TACTICAL OPS
            </h1>
            <div className="text-2xl text-primary mb-6">
              Indian Army Training Simulator
            </div>
            <div className="w-full h-2 bg-primary/20 rounded">
              <div className="w-1/3 h-full bg-primary rounded animate-pulse" />
            </div>
          </div>

          {/* Mission Brief */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              MISSION BRIEFING
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Hostile forces have infiltrated the base perimeter. Your tactical knowledge 
              and quick decision-making skills are required to neutralize the threats. 
              Each engagement requires correct tactical analysis before firing.
            </p>
          </div>

          {/* Game Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-primary/10 p-4 rounded-lg">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-bold text-primary-foreground">4 TARGETS</div>
              <div className="text-xs text-muted-foreground">Hostile Forces</div>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <Award className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-bold text-primary-foreground">MCQ SYSTEM</div>
              <div className="text-xs text-muted-foreground">Tactical Questions</div>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-bold text-primary-foreground">ARMY THEMED</div>
              <div className="text-xs text-muted-foreground">Indian Army</div>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <Play className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-bold text-primary-foreground">FPS VIEW</div>
              <div className="text-xs text-muted-foreground">First Person</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 bg-secondary/10 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-primary-foreground mb-4">OPERATION INSTRUCTIONS</h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-muted-foreground">Use mouse to aim crosshair at enemies</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-muted-foreground">Click on enemy to engage and trigger tactical question</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-muted-foreground">Answer correctly to eliminate target (+1 score)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-muted-foreground">Wrong answer results in enemy retaliation (-1 score)</span>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={onStartGame}
            className="tactical-button text-2xl px-16 py-6"
          >
            <Play className="w-6 h-6 mr-3" />
            START MISSION
          </Button>

          <div className="mt-6 text-sm text-muted-foreground">
            Mission 1: Intel Briefing • Difficulty: Recruit
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;