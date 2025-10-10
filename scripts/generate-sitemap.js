/**
 * Dynamic Sitemap Generator for REX Kenya
 * 
 * This script generates a sitemap.xml file that includes all case URLs
 * Run this script before deployment or as part of the build process
 * 
 * Usage: node scripts/generate-sitemap.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://rextracker.online';

// Static pages configuration
const staticPages = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/map', changefreq: 'daily', priority: '0.9' },
  { path: '/cases', changefreq: 'daily', priority: '0.8' },
  { path: '/cases-index', changefreq: 'daily', priority: '0.9' },
];

/**
 * Fetch all approved case IDs from Supabase
 */
async function fetchCases() {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('id, updated_at')
      .neq('status', 'rejected')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching cases:', error);
      return [];
    }

    console.log(`✅ Fetched ${data.length} cases from database`);
    return data;
  } catch (err) {
    console.error('❌ Error:', err);
    return [];
  }
}

/**
 * Generate sitemap XML content
 */
function generateSitemapXML(cases) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${page.path}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add dynamic case pages
  cases.forEach(caseItem => {
    const lastmod = caseItem.updated_at 
      ? new Date(caseItem.updated_at).toISOString().split('T')[0]
      : currentDate;

    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/case/${caseItem.id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting sitemap generation...');
  console.log(`📍 Base URL: ${BASE_URL}`);

  // Fetch cases
  const cases = await fetchCases();

  // Generate XML
  const sitemapXML = generateSitemapXML(cases);

  // Write to file
  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  
  try {
    fs.writeFileSync(outputPath, sitemapXML, 'utf-8');
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📁 Location: ${outputPath}`);
    console.log(`📊 Total URLs: ${staticPages.length + cases.length}`);
    console.log(`   - Static pages: ${staticPages.length}`);
    console.log(`   - Case pages: ${cases.length}`);
  } catch (err) {
    console.error('❌ Error writing sitemap file:', err);
    process.exit(1);
  }
}

// Run the script
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

