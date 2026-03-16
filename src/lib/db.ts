import { PrismaClient } from '@prisma/client';
import { FortuneStick } from '@/types/stick';

// Prisma 客户端全局实例（防止热重载时重复创建）
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 转换为前端需要的格式
function formatStick(stick: any): FortuneStick {
  return {
    id: stick.id,
    level: stick.level,
    title: stick.title,
    poem: stick.poem,
    meaning: stick.meaning,
    advice: stick.advice,
    story: stick.story,
  };
}

// 获取所有签文
export async function getAllSticks(): Promise<FortuneStick[]> {
  const sticks = await prisma.fortuneStick.findMany({
    orderBy: { id: 'asc' },
  });
  return sticks.map(formatStick);
}

// 根据ID获取签文
export async function getStickById(id: number): Promise<FortuneStick | null> {
  const stick = await prisma.fortuneStick.findUnique({
    where: { id },
  });
  return stick ? formatStick(stick) : null;
}

// 随机获取一支签
export async function getRandomStick(): Promise<FortuneStick> {
  const count = await prisma.fortuneStick.count();
  if (count === 0) {
    throw new Error('数据库中没有签文');
  }
  const randomId = Math.floor(Math.random() * count) + 1;
  const stick = await prisma.fortuneStick.findFirst({
    where: { id: randomId },
  });
  if (!stick) {
    // 如果该ID不存在，递归重试
    return getRandomStick();
  }
  return formatStick(stick);
}

// 更新签文
export async function updateStick(
  id: number,
  data: Partial<FortuneStick>
): Promise<boolean> {
  try {
    await prisma.fortuneStick.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error('更新签文失败:', error);
    return false;
  }
}

// 创建签文
export async function createStick(data: FortuneStick): Promise<boolean> {
  try {
    await prisma.fortuneStick.create({
      data: {
        id: data.id,
        level: data.level,
        title: data.title,
        poem: data.poem,
        meaning: data.meaning,
        advice: data.advice,
        story: data.story,
      },
    });
    return true;
  } catch (error) {
    console.error('创建签文失败:', error);
    return false;
  }
}

// 删除签文
export async function deleteStick(id: number): Promise<boolean> {
  try {
    await prisma.fortuneStick.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('删除签文失败:', error);
    return false;
  }
}

// 搜索签文
export async function searchSticks(keyword: string): Promise<FortuneStick[]> {
  const sticks = await prisma.fortuneStick.findMany({
    where: {
      OR: [
        { title: { contains: keyword } },
        { poem: { contains: keyword } },
        { meaning: { contains: keyword } },
      ],
    },
    orderBy: { id: 'asc' },
  });
  return sticks.map(formatStick);
}

// 初始化数据库（导入默认数据）
export async function seedDatabase(sticks: FortuneStick[]): Promise<void> {
  const count = await prisma.fortuneStick.count();
  if (count === 0) {
    console.log('初始化数据库，导入', sticks.length, '支签文...');
    for (const stick of sticks) {
      await prisma.fortuneStick.create({
        data: {
          id: stick.id,
          level: stick.level,
          title: stick.title,
          poem: stick.poem,
          meaning: stick.meaning,
          advice: stick.advice,
          story: stick.story,
        },
      });
    }
    console.log('数据库初始化完成');
  }
}
