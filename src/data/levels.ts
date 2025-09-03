import tacticalTrainingBg from '@/assets/military bg.jpg';
import enemy1 from '@/assets/enemy1.png';
import level2Bg from '@/assets/level2_bg.jpg';
import enemy2 from '@/assets/enemy2.png';
import level3Bg from '@/assets/level3_bg.jpg';
import enemy3 from '@/assets/enemy3.png';

export interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface LevelData {
  id: number;
  name: string;
  backgroundImg: string;
  enemyImg: string;
  questions: Question[];
  enemyPositions: { x: number; y: number }[];
  enemyWidth: number; // New property
  enemyHeight: number; // New property
}

const level1Questions: Question[] = [
  { text: "What is the primary objective of infantry tactics?", options: ["Speed", "Terrain Control", "Heavy Firepower", "Air Support"], correctAnswer: 1 },
  { text: "Which formation provides best protection during advance?", options: ["Single File", "Wedge Formation", "Line Formation", "Column Formation"], correctAnswer: 1 },
  { text: "What does 'RV' stand in military terminology?", options: ["Rapid Vehicle", "Rendezvous Point", "Radio Vector", "Recon Vehicle"], correctAnswer: 1 },
  { text: "Which is the most effective cover during enemy fire?", options: ["Trees", "Concrete Walls", "Metal Sheets", "Sand Bags"], correctAnswer: 1 },
  { text: "What is the standard field of fire for a rifle squad?", options: ["90 degrees", "180 degrees", "270 degrees", "360 degrees"], correctAnswer: 1 }
];

export const levels: LevelData[] = [
  {
    id: 1,
    name: "Level 1: Tactical Training",
    backgroundImg: tacticalTrainingBg,
    enemyImg: enemy1,
    questions: [...level1Questions],
    enemyPositions: [
      { x: 100, y: 400 }, { x: 350, y: 410 }, { x: 860, y: 400 }, { x: 1370, y: 410 }, { x: 1620, y: 400 }
    ],
    enemyWidth: 300,
    enemyHeight: 440
  },
  {
    id: 2,
    name: "Level 2: Needs Recon",
    backgroundImg: level2Bg,
    enemyImg: enemy2,
    questions: [...level1Questions], // Use a copy of Level 1 questions
    enemyPositions: [
      { x: 200, y: 300 }, { x: 500, y: 320 }, { x: 800, y: 300 }, { x: 1100, y: 320 }, { x: 1400, y: 300 }
    ],
    enemyWidth: 350,
    enemyHeight: 740
  },
  {
    id: 3,
    name: "Mission 3: Secure The Plan",
    backgroundImg: level3Bg,
    enemyImg: enemy3,
    questions: [...level1Questions], // Use a copy of Level 1 questions
    enemyPositions: [
      { x: 150, y: 430 }, { x: 450, y: 450 }, { x: 750, y: 430 }, { x: 1050, y: 450 }, { x: 1350, y: 430 }
    ],
    enemyWidth: 200,
    enemyHeight: 400
  }
];