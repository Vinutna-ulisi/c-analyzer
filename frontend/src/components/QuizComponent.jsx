import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, HelpCircle, Trophy } from 'lucide-react';

const QuizComponent = ({ quiz, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No quiz available for this course yet.</p>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const options = currentQuestion.options.split(',');

    const handleOptionSelect = (option) => {
        if (showFeedback) return;
        setSelectedOption(option);
    };

    const handleSubmit = () => {
        if (!selectedOption) return;

        const isCorrect = selectedOption === currentQuestion.correct_answer;
        if (isCorrect) setScore(score + 1);
        setShowFeedback(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex + 1 < quiz.questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setShowFeedback(false);
        } else {
            setIsFinished(true);
            if (onComplete) onComplete(score + (selectedOption === currentQuestion.correct_answer ? 1 : 0));
        }
    };

    if (isFinished) {
        const finalScore = score;
        const total = quiz.questions.length;
        const percentage = (finalScore / total) * 100;

        return (
            <div className="p-8 md:p-12 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-12 h-12 text-primary-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Quiz Completed!</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    You've finished the final assessment for this course. Here are your results:
                </p>

                <div className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100 max-w-sm mx-auto">
                    <div className="text-5xl font-black text-primary-600 mb-2">{finalScore}/{total}</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Score</div>
                    <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-600 transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>

                <button
                    onClick={() => {
                        setCurrentQuestionIndex(0);
                        setSelectedOption(null);
                        setShowFeedback(false);
                        setScore(0);
                        setIsFinished(false);
                    }}
                    className="text-primary-600 font-bold hover:underline"
                >
                    Retake Quiz
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="text-xs font-black text-primary-600 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                </div>
                <div className="flex gap-1">
                    {quiz.questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 w-6 rounded-full transition-colors ${idx === currentQuestionIndex ? 'bg-primary-600' : idx < currentQuestionIndex ? 'bg-primary-200' : 'bg-slate-100'}`}
                        />
                    ))}
                </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-snug">
                {currentQuestion.text}
            </h3>

            <div className="space-y-3 mb-10">
                {options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === currentQuestion.correct_answer;

                    let variantClass = "border-slate-200 hover:border-primary-300 hover:bg-primary-50/30";
                    if (showFeedback) {
                        if (isCorrect) variantClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                        else if (isSelected) variantClass = "border-red-500 bg-red-50 ring-1 ring-red-500";
                        else variantClass = "border-slate-100 opacity-50";
                    } else if (isSelected) {
                        variantClass = "border-primary-600 bg-primary-50 ring-1 ring-primary-600 shadow-sm";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(option)}
                            disabled={showFeedback}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${variantClass}`}
                        >
                            <span className={`font-medium ${isSelected || (showFeedback && isCorrect) ? 'text-slate-900' : 'text-slate-600'}`}>
                                {option}
                            </span>
                            {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                            {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                        </button>
                    );
                })}
            </div>

            {showFeedback && currentQuestion.explanation && (
                <div className="mb-10 p-5 bg-blue-50 border border-blue-100 rounded-2xl animate-in fade-in duration-300">
                    <p className="text-sm font-bold text-blue-800 mb-1 flex items-center">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Explanation
                    </p>
                    <p className="text-sm text-blue-700 leading-relaxed">
                        {currentQuestion.explanation}
                    </p>
                </div>
            )}

            <div className="flex justify-end">
                {!showFeedback ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center"
                    >
                        Submit Answer
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center"
                    >
                        {currentQuestionIndex + 1 === quiz.questions.length ? 'Finish Quiz' : 'Next Question'}
                        <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizComponent;
