This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

要修复 Next.js 构建时的 ECONNREFUSED 报错（静态页面预取数据失败），可以按以下方法操作：
1确保构建时后端 API 可用

在本地或云端构建前，先启动你的后端服务（如 NestJS），保证 API 地址能访问。
如果用的是生产 API 地址，确保该地址在构建时可访问。

2使用线上 API 地址

在 .env.production 或构建环境变量中，把 API 地址设置为线上可访问的地址（不要用 localhost）。
例如
NEXT_PUBLIC_API_URL=https://aaa.bbb.ccc.com

3 getStaticProps/getServerSideProps 容错处理

在数据请求处加 try-catch，失败时返回空数据，避免构建直接报错。例如：

```ts
export async function getStaticProps() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
    const data = await res.json();
    return { props: { services: data } };
  } catch (e) {
    return { props: { services: [] } }; // 或返回 error 信息
  }
}
```

如果下面这样的写法eslint报错

```html
<form onSubmit="{form.handleSubmit(onSubmit)}" className="space-y-4"></form>
```

改成下面的写法

```html
<form onSubmit="{(e)" ="">void form.handleSubmit(onSubmit)(e)} className="space-y-4"></form>
```
