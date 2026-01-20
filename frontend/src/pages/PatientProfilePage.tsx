import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientById } from '../services/patients';
import type { Patient } from '../services/patients';
import { User, Calendar, Phone, Mail, MapPin, Activity, Clock, ArrowLeft, Image as ImageIcon } from 'lucide-react';

type TabType = 'overview' | 'history' | 'gallery';

const PatientProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        const loadPatient = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getPatientById(id);
                setPatient(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load patient profile');
            } finally {
                setLoading(false);
            }
        };
        loadPatient();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (error || !patient) return <div className="p-8 text-center text-red-500">{error || 'Patient not found'}</div>;

    // פונקציית עזר להצגת טאבים
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        {/* כרטיס פרטים אישיים */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={20} className="text-teal-600" /> Personal Details
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone size={18} />
                                    <span>{patient.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail size={18} />
                                    <span>{patient.email || 'No email provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <MapPin size={18} />
                                    <span>{patient.address || 'No address provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Calendar size={18} />
                                    <span>DOB: {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* כרטיס מידע רפואי */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Activity size={20} className="text-red-500" /> Medical Info
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase">Sensitivities</span>
                                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg border border-red-100 mt-1">
                                        {patient.sensitivities || 'None reported'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase">Skin Type</span>
                                    <p className="text-gray-700 mt-1">Unknown (Add via assessment)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'history':
                return (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Treatment History</h3>
                        <p className="text-gray-500">No treatments recorded yet.</p>
                        <button className="mt-4 text-teal-600 font-medium hover:underline">Log First Treatment</button>
                    </div>
                );
            case 'gallery':
                return (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Before & After Gallery</h3>
                        <p className="text-gray-500">Upload photos to track progress.</p>
                        <button className="mt-4 text-teal-600 font-medium hover:underline">Upload Photos</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/patients')} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{patient.first_name} {patient.last_name}</h1>
                    <p className="text-sm text-gray-500">Member since {new Date(patient.created_at || '').toLocaleDateString()}</p>
                </div>
                <div className="ml-auto flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                        Edit Profile
                    </button>
                    <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-sm">
                        New Appointment
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-6">
                    {(['overview', 'history', 'gallery'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab 
                                    ? 'border-teal-500 text-teal-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default PatientProfilePage;