import 'dotenv/config';
import prisma from './src/prismaClient';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@ayra.com';
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    console.log('Admin user already exists.');
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'Admin'
    }
  });
  console.log('Admin user created successfully.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
