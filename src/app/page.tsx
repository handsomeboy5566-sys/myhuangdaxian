'use client';

import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isShaking, setIsShaking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [stickNumber, setStickNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const controls = useAnimation();
  const router = useRouter();

  const handleShakeStart = async () => {
    if (isShaking || showResult || loading) return;

    setIsShaking(true);

    // 触发震动反馈
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }

    // 播放摇晃动画
    await controls.start({
      x: [-8, 8, -8, 8, -6, 6, -4, 4, 0],
      rotate: [-10, 10, -10, 10, -8, 8, -5, 5, 0],
      transition: {
        duration: 1.2,
        ease: "easeInOut"
      }
    });
  };

  const handleShakeEnd = async () => {
    if (!isShaking) return;

    setIsShaking(false);
    setLoading(true);

    try {
      // 调用 API 获取随机签
      const response = await fetch('/api/sticks/random');
      const data = await response.json();

      if (data.success) {
        // 显示结果动画
        setShowResult(true);
        setStickNumber(data.data.id);

        // 震动反馈
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }

        // 2秒后自动跳转到签文详情页
        setTimeout(() => {
          router.push(`/stick/${data.data.id}`);
        }, 2000);
      } else {
        alert('求签失败，请重试');
        setLoading(false);
      }
    } catch (error) {
      console.error('求签失败:', error);
      alert('求签失败，请重试');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">
          黄大仙灵签
        </h1>
        <p className="text-amber-700 text-sm md:text-base">
          默念所求，摇动手机或点击摇签
        </p>
      </div>

      {/* 摇签区域 */}
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        {/* 装饰背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-amber-100 rounded-full opacity-50" />

        {/* 摇签筒 */}
        <motion.div
          animate={controls}
          className="relative cursor-pointer select-none"
          onMouseDown={handleShakeStart}
          onMouseUp={handleShakeEnd}
          onMouseLeave={handleShakeEnd}
          onTouchStart={handleShakeStart}
          onTouchEnd={handleShakeEnd}
        >
          <svg
            width="200"
            height="280"
            viewBox="0 0 200 280"
            className="drop-shadow-2xl"
          >
            {/* 签筒主体 */}
            <defs>
              <linearGradient id="tubeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B4513" />
                <stop offset="50%" stopColor="#A0522D" />
                <stop offset="100%" stopColor="#8B4513" />
              </linearGradient>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>

            {/* 筒身 */}
            <ellipse cx="100" cy="240" rx="60" ry="20" fill="#654321" />
            <rect x="40" y="80" width="120" height="160" fill="url(#tubeGradient)" rx="10" />
            <ellipse cx="100" cy="80" rx="60" ry="20" fill="#A0522D" />

            {/* 装饰金边 */}
            <rect x="35" y="100" width="130" height="8" fill="url(#goldGradient)" rx="4" />
            <rect x="35" y="200" width="130" height="8" fill="url(#goldGradient)" rx="4" />

            {/* 文字 */}
            <text x="100" y="160" textAnchor="middle" fill="#FFD700" fontSize="24" fontWeight="bold">
              求签
            </text>

            {/* 签条 */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.rect
                key={i}
                x={75 + i * 8}
                y={20 + i * 5}
                width="12"
                height="80"
                fill="#F5DEB3"
                rx="2"
                stroke="#8B4513"
                strokeWidth="1"
                animate={isShaking ? {
                  y: [20 + i * 5, 15 + i * 5, 20 + i * 5],
                  rotate: [0, 5 - i * 2, 0]
                } : {}}
                transition={{
                  duration: 0.1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </svg>
        </motion.div>

        {/* 结果展示 */}
        {showResult && stickNumber && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="bg-gradient-to-br from-red-600 to-red-800 text-white px-8 py-6 rounded-lg shadow-2xl border-4 border-yellow-400">
              <p className="text-sm text-yellow-200 mb-1">您抽到了</p>
              <p className="text-4xl font-bold">第 {stickNumber} 签</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 提示文字 */}
      <div className="mt-8 text-center">
        {!showResult ? (
          <p className="text-amber-800 animate-pulse">
            {loading ? '求签中...' : isShaking ? '摇签中...' : '按住屏幕或点击开始摇签'}
          </p>
        ) : (
          <p className="text-amber-800">正在为您解签...</p>
        )}
      </div>

      {/* 底部说明 */}
      <div className="mt-auto pt-8 pb-4 text-center">
        <p className="text-xs text-amber-600">
          心诚则灵 · 黄大仙100签
        </p>
      </div>
    </main>
  );
}
