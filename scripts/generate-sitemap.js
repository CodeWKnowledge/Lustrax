import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in process.env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DOMAIN = 'https://lustrax-jewelries.com';

async function generateSitemap() {
  console.log("Generating dynamic sitemap...");
  
  // Static routes
  const routes = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/products', changefreq: 'daily', priority: 0.8 },
  ];

  // Fetch products from Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select('id, updated_at');

  if (error) {
    console.error("Error fetching products from Supabase:", error);
    process.exit(1);
  }

  if (products) {
    products.forEach(product => {
      routes.push({
        url: `/product/${product.id}`,
        lastmod: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8
      });
    });
  }

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${DOMAIN}${route.url}</loc>
    <lastmod>${route.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemapContent);
  console.log(`Sitemap generated successfully at ${outputPath} with ${routes.length} URLs.`);
}

generateSitemap();
