import React, { useState } from 'react';
import StartScreen from './StartScreen';
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
    setGameState('playing');
    setCurrentLevelIndex(0); // Reset to first level on new game
    setFinalScore(0); // Reset score
    setRank(0); // Reset rank
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState('gameOver');
  };

  const handleMissionComplete = (score: number) => {
    setFinalScore(score);
    if (score < 4) { // Assuming 4 is the minimum score to pass a level
      setGameState('gameOver');
    } else {
      // Level completed successfully, show MissionComplete screen
      setGameState('levelCompleteScreen');
      // Update rank based on the *completed* level
      setRank(currentLevelIndex + 1); // Rank is 1-indexed based on level completed
    }
  };

  const proceedToNextLevel = () => {
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(prevIndex => prevIndex + 1);
      setGameState('playing'); // Start next level
    } else {
      setGameState('allLevelsComplete'); // All levels completed
    }
  };

  const restartGame = () => {
    setGameState('start');
    setFinalScore(0);
    setCurrentLevelIndex(0);
    setRank(0);
  };

  switch (gameState) {
    case 'start':
      return <StartScreen onStartGame={startGame} />;
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
      return <StartScreen onStartGame={startGame} />;
  }
};

export default Game;