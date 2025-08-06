import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export async function ensureUserProfile(user: User) {
  const supabase = await createClient();
  
  // First check if profile exists
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (existingProfile && !checkError) {
    return existingProfile;
  }

  // If profile doesn't exist, create one
  if (checkError?.code === 'PGRST116') {
    console.log('Creating profile for user:', user.id);
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email || '',
        role: 'user',
        status: 'active',
        login_count: 0,
        preferred_language: 'en'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user profile:', createError);
      throw new Error('Failed to create user profile');
    }

    return newProfile;
  }

  // Other errors
  console.error('Error checking user profile:', checkError);
  throw new Error('Failed to get user profile');
}

export async function updateLoginStats(userId: string) {
  const supabase = await createClient();
  
  // First get current login count
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('login_count')
    .eq('user_id', userId)
    .single();

  const currentCount = currentProfile?.login_count || 0;
  
  const { error } = await supabase
    .from('profiles')
    .update({
      last_login_at: new Date().toISOString(),
      login_count: currentCount + 1
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating login stats:', error);
  }
}