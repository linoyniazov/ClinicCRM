import React, { useEffect, useState } from "react";
import { getServices, deleteService } from "../services/services";
import type { Service } from "../services/types";
import AddServiceModal from "../components/AddServiceModal";
import EditServiceModal from "../components/EditServiceModal";

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getServices();
      setServices(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load services list.");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAdded = () => {
    fetchServices();
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteService(id);
      await fetchServices();
    } catch (err) {
      console.error("Failed to delete service:", err);
      alert("Failed to delete service. Please try again.");
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">Loading services...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Services & Treatments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your clinic's service catalog
          </p>
        </div>
        <button
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition shadow-sm flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <span className="text-xl font-bold">+</span>
          <span>Add Service</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No services found. Click "Add Service" to start.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {service.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.duration_minutes} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₪{service.base_price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-teal-600 hover:text-teal-900 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-900 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleServiceAdded}
      />

      {selectedService && (
        <EditServiceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedService(null);
          }}
          onSuccess={handleServiceAdded}
          service={selectedService}
        />
      )}
    </div>
  );
};

export default ServicesPage;
