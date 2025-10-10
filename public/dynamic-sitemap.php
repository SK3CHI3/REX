<?php
/**
 * Dynamic Sitemap Generator for REX Kenya
 * 
 * This file generates a sitemap that includes all case URLs dynamically
 * Note: This requires PHP on the server. For static hosting, use the Node.js version instead.
 */

header('Content-Type: application/xml; charset=utf-8');

// Database connection (replace with your actual credentials)
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'rex_kenya';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Fetch all case IDs
    $stmt = $pdo->query("SELECT id, updated_at FROM cases WHERE status != 'rejected' ORDER BY created_at DESC");
    $cases = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    // Fallback to static sitemap if DB connection fails
    $cases = [];
}

$baseUrl = 'https://rextracker.online';
?>
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc><?php echo $baseUrl; ?>/</loc>
    <lastmod><?php echo date('Y-m-d'); ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc><?php echo $baseUrl; ?>/map</loc>
    <lastmod><?php echo date('Y-m-d'); ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc><?php echo $baseUrl; ?>/cases</loc>
    <lastmod><?php echo date('Y-m-d'); ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc><?php echo $baseUrl; ?>/cases-index</loc>
    <lastmod><?php echo date('Y-m-d'); ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Dynamic Case Pages -->
  <?php foreach ($cases as $case): ?>
  <url>
    <loc><?php echo $baseUrl; ?>/case/<?php echo htmlspecialchars($case['id']); ?></loc>
    <lastmod><?php echo date('Y-m-d', strtotime($case['updated_at'] ?? 'now')); ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <?php endforeach; ?>
</urlset>

