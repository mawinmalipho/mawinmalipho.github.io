import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(request, response) {
  // Add CORS headers for cross-origin requests (e.g. from GitHub Pages)
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Check if credentials exist
  if (!supabaseUrl || !supabaseServiceKey) {
    return response.status(500).json({ 
      message: 'ระบบยังไม่ได้ระบุคีย์สำหรับเชื่อมต่อฐานข้อมูล' 
    });
  }

  try {
    // 1. Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Query only the row count (performant, head: true)
    const { count, error } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    // 3. Return exact count
    return response.status(200).json({ count: count || 0 });
  } catch (error) {
    console.error('Supabase Database Error:', error);
    return response.status(500).json({ 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Supabase', 
      error: error.message 
    });
  }
}
