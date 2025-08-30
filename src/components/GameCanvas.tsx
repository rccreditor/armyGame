import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import MCQDialog from './MCQDialog';
import GameUI from './GameUI';

// Import game assets
import tacticalTrainingBg from '@/assets/military bg.jpg';
import ak47Weapon from '@/assets/ak47-first-person.png';
import enemyTransparent from '@/assets/enemy1.png'; // Replace this file with your transparent full-body enemy image

interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
  image: HTMLImageElement;
  question: {
    text: string;
    options: string[];
    correctAnswer: number;
  };
}

interface GameCanvasProps {
  onGameOver: (finalScore: number) => void;
  onMissionComplete: (finalScore: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onMissionComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [crosshairPos, setCrosshairPos] = useState({ x: 0, y: 0 });
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [gameImages, setGameImages] = useState<{
    background?: HTMLImageElement;
    weapon?: HTMLImageElement;
    enemies: HTMLImageElement[];
  }>({ enemies: [] });


  // Sample MCQ questions for Mission 1
  const questions = [
    {
      text: "What is the primary objective of infantry tactics?",
      options: ["Speed", "Terrain Control", "Heavy Firepower", "Air Support"],
      correctAnswer: 1
    },
    {
      text: "Which formation provides best protection during advance?",
      options: ["Single File", "Wedge Formation", "Line Formation", "Column Formation"],
      correctAnswer: 1
    },
    {
      text: "What does 'RV' stand in military terminology?",
      options: ["Rapid Vehicle", "Rendezvous Point", "Radio Vector", "Recon Vehicle"],
      correctAnswer: 1
    },
    {
      text: "Which is the most effective cover during enemy fire?",
      options: ["Trees", "Concrete Walls", "Metal Sheets", "Sand Bags"],
      correctAnswer: 1
    },
    {
      text: "What is the standard field of fire for a rifle squad?",
      options: ["90 degrees", "180 degrees", "270 degrees", "360 degrees"],
      correctAnswer: 1
    }
  ];


  // Load images
  useEffect(() => {
    const loadImages = async () => {
      // Load background
      const bgImg = new Image();
      bgImg.src = tacticalTrainingBg;

      // Load weapon
      const weaponImg = new Image();
      weaponImg.src = ak47Weapon;

      // Load single transparent enemy image
      const enemyImg = new Image();
      enemyImg.src = enemyTransparent;

      await Promise.all([
        new Promise(resolve => bgImg.onload = resolve),
        new Promise(resolve => weaponImg.onload = resolve),
        new Promise(resolve => enemyImg.onload = resolve)
      ]);

      setGameImages({
        background: bgImg,
        weapon: weaponImg,
        enemies: [enemyImg] // Single enemy image
      });

      // Define enemy positions for a 2-1-2 layout
      const enemyPositions = [
        { x: 100, y: 450 }, // Far left
        { x: 350, y: 460 }, // Near left
        { x: 860, y: 450 }, // Middle
        { x: 1370, y: 460 }, // Near right
        { x: 1620, y: 450 }  // Far right
      ];

      // Initialize 5 enemies using the same transparent image but different questions and positions
      const initialEnemies: Enemy[] = questions.map((question, index) => ({
        id: index,
        x: enemyPositions[index].x,
        y: enemyPositions[index].y,
        width: 200, // Width for full-body transparent image
        height: 400, // Height for full-body transparent image
        alive: true,
        image: enemyImg,
        question: question
      }));

      setEnemies(initialEnemies);
    };

    loadImages();
  }, []);

  // Draw game scene
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (gameImages.background) {
      ctx.drawImage(gameImages.background, 0, 0, canvas.width, canvas.height);
    }

    // Draw enemies
    enemies.forEach(enemy => {
      if (enemy.alive) {
        ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
      }
    });

    // Draw weapon with parallax effect
    if (gameImages.weapon) {
      const weaponWidth = 800;
      const weaponHeight = 600;
      
      // Calculate the base position of the weapon
      const baseWeaponX = canvas.width - weaponWidth;
      const baseWeaponY = canvas.height - weaponHeight;

      // Calculate the parallax offset based on the crosshair position
      const parallaxFactor = 0.1;
      const offsetX = (canvas.width / 2 - crosshairPos.x) * parallaxFactor;
      const offsetY = (canvas.height / 2 - crosshairPos.y) * parallaxFactor;

      // Apply the parallax offset to the weapon position
      const weaponX = baseWeaponX + offsetX;
      const weaponY = baseWeaponY + offsetY;

      ctx.drawImage(gameImages.weapon, weaponX, weaponY, weaponWidth, weaponHeight);
    }
  }, [enemies, gameImages, crosshairPos]);

  // Handle mouse movement for crosshair
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setCrosshairPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  // Handle click/shooting
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Map mouse (CSS pixels) to canvas coordinate space
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicking on an enemy
    const hitEnemy = enemies.find(enemy => 
      enemy.alive &&
      clickX >= enemy.x &&
      clickX <= enemy.x + enemy.width &&
      clickY >= enemy.y &&
      clickY <= enemy.y + enemy.height
    );

    if (hitEnemy) {
      setSelectedEnemy(hitEnemy);
    }
  }, [enemies]);

  // Handle MCQ answer
  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (!selectedEnemy) return;

    if (isCorrect) {
      // Correct answer - eliminate enemy and increase score
      setEnemies(prev => prev.map(enemy => 
        enemy.id === selectedEnemy.id ? { ...enemy, alive: false } : enemy
      ));
      setScore(prev => prev + 1);
      toast({
        title: "Target Eliminated!",
        description: "+1 Score",
        className: "bg-primary text-primary-foreground"
      });

      // Check win condition
      const remainingEnemies = enemies.filter(e => e.alive && e.id !== selectedEnemy.id);
      if (remainingEnemies.length === 0) {
        setTimeout(() => onMissionComplete(score + 1), 1000);
      }
    } else {
      // Wrong answer - take damage
      if (score === 0) {
        onGameOver(0);
      } else {
        setScore(prev => prev - 1);
        setHealth(prev => Math.max(0, prev - 25));
        toast({
          title: "Enemy Retaliation!",
          description: "-1 Score",
          variant: "destructive"
        });
      }
    }

    setSelectedEnemy(null);
  }, [selectedEnemy, enemies, score, onGameOver, onMissionComplete]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };
    animate();
  }, [draw]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900">
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="w-full h-full cursor-none"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
      
      {/* Crosshair */}
      <div 
        className="crosshair"
        style={{
          left: crosshairPos.x,
          top: crosshairPos.y
        }}
      />

      {/* Game UI */}
      <GameUI score={score} health={health} />

      {/* MCQ Dialog */}
      {selectedEnemy && (
        <MCQDialog
          question={selectedEnemy.question}
          onAnswer={handleAnswer}
          onClose={() => setSelectedEnemy(null)}
        />
      )}

    </div>
  );
};

export default GameCanvas;