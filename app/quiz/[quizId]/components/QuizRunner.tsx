// app/quiz/[quizId]/components/QuizRunner.tsx
'use client';

import { useState } from 'react';
import { Quiz } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // We'll fix this import

interface QuizRunnerProps {
  quiz: Quiz;
}

export function QuizRunner({ quiz }: QuizRunnerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz.content.questions[currentQuestionIndex];
  const totalQuestions = quiz.content.questions.length;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-lg font-medium">{currentQuestion.text}</p>
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.id}
                variant={selectedAnswers[currentQuestion.id] === option.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
              >
                {option.text}
              </Button>
            ))}
          </div>
        </div>
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
          disabled={!selectedAnswers[currentQuestion.id]}
        >
          {isLastQuestion ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
}