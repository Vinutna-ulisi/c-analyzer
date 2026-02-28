import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import html2pdf from 'html2pdf.js';
import { Download, Loader2, Target, TrendingUp, Zap } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const reportRef = useRef();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/analytics/performance');
                setData(response.data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleDownloadPDF = () => {
        const element = reportRef.current;

        // Configure PDF options
        const opt = {
            margin: 10,
            filename: 'Cognitive_Performance_Report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // To prevent clipping, we can add a temporary style or just let html2pdf handle it
        html2pdf().set(opt).from(element).save();
    };

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

    if (!data?.profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                        <Target className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Not Enough Data</h2>
                        <p className="text-slate-600 mb-6">Please complete the Behavioral and Technical tests to generate your performance report.</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/test/behavioral')}
                                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition"
                            >
                                Take Behavioral Test
                            </button>
                            <button
                                onClick={() => navigate('/test/technical')}
                                className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                            >
                                Take Technical Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { profile, accuracy_trend, response_time_trend } = data;

    // Preparing Pie Chart data for Cognitive Breakdown (Behavioral vs Technical base scores)
    const pieData = [
        { name: 'Behavioral Base', value: profile.behavioral_score * 0.4 },
        { name: 'Technical Base', value: profile.technical_score * 0.3 },
        { name: 'Speed Bonus', value: 15 }, // Assuming average metric just for visualization
        { name: 'Persistence', value: 15 }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg shadow-sm hover:bg-primary-700 transition"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Report (PDF)
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full" ref={reportRef}>

                {/* REPORT HEADER - Visible in PDF mainly */}
                <div className="mb-8 p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-extrabold mb-2">Improvement Report & Roadmap</h2>
                        <p className="text-primary-200 text-lg">Your personalized cognitive assessment summary</p>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                                <div className="flex items-center text-primary-300 mb-2">
                                    <Target className="w-5 h-5 mr-2" />
                                    <span className="font-semibold uppercase text-xs tracking-wider">Classification</span>
                                </div>
                                <div className="text-2xl font-bold">{profile.cognitive_level}</div>
                            </div>

                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                                <div className="flex items-center text-emerald-300 mb-2">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    <span className="font-semibold uppercase text-xs tracking-wider">Tech Score</span>
                                </div>
                                <div className="text-2xl font-bold">{profile.technical_score.toFixed(1)}%</div>
                            </div>

                            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                                <div className="flex items-center text-amber-300 mb-2">
                                    <Zap className="w-5 h-5 mr-2" />
                                    <span className="font-semibold uppercase text-xs tracking-wider">Behavioral Score</span>
                                </div>
                                <div className="text-2xl font-bold">{profile.behavioral_score.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                    {/* Accuracy Trend - Line Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Technical Accuracy Trend</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={accuracy_trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="attempt" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Tracks your rolling accuracy percentage across attempts.</p>
                    </div>

                    {/* Response Time Trend - Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Response Time per Question</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={response_time_trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="attempt" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f1f5f9' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="time" name="Time (seconds)" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="mt-4 text-sm text-slate-500">Displays the time taken in seconds for each question attempt.</p>
                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Cognitive Weight Distribution - Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 flex flex-col items-center">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 w-full">Assessment Weight</h3>
                        <div className="h-64 w-full flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full flex justify-center space-x-2 space-y-2 flex-wrap text-sm text-slate-600 mt-4">
                            {pieData.map((entry, index) => (
                                <div key={index} className="flex items-center ml-2">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Targeted Improvement Roadmap */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                            AI-Generated Improvement Roadmap
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-slate-900 flex items-center mb-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex justify-center items-center mr-2 text-xs">1</span>
                                    Primary Focus Area
                                </h4>
                                <p className="text-slate-600 pl-8 leading-relaxed">
                                    Based on your classification as a <strong>{profile.cognitive_level}</strong>, your immediate priority should be the following recommended strategy:<br />
                                    <span className="block mt-2 font-medium text-slate-800 bg-slate-50 p-4 border border-slate-100 rounded-lg">
                                        {profile.recommended_strategy}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-900 flex items-center mb-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex justify-center items-center mr-2 text-xs">2</span>
                                    Technical Analysis
                                </h4>
                                <p className="text-slate-600 pl-8 leading-relaxed">
                                    Your technical accuracy is <strong>{profile.technical_score.toFixed(1)}%</strong>.
                                    {profile.technical_score < 50
                                        ? " You should review foundational concepts before attempting to increase speed. Practice fundamental problem-solving."
                                        : profile.technical_score < 80
                                            ? " You have a good grasp of the basics. Try reducing your average response time while maintaining this accuracy."
                                            : " Excellent technical foundation. You are ready for competitive-level challenges and analytical problems."}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-900 flex items-center mb-2">
                                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex justify-center items-center mr-2 text-xs">3</span>
                                    Behavioral Suggestions
                                </h4>
                                <p className="text-slate-600 pl-8 leading-relaxed">
                                    Your behavioral score <strong>({profile.behavioral_score.toFixed(1)}/100)</strong> indicates your persistence and study habits.
                                    {profile.behavioral_score < 50
                                        ? " We recommend increasing your total study hours, implementing spaced repetition, and trying practical hands-on projects instead of just reading."
                                        : " Your motivation and persistence levels are strong. Continue utilizing structured study routines and actively reviewing mistakes."}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AnalyticsDashboard;
