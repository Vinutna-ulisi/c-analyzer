import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { BookOpen, Clock, User, ChevronRight, Loader2, Search } from 'lucide-react';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, profileRes] = await Promise.all([
                    api.get('/courses/'),
                    api.get('/recommendations/profile')
                ]);
                setCourses(coursesRes.data);
                setUserProfile(profileRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-slate-900">Course Catalog</h1>
                    <p className="mt-2 text-slate-600">Explore our curated Python learning paths adjusted for your cognitive patterns.</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 w-full">

                {/* Search Bar */}
                <div className="relative mb-8 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                                {course.image_url ? (
                                    <img
                                        src={course.image_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <BookOpen className="h-20 w-20 text-slate-300 group-hover:scale-110 transition-transform" />
                                )}
                                {course.difficulty === (userProfile?.cognitive_level && {
                                    "Strong Analytical Learner": "Advanced",
                                    "Advanced Learner": "Advanced",
                                    "Moderate Performer": "Intermediate",
                                    "Developing Learner": "Beginner",
                                    "Basic Learner": "Beginner"
                                }[userProfile.cognitive_level]) && (
                                        <div className="absolute top-4 left-4 bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-lg animate-bounce">
                                            BEST FOR YOU
                                        </div>
                                    )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-100">
                                    {course.difficulty}
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                                <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                                    {course.description}
                                </p>

                                <div className="mt-auto space-y-3">
                                    <div className="flex items-center text-sm text-slate-500">
                                        <User className="w-4 h-4 mr-2" />
                                        {course.instructor}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {course.modules?.length || 0} Modules
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-primary-600 font-semibold group">
                                        <span>View Course</span>
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-20">
                        <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No courses found</h3>
                        <p className="text-slate-500">Try adjusting your search criteria.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Courses;
