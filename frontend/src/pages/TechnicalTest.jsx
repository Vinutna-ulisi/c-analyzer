import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { CheckCircle2, ChevronRight, Loader2, Timer, XCircle } from 'lucide-react';

const QUESTIONS = [
    {
        id: 1,
        text: "If A is faster than B, and B is faster than C. Is A faster than C?",
        options: ["Yes", "No", "Cannot be determined", "None of the above"],
        correct_answer: "Yes"
    },
    {
        id: 2,
        text: "Find the next number in the series: 2, 6, 12, 20, 30, ...",
        options: ["40", "42", "44", "46"],
        correct_answer: "42"
    },
    {
        id: 3,
        text: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
        options: ["120 metres", "180 metres", "324 metres", "150 metres"],
        correct_answer: "150 metres"
    },
    {
        id: 4,
        text: "Which word does NOT belong with the others?",
        options: ["Tulip", "Rose", "Bud", "Daisy"],
        correct_answer: "Bud"
    },
    {
        id: 5,
        text: "If 'apple' is coded as 255135, how would 'grape' be coded?",
        options: ["142345", "7181165", "7181166", "7171165"], // Just a random logic puzzle for demonstration
        correct_answer: "7181165"
    },
    {
        id: 6,
        text: "Odometer is to mileage as compass is to:",
        options: ["Speed", "Hiking", "Needle", "Direction"],
        correct_answer: "Direction"
    },
    {
        id: 7,
        text: "How many times in a day, are the hands of a clock in straight line but opposite in direction?",
        options: ["20", "22", "24", "48"],
        correct_answer: "22"
    },
    {
        id: 8,
        text: "The day after tomorrow is my birthday. On the same day next week is the festival of Holi. Today is Monday. What will be the day after Holi?",
        options: ["Wednesday", "Thursday", "Friday", "Saturday"],
        correct_answer: "Thursday"
    },
    {
        id: 9,
        text: "What comes next in the sequence: A, C, F, J, O, ...",
        options: ["S", "T", "U", "U"],
        correct_answer: "U"
    },
    {
        id: 10,
        text: "If 5 machines take 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
        options: ["100 minutes", "50 minutes", "5 minutes", "10 minutes"],
        correct_answer: "5 minutes"
    }
];

const TechnicalTest = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [attemptNumber, setAttemptNumber] = useState(1);
    const [results, setResults] = useState([]);

    const [feedback, setFeedback] = useState(null); // { isCorrect: bool, selected: str }
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const timerRef = useRef(null);
    const navigate = useNavigate();

    const question = QUESTIONS[currentStep];

    useEffect(() => {
        // Start timer for current question
        setStartTime(Date.now());
        timerRef.current = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [currentStep, startTime]);

    const handleSelectOption = async (selected_answer) => {
        if (feedback?.isCorrect || isSubmitting) return;

        clearInterval(timerRef.current);
        const response_time = (Date.now() - startTime) / 1000;
        const is_correct = selected_answer === question.correct_answer;

        setFeedback({ isCorrect: is_correct, selected: selected_answer });

        const attemptData = {
            question_id: question.id,
            selected_answer: selected_answer,
            correct_answer: question.correct_answer,
            response_time: parseFloat(response_time.toFixed(2)),
            is_correct: is_correct,
            attempt_number: attemptNumber
        };

        setResults(prev => [...prev, attemptData]);

        if (!is_correct) {
            setTimeout(() => {
                setFeedback(null);
                setAttemptNumber(prev => prev + 1);
                setStartTime(Date.now());
            }, 1500); // 1.5 seconds feedback before allowing retry
        }
    };

    const handleNext = () => {
        setFeedback(null);
        setAttemptNumber(1);

        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            submitTest();
        }
    };

    const submitTest = async () => {
        setIsSubmitting(true);
        try {
            // Backend expects one attempt per post. 
            // We will batch send the results array.
            const submissionPromises = results.map(attempt => {
                return api.post('/tests/technical', attempt);
            });

            await Promise.all(submissionPromises);
            setIsCompleted(true);
        } catch (error) {
            console.error("Error submitting technical test", error);
            alert("Failed to submit test. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const progressPercentage = ((currentStep) / QUESTIONS.length) * 100;

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                        <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-4">Test Submitted!</h1>
                        <p className="text-slate-600 mb-8">
                            Your technical assessment is complete. Your cognitive profile has been updated automatically.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-grow flex items-center justify-center p-4 py-12">
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Progress Bar */}
                    <div className="bg-slate-100 h-2 w-full">
                        <div
                            className="bg-primary-500 h-2 transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="mb-8 flex justify-between items-end">
                            <div>
                                <span className="text-sm font-bold text-slate-500 tracking-wider uppercase block mb-1">
                                    Question {currentStep + 1} of {QUESTIONS.length}
                                </span>
                                <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                                    Attempt {attemptNumber}
                                </span>
                            </div>

                            <div className="flex items-center space-x-2 text-slate-600 font-mono text-lg font-medium bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                                <Timer className="h-5 w-5 text-slate-400" />
                                <span>{elapsedTime}s</span>
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-snug">
                            {question.text}
                        </h2>

                        <div className="space-y-4">
                            {question.options.map((opt, idx) => {
                                const isSelected = feedback?.selected === opt;
                                const isCorrectOption = question.correct_answer === opt;

                                let btnStyle = "border-slate-200 hover:border-primary-300 hover:bg-slate-50 text-slate-700";
                                let Icon = null;

                                if (feedback) {
                                    if (isSelected) {
                                        if (feedback.isCorrect) {
                                            btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm";
                                            Icon = <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-2" />;
                                        } else {
                                            btnStyle = "border-red-500 bg-red-50 text-red-900 shadow-sm";
                                            Icon = <XCircle className="h-5 w-5 text-red-500 ml-2 animate-bounce" />;
                                        }
                                    } else if (feedback.isCorrect && isCorrectOption && !isSelected) { // implicitly show correct if answered wrongly? We won't show it immediately because they retry.
                                        // But if they just got it wrong, we don't highlight the correct one, we let them retry.
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        disabled={feedback !== null}
                                        onClick={() => handleSelectOption(opt)}
                                        className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between ${btnStyle}`}
                                    >
                                        <span className="font-medium text-lg leading-relaxed">{opt}</span>
                                        {Icon}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-12 flex justify-between items-center">
                            <div className="text-sm text-slate-500">
                                {feedback && !feedback.isCorrect && (
                                    <span className="text-red-500 font-medium">Incorrect. Retrying in a moment...</span>
                                )}
                                {feedback && feedback.isCorrect && (
                                    <span className="text-emerald-500 font-medium flex items-center">
                                        Correct! Click Next to continue.
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={!feedback?.isCorrect || isSubmitting}
                                className="flex items-center px-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        {currentStep === QUESTIONS.length - 1 ? 'Finish Test' : 'Next Question'}
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default TechnicalTest;
