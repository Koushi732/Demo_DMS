const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://mufafqcmnenbajimpbls.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_w4OUTgfhqUJquf6y6CdrIw_aY-knEH2';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const email = 'admin@aureonpharma.com';
  const password = 'AureonDemo@2026';

  try {
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      process.exit(1);
    }

    const existingUser = listData.users.find(u => u.email === email);
    
    if (existingUser) {
      console.log(existingUser.id);
      process.exit(0);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      console.error('Error creating user:', error);
      process.exit(1);
    }

    console.log(data.user.id);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
