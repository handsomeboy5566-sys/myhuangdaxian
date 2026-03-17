'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Search, Lock, Unlock, Loader2, Plus, Trash2, X } from 'lucide-react';
import { FortuneStick } from '@/types/stick';

const ADMIN_PASSWORD = 'admin123';

// Easing
const easeOutQuart = [0.25, 1, 0.5, 1];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [sticks, setSticks] = useState<FortuneStick[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStick, setEditingStick] = useState<FortuneStick | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadSticks();
    }
  }, [isAuthenticated]);

  const loadSticks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sticks');
      const data = await response.json();
      if (data.success) {
        setSticks(data.data);
      }
    } catch (error) {
      console.error('加载签文失败:', error);
      alert('加载签文失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('密码错误');
    }
  };

  const handleSave = async () => {
    if (!editingStick) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/sticks/${editingStick.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: editingStick.level,
          title: editingStick.title,
          poem: editingStick.poem,
          meaning: editingStick.meaning,
          advice: editingStick.advice,
          story: editingStick.story,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSticks(sticks.map(s => s.id === editingStick.id ? data.data : s));
        setEditingStick(null);
        alert('签文已保存！');
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!editingStick) return;

    setSaving(true);
    try {
      const response = await fetch('/api/sticks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingStick.id,
          level: editingStick.level,
          title: editingStick.title,
          poem: editingStick.poem,
          meaning: editingStick.meaning,
          advice: editingStick.advice,
          story: editingStick.story,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSticks([...sticks, data.data].sort((a, b) => a.id - b.id));
        setEditingStick(null);
        setIsCreating(false);
        alert('新签文已创建！');
      } else {
        alert('创建失败: ' + data.error);
      }
    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`确定要删除第 ${id} 签吗？此操作不可恢复。`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/sticks/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        setSticks(sticks.filter(s => s.id !== id));
        alert('签文已删除！');
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    const maxId = sticks.length > 0 ? Math.max(...sticks.map(s => s.id)) : 0;
    setEditingStick({
      id: maxId + 1,
      level: '中平签',
      title: '',
      poem: '',
      meaning: '',
      advice: '',
      story: '',
    });
    setIsCreating(true);
  };

  const filteredSticks = sticks.filter(stick =>
    stick.title.includes(searchTerm) ||
    stick.poem.includes(searchTerm) ||
    stick.id.toString() === searchTerm
  );

  const getLevelColor = (level: string) => {
    if (level.includes('上')) return 'bg-red-100 text-red-700 border-red-200';
    if (level.includes('中')) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutQuart }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-amber-100"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Lock className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">管理后台登录</h1>
            <p className="text-sm text-gray-500">请输入密码继续</p>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                     transition-all duration-200 mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          <button
            onClick={handleLogin}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700
                     text-white rounded-xl font-semibold
                     hover:from-amber-700 hover:to-amber-800
                     active:scale-[0.98]
                     transition-all duration-200
                     shadow-lg shadow-amber-600/25"
          >
            登录
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Unlock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">签文管理后台</h1>
              <p className="text-xs text-gray-500">共 {sticks.length} 支签</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadSticks}
              disabled={loading}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-amber-600
                       hover:bg-amber-50 rounded-lg transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '刷新'}
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              退出
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white
                       rounded-xl font-medium hover:bg-amber-700
                       active:scale-[0.98] transition-all duration-200
                       shadow-lg shadow-amber-600/25"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">新增签文</span>
              <span className="sm:hidden">新增</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索签号、标题或签诗..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                     transition-all duration-200 shadow-sm"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filteredSticks.map((stick, index) => (
                <motion.div
                  key={stick.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03, duration: 0.3, ease: easeOutQuart }}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200
                           hover:shadow-md hover:border-amber-200
                           transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-lg font-bold text-gray-900">
                          第 {stick.id} 签
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getLevelColor(stick.level)}`}>
                          {stick.level}
                        </span>
                        <span className="text-gray-700 font-medium truncate">{stick.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{stick.poem}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingStick(stick)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50
                                 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(stick.id)}
                        disabled={deletingId === stick.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50
                                 rounded-lg transition-colors disabled:opacity-50"
                        title="删除"
                      >
                        {deletingId === stick.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredSticks.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200"
              >
                <p>没有找到匹配的签文</p>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {editingStick && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setEditingStick(null);
                setIsCreating(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: easeOutQuart }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {isCreating ? '新增签文' : `编辑第 ${editingStick.id} 签`}
                </h2>
                <button
                  onClick={() => {
                    setEditingStick(null);
                    setIsCreating(false);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
                {isCreating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">签号</label>
                    <input
                      type="number"
                      value={editingStick.id}
                      onChange={(e) => setEditingStick({ ...editingStick, id: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                               transition-all"
                      min={1}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">吉凶等级</label>
                    <select
                      value={editingStick.level}
                      onChange={(e) => setEditingStick({ ...editingStick, level: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                               transition-all"
                    >
                      <option value="上上签">上上签</option>
                      <option value="上吉签">上吉签</option>
                      <option value="中吉签">中吉签</option>
                      <option value="中平签">中平签</option>
                      <option value="下下签">下下签</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">典故标题</label>
                    <input
                      type="text"
                      value={editingStick.title}
                      onChange={(e) => setEditingStick({ ...editingStick, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                               transition-all"
                      placeholder="如：钟离成道"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">签诗</label>
                  <textarea
                    value={editingStick.poem}
                    onChange={(e) => setEditingStick({ ...editingStick, poem: e.target.value })}
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                             transition-all resize-none"
                    placeholder="输入四句签诗..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">寓意概要</label>
                    <textarea
                      value={editingStick.meaning}
                      onChange={(e) => setEditingStick({ ...editingStick, meaning: e.target.value })}
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                               transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">建议</label>
                    <textarea
                      value={editingStick.advice}
                      onChange={(e) => setEditingStick({ ...editingStick, advice: e.target.value })}
                      rows={3}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                               transition-all resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">典故详解</label>
                  <textarea
                    value={editingStick.story}
                    onChange={(e) => setEditingStick({ ...editingStick, story: e.target.value })}
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                             transition-all resize-none"
                    placeholder="输入典故故事..."
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingStick(null);
                    setIsCreating(false);
                  }}
                  disabled={saving}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl
                           transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={isCreating ? handleCreate : handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-medium
                           hover:bg-amber-700 active:scale-[0.98]
                           transition-all duration-200
                           disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? (isCreating ? '创建中...' : '保存中...') : (isCreating ? '创建签文' : '保存到数据库')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
