import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatientById, getPatientImages, uploadPatientImage, type Patient, type PatientImage } from '../services/patients';
import { User, Calendar, Phone, Mail, MapPin, Activity, Clock, ArrowLeft, Image as ImageIcon, Upload, X } from 'lucide-react';
import EditPatientModal from '../components/EditPatientModal';
import { AxiosError } from 'axios';

type TabType = 'overview' | 'history' | 'gallery';

const PatientProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [images, setImages] = useState<PatientImage[]>([]);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageType, setImageType] = useState<'before' | 'after' | 'progress'>('before');
    const [imageNotes, setImageNotes] = useState('');

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

    useEffect(() => {
        const loadImages = async () => {
            if (!id || activeTab !== 'gallery') return;
            try {
                setImagesLoading(true);
                const data = await getPatientImages(id);
                setImages(data);
            } catch (err) {
                console.error('Failed to load images:', err);
            } finally {
                setImagesLoading(false);
            }
        };
        loadImages();
    }, [id, activeTab]);

    const handlePatientUpdate = (updatedPatient: Patient) => {
        setPatient(updatedPatient);
        setIsEditModalOpen(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !patient) return;

        try {
            setUploading(true);
            const uploadedImage = await uploadPatientImage(
                patient.id,
                selectedFile,
                imageType,
                imageNotes || undefined
            );
            setImages(prev => [uploadedImage, ...prev]);
            setShowUploadModal(false);
            setSelectedFile(null);
            setImageNotes('');
            setImageType('before');
        } catch (err) {
            const errorMessage = err instanceof AxiosError && err.response?.data?.error 
                ? err.response.data.error 
                : 'Failed to upload image';
            alert(errorMessage);
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const getImageUrl = (imageUrl: string) => {
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
       
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        const baseUrl = apiBaseUrl.replace('/api', '');
        return `${baseUrl}${imageUrl}`;
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (error || !patient) return <div className="p-8 text-center text-red-500">{error || 'Patient not found'}</div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
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
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Before & After Gallery</h3>
                                <p className="text-sm text-gray-500">Track patient progress with photos</p>
                            </div>
                            <button 
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-sm"
                            >
                                <Upload size={18} />
                                Upload Photo
                            </button>
                        </div>

                        {imagesLoading ? (
                            <div className="text-center py-12 text-gray-500">Loading images...</div>
                        ) : images.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                                <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No photos yet</h3>
                                <p className="text-gray-500 mb-4">Upload photos to track progress.</p>
                                <button 
                                    onClick={() => setShowUploadModal(true)}
                                    className="text-teal-600 font-medium hover:underline"
                                >
                                    Upload First Photo
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {images.map((image) => (
                                    <div key={image.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="aspect-square relative bg-gray-100">
                                            <img 
                                                src={getImageUrl(image.image_url)} 
                                                alt={`${image.image_type} photo`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle" %3EImage not found%3C/text%3E%3C/svg%3E';
                                                }}
                                            />
                                            <div className="absolute top-2 right-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                    image.image_type === 'before' ? 'bg-blue-100 text-blue-800' :
                                                    image.image_type === 'after' ? 'bg-green-100 text-green-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {image.image_type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-xs text-gray-500">
                                                {new Date(image.taken_at).toLocaleDateString()}
                                            </p>
                                            {image.notes && (
                                                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{image.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Modal */}
                        {showUploadModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
                                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-gray-800">Upload Photo</h2>
                                        <button 
                                            onClick={() => {
                                                setShowUploadModal(false);
                                                setSelectedFile(null);
                                                setImageNotes('');
                                                setImageType('before');
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Image Type
                                            </label>
                                            <select
                                                value={imageType}
                                                onChange={(e) => setImageType(e.target.value as 'before' | 'after' | 'progress')}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                            >
                                                <option value="before">Before</option>
                                                <option value="after">After</option>
                                                <option value="progress">Progress</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Image
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                            {selectedFile && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={imageNotes}
                                                onChange={(e) => setImageNotes(e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                                placeholder="Add any notes about this photo..."
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={() => {
                                                    setShowUploadModal(false);
                                                    setSelectedFile(null);
                                                    setImageNotes('');
                                                    setImageType('before');
                                                }}
                                                className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleUpload}
                                                disabled={!selectedFile || uploading}
                                                className="flex-1 px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {uploading ? 'Uploading...' : 'Upload'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
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

            {patient && (
                <EditPatientModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handlePatientUpdate}
                    patient={patient}
                />
            )}
        </div>
    );
};

export default PatientProfilePage;