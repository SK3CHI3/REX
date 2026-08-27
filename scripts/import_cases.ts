import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables (VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// County Centroids Mapping for Kenya
const countyCoordinates: Record<string, { lat: number; lng: number }> = {
  'Nairobi': { lat: -1.286389, lng: 36.817222 },
  'Mombasa': { lat: -4.035153, lng: 39.664171 },
  'Kisumu': { lat: -0.102222, lng: 34.761667 },
  'Nakuru': { lat: -0.303, lng: 36.08 },
  'Kiambu': { lat: -1.166667, lng: 36.833333 },
  'Murang\'a': { lat: -0.716667, lng: 37.15 },
  'Nyeri': { lat: -0.416667, lng: 36.95 },
  'Meru': { lat: 0.05, lng: 37.65 },
  'Kajiado': { lat: -2.2, lng: 36.8 },
  'Kirinyaga': { lat: -0.5, lng: 37.3 },
  'Nyandarua': { lat: -0.3, lng: 36.4 },
  'Nyamira': { lat: -0.583333, lng: 34.933333 },
  'Embu': { lat: -0.533333, lng: 37.45 },
  'Uasin Gishu': { lat: 0.516667, lng: 35.283333 },
  'Siaya': { lat: 0.05, lng: 34.25 },
  'Machakos': { lat: -1.516667, lng: 37.266667 },
  'Makueni': { lat: -1.8, lng: 37.616667 },
  'Kericho': { lat: -0.366667, lng: 35.283333 },
  'Eldoret': { lat: 0.516667, lng: 35.283333 }, // Mapping city to county centroid (Uasin Gishu)
  'Bungoma': { lat: 0.566667, lng: 34.566667 },
  'Kakamega': { lat: 0.283333, lng: 34.75 },
  'Kisii': { lat: -0.683333, lng: 34.766667 },
  'Narok': { lat: -1.083333, lng: 35.866667 },
  'Taita Taveta': { lat: -3.4, lng: 38.3 },
  'Kilifi': { lat: -3.633333, lng: 39.85 },
  'Kwale': { lat: -4.166667, lng: 39.45 },
  'Laikipia': { lat: 0.4, lng: 36.95 },
  'Tharaka-Nithi': { lat: -0.3, lng: 37.983333 },
  'Kitui': { lat: -1.366667, lng: 38.016667 },
};

async function importCases() {
  try {
    const rawData = fs.readFileSync('missing_voices_2025.json', 'utf-8');
    const cases = JSON.parse(rawData);

    console.log(`Found ${cases.length} cases to import.`);

    const formattedCases = cases.map((c: any) => {
      let county = c.county;
      let location = c.location;
      
      // Handle unknown locations by distributing them in Nairobi CBD
      if (!location || location === 'Unknown') {
        location = 'Nairobi CBD (Distributed)';
        county = 'Nairobi';
      }

      if (!county) {
        county = 'Nairobi'; // Default to Nairobi if unknown
      }

      const coords = countyCoordinates[county] || countyCoordinates['Nairobi'];
      
      // If it's Nairobi CBD distribution, use tighter jitter around CBD coordinates
      const isCBD = location.includes('CBD');
      const jitterFactor = isCBD ? 0.01 : 0.05; // ~1km for CBD, ~5km for general county
      
      return {
        victim_name: c.victim_name || 'Unknown',
        age: c.age || null,
        incident_date: c.date,
        location: location,
        county: county,
        latitude: coords.lat + (Math.random() - 0.5) * jitterFactor,
        longitude: coords.lng + (Math.random() - 0.5) * jitterFactor,
        case_type: 'death',
        description: c.description || 'Confirmed case of police brutality/killing documented by Missing Voices.',
        status: 'confirmed',
        source: c.profile_url,
        justice_served: false,
        community_verified: true,
        needs_verification: false,
        admin_approved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    // Batch insert in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < formattedCases.length; i += chunkSize) {
      const chunk = formattedCases.slice(i, i + chunkSize);
      const { error } = await supabase.from('cases').insert(chunk);

      if (error) {
        console.error(`Error inserting chunk ${i / chunkSize + 1}:`, error);
      } else {
        console.log(`Successfully inserted chunk ${i / chunkSize + 1}`);
      }
    }

    console.log('Import completed successfully.');
  } catch (error) {
    console.error('Import failed:', error);
  }
}

importCases();
