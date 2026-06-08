import React, { useState } from 'react';
import { X, Plus, AlertTriangle, Ban, ArrowRightLeft, Users } from 'lucide-react';
import type { RuleType } from '../../types';
import { RULE_TYPE_OPTIONS } from '../../types';
import { useSeatingStore } from '../../store/useSeatingStore';

interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleModal: React.FC<RuleModalProps> = ({ isOpen, onClose }) => {
  const { rules, guests, addRule, removeRule } = useSeatingStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState({
    type: 'NOT_SAME_TABLE' as RuleType,
    guestAId: '',
    guestBId: '',
    value: 1,
    description: '',
  });

  if (!isOpen) return null;

  const getRuleIcon = (type: RuleType) => {
    switch (type) {
      case 'NOT_SAME_TABLE':
        return <Ban size={16} className="text-red-500" />;
      case 'MIN_TABLES_DISTANCE':
        return <ArrowRightLeft size={16} className="text-amber-500" />;
      case 'MUST_ADJACENT':
        return <Users size={16} className="text-green-500" />;
    }
  };

  const getRuleTypeLabel = (type: RuleType) => {
    return RULE_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type;
  };

  const getGuestName = (id: string) => {
    return guests.find(g => g.id === id)?.name || '未知';
  };

  const handleAddRule = () => {
    if (!newRule.guestAId || !newRule.guestBId || newRule.guestAId === newRule.guestBId) {
      alert('请选择两位不同的宾客');
      return;
    }

    addRule({
      type: newRule.type,
      guestAId: newRule.guestAId,
      guestBId: newRule.guestBId,
      value: newRule.type === 'MIN_TABLES_DISTANCE' ? newRule.value : undefined,
      description: newRule.description,
    });

    setNewRule({
      type: 'NOT_SAME_TABLE',
      guestAId: '',
      guestBId: '',
      value: 1,
      description: '',
    });
    setShowAddForm(false);
  };

  const handleRemoveRule = (id: string) => {
    if (confirm('确定要删除这条规则吗？')) {
      removeRule(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border-4 border-amber-200">
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} />
            <div>
              <h2 className="font-bold text-xl">冲突规则配置</h2>
              <p className="text-sm text-red-100">设置宾客座位禁忌与要求</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              添加新规则
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-inner">
              <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-amber-600" />
                新建规则
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">
                    规则类型
                  </label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as RuleType })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {RULE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} - {opt.description}
                      </option>
                    ))}
                  </select>
                </div>

                {newRule.type === 'MIN_TABLES_DISTANCE' && (
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">
                      至少间隔桌数
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newRule.value}
                      onChange={(e) => setNewRule({ ...newRule, value: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">
                    宾客 A
                  </label>
                  <select
                    value={newRule.guestAId}
                    onChange={(e) => setNewRule({ ...newRule, guestAId: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">请选择宾客</option>
                    {guests.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">
                    宾客 B
                  </label>
                  <select
                    value={newRule.guestBId}
                    onChange={(e) => setNewRule({ ...newRule, guestBId: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">请选择宾客</option>
                    {guests.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  规则说明（可选）
                </label>
                <input
                  type="text"
                  placeholder="如：前任情侣、婆媳关系等"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddRule}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  添加规则
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 bg-stone-200 text-stone-700 rounded-lg font-medium hover:bg-stone-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {guests.length === 0 && (
            <div className="text-center py-12 text-stone-400">
              <Users size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">请先添加宾客后再设置规则</p>
            </div>
          )}

          {rules.length === 0 && guests.length > 0 && (
            <div className="text-center py-12 text-stone-400">
              <AlertTriangle size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">暂无冲突规则</p>
              <p className="text-sm mt-1">点击上方按钮添加座位禁忌</p>
            </div>
          )}

          {rules.length > 0 && (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="group p-4 bg-white rounded-xl border-2 border-stone-100 hover:border-amber-200 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-stone-100 rounded-lg">
                        {getRuleIcon(rule.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800">
                            {getGuestName(rule.guestAId)}
                          </span>
                          <span className="px-2 py-0.5 bg-stone-100 text-xs font-medium rounded text-stone-600">
                            {getRuleTypeLabel(rule.type)}
                          </span>
                          <span className="font-bold text-stone-800">
                            {getGuestName(rule.guestBId)}
                          </span>
                          {rule.type === 'MIN_TABLES_DISTANCE' && (
                            <span className="text-sm text-amber-600 font-medium">
                              (间隔 ≥ {rule.value} 桌)
                            </span>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-sm text-stone-500 mt-1">
                            {rule.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRule(rule.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
