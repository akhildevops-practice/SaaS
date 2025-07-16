// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from './generated/client1';
// import { PrismaClient } from './generated/client1';
const prisma = new PrismaClient();

async function main() {
  const user = {
    kcId: 'bf6dc80b-201b-4d37-9ed9-a07b6f3f9fdb',
    email: 'chethan@processridge.in',
    userType: 'internal',
    username: 'admin',
    firstname: 'Super',
    lastname: 'Admin',
    status: true,
    deleted: false,
    organizationId: "master"
  };
  let createdUser = await prisma.user.create({ data: user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
