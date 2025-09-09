import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Seed Services
  await prisma.service.createMany({
    data: [
      {
        name: 'File and Polish',

        description: 'Shape and Regular Polish Application',

        price: 20,

        duration: 60,
      },
      {
        name: 'Shellac Hand',

        description: 'Shape and Gel Polish/Shellac Application',

        price: 28,

        duration: 60,
      },

      {
        name: 'Mini Manicure (no colour)',

        description: 'Shape and Deep Cuticle Clean',

        price: 25,

        duration: 60,
      },

      {
        name: 'Mini Manicure (normal polish)',

        description: 'Shape, Cuticle Clean and Regular Polish Application',

        price: 35,

        duration: 60,
      },

      {
        name: 'Mini Manicure (shellac)',

        description: 'Shape, Cuticle Clean and Shellac/Gel Polish Application',

        price: 35,

        duration: 60,
      },

      {
        name: 'Full Manicure (no color)',

        description: 'Shape, Deep Cuticle Clean and Hand Massage',

        price: 30,

        duration: 60,
      },

      {
        name: 'Full Manicure (normal polish)',

        description: 'Shape, Deep Cuticle Clean, Hand Massage and Normal Polish Application',

        price: 40,

        duration: 60,
      },

      {
        name: 'Full Manicure (shellac)',

        description: 'Shape, Deep Cuticle Clean, Hand Massage and Shellac/ Gel Polish Application',

        price: 40,

        duration: 60,
      },

      {
        name: 'Deluxe Manicure (no color)',

        description: 'Shape, Deep Cuticle Clean, Hand Scrub, Hot Mud Mask and Hand Massage',

        price: 40,

        duration: 60,
      },

      {
        name: 'Deluxe Manicure (with colour)',

        description:
          'Shape, Deep Cuticle Clean, Hand Scrub, Hot Mud Mask, Hand Massage with Color Application',

        price: 50,

        duration: 60,
      },
    ],
    skipDuplicates: true, // Skip if a service with the same name already exists
  });

  // Seed Employees
  await prisma.employee.createMany({
    data: [
      { name: 'Jessica', title: 'Senior Nail Technician' },
      { name: 'Maria', title: 'Nail Artist' },
      { name: 'Chloe', title: 'Junior Technician' },
      { name: 'Emily', title: 'Senior Nail Technician' },

      { name: 'Olivia', title: 'Nail Artist' },

      { name: 'Sophia', title: 'Gel Polish Specialist' },

      { name: 'Ava', title: 'Acrylic Nail Expert' },

      { name: 'Isabella', title: 'Nail Designer' },

      { name: 'Mia', title: 'Nail Care Specialist' },

      { name: 'Charlotte', title: 'Hand & Nail Therapist' },

      { name: 'Amelia', title: 'Luxury Nail Technician' },

      { name: 'Harper', title: 'Nail Extension Expert' },

      { name: 'Evelyn', title: 'Creative Nail Artisan' },
    ],
    skipDuplicates: true, // Skip if an employee with the same name already exists
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
