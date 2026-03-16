import { NextRequest, NextResponse } from 'next/server';
import { getAllSticks, searchSticks, createStick, seedDatabase } from '@/lib/db';
import sticksData from '../../../../data/sticks.json';

// 初始化数据库
async function initDb() {
  await seedDatabase(sticksData.sticks);
}

// GET /api/sticks - 获取所有签文或搜索
export async function GET(request: NextRequest) {
  try {
    // 确保数据库已初始化
    await initDb();

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (keyword) {
      const sticks = await searchSticks(keyword);
      return NextResponse.json({ success: true, data: sticks });
    }

    const sticks = await getAllSticks();
    return NextResponse.json({ success: true, data: sticks });
  } catch (error) {
    console.error('获取签文列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取签文列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/sticks - 创建新签文
export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();

    // 验证必填字段
    if (!body.id || !body.level || !body.title || !body.poem) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 检查签号是否已存在
    const existingSticks = await getAllSticks();
    if (existingSticks.some(s => s.id === body.id)) {
      return NextResponse.json(
        { success: false, error: '签号已存在' },
        { status: 400 }
      );
    }

    const success = await createStick(body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '创建签文失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('创建签文失败:', error);
    return NextResponse.json(
      { success: false, error: '创建签文失败' },
      { status: 500 }
    );
  }
}
