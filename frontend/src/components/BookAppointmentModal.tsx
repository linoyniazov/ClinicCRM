import React, { useState, useEffect } from 'react';
import { getPatients } from '../services/patients';
import { getServices } from '../services/services';
import { createAppointment } from '../services/appointments';
import AddPatientModal from './AddPatientModal';
import AddServiceModal from './AddServiceModal';
import type { Service } from '../services/types';

// הגדרת טיפוסים (Types) ברורים לנתונים
interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
}

interface BookAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialDate?: Date;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ isOpen, onClose, onSuccess, initialDate }) => {
    // שימוש בטיפוסים שהגדרנו במקום any
    const [patients, setPatients] = useState<Patient[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        patient_id: '',
        service_id: '',
        date: '',
        time: '',
        notes: ''
    });

    // Load data when modal opens
    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                setLoading(true);
                try {
                    // Load patients and services separately to better handle errors
                    try {
                        const patientsData = await getPatients();
                        console.log("Patients loaded:", patientsData);
                        if (Array.isArray(patientsData)) {
                            setPatients(patientsData);
                        } else {
                            console.error("Patients data is not an array:", patientsData);
                            setPatients([]);
                        }
                    } catch (patientError) {
                        console.error("Failed to fetch patients:", patientError);
                        setPatients([]);
                        // Don't show alert here, just log - user can still create new patient
                    }

                    try {
                        const servicesData = await getServices();
                        console.log("Services loaded:", servicesData);
                        if (Array.isArray(servicesData)) {
                            setServices(servicesData);
                        } else {
                            console.error("Services data is not an array:", servicesData);
                            setServices([]);
                        }
                    } catch (serviceError) {
                        console.error("Failed to fetch services:", serviceError);
                        setServices([]);
                        alert("Failed to load services. Please refresh the page.");
                    }
                    
                    // Set initial date/time if provided (from calendar click)
                    if (initialDate) {
                        setFormData(prev => ({
                            ...prev,
                            date: initialDate.toISOString().split('T')[0],
                            time: initialDate.toTimeString().slice(0, 5)
                        }));
                    } else {
                        // Reset form when opening
                        setFormData({
                            patient_id: '',
                            service_id: '',
                            date: '',
                            time: '',
                            notes: ''
                        });
                    }
                } catch (error) {
                    console.error("Unexpected error loading data", error);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [isOpen, initialDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const appointmentDate = new Date(`${formData.date}T${formData.time}`);
            await createAppointment({
                patient_id: parseInt(formData.patient_id),
                service_id: parseInt(formData.service_id),
                appointment_date: appointmentDate.toISOString(),
                treatment_notes: formData.notes || undefined
            });
            onSuccess();
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to book appointment';
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
                {/* Modal Container */}
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[calc(100vh-3rem)]">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">New Appointment</h2>
                            <p className="text-sm text-gray-500 hidden sm:block">
                                Schedule a treatment for your client
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center justify-center text-xl font-semibold leading-none"
                            aria-label="Close"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="p-6 overflow-y-auto flex-1 min-h-0">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            </div>
                        ) : (
                            <form id="appointment-form" onSubmit={handleSubmit} className="space-y-6">
                                {/* Section: Appointment Details */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-2 h-2 bg-teal-500 rounded-full" />
                                        Appointment Details
                                    </h3>

                                    {/* Patient Selection */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Patient <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddPatientModalOpen(true)}
                                                className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 hover:underline"
                                            >
                                                <span>+</span> Add New
                                            </button>
                                        </div>
                                        {!loading && patients.length === 0 ? (
                                            <div className="w-full px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-center justify-between">
                                                <span>No patients found. Click "+ Add New" to create a patient first.</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddPatientModalOpen(true)}
                                                    className="ml-2 text-yellow-700 hover:text-yellow-800 font-medium underline"
                                                >
                                                    Add Patient
                                                </button>
                                            </div>
                                        ) : (
                                            <select 
                                                required
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-gray-700"
                                                value={formData.patient_id}
                                                onChange={e => setFormData({...formData, patient_id: e.target.value})}
                                                disabled={loading}
                                            >
                                                <option value="">
                                                    {loading ? "Loading patients..." : "Select a patient..."}
                                                </option>
                                                {patients.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.first_name} {p.last_name} - {p.phone}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Service Selection */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Treatment / Service <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddServiceModalOpen(true)}
                                                className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 hover:underline"
                                            >
                                                <span>+</span> Add New
                                            </button>
                                        </div>
                                        {!loading && services.length === 0 ? (
                                            <div className="w-full px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-center justify-between">
                                                <span>No services found. Click "+ Add New" to create a service first.</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddServiceModalOpen(true)}
                                                    className="ml-2 text-yellow-700 hover:text-yellow-800 font-medium underline"
                                                >
                                                    Add Service
                                                </button>
                                            </div>
                                        ) : (
                                            <select 
                                                required
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-gray-700"
                                                value={formData.service_id}
                                                onChange={e => setFormData({...formData, service_id: e.target.value})}
                                                disabled={loading}
                                            >
                                                <option value="">
                                                    {loading ? "Loading services..." : "Select a service..."}
                                                </option>
                                                {services.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name} ({s.duration_minutes} min) - ₪{s.base_price}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Date & Time */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                required
                                                type="date"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-gray-600"
                                                value={formData.date}
                                                onChange={e => setFormData({...formData, date: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Time <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                required
                                                type="time"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-gray-600"
                                                value={formData.time}
                                                onChange={e => setFormData({...formData, time: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes (Optional)
                                        </label>
                                        <textarea 
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none placeholder:text-gray-400"
                                            rows={3}
                                            placeholder="Add any special instructions..."
                                            value={formData.notes}
                                            onChange={e => setFormData({...formData, notes: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            form="appointment-form"
                            disabled={submitting || loading}
                            className={`w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-500/30 transition-all shadow-md hover:shadow-lg flex items-center justify-center ${
                                submitting || loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {submitting ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Booking...
                                </>
                            ) : (
                                'Confirm Booking'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Patient Modal */}
            <AddPatientModal
                isOpen={isAddPatientModalOpen}
                onClose={() => setIsAddPatientModalOpen(false)}
                onSuccess={async (newPatientId) => {
                    // Reload patients list
                    try {
                        const patientsData = await getPatients();
                        setPatients(patientsData);
                        
                        // Auto-select the newly created patient
                        if (newPatientId) {
                            setFormData(prev => ({
                                ...prev,
                                patient_id: newPatientId.toString()
                            }));
                        }
                    } catch (error) {
                        console.error("Error reloading patients", error);
                    }
                }}
            />

            {/* Add Service Modal */}
            <AddServiceModal
                isOpen={isAddServiceModalOpen}
                onClose={() => setIsAddServiceModalOpen(false)}
                onSuccess={async (newServiceId) => {
                    // Reload services list
                    try {
                        const servicesData = await getServices();
                        setServices(servicesData);
                        
                        // Auto-select the newly created service
                        if (newServiceId) {
                            setFormData(prev => ({
                                ...prev,
                                service_id: newServiceId.toString()
                            }));
                        }
                    } catch (error) {
                        console.error("Error reloading services", error);
                    }
                }}
            />
        </>
    );
};

export default BookAppointmentModal;
