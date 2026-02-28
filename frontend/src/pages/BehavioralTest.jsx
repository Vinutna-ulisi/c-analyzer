import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

const QUESTIONS = [
    {
        id: 1,
        text: "How many hours do you study daily on average?",
        options: [
            { id: 'a', text: "Less than 1 hour", score: 2 },
            { id: 'b', text: "1 - 3 hours", score: 5 },
            { id: 'c', text: "3 - 5 hours", score: 8 },
            { id: 'd', text: "More than 5 hours", score: 10 }
        ]
    },
    {
        id: 2,
        text: "What do you do when you don’t understand a topic?",
        options: [
            { id: 'a', text: "Skip it and move on", score: 1 },
            { id: 'b', text: "Try reading it once more, then give up", score: 4 },
            { id: 'c', text: "Search for resources online and ask for help", score: 8 },
            { id: 'd', text: "Persist until I completely understand it", score: 10 }
        ]
    },
    {
        id: 3,
        text: "How often do you revise previously learned topics?",
        options: [
            { id: 'a', text: "Only before an exam", score: 3 },
            { id: 'b', text: "Occasionally, when I remember", score: 5 },
            { id: 'c', text: "Weekly scheduled revisions", score: 8 },
            { id: 'd', text: "Daily spaced repetition", score: 10 }
        ]
    },
    {
        id: 4,
        text: "Which learning format do you prefer?",
        options: [
            { id: 'a', text: "Listening to lectures (Auditory)", score: 6 },
            { id: 'b', text: "Reading books and notes (Reading)", score: 6 },
            { id: 'c', text: "Watching videos and diagrams (Visual)", score: 7 },
            { id: 'd', text: "Hands-on projects and coding (Practical)", score: 10 }
        ]
    },
    {
        id: 5,
        text: "How do you react after making mistakes in a test?",
        options: [
            { id: 'a', text: "Feel demotivated and avoid the subject", score: 1 },
            { id: 'b', text: "Ignore the mistakes and focus on the score", score: 3 },
            { id: 'c', text: "Review the mistakes briefly", score: 7 },
            { id: 'd', text: "Analyze each mistake to ensure I don't repeat it", score: 10 }
        ]
    },
    {
        id: 6,
        text: "Do you retry difficult questions that you failed initially?",
        options: [
            { id: 'a', text: "Rarely, I prefer easier questions", score: 2 },
            { id: 'b', text: "Sometimes, if I have time", score: 5 },
            { id: 'c', text: "Most of the time", score: 8 },
            { id: 'd', text: "Always, I treat it as a challenge", score: 10 }
        ]
    },
    {
        id: 7,
        text: "How do you manage study distractions (e.g., social media)?",
        options: [
            { id: 'a', text: "I get distracted easily and often", score: 2 },
            { id: 'b', text: "I try to ignore them but sometimes fail", score: 5 },
            { id: 'c', text: "I use apps to block distractions during study time", score: 8 },
            { id: 'd', text: "I have a strict disciplined routine", score: 10 }
        ]
    },
    {
        id: 8,
        text: "When facing a complex problem, what is your approach?",
        options: [
            { id: 'a', text: "Look for the complete solution immediately", score: 3 },
            { id: 'b', text: "Try for a few minutes, then look for the solution", score: 5 },
            { id: 'c', text: "Break it down into smaller parts", score: 8 },
            { id: 'd', text: "Draft an algorithm/plan before attempting", score: 10 }
        ]
    },
    {
        id: 9,
        text: "How do you measure your learning progress?",
        options: [
            { id: 'a', text: "I don't measure it", score: 2 },
            { id: 'b', text: "By the number of chapters completed", score: 5 },
            { id: 'c', text: "By doing regular self-assessments", score: 8 },
            { id: 'd', text: "By building real-world applications/projects", score: 10 }
        ]
    },
    {
        id: 10,
        text: "What motivates you to learn?",
        options: [
            { id: 'a', text: "To pass exams", score: 3 },
            { id: 'b', text: "To get a job/career progression", score: 6 },
            { id: 'c', text: "Praise from peers/mentors", score: 5 },
            { id: 'd', text: "Genuine curiosity and passion for the field", score: 10 }
        ]
    }
];

const BehavioralTest = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const navigate = useNavigate();

    const handleSelectOption = (questionId, optionId, score) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                selected_option: optionId,
                score_weight: score
            }
        }));
    };

    const handleNext = () => {
        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            submitTest();
        }
    };

    const submitTest = async () => {
        setIsSubmitting(true);
        try {
            const submissionPromises = Object.keys(answers).map(qId => {
                return api.post('/tests/behavioral', {
                    question_id: parseInt(qId),
                    selected_option: answers[qId].selected_option,
                    score_weight: answers[qId].score_weight
                });
            });

            await Promise.all(submissionPromises);
            setIsCompleted(true);
        } catch (error) {
            console.error("Error submitting test", error);
            alert("Failed to submit test. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const question = QUESTIONS[currentStep];
    const progressPercentage = ((currentStep) / QUESTIONS.length) * 100;

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center">
                    <CheckCircle2 className="h-24 w-24 text-emerald-500 mb-6" />
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Test Completed Successfully!</h1>
                    <p className="text-slate-600 mb-8 text-center max-w-md">
                        Your behavioral responses have been recorded and your cognitive profile has been updated.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                        Return to Dashboard
                    </button>
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
                            <span className="text-sm font-bold text-primary-600 tracking-wider uppercase">
                                Question {currentStep + 1} of {QUESTIONS.length}
                            </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">
                            {question.text}
                        </h2>

                        <div className="space-y-4">
                            {question.options.map((opt) => {
                                const isSelected = answers[question.id]?.selected_option === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleSelectOption(question.id, opt.id, opt.score)}
                                        className={`w-full text-left p-5 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm'
                                                : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 text-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-lg">{opt.text}</span>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary-500' : 'border-slate-300'
                                                }`}>
                                                {isSelected && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-12 flex justify-end">
                            <button
                                onClick={handleNext}
                                disabled={!answers[question.id] || isSubmitting}
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

export default BehavioralTest;
