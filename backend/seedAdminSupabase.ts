import 'dotenv/config';
import bcrypt from 'bcryptjs';
import supabase from './src/supabaseClient';

async function main(): Promise<void> {
  const email = 'admin@ayra.com';
  const password = 'admin123';

  const { data: existing } = await supabase
    .from('User')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const { error: updateError } = await supabase
      .from('User')
      .update({ password: hashedPassword, role: 'Admin' })
      .eq('email', email);

    if (updateError) throw updateError;

    console.log('Admin user already existed — password reset to default.');
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const { error } = await supabase.from('User').insert({
    email,
    password: hashedPassword,
    name: 'Super Admin',
    role: 'Admin',
  });

  if (error) throw error;

  console.log('Admin user created in Supabase.');
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
