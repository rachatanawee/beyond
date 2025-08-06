import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test Supabase connection with a simple query
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
      throw error;
    }

    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'supabase',
      connection: 'healthy'
    });
  } catch (error) {
    console.error('Supabase health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Supabase connection failed',
        timestamp: new Date().toISOString(),
        service: 'supabase',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}