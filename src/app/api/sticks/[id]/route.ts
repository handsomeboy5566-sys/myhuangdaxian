import { NextRequest, NextResponse } from 'next/server';
import { getStickById, updateStick, deleteStick, seedDatabase } from '@/lib/db';
import sticksData from '../../../../../data/sticks.json';

// 初始化数据库
async function initDb() {
  await seedDatabase(sticksData.sticks);
}

// GET /api/sticks/:id - 获取单支签文
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const stickId = parseInt(id, 10);

    if (isNaN(stickId)) {
      return NextResponse.json(
        { success: false, error: '无效的签号' },
        { status: 400 }
      );
    }

    const stick = await getStickById(stickId);

    if (!stick) {
      return NextResponse.json(
        { success: false, error: '签文未找到' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: stick });
  } catch (error) {
    console.error('获取签文失败:', error);
    return NextResponse.json(
      { success: false, error: '获取签文失败' },
      { status: 500 }
    );
  }
}

// PUT /api/sticks/:id - 更新签文
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const stickId = parseInt(id, 10);

    if (isNaN(stickId)) {
      return NextResponse.json(
        { success: false, error: '无效的签号' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const success = await updateStick(stickId, body);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '签文未找到或无需更新' },
        { status: 404 }
      );
    }

    const updatedStick = await getStickById(stickId);
    return NextResponse.json({ success: true, data: updatedStick });
  } catch (error) {
    console.error('更新签文失败:', error);
    return NextResponse.json(
      { success: false, error: '更新签文失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/sticks/:id - 删除签文
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const stickId = parseInt(id, 10);

    if (isNaN(stickId)) {
      return NextResponse.json(
        { success: false, error: '无效的签号' },
        { status: 400 }
      );
    }

    const success = await deleteStick(stickId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: '签文未找到' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: '签文已删除' });
  } catch (error) {
    console.error('删除签文失败:', error);
    return NextResponse.json(
      { success: false, error: '删除签文失败' },
      { status: 500 }
    );
  }
}
