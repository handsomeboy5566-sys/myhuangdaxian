'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Download, Share2, Loader2 } from 'lucide-react';
import { FortuneStick } from '@/types/stick';
import html2canvas from 'html2canvas';

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

  // 如果服务端没有获取到数据，客户端通过 API 获取
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
        backgroundColor: '#FEF3C7',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `黄大仙第${stick?.id}签-${stick?.title}.png`;
      link.href = canvas.toDataURL();
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
      text: stick?.poem,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // 用户取消分享
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const getLevelColor = (level: string) => {
    if (level.includes('上')) return 'text-red-600 bg-red-50 border-red-200';
    if (level.includes('中')) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (level.includes('下')) return 'text-gray-600 bg-gray-50 border-gray-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!stick) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">签文未找到</p>
          <button
            onClick={handleGoHome}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-amber-50/80 backdrop-blur-sm border-b border-amber-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="p-2 hover:bg-amber-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-amber-800" />
          </button>
          <h1 className="text-lg font-bold text-amber-900">签文详解</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* 签文卡片 */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          ref={cardRef}
          className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-6 shadow-xl border-2 border-amber-200"
        >
          {/* 头部 */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-3xl font-bold text-amber-900">
                第 {stick.id} 签
              </span>
            </div>
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium border ${getLevelColor(stick.level)}`}>
              {stick.level}
            </div>
            <h2 className="text-xl font-bold text-amber-800 mt-2">
              {stick.title}
            </h2>
          </div>

          {/* 签诗 */}
          <div className="bg-white/60 rounded-xl p-4 mb-6 border border-amber-200">
            <h3 className="text-sm font-bold text-amber-700 mb-2 text-center">签诗</h3>
            <p className="text-amber-900 text-center whitespace-pre-line leading-relaxed font-medium">
              {stick.poem}
            </p>
          </div>

          {/* 寓意 */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-amber-700 mb-1 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full" />
              寓意
            </h3>
            <p className="text-amber-800 text-sm leading-relaxed pl-3">
              {stick.meaning}
            </p>
          </div>

          {/* 建议 */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-amber-700 mb-1 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full" />
              建议
            </h3>
            <p className="text-amber-800 text-sm leading-relaxed pl-3">
              {stick.advice}
            </p>
          </div>

          {/* 典故 */}
          <div className="border-t border-amber-200 pt-4">
            <h3 className="text-sm font-bold text-amber-700 mb-1 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full" />
              典故
            </h3>
            <p className="text-amber-700 text-sm leading-relaxed pl-3">
              {stick.story}
            </p>
          </div>

          {/* 底部装饰 */}
          <div className="text-center mt-6 pt-4 border-t border-amber-200/50">
            <p className="text-xs text-amber-500">黄大仙灵签 · 心诚则灵</p>
          </div>
        </motion.div>

        {/* 操作按钮 */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {saving ? '保存中...' : '保存图片'}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-amber-700 border-2 border-amber-200 rounded-xl font-medium hover:bg-amber-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            分享
          </button>
        </div>

        {/* 再抽一次 */}
        <button
          onClick={handleGoHome}
          className="w-full mt-4 py-3 text-amber-600 font-medium hover:text-amber-700 transition-colors"
        >
          再抽一次
        </button>
      </div>
    </main>
  );
}
