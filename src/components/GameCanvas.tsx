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
  // Animation properties
  startX: number;
  startY: number;
  movementPattern: 'patrol' | 'cover' | 'advance' | 'strafe';
  movementPhase: number;
  lastMovementTime: number;
  movementSpeed: number;
  direction: number; // 1 for right, -1 for left
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
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [muzzleFlash, setMuzzleFlash] = useState({ active: false, x: 0, y: 0, time: 0 });
  const [hitEffects, setHitEffects] = useState<Array<{x: number, y: number, time: number, id: number}>>([]);
  const [screenShake, setScreenShake] = useState({ active: false, time: 0, intensity: 0 });

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

  // Enemy movement patterns
  const getMovementPattern = (index: number) => {
    const patterns: ('patrol' | 'cover' | 'advance' | 'strafe')[] = ['patrol', 'cover', 'advance', 'strafe', 'cover'];
    return patterns[index];
  };

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

      // Initialize 5 enemies with movement patterns
      const initialEnemies: Enemy[] = questions.map((question, index) => ({
        id: index,
        x: enemyPositions[index].x,
        y: enemyPositions[index].y,
        width: 200, // Width for full-body transparent image
        height: 400, // Height for full-body transparent image
        alive: true,
        image: enemyImg,
        question: question,
        startX: enemyPositions[index].x,
        startY: enemyPositions[index].y,
        movementPattern: getMovementPattern(index),
        movementPhase: 0,
        lastMovementTime: 0,
        movementSpeed: 0.5 + Math.random() * 0.5, // Random speed between 0.5 and 1.0
        direction: Math.random() > 0.5 ? 1 : -1
      }));

      setEnemies(initialEnemies);
    };

    loadImages();
  }, []);

  // Update enemy positions based on movement patterns
  const updateEnemyMovement = useCallback((deltaTime: number) => {
    setEnemies(prev => prev.map(enemy => {
      if (!enemy.alive) return enemy;

      const currentTime = Date.now();
      const timeSinceLastMove = currentTime - enemy.lastMovementTime;
      
      if (timeSinceLastMove < 50) return enemy; // Update every 50ms

      let newX = enemy.x;
      let newY = enemy.y;
      let newDirection = enemy.direction;
      let newPhase = enemy.movementPhase;

      switch (enemy.movementPattern) {
        case 'patrol':
          // Patrol back and forth with varying speeds
          const patrolSpeed = enemy.movementSpeed * (0.8 + Math.sin(Date.now() * 0.001 + enemy.id) * 0.2);
          newX = enemy.x + (enemy.direction * patrolSpeed * deltaTime * 0.1);
          
          if (newX > enemy.startX + 120 || newX < enemy.startX - 120) {
            newDirection = -enemy.direction;
            newX = enemy.x; // Stay in place when changing direction
          }
          break;

        case 'cover':
          // Move to cover positions with tactical movement
          if (enemy.movementPhase === 0) {
            // Move to cover
            newX = enemy.x - (enemy.movementSpeed * deltaTime * 0.08);
            if (newX <= enemy.startX - 60) {
              newPhase = 1;
              newX = enemy.startX - 60; // Snap to cover position
            }
          } else if (enemy.movementPhase === 1) {
            // Stay in cover for a while
            if (timeSinceLastMove > 2000) { // Stay in cover for 2 seconds
              newPhase = 2;
            }
          } else if (enemy.movementPhase === 2) {
            // Return from cover
            newX = enemy.x + (enemy.movementSpeed * deltaTime * 0.08);
            if (newX >= enemy.startX) {
              newPhase = 0;
              newX = enemy.startX;
            }
          }
          break;

        case 'advance':
          // Advance forward with tactical pauses
          if (enemy.movementPhase === 0) {
            // Advance
            newX = enemy.x - (enemy.movementSpeed * deltaTime * 0.05);
            if (newX < enemy.startX - 100) {
              newPhase = 1;
              newX = enemy.startX - 100;
            }
          } else if (enemy.movementPhase === 1) {
            // Pause and assess
            if (timeSinceLastMove > 1500) { // Pause for 1.5 seconds
              newPhase = 2;
            }
          } else if (enemy.movementPhase === 2) {
            // Return to start
            newX = enemy.x + (enemy.movementSpeed * deltaTime * 0.05);
            if (newX >= enemy.startX) {
              newPhase = 0;
              newX = enemy.startX;
            }
          }
          break;

        case 'strafe':
          // Strafe left and right with quick movements
          if (enemy.movementPhase === 0) {
            // Strafe left
            newX = enemy.x - (enemy.movementSpeed * deltaTime * 0.15);
            if (newX <= enemy.startX - 80) {
              newPhase = 1;
              newX = enemy.startX - 80;
            }
          } else if (enemy.movementPhase === 1) {
            // Pause
            if (timeSinceLastMove > 1000) { // Pause for 1 second
              newPhase = 2;
            }
          } else if (enemy.movementPhase === 2) {
            // Strafe right
            newX = enemy.x + (enemy.movementSpeed * deltaTime * 0.15);
            if (newX >= enemy.startX + 80) {
              newPhase = 3;
              newX = enemy.startX + 80;
            }
          } else if (enemy.movementPhase === 3) {
            // Pause
            if (timeSinceLastMove > 1000) { // Pause for 1 second
              newPhase = 0;
            }
          }
          break;
      }

      return {
        ...enemy,
        x: newX,
        y: newY,
        direction: newDirection,
        movementPhase: newPhase,
        lastMovementTime: currentTime
      };
    }));
  }, []);

  // Draw game scene
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply screen shake effect
    if (screenShake.active) {
      const shakeAge = Date.now() - screenShake.time;
      if (shakeAge < 200) { // Shake lasts 200ms
        const shakeIntensity = screenShake.intensity * (1 - shakeAge / 200);
        const shakeX = (Math.random() - 0.5) * shakeIntensity;
        const shakeY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(shakeX, shakeY);
      } else {
        setScreenShake(prev => ({ ...prev, active: false }));
      }
    }

    // Draw background
    if (gameImages.background) {
      ctx.drawImage(gameImages.background, 0, 0, canvas.width, canvas.height);
    }

    // Draw enemies
    enemies.forEach(enemy => {
      if (enemy.alive) {
        // Save context for transformations
        ctx.save();
        
        // Add subtle rotation based on movement direction
        const rotationAngle = Math.sin(Date.now() * 0.002 + enemy.id) * 0.02;
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        ctx.rotate(rotationAngle);
        
        // Draw enemy with shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.drawImage(enemy.image, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
        
        // Restore context
        ctx.restore();
      }
    });
    
    // Draw hit effects
    hitEffects.forEach((effect, index) => {
      const effectAge = Date.now() - effect.time;
      if (effectAge < 500) { // Effect lasts 500ms
        const effectSize = 40 - (effectAge / 500) * 30;
        const effectAlpha = 1 - (effectAge / 500);
        
        ctx.save();
        ctx.globalAlpha = effectAlpha;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        
        // Draw expanding circle effect
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effectSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        // Remove expired effects
        setHitEffects(prev => prev.filter((_, i) => i !== index));
      }
    });

    // Draw weapon with enhanced aim movement
    if (gameImages.weapon) {
      const weaponWidth = 800;
      const weaponHeight = 600;
      
      // Calculate the base position of the weapon
      const baseWeaponX = canvas.width - weaponWidth;
      const baseWeaponY = canvas.height - weaponHeight;

      // Enhanced aim movement with multiple factors
      const aimFactor = 0.2; // How much the gun follows the crosshair
      const recoilFactor = 0.08; // Subtle recoil effect
      
      // Calculate aim offset based on crosshair position
      const aimOffsetX = (canvas.width / 2 - crosshairPos.x) * aimFactor;
      const aimOffsetY = (canvas.height / 2 - crosshairPos.y) * aimFactor;
      
      // Add dynamic recoil effect based on time
      const currentTime = Date.now();
      const recoilTime = currentTime * 0.01;
      const recoilOffsetX = Math.sin(recoilTime) * recoilFactor * 8 + 
                           Math.sin(recoilTime * 2.3) * recoilFactor * 4;
      const recoilOffsetY = Math.cos(recoilTime * 0.8) * recoilFactor * 6 + 
                           Math.sin(recoilTime * 1.7) * recoilFactor * 3;
      
      // Add breathing effect for more realism
      const breathingOffset = Math.sin(currentTime * 0.003) * 2;
      
      // Apply all offsets to weapon position
      const weaponX = baseWeaponX + aimOffsetX + recoilOffsetX;
      const weaponY = baseWeaponY + aimOffsetY + recoilOffsetY + breathingOffset;

      ctx.drawImage(gameImages.weapon, weaponX, weaponY, weaponWidth, weaponHeight);
      
      // Draw muzzle flash if active
      if (muzzleFlash.active) {
        const flashAge = Date.now() - muzzleFlash.time;
        if (flashAge < 100) { // Flash lasts 100ms
          const flashSize = 30 - (flashAge / 100) * 20;
          const flashAlpha = 1 - (flashAge / 100);
          
          ctx.save();
          ctx.globalAlpha = flashAlpha;
          ctx.fillStyle = '#ffff00';
          ctx.shadowColor = '#ffff00';
          ctx.shadowBlur = 20;
          
          // Draw muzzle flash at weapon tip
          const flashX = weaponX + weaponWidth - 50;
          const flashY = weaponY + weaponHeight / 2;
          
          ctx.beginPath();
          ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          setMuzzleFlash(prev => ({ ...prev, active: false }));
        }
      }
    }
  }, [enemies, gameImages, crosshairPos, muzzleFlash, hitEffects, screenShake]);

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
      
      // Add hit effect at enemy location
      setHitEffects(prev => [...prev, {
        x: hitEnemy.x + hitEnemy.width / 2,
        y: hitEnemy.y + hitEnemy.height / 2,
        time: Date.now(),
        id: Date.now()
      }]);
    }
    
    // Trigger muzzle flash
    setMuzzleFlash({
      active: true,
      x: clickX,
      y: clickY,
      time: Date.now()
    });
    
    // Trigger screen shake
    setScreenShake({
      active: true,
      time: Date.now(),
      intensity: 8
    });
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

  // Animation loop with enemy movement
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update enemy movement
      updateEnemyMovement(deltaTime);
      
      // Draw the scene
      draw();
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [draw, updateEnemyMovement]);

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