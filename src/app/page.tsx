'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/ui/Toast';

// Easing curves - typed as tuple for Framer Motion
const easeOutQuart: [number, number, number, number] = [0.25, 1, 0.5, 1];
const easeOutQuint: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOutQuart,
    },
  },
};

const floatVariants: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Gold coin component
function GoldCoin({ delay = 0, left = '50%', size = 24 }: { delay?: number; left?: string; size?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left, width: size, height: size }}
      initial={{ y: -50, opacity: 0, rotate: 0 }}
      animate={{
        y: [null, -150, -300],
        opacity: [0, 1, 0],
        rotate: [0, 180, 360],
        x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
    >
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <circle cx="20" cy="20" r="18" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
        <circle cx="20" cy="20" r="14" fill="none" stroke="#FFA500" strokeWidth="1" />
        <text x="20" y="26" textAnchor="middle" fill="#8B4513" fontSize="16" fontWeight="bold">¥</text>
      </svg>
    </motion.div>
  );
}

// Sparkle particle
function Sparkle({ delay = 0, left = '50%', top = '50%' }: { delay?: number; left?: string; top?: string }) {
  return (
    <motion.div
      className="absolute pointer-events-none w-1 h-1 bg-yellow-300 rounded-full"
      style={{ left, top }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        delay,
        ease: 'easeOut',
      }}
    />
  );
}

// Cloud pattern
function CloudPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
      <svg className="w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="cloudPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M20,50 Q30,30 50,40 Q70,30 80,50 Q90,60 80,70 Q70,80 50,75 Q30,80 20,70 Q10,60 20,50"
              fill="none"
              stroke="#FFD700"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cloudPattern)" />
      </svg>
    </div>
  );
}

// Light rays effect
function LightRays() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-2 h-full origin-top"
          style={{
            background: 'linear-gradient(180deg, rgba(255,215,0,0.3) 0%, transparent 50%)',
            transform: `rotate(${i * 45}deg) translateX(-50%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [isShaking, setIsShaking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [stickNumber, setStickNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'error' | 'success' | 'info' }>({
    isVisible: false,
    message: '',
    type: 'error',
  });
  const controls = useAnimation();
  const router = useRouter();

  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.isVisible]);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ isVisible: true, message, type });
  }, []);

  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const handleShakeStart = async () => {
    if (isShaking || showResult || loading) return;

    setIsPressed(true);
    setIsShaking(true);

    if (navigator.vibrate) {
      navigator.vibrate([50, 100, 50]);
    }

    await controls.start({
      x: [-8, 8, -6, 6, -4, 4, -2, 2, 0],
      rotate: [-10, 10, -8, 8, -5, 5, -2, 2, 0],
      transition: {
        duration: 1,
        ease: easeOutQuart,
      }
    });
  };

  const handleShakeEnd = async () => {
    if (!isShaking) return;

    setIsPressed(false);
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
        }, 2500);
      } else {
        showToast('求签失败，请重试', 'error');
        setLoading(false);
      }
    } catch {
      showToast('网络连接失败，请检查网络后重试', 'error');
      setLoading(false);
    }
  };

  // Fortune stick data
  const fortuneSticks = [
    { char: '大吉', rotate: -25, x: 75, y: 45 },
    { char: '上吉', rotate: -12, x: 90, y: 38 },
    { char: '中吉', rotate: 0, x: 105, y: 35 },
    { char: '上吉', rotate: 12, x: 120, y: 38 },
    { char: '大吉', rotate: 25, x: 135, y: 45 },
  ];

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #4A0000 0%, #8B0000 30%, #6B0000 70%, #2A0000 100%)',
      }}
    >
      {/* Background patterns */}
      <CloudPattern />
      <LightRays />

      {/* Lattice overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #FFD700 1px, transparent 1px),
            linear-gradient(#FFD700 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating gold coins */}
      <GoldCoin delay={0} left="10%" size={32} />
      <GoldCoin delay={1.5} left="25%" size={24} />
      <GoldCoin delay={3} left="75%" size={28} />
      <GoldCoin delay={2} left="85%" size={20} />
      <GoldCoin delay={4} left="50%" size={36} />

      {/* Sparkles */}
      <Sparkle delay={0} left="20%" top="30%" />
      <Sparkle delay={0.5} left="80%" top="20%" />
      <Sparkle delay={1} left="60%" top="40%" />
      <Sparkle delay={1.5} left="30%" top="60%" />
      <Sparkle delay={2} left="70%" top="50%" />

      {/* Glow at base */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/3 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center bottom, rgba(255,215,0,0.4) 0%, transparent 60%)',
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center w-full max-w-md px-4"
      >
        {/* Top banner with golden 3D text */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-2 tracking-wider"
            style={{
              fontFamily: 'var(--font-serif)',
              color: '#FFD700',
              textShadow: `
                0 0 10px #FFD700,
                0 0 20px #FFD700,
                0 0 40px #FFA500,
                3px 3px 0px #8B4513,
                -1px -1px 0px #FFF8DC
              `,
            }}
          >
            黄大仙灵签
          </h1>
          <p
            className="text-lg tracking-widest"
            style={{
              color: '#FFA500',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            心诚则灵 · 有求必应
          </p>
        </motion.div>

        {/* Fortune tube area */}
        <motion.div
          variants={itemVariants}
          className="relative w-full max-w-sm aspect-[4/5] flex items-center justify-center"
        >
          {/* Halo glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 60px 20px rgba(255,215,0,0.3)',
                '0 0 80px 30px rgba(255,215,0,0.5)',
                '0 0 60px 20px rgba(255,215,0,0.3)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
            }}
          />

          {/* Main tube SVG */}
          <motion.button
            animate={controls}
            onMouseDown={handleShakeStart}
            onMouseUp={handleShakeEnd}
            onMouseLeave={handleShakeEnd}
            onTouchStart={handleShakeStart}
            onTouchEnd={handleShakeEnd}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleShakeStart();
                setTimeout(handleShakeEnd, 1000);
              }
            }}
            whileHover={{ scale: loading || showResult ? 1 : 1.02 }}
            whileTap={{ scale: loading || showResult ? 1 : 0.98 }}
            disabled={loading || showResult}
            aria-label={loading ? '求签中' : showResult ? '已求得签文' : '按住摇签'}
            aria-pressed={isPressed}
            aria-busy={loading}
            className="relative select-none touch-manipulation will-change-transform"
            style={{
              minWidth: '220px',
              minHeight: '320px',
              opacity: loading || showResult ? 0.8 : 1,
              cursor: loading || showResult ? 'not-allowed' : 'pointer',
            }}
          >
            <svg
              width="220"
              height="320"
              viewBox="0 0 220 320"
              className="drop-shadow-2xl"
            >
              <defs>
                {/* Imperial red gradient */}
                <linearGradient id="imperialRed" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4A0000" />
                  <stop offset="20%" stopColor="#8B0000" />
                  <stop offset="50%" stopColor="#A00000" />
                  <stop offset="80%" stopColor="#8B0000" />
                  <stop offset="100%" stopColor="#4A0000" />
                </linearGradient>

                {/* Gold gradient */}
                <linearGradient id="imperialGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF8DC" />
                  <stop offset="30%" stopColor="#FFD700" />
                  <stop offset="60%" stopColor="#FFA500" />
                  <stop offset="100%" stopColor="#B8860B" />
                </linearGradient>

                {/* Belt buckle gold */}
                <radialGradient id="buckleGold" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#FFF8DC" />
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#DAA520" />
                </radialGradient>

                <filter id="imperialGlow">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Tube shadow */}
              <ellipse cx="110" cy="295" rx="70" ry="20" fill="#2A0000" opacity="0.6" />

              {/* Sticks - fanning out from top */}
              {fortuneSticks.map((stick, i) => (
                <motion.g
                  key={`stick-${i}`}
                  animate={isShaking ? {
                    y: [0, -10, 0],
                    rotate: [stick.rotate, stick.rotate + (i - 2) * 5, stick.rotate],
                  } : {}}
                  transition={{
                    duration: 0.15,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.02,
                  }}
                >
                  {/* Stick body */}
                  <rect
                    x={stick.x}
                    y={stick.y}
                    width="14"
                    height="85"
                    fill="#F5E6C8"
                    rx="2"
                    stroke="#DAA520"
                    strokeWidth="1"
                    transform={`rotate(${stick.rotate} ${stick.x + 7} ${stick.y + 85})`}
                  />
                  {/* Golden tip */}
                  <rect
                    x={stick.x}
                    y={stick.y}
                    width="14"
                    height="25"
                    fill="url(#imperialGold)"
                    rx="2"
                    transform={`rotate(${stick.rotate} ${stick.x + 7} ${stick.y + 85})`}
                  />
                  {/* Character */}
                  <text
                    x={stick.x + 7}
                    y={stick.y + 50}
                    textAnchor="middle"
                    fill="#8B0000"
                    fontSize="11"
                    fontWeight="bold"
                    style={{
                      writingMode: 'vertical-rl',
                      fontFamily: 'var(--font-serif)',
                    }}
                    transform={`rotate(${stick.rotate} ${stick.x + 7} ${stick.y + 85})`}
                  >
                    {stick.char}
                  </text>
                </motion.g>
              ))}

              {/* Tube body bottom */}
              <ellipse cx="110" cy="280" rx="72" ry="22" fill="#2A0000" />

              {/* Main tube */}
              <rect x="38" y="90" width="144" height="190" fill="url(#imperialRed)" rx="6" />

              {/* Inner shadow */}
              <rect x="38" y="90" width="144" height="190" fill="url(#innerShadow)" rx="6" opacity="0.3" />

              {/* Top rim */}
              <ellipse cx="110" cy="90" rx="72" ry="22" fill="#6B0000" />
              <ellipse cx="110" cy="90" rx="68" ry="18" fill="#2A0000" opacity="0.4" />

              {/* Golden belt - top */}
              <rect x="36" y="110" width="148" height="12" fill="url(#imperialGold)" rx="2" />

              {/* Golden belt buckle */}
              <circle cx="110" cy="116" r="18" fill="url(#buckleGold)" stroke="#B8860B" strokeWidth="2" />
              <circle cx="110" cy="116" r="12" fill="none" stroke="#8B0000" strokeWidth="2" />
              <text x="110" y="122" textAnchor="middle" fill="#8B0000" fontSize="14" fontWeight="bold">福</text>

              {/* Golden belt - bottom */}
              <rect x="36" y="250" width="148" height="12" fill="url(#imperialGold)" rx="2" />

              {/* Center ornament with "摇" */}
              <circle cx="110" cy="180" r="40" fill="url(#buckleGold)" stroke="#B8860B" strokeWidth="3" filter="url(#imperialGlow)" />
              <circle cx="110" cy="180" r="32" fill="none" stroke="#8B0000" strokeWidth="2" />
              <text
                x="110"
                y="195"
                textAnchor="middle"
                fill="#8B0000"
                fontSize="36"
                fontWeight="bold"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                摇
              </text>

              {/* Decorative patterns */}
              <path d="M50 150 Q110 160 170 150" fill="none" stroke="url(#imperialGold)" strokeWidth="2" opacity="0.6" />
              <path d="M50 220 Q110 230 170 220" fill="none" stroke="url(#imperialGold)" strokeWidth="2" opacity="0.6" />
            </svg>
          </motion.button>

          {/* Result display */}
          {showResult && stickNumber && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <div
                className="px-10 py-8 rounded-2xl shadow-2xl border-4"
                style={{
                  background: 'linear-gradient(135deg, #8B0000 0%, #A00000 50%, #8B0000 100%)',
                  borderColor: '#FFD700',
                  boxShadow: '0 0 40px rgba(255,215,0,0.5)',
                }}
              >
                <p className="text-sm mb-2 font-medium tracking-wide" style={{ color: '#FFA500' }}>
                  您抽到了
                </p>
                <p
                  className="text-5xl font-bold"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: '#FFD700',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
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
              className="font-medium text-lg"
              style={{ color: '#FFA500' }}
              animate={isShaking ? { opacity: [1, 0.6, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  求签中
                </span>
              ) : isShaking ? (
                '摇签中...'
              ) : (
                '按住屏幕或点击摇签'
              )}
            </motion.p>
          ) : (
            <p className="font-medium text-lg" style={{ color: '#FFA500' }}>
              正在为您解签...
            </p>
          )}
        </motion.div>

        {/* CTA Button with coin icon */}
        <motion.button
          variants={itemVariants}
          onClick={handleShakeStart}
          disabled={loading || showResult || isShaking}
          className="mt-8 px-12 py-4 rounded-full font-bold text-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%)',
            color: '#8B0000',
            boxShadow: '0 4px 20px rgba(255,215,0,0.4), inset 0 2px 4px rgba(255,255,255,0.5)',
            textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 6px 30px rgba(255,215,0,0.6)' }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="24" height="24" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#8B0000" stroke="#FFD700" strokeWidth="2" />
            <text x="20" y="26" textAnchor="middle" fill="#FFD700" fontSize="16" fontWeight="bold">¥</text>
          </svg>
          立即求签
        </motion.button>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-auto pt-8 pb-4 text-center">
          <p className="text-sm tracking-wider" style={{ color: '#FFD700', opacity: 0.8 }}>
            黄大仙100签 · 心诚则灵
          </p>
        </motion.div>
      </motion.div>

      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </main>
  );
}
