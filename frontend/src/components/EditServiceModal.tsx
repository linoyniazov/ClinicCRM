import React, { useState, useEffect } from 'react';
import { updateService } from '../services/services';
import type { Service, CreateServiceDto } from '../services/services';

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  service: Service;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  service,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateServiceDto>({
    name: '',
    duration_minutes: 60,
    base_price: 0,
  });

  useEffect(() => {
    if (isOpen && service) {
      setFormData({
        name: service.name,
        duration_minutes: service.duration_minutes,
        base_price: parseFloat(service.base_price) || 0,
      });
    }
  }, [isOpen, service]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'duration_minutes' || name === 'base_price' 
        ? parseFloat(value) || 0 
        : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await updateService(service.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined;
      setError(errorMessage || 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div
        className="
          bg-white w-full max-w-lg rounded-2xl shadow-2xl 
          flex flex-col overflow-hidden
          max-h-[calc(100vh-3rem)]
        "
      >
        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Service</h2>
            <p className="text-sm text-gray-500 hidden sm:block">
              Update service information
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

        {/* 2. Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          <form
            id="edit-service-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Section: Service Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full" />
                Service Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-gray-400"
                  placeholder="e.g. Facial Treatment, Laser Therapy"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration_minutes"
                    required
                    min="1"
                    step="1"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="60"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (₪) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="base_price"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="0.00"
                    value={formData.base_price}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start animate-shake">
                <span className="mr-2 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* 3. Footer */}
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
            form="edit-service-form"
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-500/30 transition-all shadow-md hover:shadow-lg flex items-center justify-center ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
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
                Updating...
              </>
            ) : (
              'Update Service'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditServiceModal;
