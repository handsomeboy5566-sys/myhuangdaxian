import { FortuneStick } from '@/types/stick';

// 直接导入JSON数据
import sticksData from '../../data/sticks.json';

let sticks: FortuneStick[] = [...sticksData.sticks];

export function getAllSticks(): FortuneStick[] {
  return sticks;
}

export function getStickById(id: number): FortuneStick | undefined {
  return sticks.find(stick => stick.id === id);
}

export function getRandomStick(): FortuneStick {
  const randomIndex = Math.floor(Math.random() * sticks.length);
  return sticks[randomIndex];
}

export function updateStick(id: number, data: Partial<FortuneStick>): boolean {
  const index = sticks.findIndex(stick => stick.id === id);
  if (index === -1) return false;

  sticks[index] = { ...sticks[index], ...data };
  return true;
}
