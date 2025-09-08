## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

=====================
Nail Salon
=====================

前端 (Frontend): Vercel

后端 (Backend - API + Database): Railway

本地开发数据库 (Local Dev DB): 您本地安装的 PostgreSQL

线上生产数据库 (Production DB): Railway 上创建的 PostgreSQL

## 目录结构

apps/web/
└── app/
├── page.tsx # 顾客看到的首页 (/)
├── services/
│ └── page.tsx # 顾客看到的服务列表页 (/services)
├── layout.tsx # 应用的根布局 (可能包含给顾客看的导航栏和页脚)
│
└── admin/ # 所有后台管理的页面都在这里
├── page.tsx # 后台主页或登录页 (/admin)
├── appointments/
│ └── page.tsx # 预约管理页 (/admin/appointments)
├── employees/
│ └── page.tsx # 员工管理页 (/admin/employees)
│
└── layout.tsx # 🔥 后台管理的专属布局 (包含侧边栏菜单、后台导航栏等)

![架构图](../docs/images/架构图.png)

## 后端接口设计

Auth Module (/auth) - 认证
POST /auth/register - 顾客注册新账户。

POST /auth/login - 顾客或员工/老板登录。

GET /auth/profile - 获取当前登录用户的个人信息 (需要认证)。

Services Module (/services) - 美甲服务
GET /services - (公开) 获取所有可用的服务列表。

GET /services/:id - (公开) 获取单个服务的详细信息。

POST /services - (管理员) 创建一个新服务。

PATCH /services/:id - (管理员) 更新一个服务的信息。

DELETE /services/:id - (管理员) 删除一个服务。

Employees Module (/employees) - 员工
GET /employees - (公开) 获取所有员工列表（以便顾客预约时选择）。

POST /employees - (管理员) 添加新员工。

PATCH /employees/:id - (管理员) 更新员工信息。

DELETE /employees/:id - (管理员) 删除员工。

Appointments Module (/appointments) - 预约
POST /appointments - (顾客/需认证) 创建一个新的预约。

GET /users/me/appointments - (顾客/需认证) 获取当前用户自己的预约历史。

GET /appointments - (管理员) 获取所有预约列表（可按日期、员工等筛选）。

PATCH /appointments/:id - (管理员) 更新预约状态（例如：确认预约、标记为已完成）。

Users Module (/users) - 用户管理 (后台)
GET /users - (管理员) 获取所有注册用户列表。

GET /users/:id - (管理员) 获取单个用户的详细信息。

## 初始化 Prisma 并定义我们的数据模型。进入后端项目目录：

```bash

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## 在 VS Code 终端中，进入后端项目目录：

```bash
cd apps/api
```

##　安装 Prisma 依赖：

```Bash
pnpm add prisma @prisma/client
pnpm add -D @types/node

```

prisma: Prisma 的命令行工具 (CLI)。

@prisma/client: 在代码中与数据库交互的客户端。

＃＃初始化 Prisma：

```Bash
pnpm prisma init --datasource-provider postgresql
```

这个命令会创建一个 prisma 文件夹和一个 schema.prisma 文件，同时也会在 .env 文件中帮我们创建一个数据库连接地址的模板。

# 定义数据模型！

打开 prisma/schema.prisma 文件，用下面的内容完全替换掉文件里的所有内容。我已经为您设计好了所有模型和它们之间的关系。

```js
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

// 用户模型 (顾客或管理员)
model User {
id String @id @default(cuid())
email String @unique
name String?
password String
role Role @default(USER)
appointments Appointment[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

// 员工模型
model Employee {
id String @id @default(cuid())
name String
title String // e.g., "高级美甲师"
// 关系：一个员工可以处理多个预约
appointments Appointment[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

// 服务项目模型
model Service {
id String @id @default(cuid())
name String
description String?
price Float
duration Int // 持续时间（分钟）
// 关系：一个服务可以被多次预约
appointments Appointment[]
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

// 预约模型 (核心)
model Appointment {
id String @id @default(cuid())
// 关系：关联到哪个用户
user User @relation(fields: [userId], references: [id])
userId String
// 关系：关联到哪个员工
employee Employee @relation(fields: [employeeId], references: [id])
employeeId String
// 关系：关联到哪个服务
service Service @relation(fields: [serviceId], references: [id])
serviceId String

appointmentTime DateTime // 预约的具体时间
status AppointmentStatus @default(PENDING) // 预约状态
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

// 枚举：用户角色
enum Role {
USER // 普通用户
ADMIN // 管理员
}

// 枚举：预约状态
enum AppointmentStatus {
PENDING // 待确认
CONFIRMED // 已确认
COMPLETED // 已完成
CANCELLED // 已取消
}
```

## 打开 apps/api/ 目录下的 .env 文件。（pnpm prisma init 应该已经帮您创建了它）。文件里会有一行 DATABASE_URL="..."。

```bash
# apps/api/.env

DATABASE_URL="postgresql://user:password@localhost:5433/nail-salon?schema=public"
```

## 执行下面命令，初始化

```bash
pnpm prisma migrate dev --name init
```

## 在 NestJS 中集成 Prisma

现在，我们需要在 NestJS 应用中创建一个“官方渠道”，让应用里的所有模块（比如用户模块、预约模块）都能通过这个渠道来访问数据库
创建 Prisma 模块和服务
请确保您的终端在 apps/api 目录下
运行以下 NestJS CLI 命令

```bash
# 1. 创建一个名为 'prisma' 的模块
nest g module prisma

# 2. 在 prisma 模块下创建一个名为 'prisma' 的服务
nest g service prisma
```

编写 PrismaService
打开刚刚创建的 src/prisma/prisma.service.ts 文件，用以下内容完全替换它：

```ts
// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // 在 NestJS 模块初始化时，连接到数据库
    await this.$connect();
  }
}
```

将 PrismaModule 设为全局模块
打开 src/prisma/prisma.module.ts 文件

```ts
// src/prisma/prisma.module.ts

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 关键：将此模块设为全局
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 关键：导出 PrismaService 供其他模块使用
})
export class PrismaModule {}
```

在主模块中导入 PrismaModule
打开 src/app.module.ts 文件，导入 PrismaModule：

```ts
// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module'; // <-- 1. 导入

@Module({
  imports: [PrismaModule], // <-- 2. 添加到 imports 数组
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

在主模块中导入 PrismaModule
在应用的主模块 AppModule 中导入一次 PrismaModule，这样整个应用才能“知道”它的存在。
打开 src/app.module.ts 文件

```ts
// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module'; // <-- 1. 导入

@Module({
  imports: [PrismaModule], // <-- 2. 添加到 imports 数组
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
