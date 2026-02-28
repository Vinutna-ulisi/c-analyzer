import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, BrainCircuit, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/dashboard" className="flex items-center space-x-2 mr-10">
                            <BrainCircuit className="h-8 w-8 text-primary-600" />
                            <span className="font-bold text-xl text-slate-800">C-Analyzer</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/dashboard" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Dashboard</Link>
                            <Link to="/courses" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Courses</Link>
                            <Link to="/analytics" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Reports</Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-slate-600 border-r border-slate-200 pr-4">
                            <User className="h-5 w-5 text-slate-400" />
                            <span className="text-sm font-medium">{user.name || user.email}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center space-x-2 text-slate-500 hover:text-slate-700 focus:outline-none transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
