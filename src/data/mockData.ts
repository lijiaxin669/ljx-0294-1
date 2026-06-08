import type { Guest, Table, Rule, Seniority } from '../types';
import { generateId } from '../utils/idGenerator';
import { getRandomAvatarColor } from '../utils/colors';

const createGuest = (name: string, seniority: Seniority, dietaryNote: string = ''): Guest => ({
  id: generateId(),
  name,
  seniority,
  dietaryNote,
  avatarColor: getRandomAvatarColor(),
  createdAt: Date.now(),
});

export const mockGuests: Guest[] = [
  createGuest('张爷爷', 'elder', '糖尿病，忌甜食'),
  createGuest('张奶奶', 'elder', '高血压，少盐'),
  createGuest('王大爷', 'elder', ''),
  createGuest('李姥姥', 'elder', '素食'),
  createGuest('张建国', 'peer', ''),
  createGuest('张美玲', 'peer', '海鲜过敏'),
  createGuest('王建国', 'peer', ''),
  createGuest('李淑芬', 'peer', ''),
  createGuest('张小明', 'junior', '不吃香菜'),
  createGuest('张小红', 'junior', '乳糖不耐受'),
  createGuest('王大伟', 'junior', ''),
  createGuest('李小美', 'junior', '坚果过敏'),
  createGuest('张卫国', 'peer', '前任-张美玲'),
  createGuest('刘建国', 'peer', ''),
  createGuest('陈阿姨', 'peer', '宝妈，需挨着孩子'),
  createGuest('小宝', 'junior', '3岁，需宝妈照顾'),
  createGuest('张建军', 'peer', ''),
  createGuest('王丽华', 'peer', ''),
  createGuest('张子轩', 'junior', ''),
  createGuest('张雨晴', 'junior', ''),
];

export const mockTables: Table[] = [
  {
    id: generateId(),
    name: '主桌',
    capacity: 10,
    x: 400,
    y: 350,
    createdAt: Date.now(),
  },
  {
    id: generateId(),
    name: '二桌',
    capacity: 10,
    x: 900,
    y: 350,
    createdAt: Date.now(),
  },
];

export const createInitialRules = (guests: Guest[]): Rule[] => {
  const zhangWeiguo = guests.find(g => g.name === '张卫国');
  const zhangMeiling = guests.find(g => g.name === '张美玲');
  const chenAyi = guests.find(g => g.name === '陈阿姨');
  const xiaoBao = guests.find(g => g.name === '小宝');
  const zhangYeye = guests.find(g => g.name === '张爷爷');
  const zhangNainai = guests.find(g => g.name === '张奶奶');

  const rules: Rule[] = [];

  if (zhangWeiguo && zhangMeiling) {
    rules.push({
      id: generateId(),
      type: 'NOT_SAME_TABLE',
      guestAId: zhangWeiguo.id,
      guestBId: zhangMeiling.id,
      description: '❌ 张卫国与张美玲为前任情侣，不可同桌',
    });
  }

  if (chenAyi && xiaoBao) {
    rules.push({
      id: generateId(),
      type: 'MUST_ADJACENT',
      guestAId: chenAyi.id,
      guestBId: xiaoBao.id,
      description: '⚠️ 陈阿姨需挨着孩子小宝就坐',
    });
  }

  if (zhangYeye && zhangNainai) {
    rules.push({
      id: generateId(),
      type: 'MUST_ADJACENT',
      guestAId: zhangYeye.id,
      guestBId: zhangNainai.id,
      description: '⚠️ 爷爷奶奶需相邻就坐',
    });
  }

  return rules;
};

export const generateMockGuests = (count: number): Guest[] => {
  const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];
  const names = ['伟', '芳', '娜', '敏', '静', '强', '磊', '军', '洋', '勇',
                 '艳', '杰', '涛', '明', '超', '秀英', '华', '丽', '桂英', '玉兰'];
  const seniorities: Seniority[] = ['elder', 'peer', 'junior'];
  const dietaryNotes = ['', '海鲜过敏', '素食', '糖尿病', '高血压', '不吃辣', '坚果过敏'];

  const guests: Guest[] = [];
  for (let i = 0; i < count; i++) {
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const seniority = seniorities[Math.floor(Math.random() * seniorities.length)];
    const dietaryNote = dietaryNotes[Math.floor(Math.random() * dietaryNotes.length)];
    guests.push(createGuest(`${surname}${name}${i > 19 ? i : ''}`, seniority, dietaryNote));
  }
  return guests;
};
