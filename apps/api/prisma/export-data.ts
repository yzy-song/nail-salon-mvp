import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const exportDir = './exported-data'; // 你想保存的目录

  // 如果目录不存在，先创建
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  // 以 service 表为例，导出所有数据
  const services = await prisma.service.findMany();
  fs.writeFileSync(`${exportDir}/services.json`, JSON.stringify(services, null, 2));

  // 其它表同理
  const employees = await prisma.employee.findMany();
  fs.writeFileSync(`${exportDir}/employees.json`, JSON.stringify(employees, null, 2));

  const images = await prisma.image.findMany();
  fs.writeFileSync(`${exportDir}/images.json`, JSON.stringify(images, null, 2));

  const serviceImages = await prisma.serviceImage.findMany();
  fs.writeFileSync(`${exportDir}/serviceImages.json`, JSON.stringify(serviceImages, null, 2));

  const users = await prisma.user.findMany();
  fs.writeFileSync(`${exportDir}/users.json`, JSON.stringify(users, null, 2));

  const appointments = await prisma.appointment.findMany();
  fs.writeFileSync(`${exportDir}/appointments.json`, JSON.stringify(appointments, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
  });
