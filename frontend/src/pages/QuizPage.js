import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { Brain, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuizPage = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get('track') || 'basic';
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API}/quiz/tracks/${trackId}/questions?limit=5`);
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [trackId]);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;

    try {
      const res = await fetch(`${API}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question_id: currentQuestion.question_id,
          selected_answer: selectedAnswer,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsCorrect(data.correct);
        setExplanation(language === 'pt' ? data.explanation_pt : data.explanation_en);
        setShowResult(true);
        
        if (data.correct) {
          setScore(prev => prev + 1);
        }
      }
    } catch (error) {
      toast.error('Erro ao enviar resposta');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizComplete(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-wine-500/20 rounded-sm mx-auto mb-4 animate-pulse flex items-center justify-center">
            <Brain className="w-8 h-8 text-wine-500" />
          </div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === 'pt' ? 'Nenhuma pergunta disponível' : 'No questions available'}
          </p>
          <Link to="/study">
            <Button variant="link" className="text-wine-500 mt-2">
              {t('quiz.backToStudy')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen py-8 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-border/40 text-center">
            <CardContent className="p-10">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                percentage >= 60 ? 'bg-green-500/20' : 'bg-wine-500/20'
              }`}>
                <Trophy className={`w-10 h-10 ${
                  percentage >= 60 ? 'text-green-500' : 'text-wine-500'
                }`} />
              </div>
              
              <h2 className="font-serif text-2xl font-bold mb-2">
                {language === 'pt' ? 'Quiz Concluído!' : 'Quiz Complete!'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {percentage >= 60 
                  ? (language === 'pt' ? 'Parabéns! Você foi muito bem!' : 'Congratulations! You did great!')
                  : (language === 'pt' ? 'Continue estudando para melhorar seu resultado.' : 'Keep studying to improve your score.')}
              </p>
              
              <div className="bg-muted/30 rounded-sm p-6 mb-8">
                <div className="text-4xl font-serif font-bold text-wine-500 mb-1">
                  {score}/{questions.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {percentage}% {language === 'pt' ? 'de acertos' : 'correct'}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  data-testid="restart-quiz-button"
                  onClick={handleRestart}
                  className="w-full bg-wine-500 hover:bg-wine-600 text-white rounded-sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('quiz.tryAgain')}
                </Button>
                <Link to="/study" className="block">
                  <Button variant="outline" className="w-full rounded-sm">
                    {t('quiz.backToStudy')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-serif text-2xl font-bold">{t('quiz.title')}</h1>
            <span className="text-muted-foreground">
              {t('quiz.question')} {currentIndex + 1} {t('quiz.of')} {questions.length}
            </span>
          </div>
          <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-border/40">
              <CardContent className="p-8">
                <h2 className="font-serif text-xl font-semibold mb-6">
                  {language === 'pt' ? currentQuestion.question_pt : currentQuestion.question_en}
                </h2>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {(language === 'pt' ? currentQuestion.options_pt : currentQuestion.options_en).map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectAnswer = currentQuestion.correct_answer === index;
                    
                    let buttonClass = 'w-full text-left px-5 py-4 rounded-sm border transition-all ';
                    
                    if (showResult) {
                      if (isCorrectAnswer) {
                        buttonClass += 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400';
                      } else if (isSelected && !isCorrect) {
                        buttonClass += 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400';
                      } else {
                        buttonClass += 'border-border opacity-50';
                      }
                    } else {
                      if (isSelected) {
                        buttonClass += 'border-wine-500 bg-wine-500/10';
                      } else {
                        buttonClass += 'border-border hover:border-wine-500/50 hover:bg-muted/50';
                      }
                    }

                    return (
                      <button
                        key={index}
                        data-testid={`quiz-option-${index}`}
                        onClick={() => !showResult && setSelectedAnswer(index)}
                        disabled={showResult}
                        className={buttonClass}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium ${
                            isSelected && !showResult ? 'border-wine-500 bg-wine-500 text-white' : 'border-current'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                          {showResult && isCorrectAnswer && (
                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Result Feedback */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 rounded-sm mb-6 ${
                        isCorrect 
                          ? 'bg-green-500/10 border border-green-500/30' 
                          : 'bg-red-500/10 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-medium text-green-700 dark:text-green-400">
                              {t('quiz.correct')}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="font-medium text-red-700 dark:text-red-400">
                              {t('quiz.incorrect')}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>{t('quiz.explanation')}:</strong> {explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  {!showResult ? (
                    <Button
                      data-testid="submit-answer-button"
                      onClick={handleSubmit}
                      disabled={selectedAnswer === null}
                      className="bg-wine-500 hover:bg-wine-600 text-white rounded-sm"
                    >
                      {t('quiz.submit')}
                    </Button>
                  ) : (
                    <Button
                      data-testid="next-question-button"
                      onClick={handleNext}
                      className="bg-wine-500 hover:bg-wine-600 text-white rounded-sm"
                    >
                      {currentIndex < questions.length - 1 ? t('quiz.next') : t('quiz.finish')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Score Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-muted-foreground"
        >
          {t('quiz.score')}: {score}/{currentIndex + (showResult ? 1 : 0)}
        </motion.div>
      </div>
    </div>
  );
};

export default QuizPage;
