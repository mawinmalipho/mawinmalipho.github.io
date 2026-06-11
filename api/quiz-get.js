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

  // Get ID from query parameter
  const { id } = request.query;

  if (!id) {
    return response.status(400).json({ message: 'โปรดระบุ ID ที่ต้องการดึงข้อมูล' });
  }

  // Check if credentials exist
  if (!supabaseUrl || !supabaseServiceKey) {
    return response.status(500).json({ 
      message: 'ระบบยังไม่ได้ระบุคีย์สำหรับเชื่อมต่อฐานข้อมูล (โปรดระบุ SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน Vercel)' 
    });
  }

  try {
    // 1. Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Fetch row where id matches
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return response.status(404).json({ message: 'ไม่พบข้อมูลผลกรรมสำหรับ ID นี้' });
    }

    // 3. Return the retrieved data
    return response.status(200).json(data);
  } catch (error) {
    console.error('Supabase Database Fetch Error:', error);
    return response.status(500).json({ 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Supabase', 
      error: error.message 
    });
  }
}
