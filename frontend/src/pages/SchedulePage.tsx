import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { apiClient } from '../services/client';
import { updateAppointmentStatus, deleteAppointment } from '../services/appointments';
import BookAppointmentModal from '../components/BookAppointmentModal';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const getServiceType = (serviceName: string): string => {
  const name = serviceName.toLowerCase();
  if (name.includes('consultation') || name.includes('consult')) return 'consultation';
  if (name.includes('facial') || name.includes('face')) return 'facial';
  if (name.includes('laser') || name.includes('lase')) return 'laser';
  if (name.includes('injection') || name.includes('inject') || name.includes('botox') || name.includes('filler')) return 'injection';
  return 'default';
};

const TREATMENT_COLORS: Record<string, string> = {
  'consultation': '#60A5FA',
  'facial': '#F472B6',       
  'laser': '#34D399',        
  'injection': '#A78BFA',    
  'default': '#9CA3AF'     
};

const STATUS_COLORS: Record<string, string> = {
  'completed': '#10B981',   
  'canceled': '#EF4444'     
};

interface AppointmentEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource?: AppointmentData;
  type: string;
  status: string;
}

interface AppointmentData {
  id: number;
  patient_id: number;
  service_id: number;
  patient_name: string;
  service_name: string;
  appointment_date: string;
  status: 'scheduled' | 'completed' | 'canceled';
  treatment_notes?: string;
  duration_minutes?: number;
  phone?: string;
}

const SchedulePage = () => {
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [view, setView] = useState<View>(Views.WEEK);
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | undefined>(undefined);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await apiClient.get<AppointmentData[]>('/appointments');
      
      const formattedEvents = response.data.map((apt) => ({
        id: apt.id,
        title: `${apt.patient_name} - ${apt.service_name}`,
        start: new Date(apt.appointment_date),
        end: new Date(new Date(apt.appointment_date).getTime() + ((apt.duration_minutes || 60) * 60000)),
        type: getServiceType(apt.service_name),
        status: apt.status,
        resource: apt
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      await fetchAppointments();
    };
    loadAppointments();
  }, []);

  const eventStyleGetter = (event: AppointmentEvent) => {
    // Use status color for completed/canceled, otherwise use treatment color
    const backgroundColor = STATUS_COLORS[event.status] 
      || TREATMENT_COLORS[event.type] 
      || TREATMENT_COLORS['default'];

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: event.status === 'canceled' ? 0.6 : 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.85rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textDecoration: event.status === 'canceled' ? 'line-through' : 'none',
        padding: '2px 6px'
      }
    };
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedSlot(start);
    setIsModalOpen(true);
  };

  // Handle clicking on an appointment
  const handleSelectEvent = (event: AppointmentEvent) => {
    if (event.resource) {
      setSelectedAppointment(event.resource);
      setIsDetailsModalOpen(true);
    }
  };

  const handleStatusChange = async (status: 'scheduled' | 'completed' | 'canceled') => {
    if (!selectedAppointment) return;
    
    try {
      await updateAppointmentStatus(selectedAppointment.id, status);
      await fetchAppointments();
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error('Failed to update appointment status', error);
      alert('Failed to update appointment status');
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    if (!window.confirm(`Are you sure you want to delete this appointment?`)) {
      return;
    }

    try {
      await deleteAppointment(selectedAppointment.id);
      await fetchAppointments();
      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error('Failed to delete appointment', error);
      alert('Failed to delete appointment');
    }
  };

  const handleViewPatient = () => {
    if (selectedAppointment) {
      navigate(`/patients/${selectedAppointment.patient_id}`);
      setIsDetailsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your appointments efficiently
          </p>
        </div>
        <button 
          onClick={() => { setSelectedSlot(new Date()); setIsModalOpen(true); }}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition shadow-sm flex items-center gap-2"
        >
          <span className="text-xl font-bold">+</span>
          <span>New Appointment</span>
        </button>
      </div>

      {/* Calendar Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', fontFamily: 'inherit' }}
            view={view}
            onView={setView}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            selectable={true}
            onSelectSlot={handleSelectSlot}
            min={new Date(0, 0, 0, 8, 0, 0)}
            max={new Date(0, 0, 0, 20, 0, 0)}
            step={30}
            timeslots={2}
            popup
          />
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchAppointments();
          setIsModalOpen(false);
        }}
        initialDate={selectedSlot}
      />

      {/* Appointment Details Modal */}
      {isDetailsModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[calc(100vh-3rem)]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
                <p className="text-sm text-gray-500 hidden sm:block">
                  View and manage appointment information
                </p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center justify-center text-xl font-semibold leading-none"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Patient</label>
                <p className="text-lg font-semibold text-gray-800">{selectedAppointment.patient_name}</p>
                {selectedAppointment.phone && (
                  <p className="text-sm text-gray-600">{selectedAppointment.phone}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Service</label>
                <p className="text-lg text-gray-800">{selectedAppointment.service_name}</p>
                {selectedAppointment.duration_minutes && (
                  <p className="text-sm text-gray-600">{selectedAppointment.duration_minutes} minutes</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                <p className="text-lg text-gray-800">
                  {format(new Date(selectedAppointment.appointment_date), 'PPP p', { locale: enUS })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedAppointment.status === 'canceled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                </span>
              </div>

              {selectedAppointment.treatment_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedAppointment.treatment_notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
              <button
                onClick={handleViewPatient}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-4 focus:ring-teal-500/30 transition-all shadow-md hover:shadow-lg"
              >
                View Patient
              </button>
              {selectedAppointment.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500/30 transition-all shadow-md hover:shadow-lg"
                >
                  Mark Complete
                </button>
              )}
              {selectedAppointment.status !== 'canceled' && (
                <button
                  onClick={() => handleStatusChange('canceled')}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-500/30 transition-all shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleDeleteAppointment}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-500/30 transition-all shadow-md hover:shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
