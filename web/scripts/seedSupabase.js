import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding database...');

  // Seed profiles
  const { error: profileError } = await supabase
    .from('profile')
    .upsert([
      { id: '00000000-0000-0000-0000-000000000000', metadata: { demo: true } }
    ]);

  if (profileError) console.error('Error seeding profiles:', profileError);

  // Seed questions
  const { error: questionsError } = await supabase
    .from('questions')
    .upsert([
      { id: 1, text: 'Sample Question 1', difficulty_level: 1, active: true },
      { id: 2, text: 'Sample Question 2', difficulty_level: 2, active: true }
    ]);

  if (questionsError) console.error('Error seeding questions:', questionsError);

  console.log('Seeding complete!');
}

seed();
