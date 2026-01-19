import React, { useEffect, useState } from 'react';
import { getPatients } from '../services/patients';
import type { Patient } from '../services/patients';

const PatientsPage: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load data on mount
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const data = await getPatients();
            setPatients(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch patients:', err);
            setError(err instanceof Error ? err.message : 'Failed to load patient list. Please try refreshing the page.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500 text-lg animate-pulse">Loading patients...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4" role="alert">
                <p className="font-bold text-red-700">Error</p>
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={fetchPatients}
                    className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Patients Directory</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your clinic's patient records</p>
                </div>
                <button 
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition shadow-sm flex items-center gap-2"
                    onClick={() => alert("Add Patient modal coming soon...")}
                >
                    <span className="text-xl font-bold">+</span>
                    <span>Add Patient</span>
                </button>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Full Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date Joined
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <span className="text-4xl text-gray-300">📇</span>
                                            <span className="text-lg font-medium">No patients found</span>
                                            <span className="text-sm">Click the "Add Patient" button to start.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {patient.first_name} {patient.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {patient.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {patient.email || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {patient.created_at 
                                                ? new Date(patient.created_at).toLocaleDateString() 
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-teal-600 hover:text-teal-900 font-semibold mr-3">
                                                View
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientsPage;