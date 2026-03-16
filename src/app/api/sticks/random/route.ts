import { NextResponse } from 'next/server';
import { initDatabase, seedDatabase, getRandomStick } from '@/lib/db';
import sticksData from '../../../../../data/sticks.json';

// 初始化数据库
async function initDb() {
  await seedDatabase(sticksData.sticks);
}

// GET /api/sticks/random - 随机抽签
export async function GET() {
  try {
    await initDb();
    const stick = await getRandomStick();
    return NextResponse.json({ success: true, data: stick });
  } catch (error) {
    console.error('随机抽签失败:', error);
    return NextResponse.json(
      { success: false, error: '随机抽签失败' },
      { status: 500 }
    );
  }
}
