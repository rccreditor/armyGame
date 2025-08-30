import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Question {
  text: string;
  options: string[];
  correctAnswer: number;
}

interface MCQDialogProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  onClose: () => void;
}

const MCQDialog: React.FC<MCQDialogProps> = ({ question, onAnswer, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === question.correctAnswer;
    onAnswer(isCorrect);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="mcq-dialog max-w-2xl w-full mx-4">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-primary-foreground mb-2">
            TACTICAL INTEL REQUIRED
          </h3>
          <div className="w-full h-1 bg-primary/20 rounded">
            <div className="w-full h-full bg-primary rounded animate-pulse" />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-lg text-primary-foreground font-medium leading-relaxed">
            {question.text}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedOption === index
                  ? 'border-primary bg-primary/20 text-primary-foreground'
                  : 'border-border bg-secondary/10 text-secondary-foreground hover:border-primary/50'
              }`}
            >
              <span className="font-bold text-primary mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-8 py-2 border-border hover:border-primary"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="tactical-button px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CONFIRM TARGET
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MCQDialog;