'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Download, Share2, Loader2 } from 'lucide-react';
import { FortuneStick } from '@/types/stick';
import html2canvas from 'html2canvas';

// Easing curves
const easeOutQuart = [0.25, 1, 0.5, 1];

// Animation variants
const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: easeOutQuart,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easeOutQuart,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: easeOutQuart,
    },
  },
};

interface StickDetailClientProps {
  initialStick: FortuneStick | null;
}

export default function StickDetailClient({ initialStick }: StickDetailClientProps) {
  const router = useRouter();
  const params = useParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [stick, setStick] = useState<FortuneStick | null>(initialStick);
  const [loading, setLoading] = useState(!initialStick);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialStick && params.id) {
      const fetchStick = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/sticks/${params.id}`);
          const data = await response.json();
          if (data.success) {
            setStick(data.data);
          }
        } catch (error) {
          console.error('获取签文失败:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchStick();
    }
  }, [initialStick, params.id]);

  const handleSave = async () => {
    if (!cardRef.current || saving) return;

    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#fef3c7',
        scale: 3,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `黄大仙第${stick?.id}签-${stick?.title}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      alert('保存图片失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleShare = async () => {
    const shareData = {
      title: `黄大仙第${stick?.id}签 - ${stick?.title}`,
      text: `${stick?.poem}\n\n${stick?.meaning}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // 用户取消分享
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const getLevelStyle = (level: string) => {
    if (level.includes('上上'))
      return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200';
    if (level.includes('上吉'))
      return 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-orange-200';
    if (level.includes('中吉'))
      return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200';
    if (level.includes('中平'))
      return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200';
    if (level.includes('下'))
      return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200';
    return 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
          <p className="text-amber-700 text-sm">加载中...</p>
        </motion.div>
      </div>
    );
  }

  if (!stick) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-sm"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🙏</span>
          </div>
          <p className="text-red-600 mb-6 font-medium">签文未找到</p>
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl font-medium
                     hover:bg-amber-700 active:bg-amber-800
                     transition-all duration-200 ease-out
                     shadow-lg shadow-amber-600/20"
          >
            返回首页
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100"
    >
      {/* Navigation header */}
      <header className="sticky top-0 z-50 bg-amber-50/90 backdrop-blur-md border-b border-amber-200/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="p-2.5 -ml-2 rounded-xl hover:bg-amber-100 active:bg-amber-200
                     transition-colors duration-200 group"
            aria-label="返回"
          >
            <ArrowLeft className="w-5 h-5 text-amber-800 group-hover:text-amber-900" />
          </button>

          <h1 className="text-lg font-bold text-amber-900" style={{ fontFamily: 'var(--font-serif)' }}>
            签文详解
          </h1>

          <div className="w-9" />
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          ref={cardRef}
          className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50
                   rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-200/60"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 0%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 100%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)
            `,
          }}
        >
          {/* Header */}
          <motion.div variants={sectionVariants} className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <span
                className="text-4xl sm:text-5xl font-bold text-amber-900 tracking-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                第 {stick.id} 签
              </span>
            </div>

            <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold border ${getLevelStyle(stick.level)}`}>
              {stick.level}
            </div>

            <h2
              className="text-xl sm:text-2xl font-bold text-amber-800 mt-3"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {stick.title}
            </h2>
          </motion.div>

          {/* Poem card */}
          <motion.div
            variants={sectionVariants}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 mb-6
                     border border-amber-200/50 shadow-inner"
          >
            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3 text-center">
              签诗
            </h3>
            <p
              className="text-amber-900 text-center whitespace-pre-line leading-loose font-medium text-lg"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {stick.poem}
            </p>
          </motion.div>

          {/* Meaning */}
          <motion.div variants={sectionVariants} className="mb-5">
            <h3 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
              寓意
            </h3>
            <p className="text-amber-800 leading-relaxed pl-3">
              {stick.meaning}
            </p>
          </motion.div>

          {/* Advice */}
          <motion.div variants={sectionVariants} className="mb-5">
            <h3 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
              建议
            </h3>
            <p className="text-amber-800 leading-relaxed pl-3">
              {stick.advice}
            </p>
          </motion.div>

          {/* Story */}
          <motion.div variants={sectionVariants} className="border-t border-amber-200/60 pt-5">
            <h3 className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full" />
              典故
            </h3>
            <p className="text-amber-700/90 leading-relaxed pl-3 text-sm">
              {stick.story}
            </p>
          </motion.div>

          {/* Footer decoration */}
          <motion.div
            variants={sectionVariants}
            className="text-center mt-8 pt-6 border-t border-amber-200/40"
          >
            <p className="text-xs text-amber-500/70 tracking-widest uppercase">
              黄大仙灵签 · 心诚则灵
            </p>
          </motion.div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: easeOutQuart }}
          className="flex gap-3 mt-6"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3.5
                     bg-gradient-to-r from-amber-600 to-amber-700
                     text-white rounded-2xl font-semibold
                     hover:from-amber-700 hover:to-amber-800
                     active:scale-[0.98]
                     transition-all duration-200
                     shadow-lg shadow-amber-600/25
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {saving ? '保存中...' : '保存图片'}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3.5
                     bg-white text-amber-700
                     border-2 border-amber-200
                     rounded-2xl font-semibold
                     hover:bg-amber-50 hover:border-amber-300
                     active:scale-[0.98]
                     transition-all duration-200"
          >
            <Share2 className="w-5 h-5" />
            分享
          </button>
        </motion.div>

        {/* Draw again */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleGoHome}
          className="w-full mt-4 py-4 text-amber-600 font-semibold
                   hover:text-amber-700 hover:bg-amber-100/50
                   rounded-xl transition-colors duration-200"
        >
          再抽一次
        </motion.button>
      </div>
    </motion.main>
  );
}
