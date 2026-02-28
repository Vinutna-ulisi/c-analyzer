import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
    ChevronLeft, BookOpen, User,
    PlayCircle, Loader2, ArrowRight, HelpCircle, Sparkles, ChevronRight
} from 'lucide-react';
import QuizComponent from '../components/QuizComponent';

const CourseDetail = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeModule, setActiveModule] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const [courseRes, profileRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get('/recommendations/profile')
                ]);
                setCourse(courseRes.data);
                setUserProfile(profileRes.data);

                if (courseRes.data.modules?.length > 0) {
                    setActiveModule(courseRes.data.modules.sort((a, b) => a.order - b.order)[0]);
                }
            } catch (error) {
                console.error("Failed to fetch course details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center p-4 text-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Course not found</h2>
                        <button onClick={() => navigate('/courses')} className="text-primary-600 font-medium hover:underline">
                            Back to catalog
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <button
                        onClick={() => navigate('/courses')}
                        className="flex items-center text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Courses
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            {course.image_url && (
                                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border border-slate-100">
                                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary-100 uppercase">
                                        {course.difficulty}
                                    </span>
                                    <span className="text-slate-400 text-sm">•</span>
                                    <span className="text-slate-500 text-sm font-medium">{course.modules?.length} Modules</span>
                                </div>
                                <h1 className="text-3xl font-extrabold text-slate-900">{course.title}</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Instructor</p>
                                <p className="text-sm font-bold text-slate-800">{course.instructor}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                    {/* Module List Sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                            Course Content
                        </h3>
                        <div className="space-y-2">
                            {course.modules?.sort((a, b) => a.order - b.order).map((module) => (
                                <button
                                    key={module.id}
                                    onClick={() => {
                                        setActiveModule(module);
                                        setShowQuiz(false);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${activeModule?.id === module.id && !showQuiz
                                        ? 'bg-white border-primary-500 shadow-sm ring-1 ring-primary-500'
                                        : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeModule?.id === module.id && !showQuiz ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
                                        }`}>
                                        {module.order}
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`font-bold text-sm ${activeModule?.id === module.id && !showQuiz ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {module.title}
                                        </p>
                                        <div className="flex items-center mt-1 text-xs text-slate-400">
                                            <PlayCircle className="w-3 h-3 mr-1" />
                                            {module.video_url ? 'Video Lesson' : 'Reading Material'}
                                        </div>
                                    </div>
                                    {activeModule?.id === module.id && !showQuiz && (
                                        <div className="ml-auto">
                                            <ArrowRight className="w-4 h-4 text-primary-600" />
                                        </div>
                                    )}
                                </button>
                            ))}

                            {/* Final Quiz Button */}
                            {course.quiz && (
                                <button
                                    onClick={() => {
                                        setShowQuiz(true);
                                        setActiveModule(null);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${showQuiz
                                        ? 'bg-primary-50 border-primary-500 shadow-sm ring-1 ring-primary-500'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                >
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${showQuiz ? 'bg-primary-600 text-white' : 'bg-white/20 text-white'
                                        }`}>
                                        <HelpCircle className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className={`font-bold text-sm ${showQuiz ? 'text-primary-900' : 'text-white'}`}>
                                            Final Assessment
                                        </p>
                                        <p className={`text-[10px] uppercase font-black tracking-widest ${showQuiz ? 'text-primary-500' : 'text-white/40'}`}>
                                            Course Quiz
                                        </p>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-2">
                        {showQuiz ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                                <QuizComponent quiz={course.quiz} />
                            </div>
                        ) : activeModule ? (
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                                <div className="p-8 md:p-12 border-b border-slate-50">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">{activeModule.title}</h2>

                                    {/* Adaptive Video Display */}
                                    {activeModule.video_url && (
                                        <div className="aspect-video bg-slate-900 rounded-2xl mb-8 overflow-hidden shadow-2xl relative group">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`${activeModule.video_url}${userProfile?.learning_style === 'Visual' ? '?autoplay=1' : ''}`}
                                                title={activeModule.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    )}

                                    {/* Adaptive Text Content Display */}
                                    <div className="prose prose-slate max-w-none">
                                        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 whitespace-pre-line leading-relaxed text-slate-700">
                                            {userProfile?.learning_style === 'Theoretical' ? (
                                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="flex items-center text-primary-600 mb-4 font-bold text-xs uppercase tracking-widest">
                                                        <Sparkles className="w-3 h-3 mr-2" />
                                                        Deep Theoretical Analysis
                                                    </div>
                                                    {activeModule.content_theoretical}
                                                </div>
                                            ) : userProfile?.learning_style === 'Practical' ? (
                                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="flex items-center text-emerald-600 mb-4 font-bold text-xs uppercase tracking-widest">
                                                        <Sparkles className="w-3 h-3 mr-2" />
                                                        Hands-on Practical Lab
                                                    </div>
                                                    <div className="bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-sm mb-4 border border-slate-800 shadow-inner">
                                                        {activeModule.content_practical}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="flex items-center text-amber-600 mb-4 font-bold text-xs uppercase tracking-widest">
                                                        <Sparkles className="w-3 h-3 mr-2" />
                                                        Visual Key Highlights
                                                    </div>
                                                    {activeModule.content_visual}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-slate-50/50 flex justify-between items-center mt-auto">
                                    <button
                                        className="text-slate-400 font-medium flex items-center hover:text-slate-600 disabled:opacity-30"
                                        disabled={activeModule.order === 1}
                                        onClick={() => {
                                            const prev = course.modules.find(m => m.order === activeModule.order - 1);
                                            if (prev) setActiveModule(prev);
                                        }}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous Module
                                    </button>
                                    <button
                                        className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition flex items-center"
                                        onClick={() => {
                                            const next = course.modules.find(m => m.order === activeModule.order + 1);
                                            if (next) {
                                                setActiveModule(next);
                                            } else {
                                                setShowQuiz(true);
                                                setActiveModule(null);
                                            }
                                        }}
                                    >
                                        {activeModule.order === course.modules?.length ? 'Take Final Quiz' : 'Next Module'}
                                        {activeModule.order !== course.modules?.length && <ChevronRight className="w-4 h-4 ml-1" />}
                                        {activeModule.order === course.modules?.length && <HelpCircle className="w-4 h-4 ml-2" />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a module to start learning</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CourseDetail;
