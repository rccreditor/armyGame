import React, { useState } from 'react';
import StartScreen from './StartScreen';
import GameCanvas from './GameCanvas';
import MissionComplete from './MissionComplete';
import GameOver from './GameOver';

type GameState = 'start' | 'playing' | 'completed' | 'gameOver';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [finalScore, setFinalScore] = useState(0);

  const startGame = () => {
    setGameState('playing');
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState('gameOver');
  };

  const handleMissionComplete = (score: number) => {
    setFinalScore(score);
    setGameState('completed');
  };

  const restartGame = () => {
    setGameState('start');
    setFinalScore(0);
  };

  switch (gameState) {
    case 'start':
      return <StartScreen onStartGame={startGame} />;
    case 'playing':
      return (
        <GameCanvas
          onGameOver={handleGameOver}
          onMissionComplete={handleMissionComplete}
        />
      );
    case 'completed':
      return <MissionComplete score={finalScore} onRestart={restartGame} />;
    case 'gameOver':
      return <GameOver score={finalScore} onRestart={restartGame} />;
    default:
      return <StartScreen onStartGame={startGame} />;
  }
};

export default Game;