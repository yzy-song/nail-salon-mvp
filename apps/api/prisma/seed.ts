import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const services = JSON.parse(fs.readFileSync('./exported-data/services.json', 'utf-8'));
  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  const employees = JSON.parse(fs.readFileSync('./exported-data/employees.json', 'utf-8'));
  for (const employee of employees) {
    await prisma.employee.create({ data: employee });
  }
  const images = JSON.parse(fs.readFileSync('./exported-data/images.json', 'utf-8'));
  for (const image of images) {
    await prisma.image.create({ data: image });
  }
  const serviceImages = JSON.parse(fs.readFileSync('./exported-data/serviceImages.json', 'utf-8'));
  for (const serviceImage of serviceImages) {
    await prisma.serviceImage.create({ data: serviceImage });
  }
  const users = JSON.parse(fs.readFileSync('./exported-data/users.json', 'utf-8'));
  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  const appointments = JSON.parse(fs.readFileSync('./exported-data/appointments.json', 'utf-8'));
  for (const appointment of appointments) {
    await prisma.appointment.create({ data: appointment });
  }

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
