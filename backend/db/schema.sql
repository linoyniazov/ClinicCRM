CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    sensitivities TEXT,
    skin_type VARCHAR(50), 
    medical_info JSONB DEFAULT '{}'::jsonb,
    last_appointment_date TIMESTAMP, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    base_price DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id),
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    treatment_notes TEXT, 
    equipment_used JSONB DEFAULT '[]'::jsonb, 
    CONSTRAINT appointments_status_check CHECK (status IN ('scheduled','completed','canceled'))
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_patients_last_appointment ON patients(last_appointment_date);


CREATE TABLE IF NOT EXISTS intake_forms (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL, 
    signature_url TEXT, 
    version INTEGER DEFAULT 1, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_intake_forms_patient_id ON intake_forms(patient_id);

CREATE TABLE IF NOT EXISTS ai_summaries (
    id SERIAL PRIMARY KEY,
    intake_form_id INTEGER REFERENCES intake_forms(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL, 
    critical_points JSONB DEFAULT '[]'::jsonb, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_summaries_intake_form ON ai_summaries(intake_form_id);

CREATE TABLE IF NOT EXISTS patient_images (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    image_type VARCHAR(20) NOT NULL, 
    treatment_phase VARCHAR(100), 
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT patient_images_type_check CHECK (image_type IN ('before', 'after', 'progress'))
);

CREATE INDEX IF NOT EXISTS idx_patient_images_patient_id ON patient_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_images_appointment_id ON patient_images(appointment_id);
CREATE INDEX IF NOT EXISTS idx_patient_images_type ON patient_images(image_type);

CREATE TABLE IF NOT EXISTS treatment_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    treatment_type VARCHAR(255) NOT NULL, 
    treatment_date TIMESTAMP NOT NULL,
    notes TEXT,
    equipment_used JSONB DEFAULT '[]'::jsonb, 
    results JSONB DEFAULT '{}'::jsonb, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_treatment_history_patient_id ON treatment_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_history_appointment_id ON treatment_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_treatment_history_date ON treatment_history(treatment_date);

CREATE TABLE IF NOT EXISTS equipment_resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE, 
    description TEXT,
    maintenance_schedule JSONB, 
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointment_resources (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment_resources(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    UNIQUE(equipment_id, start_time, end_time) 
);

CREATE INDEX IF NOT EXISTS idx_appointment_resources_appointment_id ON appointment_resources(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_resources_equipment_id ON appointment_resources(equipment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_resources_time ON appointment_resources(start_time, end_time);

CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, 
    current_stock DECIMAL(10, 2) DEFAULT 0,
    min_threshold DECIMAL(10, 2) DEFAULT 0, 
    unit VARCHAR(50) NOT NULL, 
    supplier_info JSONB, 
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventory_category_check CHECK (category IN ('cabine', 'shelf'))
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(current_stock);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id SERIAL PRIMARY KEY,
    inventory_item_id INTEGER REFERENCES inventory_items(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, 
    quantity DECIMAL(10, 2) NOT NULL,
    reason TEXT, 
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventory_movements_type_check CHECK (movement_type IN ('in', 'out', 'adjustment'))
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON inventory_movements(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(created_at);

