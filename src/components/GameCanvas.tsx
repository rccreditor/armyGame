import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import MCQDialog from './MCQDialog';
import GameUI from './GameUI';

// Import game assets
import tacticalTrainingBg from '@/assets/military bg.jpg';
import ak47Weapon from '@/assets/ak47-first-person.png';
import enemyTransparent from '@/assets/enemy1.png';

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
  const [bullets, setBullets] = useState<Array<{x: number, y: number, vx: number, vy: number, time: number, id: number}>>([]);
  const [gunSparks, setGunSparks] = useState<Array<{x: number, y: number, vx: number, vy: number, time: number, id: number}>>([]);
  const [enemyDeathEffects, setEnemyDeathEffects] = useState<Array<{x: number, y: number, time: number, id: number, phase: number}>>([]);
  const [bloodParticles, setBloodParticles] = useState<Array<{x: number, y: number, vx: number, vy: number, time: number, id: number, size: number}>>([]);
  const [playerDamageEffects, setPlayerDamageEffects] = useState<Array<{x: number, y: number, vx: number, vy: number, time: number, id: number, size: number}>>([]);
  const [enemyFallingStates, setEnemyFallingStates] = useState<Array<{enemyId: number, startTime: number, startX: number, startY: number, phase: number}>>([]);
  const [screenFlash, setScreenFlash] = useState({ active: false, time: 0, intensity: 0 });

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

  // Create bullet with trajectory
  const createBullet = useCallback((startX: number, startY: number, targetX: number, targetY: number) => {
    const bulletSpeed = 15;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const vx = (dx / distance) * bulletSpeed;
    const vy = (dy / distance) * bulletSpeed;
    
    setBullets(prev => [...prev, {
      x: startX,
      y: startY,
      vx,
      vy,
      time: Date.now(),
      id: Date.now()
    }]);
  }, []);

  // Create gun sparks
  const createGunSparks = useCallback((x: number, y: number) => {
    const sparkCount = 8;
    const newSparks = [];
    
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      newSparks.push({
        x,
        y,
        vx,
        vy,
        time: Date.now(),
        id: Date.now() + i
      });
    }
    
    setGunSparks(prev => [...prev, ...newSparks]);
  }, []);

  // Create blood particles
  const createBloodParticles = useCallback((x: number, y: number) => {
    const particleCount = 20;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      // Add some particles with different properties for variety
      const isLarge = Math.random() > 0.7;
      const size = isLarge ? 6 + Math.random() * 4 : 2 + Math.random() * 3;
      
      newParticles.push({
        x,
        y,
        vx,
        vy,
        time: Date.now(),
        id: Date.now() + i,
        size: size
      });
    }
    
    setBloodParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Create player damage effects (blood from player)
  const createPlayerDamageEffects = useCallback((x: number, y: number) => {
    const particleCount = 25;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 10;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      // Player damage particles are larger and more dramatic
      const isLarge = Math.random() > 0.5;
      const size = isLarge ? 8 + Math.random() * 6 : 4 + Math.random() * 4;
      
      newParticles.push({
        x,
        y,
        vx,
        vy,
        time: Date.now(),
        id: Date.now() + i,
        size: size
      });
    }
    
    setPlayerDamageEffects(prev => [...prev, ...newParticles]);
  }, []);

  // Start enemy falling animation
  const startEnemyFalling = useCallback((enemyId: number, startX: number, startY: number) => {
    setEnemyFallingStates(prev => [...prev, {
      enemyId,
      startTime: Date.now(),
      startX,
      startY,
      phase: 0
    }]);
  }, []);

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
        enemies: [enemyImg]
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
        width: 200,
        height: 400,
        alive: true,
        image: enemyImg,
        question: question,
        startX: enemyPositions[index].x,
        startY: enemyPositions[index].y,
        movementPattern: getMovementPattern(index),
        movementPhase: 0,
        lastMovementTime: 0,
        movementSpeed: 0.5 + Math.random() * 0.5,
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
      
      if (timeSinceLastMove < 50) return enemy;

      let newX = enemy.x;
      let newY = enemy.y;
      let newDirection = enemy.direction;
      let newPhase = enemy.movementPhase;

      switch (enemy.movementPattern) {
        case 'patrol':
          const patrolSpeed = enemy.movementSpeed * (0.8 + Math.sin(Date.now() * 0.001 + enemy.id) * 0.2);
          newX = enemy.x + (enemy.direction * patrolSpeed * deltaTime * 0.1);
          
          if (newX > enemy.startX + 120 || newX < enemy.startX - 120) {
            newDirection = -enemy.direction;
            newX = enemy.x;
          }
          break;

        case 'cover':
          if (enemy.movementPhase === 0) {
            newX = enemy.x - (enemy.movementSpeed * deltaTime * 0.08);
            if (newX <= enemy.startX - 60) {
              newPhase = 1;
              newX = enemy.startX - 60;
            }
          } else if (enemy.movementPhase === 1) {
            if (timeSinceLastMove > 2000) {
              newPhase = 2;
            }
          } else if (enemy.movementPhase === 2) {
            newX = enemy.x + (enemy.movementSpeed * deltaTime * 0.08);
            if (newX >= enemy.startX) {
              newPhase = 0;
              newX = enemy.startX;
            }
          }
          break;

        case 'advance':
          if (enemy.movementPhase === 0) {
            newX = enemy.x - (enemy.movementSpeed * deltaTime * 0.05);
            if (newX < enemy.startX - 100) {
              newPhase = 1;
              newX = enemy.startX - 100;
            }
          } else if (enemy.movementPhase === 1) {
            if (timeSinceLastMove > 1500) {
              newPhase = 2;
            }
          } else if (enemy.movementPhase === 2) {
            newX = enemy.x + (enemy.movementSpeed * deltaTime * 0.05);
            if (newX >= enemy.startX) {
              newPhase = 0;
              newX = enemy.startX;
            }
          }
          break;

        case 'strafe':
          if (enemy.movementPhase === 0) {
            newX = enemy.x - (enemy.movementSpeed * deltaTime * 0.15);
            if (newX <= enemy.startX - 80) {
              newPhase = 1;
              newX = enemy.startX - 80;
            }
          } else if (enemy.movementPhase === 1) {
            if (timeSinceLastMove > 1000) {
              newPhase = 2;
            }
          } else if (enemy.movementPhase === 2) {
            newX = enemy.x + (enemy.movementSpeed * deltaTime * 0.15);
            if (newX >= enemy.startX + 80) {
              newPhase = 3;
              newX = enemy.startX + 80;
            }
          } else if (enemy.movementPhase === 3) {
            if (timeSinceLastMove > 1000) {
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

  // Update bullets, sparks, and blood particles
  const updateParticles = useCallback(() => {
    const currentTime = Date.now();
    
    // Update bullets
    setBullets(prev => prev.filter(bullet => {
      const bulletAge = currentTime - bullet.time;
      if (bulletAge > 2000) return false;
      
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      return true;
    }));

    // Update gun sparks
    setGunSparks(prev => prev.filter(spark => {
      const sparkAge = currentTime - spark.time;
      if (sparkAge > 500) return false;
      
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.2;
      
      return true;
    }));

    // Update blood particles
    setBloodParticles(prev => prev.filter(particle => {
      const particleAge = currentTime - particle.time;
      if (particleAge > 3000) return false;
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.3;
      
      return true;
    }));

    // Update player damage effects
    setPlayerDamageEffects(prev => prev.filter(effect => {
      const effectAge = currentTime - effect.time;
      if (effectAge > 1000) return false;
      
      effect.x += effect.vx;
      effect.y += effect.vy;
      effect.vy += 0.5;
      
      return true;
    }));

         // Update enemy falling states
     setEnemyFallingStates(prev => prev.filter(state => {
       const currentTime = Date.now();
       const timeSinceStart = currentTime - state.startTime;
       
       // Remove states older than 1 second
       return timeSinceStart < 1000;
     }));
  }, []);

  // Draw game scene
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save(); // Save the current state

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply screen shake effect
    if (screenShake.active) {
      const shakeAge = Date.now() - screenShake.time;
      if (shakeAge < 200) {
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
        ctx.save();
        
        const rotationAngle = Math.sin(Date.now() * 0.002 + enemy.id) * 0.02;
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        ctx.rotate(rotationAngle);
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.drawImage(enemy.image, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
        
        ctx.restore();
      } else {
        // Draw fallen enemy on the ground
        const fallingState = enemyFallingStates.find(state => state.enemyId === enemy.id);
        if (fallingState) {
          const timeSinceStart = Date.now() - fallingState.startTime;
          const fallProgress = Math.min(timeSinceStart / 1000, 1); // 1 second fall
          const fallDistance = 80; // Fall 80 pixels
          const currentY = fallingState.startY + (fallProgress * fallDistance);
          
          ctx.save();
          ctx.globalAlpha = 0.7; // Slight fade for fallen enemy
          ctx.translate(enemy.x + enemy.width / 2, currentY + enemy.height / 2);
          ctx.rotate(fallProgress * Math.PI / 6); // Rotate as it falls
          
          // Draw enemy lying down (scaled down to simulate being on ground)
          ctx.scale(0.7, 0.4);
          ctx.drawImage(enemy.image, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
          
          ctx.restore();
        }
      }
    });
    
    // Draw bullets
    bullets.forEach(bullet => {
      ctx.save();
      ctx.fillStyle = '#ffff00';
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw gun sparks
    gunSparks.forEach(spark => {
      const sparkAge = Date.now() - spark.time;
      const alpha = 1 - (sparkAge / 500);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffaa00';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 5;
      
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw blood particles
    bloodParticles.forEach(particle => {
      const particleAge = Date.now() - particle.time;
      const alpha = 1 - (particleAge / 3000);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#8b0000';
      ctx.shadowColor = '#8b0000';
      ctx.shadowBlur = 3;
      
      // Use the particle size for more realistic blood splatter
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // Draw enemy death effects
    enemyDeathEffects.forEach((effect, index) => {
      const effectAge = Date.now() - effect.time;
      if (effectAge < 2000) { // Effect lasts 2 seconds
        const effectSize = 60 + (effectAge / 2000) * 40;
        const effectAlpha = 1 - (effectAge / 2000);
        
        ctx.save();
        ctx.globalAlpha = effectAlpha;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        
        // Draw expanding death effect
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effectSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        // Remove expired effects
        setEnemyDeathEffects(prev => prev.filter((_, i) => i !== index));
      }
    });
    
    // Draw hit effects
    hitEffects.forEach((effect, index) => {
      const effectAge = Date.now() - effect.time;
      if (effectAge < 500) {
        const effectSize = 40 - (effectAge / 500) * 30;
        const effectAlpha = 1 - (effectAge / 500);
        
        ctx.save();
        ctx.globalAlpha = effectAlpha;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effectSize, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        setHitEffects(prev => prev.filter((_, i) => i !== index));
      }
    });

    // Draw player damage effects
    playerDamageEffects.forEach(effect => {
      const effectAge = Date.now() - effect.time;
      const alpha = 1 - (effectAge / 1000);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ff0000'; // Red blood
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 5;
      
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw enemy falling states
    enemyFallingStates.forEach(state => {
      const currentTime = Date.now();
      const timeSinceStart = currentTime - state.startTime;

      if (timeSinceStart < 1000) { // Falling animation lasts 1 second
        const phase = state.phase;
        let newY = state.startY;

        if (phase === 0) {
          newY = state.startY - (timeSinceStart * 0.5); // Fall down
        } else if (phase === 1) {
          newY = state.startY + (timeSinceStart * 0.5); // Rise up
        }

        ctx.save();
        ctx.globalAlpha = 1 - (timeSinceStart / 1000); // Fade out as it rises
        ctx.fillStyle = '#ff0000'; // Red blood
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 3;
        
        ctx.beginPath();
        ctx.arc(state.startX, newY, 10, 0, Math.PI * 2); // Smaller blood splatter
        ctx.fill();
        ctx.restore();
      }
    });

    // Draw weapon with enhanced aim movement
    if (gameImages.weapon) {
      const weaponWidth = 800;
      const weaponHeight = 600;
      
      const baseWeaponX = canvas.width - weaponWidth;
      const baseWeaponY = canvas.height - weaponHeight;

      const aimFactor = 0.2;
      const recoilFactor = 0.08;
      
      // Calculate aim offset based on crosshair position
      let aimOffsetX = (crosshairPos.x - canvas.width / 2) * aimFactor;
      let aimOffsetY = (crosshairPos.y - canvas.height / 2) * aimFactor;

      // Clamp the aim offset to a certain range
      const maxAimOffsetRight = 25; // Right movement range
      const maxAimOffsetLeft = 10;  // Left movement range
      const maxAimOffsetY = 12; // Vertical movement range
      aimOffsetX = Math.max(-maxAimOffsetLeft, Math.min(maxAimOffsetRight, aimOffsetX));
      aimOffsetY = Math.max(-maxAimOffsetY, Math.min(maxAimOffsetY, aimOffsetY));
      
      const currentTime = Date.now();
      const recoilTime = currentTime * 0.01;
      const recoilOffsetX = Math.sin(recoilTime) * recoilFactor * 8 + 
                           Math.sin(recoilTime * 2.3) * recoilFactor * 4;
      const recoilOffsetY = Math.cos(recoilTime * 0.8) * recoilFactor * 6 + 
                           Math.sin(recoilTime * 1.7) * recoilFactor * 3;
      
      const breathingOffset = Math.sin(currentTime * 0.003) * 2;
      
      const weaponX = baseWeaponX + aimOffsetX + recoilOffsetX;
      const weaponY = baseWeaponY + aimOffsetY + recoilOffsetY + breathingOffset;

      ctx.drawImage(gameImages.weapon, weaponX, weaponY, weaponWidth, weaponHeight);
      
      // Draw muzzle flash if active
      if (muzzleFlash.active) {
        const flashAge = Date.now() - muzzleFlash.time;
        if (flashAge < 100) {
          const flashSize = 30 - (flashAge / 100) * 20;
          const flashAlpha = 1 - (flashAge / 100);
          
          ctx.save();
          ctx.globalAlpha = flashAlpha;
          ctx.fillStyle = '#ffff00';
          ctx.shadowColor = '#ffff00';
          ctx.shadowBlur = 20;
          
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

     // Draw red screen flash overlay when player is hit
     if (screenFlash.active) {
       const flashAge = Date.now() - screenFlash.time;
       if (flashAge < 500) { // Flash lasts 500ms
         const flashAlpha = screenFlash.intensity * (1 - flashAge / 500);
         
         ctx.save();
         ctx.globalAlpha = flashAlpha;
         ctx.fillStyle = '#ff0000'; // Red overlay
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.restore();
       } else {
         setScreenFlash(prev => ({ ...prev, active: false }));
       }
     }

     ctx.restore(); // Restore the saved state
   }, [enemies, gameImages, crosshairPos, muzzleFlash, hitEffects, screenShake, screenFlash]);

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

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Create bullet from weapon tip to crosshair
    const weaponTipX = canvas.width - 50;
    const weaponTipY = canvas.height - 300;
    createBullet(weaponTipX, weaponTipY, clickX, clickY);
    
    // Create gun sparks at weapon tip
    createGunSparks(weaponTipX, weaponTipY);

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
      
      // Add hit effect
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
  }, [enemies, createBullet, createGunSparks, createBloodParticles]);

  // Handle MCQ answer
  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (!selectedEnemy) return;

    if (isCorrect) {
      // Correct answer - enemy dies
      setEnemies(prev => prev.map(enemy => 
        enemy.id === selectedEnemy.id ? { ...enemy, alive: false } : enemy
      ));
      setScore(prev => prev + 1);
      
      // Create enemy blood particles at enemy location
      createBloodParticles(selectedEnemy.x + selectedEnemy.width / 2, selectedEnemy.y + selectedEnemy.height / 2);
      
      // Start enemy falling animation
      startEnemyFalling(selectedEnemy.id, selectedEnemy.x + selectedEnemy.width / 2, selectedEnemy.y + selectedEnemy.height / 2);
      
      // Add enemy death effect
      setEnemyDeathEffects(prev => [...prev, {
        x: selectedEnemy.x + selectedEnemy.width / 2,
        y: selectedEnemy.y + selectedEnemy.height / 2,
        time: Date.now(),
        id: Date.now(),
        phase: 0
      }]);
      
      toast({
        title: "Target Eliminated!",
        description: "+1 Score",
        className: "bg-primary text-primary-foreground"
      });

      const remainingEnemies = enemies.filter(e => e.alive && e.id !== selectedEnemy.id);
      if (remainingEnemies.length === 0) {
        setTimeout(() => onMissionComplete(score + 1), 1000);
      }
    } else {
             // Wrong answer - player takes damage
       if (score === 0) {
         onGameOver(0);
       } else {
         setScore(prev => prev - 1);
         setHealth(prev => Math.max(0, prev - 25));
         
         // Create player damage effects (blood from player)
         const playerX = canvasRef.current ? canvasRef.current.width - 400 : 800;
         const playerY = canvasRef.current ? canvasRef.current.height - 300 : 600;
         createPlayerDamageEffects(playerX, playerY);
         
         // Trigger red screen flash to show player got hit
         setScreenFlash({
           active: true,
           time: Date.now(),
           intensity: 0.4 // 40% opacity red overlay
         });
         
         toast({
           title: "Enemy Retaliation!",
           description: "-1 Score",
           variant: "destructive"
         });
       }
    }

    setSelectedEnemy(null);
  }, [selectedEnemy, enemies, score, onGameOver, onMissionComplete, createBloodParticles, createPlayerDamageEffects, startEnemyFalling]);

  // Animation loop with enemy movement
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      updateEnemyMovement(deltaTime);
      updateParticles();
      draw();
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [draw, updateEnemyMovement, updateParticles]);

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