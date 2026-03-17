'use client';

import { useState } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Easing curves - using easeOutQuart for natural deceleration
const easeOutQuart = [0.25, 1, 0.5, 1];
const easeOutQuint = [0.22, 1, 0.36, 1];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOutQuart,
    },
  },
};

const resultVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: -30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -20,
    transition: { duration: 0.3 },
  },
};

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

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }

    // Shake animation with easeOutQuart
    await controls.start({
      x: [-6, 6, -5, 5, -4, 4, -2, 2, 0],
      rotate: [-8, 8, -6, 6, -4, 4, -2, 2, 0],
      transition: {
        duration: 1,
        ease: easeOutQuart,
      }
    });
  };

  const handleShakeEnd = async () => {
    if (!isShaking) return;

    setIsShaking(false);
    setLoading(true);

    try {
      const response = await fetch('/api/sticks/random');
      const data = await response.json();

      if (data.success) {
        setShowResult(true);
        setStickNumber(data.data.id);

        if (navigator.vibrate) {
          navigator.vibrate(150);
        }

        setTimeout(() => {
          router.push(`/stick/${data.data.id}`);
        }, 2200);
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
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-10 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-100/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2 tracking-tight">
            黄大仙灵签
          </h1>
          <p className="text-amber-700/80 text-sm md:text-base font-medium">
            默念所求，摇动手机或点击摇签
          </p>
        </motion.div>

        {/* Shake area */}
        <motion.div
          variants={itemVariants}
          className="relative w-full max-w-sm aspect-square flex items-center justify-center"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 to-red-100/30 rounded-full blur-2xl scale-90" />

          {/* Fortune tube */}
          <motion.div
            animate={controls}
            className="relative cursor-pointer select-none will-change-transform"
            onMouseDown={handleShakeStart}
            onMouseUp={handleShakeEnd}
            onMouseLeave={handleShakeEnd}
            onTouchStart={handleShakeStart}
            onTouchEnd={handleShakeEnd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg
              width="180"
              height="260"
              viewBox="0 0 200 280"
              className="drop-shadow-2xl"
            >
              <defs>
                <linearGradient id="tubeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#78350f" />
                  <stop offset="30%" stopColor="#92400e" />
                  <stop offset="50%" stopColor="#b45309" />
                  <stop offset="70%" stopColor="#92400e" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Tube shadow */}
              <ellipse cx="100" cy="245" rx="55" ry="15" fill="#451a03" opacity="0.3" />

              {/* Tube body */}
              <ellipse cx="100" cy="240" rx="58" ry="18" fill="#451a03" />
              <rect x="42" y="80" width="116" height="160" fill="url(#tubeGradient)" rx="8" />
              <ellipse cx="100" cy="80" rx="58" ry="18" fill="#92400e" />

              {/* Gold decorations */}
              <rect x="37" y="100" width="126" height="10" fill="url(#goldGradient)" rx="5" filter="url(#glow)" />
              <rect x="37" y="200" width="126" height="10" fill="url(#goldGradient)" rx="5" filter="url(#glow)" />

              {/* Text */}
              <text
                x="100"
                y="160"
                textAnchor="middle"
                fill="#fbbf24"
                fontSize="28"
                fontWeight="bold"
                filter="url(#glow)"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                求签
              </text>

              {/* Sticks */}
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.rect
                  key={i}
                  x={72 + i * 10}
                  y={25 + i * 4}
                  width="14"
                  height="75"
                  fill="#fef3c7"
                  rx="3"
                  stroke="#92400e"
                  strokeWidth="1.5"
                  animate={isShaking ? {
                    y: [25 + i * 4, 18 + i * 4, 25 + i * 4],
                    rotate: [0, 4 - i * 2, 0],
                  } : {}}
                  transition={{
                    duration: 0.12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
            </svg>
          </motion.div>

          {/* Result display */}
          {showResult && stickNumber && (
            <motion.div
              variants={resultVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <div className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white px-10 py-8 rounded-2xl shadow-2xl border-4 border-amber-300">
                <p className="text-sm text-amber-200 mb-2 font-medium tracking-wide">您抽到了</p>
                <p className="text-5xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>
                  第 {stickNumber} 签
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Status text */}
        <motion.div variants={itemVariants} className="mt-6 text-center">
          {!showResult ? (
            <motion.p
              className="text-amber-800 font-medium"
              animate={isShaking ? { opacity: [1, 0.6, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                  求签中
                </span>
              ) : isShaking ? (
                '摇签中...'
              ) : (
                '按住屏幕或点击开始摇签'
              )}
            </motion.p>
          ) : (
            <p className="text-amber-800 font-medium">正在为您解签...</p>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-auto pt-12 pb-4 text-center">
          <p className="text-xs text-amber-600/70 tracking-wider">
            心诚则灵 · 黄大仙100签
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
