#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Get the email from command line argument or prompt
    const adminEmail = process.argv[2];
    
    if (!adminEmail) {
      console.error('❌ Please provide admin email as argument:');
      console.error('   bun run seed-cloud your-email@example.com');
      process.exit(1);
    }

    console.log(`👤 Setting up admin user: ${adminEmail}`);

    // Update user to admin
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        status: 'active',
        full_name: 'System Administrator',
        bio: 'Application administrator with full access to all features.'
      })
      .eq('email', adminEmail)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating profile:', updateError.message);
      console.error('Make sure the user exists and has signed up through the app first.');
      process.exit(1);
    }

    if (!updatedProfile) {
      console.error('❌ No user found with email:', adminEmail);
      console.error('Make sure the user has signed up through the app first.');
      process.exit(1);
    }

    console.log('✅ Admin user updated successfully');

    // Insert admin log
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: updatedProfile.user_id,
        action: 'system_setup',
        details: {
          message: 'Initial system setup completed',
          version: '1.0.0'
        }
      });

    if (logError) {
      console.warn('⚠️  Warning: Could not create admin log:', logError.message);
    } else {
      console.log('✅ Admin log created');
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`👑 ${adminEmail} is now an admin user`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();