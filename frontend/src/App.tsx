import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  base_price: string;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
}

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]); 
  
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>("");

  useEffect(() => {
    axios.get('http://localhost:3000/api/services')
      .then(res => setServices(res.data))
      .catch(err => console.error("Error loading services:", err));

    axios.get('http://localhost:3000/api/patients')
      .then(res => setPatients(res.data))
      .catch(err => console.error("Error loading patients:", err));
  }, []);

  const handleBookAppointment = () => {
    if (!selectedService || !selectedPatient || !appointmentDate) {
      alert("נא למלא את כל השדות!");
      return;
    }

    axios.post('http://localhost:3000/api/appointments', {
      patient_id: selectedPatient,
      service_id: selectedService,
      appointment_date: appointmentDate
    })
    .then(() => {
      alert("התור נקבע בהצלחה! 🎉");
      setSelectedService("");
      setSelectedPatient("");
      setAppointmentDate("");
    })
    .catch(error => {
      console.error("Error booking appointment:", error);
      alert("שגיאה בקביעת התור");
    });
  };

  return (
    <div style={{ padding: '20px', direction: 'ltr', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Clinic Management System </h1>
      
      <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📅 Book a New Appointment</h2>
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          
          <select 
            value={selectedPatient} 
            onChange={(e) => setSelectedPatient(e.target.value)}
            style={{ padding: '8px' }}
          >
            <option value="">-- Select Patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
            ))}
          </select>

          <select 
            value={selectedService} 
            onChange={(e) => setSelectedService(e.target.value)}
            style={{ padding: '8px' }}
          >
            <option value="">-- Select Service --</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>
            ))}
          </select>

          <input 
            type="datetime-local" 
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            style={{ padding: '8px' }}
          />

          <button 
            onClick={handleBookAppointment}
            style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Book Appointment
          </button>
        </div>
      </div>

      <h3>Available Services</h3>
      <ul>
        {services.map(service => (
          <li key={service.id}>
            {service.name} - ₪{service.base_price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;