import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import StartScreenLevel1 from './StartScreenLevel1'; // Import Level 1 Start Screen
import StartScreenLevel2 from './StartScreenLevel2'; // Import Level 2 Start Screen
import StartScreenLevel3 from './StartScreenLevel3'; // Import Level 3 Start Screen
import GameCanvas from './GameCanvas';
import MissionComplete from './MissionComplete';
import GameOver from './GameOver';
import { levels, LevelData } from '../data/levels'; // Import levels data

type GameState = 'start' | 'playing' | 'levelCompleteScreen' | 'gameOver' | 'allLevelsComplete';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [finalScore, setFinalScore] = useState(0);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // Start at the first level
  const [rank, setRank] = useState(0); // Initialize rank

  const currentLevel: LevelData = levels[currentLevelIndex];

  const startGame = () => {
    setCurrentLevelIndex(0); // Reset to first level on new game
    setFinalScore(0); // Reset score
    setRank(0); // Reset rank
    setGameState('start'); // Show start screen for level 1
  };

  const handleGameOver = (score: number) => {
    // Failing a mission should allow retrying the SAME mission
    setFinalScore(score);
    setGameState('gameOver');
  };

  const handleMissionComplete = (score: number) => {
    setFinalScore(score);
    // Require minimum score of 4 to pass the mission
    if (score < 4) {
      // Do NOT change currentLevelIndex; show retry screen
      setGameState('gameOver');
    } else {
      // Level completed successfully, show MissionComplete screen
      setGameState('levelCompleteScreen');
      // Update rank based on the completed level (1-indexed)
      setRank(currentLevelIndex + 1);
    }
  };

  const proceedToNextLevel = () => {
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(prevIndex => prevIndex + 1);
      setGameState('start'); // Show start screen for the next level
    } else {
      // All levels completed, show "More levels Coming soon" toast
      toast({
        title: "More levels Coming soon!",
        description: "Stay tuned for new challenges.",
        variant: "default",
      });
      // Keep the user on the current MissionComplete screen for the last level
      // setGameState('allLevelsComplete'); // No longer needed
    }
  };

  const restartGame = () => {
    // Retry should restart the SAME mission the player failed
    setFinalScore(0);
    setGameState('start'); // Show start screen for the current level
    // Do not change currentLevelIndex here
    // Keep rank as-is or derive from completed levels
  };

  switch (gameState) {
    case 'start':
      // Conditionally render the correct StartScreen based on currentLevelIndex
      if (currentLevelIndex === 0) {
        return <StartScreenLevel1 onStartGame={() => setGameState('playing')} />;
      } else if (currentLevelIndex === 1) {
        return <StartScreenLevel2 onStartGame={() => setGameState('playing')} />;
      } else if (currentLevelIndex === 2) {
        return <StartScreenLevel3 onStartGame={() => setGameState('playing')} />;
      }
      // Fallback for levels beyond what's explicitly defined or initial load
      return <StartScreenLevel1 onStartGame={() => setGameState('playing')} />;
    case 'playing':
      if (!currentLevel) {
        return <div>Loading Level Data...</div>;
      }
      return (
        <GameCanvas
          onGameOver={handleGameOver}
          onMissionComplete={handleMissionComplete}
          levelData={currentLevel} // Pass current level data
          rank={rank} // Pass rank to GameCanvas
        />
      );
    case 'levelCompleteScreen':
      return (
        <MissionComplete
          score={finalScore}
          onRestart={proceedToNextLevel} // Proceed to next level or all levels complete
          message={`Level ${currentLevelIndex + 1} Complete!`}
          rank={rank}
        />
      );
    case 'gameOver':
      return <GameOver score={finalScore} onRestart={restartGame} />;
    case 'allLevelsComplete':
      return (
        <MissionComplete
          score={finalScore}
          onRestart={restartGame}
          message="Congratulations! You've completed all levels!"
          rank={rank}
        />
      );
    default:
      return <StartScreenLevel1 onStartGame={() => setGameState('playing')} />;
  }
};

export default Game;