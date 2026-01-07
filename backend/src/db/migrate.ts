import dotenv from 'dotenv';
dotenv.config();

import pool from '../db';

async function run() {
  console.log('Starting database migration...');
  
  try {
    await pool.query('SELECT 1');
    console.log('✓ Database connection established');

    await pool.query(
      "ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_info JSONB DEFAULT '{}'::jsonb;"
    );

    console.log('Adding new columns to patients table...');
    await pool.query(`
      ALTER TABLE patients 
      ADD COLUMN IF NOT EXISTS skin_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS last_appointment_date TIMESTAMP;
    `);
    console.log('✓ Updated patients table');

    console.log('Adding new columns to appointments table...');
    await pool.query(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS treatment_notes TEXT,
      ADD COLUMN IF NOT EXISTS equipment_used JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('✓ Updated appointments table');

    console.log('Creating intake_forms table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS intake_forms (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        form_data JSONB NOT NULL,
        signature_url TEXT,
        version INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_intake_forms_patient_id ON intake_forms(patient_id);');
    console.log('✓ Created intake_forms table');

    console.log('Creating ai_summaries table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_summaries (
        id SERIAL PRIMARY KEY,
        intake_form_id INTEGER REFERENCES intake_forms(id) ON DELETE CASCADE,
        summary_text TEXT NOT NULL,
        critical_points JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_ai_summaries_intake_form ON ai_summaries(intake_form_id);');
    console.log('✓ Created ai_summaries table');

    console.log('Creating patient_images table...');
    await pool.query(`
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
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_patient_images_patient_id ON patient_images(patient_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_patient_images_appointment_id ON patient_images(appointment_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_patient_images_type ON patient_images(image_type);');
    console.log('✓ Created patient_images table');

    console.log('Creating treatment_history table...');
    await pool.query(`
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
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_treatment_history_patient_id ON treatment_history(patient_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_treatment_history_appointment_id ON treatment_history(appointment_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_treatment_history_date ON treatment_history(treatment_date);');
    console.log('✓ Created treatment_history table');

    console.log('Creating equipment_resources table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipment_resources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        maintenance_schedule JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Created equipment_resources table');

    console.log('Creating appointment_resources table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointment_resources (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
        equipment_id INTEGER REFERENCES equipment_resources(id) ON DELETE CASCADE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        UNIQUE(equipment_id, start_time, end_time)
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_appointment_resources_appointment_id ON appointment_resources(appointment_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_appointment_resources_equipment_id ON appointment_resources(equipment_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_appointment_resources_time ON appointment_resources(start_time, end_time);');
    console.log('✓ Created appointment_resources table');

    console.log('Creating inventory_items table...');
    await pool.query(`
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
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(current_stock);');
    console.log('✓ Created inventory_items table');

    console.log('Creating inventory_movements table...');
    await pool.query(`
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
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_inventory_movements_item_id ON inventory_movements(inventory_item_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(created_at);');
    console.log('✓ Created inventory_movements table');

    console.log('Adding index for patients.last_appointment_date...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_patients_last_appointment ON patients(last_appointment_date);');
    console.log('✓ Added index for last_appointment_date');

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

run();
