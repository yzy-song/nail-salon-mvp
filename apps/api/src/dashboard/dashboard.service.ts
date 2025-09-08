import { Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // 使用 Promise.all 并行执行所有查询，效率更高
    const [userCount, appointmentCount, todaysAppointmentCount, revenue] = await Promise.all([
      // 1. 获取总用户数
      this.prisma.user.count(),

      // 2. 获取总预约数
      this.prisma.appointment.count(),

      // 3. 获取今日新增预约数
      this.getTodaysAppointmentsCount(),

      // 4. 计算总收入
      this.calculateTotalRevenue(),
    ]);

    return {
      totalUsers: userCount,
      totalAppointments: appointmentCount,
      todaysAppointments: todaysAppointmentCount,
      totalRevenue: revenue,
    };
  }

  private async getTodaysAppointmentsCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 设置为今天的开始时间

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // 明天的开始时间

    return this.prisma.appointment.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  private async calculateTotalRevenue(): Promise<number> {
    const completedAppointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.COMPLETED,
      },
      include: {
        service: {
          select: {
            price: true,
          },
        },
      },
    });

    // 使用 reduce 计算总价
    const totalRevenue = completedAppointments.reduce((sum, appointment) => {
      return sum + (appointment.service?.price || 0);
    }, 0);

    return totalRevenue;
  }
}
