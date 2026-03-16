'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Search, Lock, Unlock, Loader2, Plus, Trash2 } from 'lucide-react';
import { FortuneStick } from '@/types/stick';

const ADMIN_PASSWORD = 'admin123';

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

  // 从API加载签文数据
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
      } else {
        alert('加载签文失败: ' + data.error);
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        // 更新本地列表
        setSticks(sticks.map(s => s.id === editingStick.id ? data.data : s));
        setEditingStick(null);
        alert('签文已保存到数据库！');
      } else {
        alert('保存失败: ' + data.error);
      }
    } catch (error) {
      console.error('保存签文失败:', error);
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        // 添加到本地列表
        setSticks([...sticks, data.data].sort((a, b) => a.id - b.id));
        setEditingStick(null);
        setIsCreating(false);
        alert('新签文已创建！');
      } else {
        alert('创建失败: ' + data.error);
      }
    } catch (error) {
      console.error('创建签文失败:', error);
      alert('创建失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`确定要删除第 ${id} 签吗？此操作不可恢复。`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/sticks/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // 从本地列表移除
        setSticks(sticks.filter(s => s.id !== id));
        alert('签文已删除！');
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('删除签文失败:', error);
      alert('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    // 找到下一个可用的ID
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">管理后台登录</h1>
            <p className="text-sm text-gray-500 mt-1">请输入密码继续</p>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            登录
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
              <Unlock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">签文管理后台</h1>
              <p className="text-xs text-gray-500">共 {sticks.length} 支签 (数据库存储)</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadSticks}
              className="text-sm text-amber-600 hover:text-amber-700"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '刷新数据'}
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              退出登录
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增签文
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索签号、标题或签诗..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSticks.map((stick) => (
              <motion.div
                key={stick.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-gray-800">
                        第 {stick.id} 签
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        stick.level.includes('上') ? 'bg-red-100 text-red-600' :
                        stick.level.includes('中') ? 'bg-amber-100 text-amber-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {stick.level}
                      </span>
                      <span className="text-gray-600 font-medium">{stick.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{stick.poem}</p>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => setEditingStick(stick)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(stick.id)}
                      disabled={deletingId === stick.id}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === stick.id ? (
                        <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredSticks.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            没有找到匹配的签文
          </div>
        )}
      </main>

      {editingStick && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {isCreating ? '新增签文' : `编辑第 ${editingStick.id} 签`}
              </h2>
              <button
                onClick={() => {
                  setEditingStick(null);
                  setIsCreating(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isCreating && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">签号</label>
                  <input
                    type="number"
                    value={editingStick.id}
                    onChange={(e) => setEditingStick({ ...editingStick, id: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min={1}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">吉凶等级</label>
                <select
                  value={editingStick.level}
                  onChange={(e) => setEditingStick({ ...editingStick, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="上上签">上上签</option>
                  <option value="上吉签">上吉签</option>
                  <option value="中吉签">中吉签</option>
                  <option value="中平签">中平签</option>
                  <option value="下下签">下下签</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">典故标题</label>
                <input
                  type="text"
                  value={editingStick.title}
                  onChange={(e) => setEditingStick({ ...editingStick, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">签诗</label>
                <textarea
                  value={editingStick.poem}
                  onChange={(e) => setEditingStick({ ...editingStick, poem: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">寓意概要</label>
                <textarea
                  value={editingStick.meaning}
                  onChange={(e) => setEditingStick({ ...editingStick, meaning: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">建议</label>
                <textarea
                  value={editingStick.advice}
                  onChange={(e) => setEditingStick({ ...editingStick, advice: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">典故详解</label>
                <textarea
                  value={editingStick.story}
                  onChange={(e) => setEditingStick({ ...editingStick, story: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingStick(null);
                  setIsCreating(false);
                }}
                disabled={saving}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={isCreating ? handleCreate : handleSave}
                disabled={saving}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? (isCreating ? '创建中...' : '保存中...') : (isCreating ? '创建签文' : '保存到数据库')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
