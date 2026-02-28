import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Brain, Code, FileBarChart, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const profileRes = await api.get('/recommendations/profile');
                setProfile(profileRes.data);
            } catch (error) {
                console.error("Failed to fetch cognitive profile", error);
            }

            try {
                const coursesRes = await api.get('/recommendations/courses');
                setRecommendedCourses(coursesRes.data);
            } catch (error) {
                console.error("Failed to fetch recommended courses", error);
            }

            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Welcome back, <span className="text-primary-600">{user.name}</span>!
                        </h1>
                        <p className="mt-2 text-slate-600 font-medium">
                            Ready to analyze and improve your cognitive learning patterns?
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center my-12">
                        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Profile Summary Card */}
                        <div className="col-span-1 md:col-span-3 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-lg text-white p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Brain size={120} />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-xl font-semibold opacity-90 mb-1">Your Cognitive Level</h2>
                                <div className="flex items-center space-x-3 mb-4">
                                    <Sparkles className="h-8 w-8 text-primary-200" />
                                    <span className="text-4xl font-bold">
                                        {profile?.cognitive_level || "Not Assessed Yet"}
                                    </span>
                                </div>

                                <div className="bg-white/10 rounded-xl p-5 mt-6 backdrop-blur-sm border border-white/20">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-200 mb-2">Recommended Strategy</h3>
                                    <p className="text-lg font-medium leading-relaxed">
                                        {profile?.recommended_strategy || "Take both tests to receive your personalized learning strategy."}
                                    </p>
                                    {profile?.learning_style && (
                                        <div className="mt-3 flex items-center space-x-2">
                                            <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 flex items-center">
                                                <Sparkles className="w-3 h-3 mr-1.5" />
                                                Learning Style: {profile.learning_style}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recommended Courses Section */}
                        <div className="col-span-1 md:col-span-3">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                                    <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
                                    Recommended for Your Level
                                </h2>
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="text-primary-600 text-sm font-bold hover:underline"
                                >
                                    View All Courses
                                </button>
                            </div>

                            {recommendedCourses.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    {recommendedCourses.map(course => (
                                        <div
                                            key={course.id}
                                            onClick={() => navigate(`/courses/${course.id}`)}
                                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
                                        >
                                            <div className="h-32 bg-slate-100 relative overflow-hidden">
                                                {course.image_url ? (
                                                    <img
                                                        src={course.image_url}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Code className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2">
                                                    <span className="bg-white/90 backdrop-blur-sm text-slate-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase border border-slate-100">
                                                        {course.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors line-clamp-1">{course.title}</h4>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-[10px] text-slate-400 font-medium">{course.instructor}</p>
                                                    <ArrowRight size={12} className="text-primary-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white/50 backdrop-blur-sm p-12 rounded-2xl border border-dashed border-slate-200 text-center animate-in fade-in duration-500">
                                    <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-700 mb-2">No Recommendations Yet</h3>
                                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                        We need more data to personalize your learning path. Complete the behavioral and technical tests below for custom AI-based suggestions!
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => navigate('/courses')}
                                            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
                                        >
                                            Browse All Courses
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Cards */}
                        <div
                            onClick={() => navigate('/test/behavioral')}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                                <Brain className="h-7 w-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Behavioral Test</h3>
                            <p className="text-slate-600 mb-6 flex-grow">
                                Complete a short survey to analyze your study habits, learning style, and motivation.
                            </p>
                            <div className="font-semibold text-blue-600 flex items-center group-hover:translate-x-1 transition-transform">
                                Take Test <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </div>

                        <div
                            onClick={() => navigate('/test/technical')}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="bg-indigo-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                                <Code className="h-7 w-7 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Technical Test</h3>
                            <p className="text-slate-600 mb-6 flex-grow">
                                Answer logical and aptitude questions to measure speed, accuracy, and persistence.
                            </p>
                            <div className="font-semibold text-indigo-600 flex items-center group-hover:translate-x-1 transition-transform">
                                Take Test <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </div>

                        <div
                            onClick={() => navigate('/analytics')}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="bg-emerald-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                                <FileBarChart className="h-7 w-7 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Performance Report</h3>
                            <p className="text-slate-600 mb-6 flex-grow">
                                View detailed charts, analyze your cognitive growth, and download your improvement manual.
                            </p>
                            <div className="font-semibold text-emerald-600 flex items-center group-hover:translate-x-1 transition-transform">
                                View Analytics <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
