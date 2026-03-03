'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Quiz } from '@prisma/client';

// Define props interface
interface QuizRunnerProps {
  quiz: Quiz;
  userId?: string;
  isPremium?: boolean;
}

interface QuestionDisplayProps {
  question: any; // You can define a proper Question type here
  selectedAnswer: string | undefined;
  onAnswerSelect: (questionId: string, optionId: string) => void;
}

interface ResultsDisplayProps {
  selectedAnswers: Record<string, string>;
  totalQuestions: number;
}

function QuestionDisplay({ question, selectedAnswer, onAnswerSelect }: QuestionDisplayProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.text}</p>
      <div className="space-y-2">
        {question.options.map((option: any) => (
          <Button
            key={option.id}
            variant={selectedAnswer === option.id ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => onAnswerSelect(question.id, option.id)}
          >
            {option.text}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ResultsDisplay({ selectedAnswers, totalQuestions }: ResultsDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Complete!</CardTitle>
        <CardDescription>You've finished the quiz</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Selected answers: {Object.keys(selectedAnswers).length} of {totalQuestions}</p>
      </CardContent>
    </Card>
  );
}

export function QuizRunner({ quiz, userId, isPremium }: QuizRunnerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = (quiz.content as any).questions[currentQuestionIndex];
  const totalQuestions = (quiz.content as any).questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  if (showResults) {
    return <ResultsDisplay selectedAnswers={selectedAnswers} totalQuestions={totalQuestions} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {totalQuestions}
          {isPremium && <span className="ml-2 text-purple-600">✨ Premium Quiz</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QuestionDisplay 
          question={currentQuestion}
          selectedAnswer={selectedAnswers[currentQuestion?.id]}
          onAnswerSelect={handleAnswerSelect}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedAnswers[currentQuestion?.id]}
        >
          {isLastQuestion ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
}