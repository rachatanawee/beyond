import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateLoginStats } from './profile-utils';

export async function handleLoginStats(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Update login statistics in the background
      updateLoginStats(user.id).catch(error => {
        console.error('Failed to update login stats:', error);
      });
    }
  } catch (error) {
    console.error('Error in login middleware:', error);
  }
}

export function withLoginStats(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Handle login stats in the background
    handleLoginStats(request).catch(error => {
      console.error('Login stats middleware error:', error);
    });

    // Continue with the original handler
    return handler(request);
  };
}