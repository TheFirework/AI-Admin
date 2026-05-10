import type { Dish } from '@/api'
import Mock from 'mockjs'

const dishNames = [
  '红烧肉', '宫保鸡丁', '糖醋里脊', '酸菜鱼', '拍黄瓜', '凉拌木耳',
  '夫妻肺片', '花生米', '青岛啤酒', '可乐', '米饭', '馒头', '蛋炒饭',
  '回锅肉', '水煮鱼', '麻婆豆腐', '鱼香肉丝', '蒜蓉西兰花', '清蒸鱼',
  '红烧排骨', '青椒肉丝', '土豆丝', '番茄炒蛋', '酸辣土豆丝', '红烧茄子',
  '炒青菜', '油焖大虾', '清蒸虾', '糖醋鱼', '辣子鸡', '炸鸡', '薯条',
  '汉堡', '披萨', '牛排', '意面', '寿司', '刺身', '天妇罗', '乌冬面'
]

const descriptions = [
  '精选食材，味道鲜美', '经典口味，回味无穷', '外酥里嫩，口感极佳',
  '鲜嫩可口，营养丰富', '清爽开胃，老少皆宜', '麻辣鲜香，越吃越香',
  '传统工艺，匠心制作', '口感爽脆，风味独特', '清爽解渴，畅饮无限',
  '酸甜可口，回味无穷', '粒粒分明，香气扑鼻', '松软可口，营养丰富',
  '香气四溢，食欲大增', '麻辣过瘾，回味无穷', '滑嫩爽口，百吃不厌',
  '酸甜适中，美味可口', '鲜香四溢，口感细腻', '清淡爽口，健康美味',
  '鲜嫩多汁，入口即化', '酱香浓郁，肉质鲜嫩', '香辣可口，下饭神器',
  '清爽脆嫩，简单美味', '酸甜可口，家常美味', '酸辣开胃，食欲大开',
  '软糯入味，香气扑鼻', '清脆爽口，营养健康', '鲜嫩Q弹，鲜美无比',
  '鲜嫩滑爽，原汁原味', '酸甜酥脆，外焦里嫩', '香辣过瘾，回味无穷',
  '酥脆可口，香气扑鼻', '金黄酥脆，美味可口', '鲜嫩多汁，风味独特',
  '香浓芝士，口感丰富', '鲜嫩多汁，肉香四溢', '弹牙劲道，口感爽滑',
  '新鲜美味，口感细腻', '鲜美无比，入口即化', '酥脆可口，香气十足',
  '劲道爽滑，汤鲜味美'
]

const numDishes = Mock.Random.integer(30, 40)
export const mockDishes: Dish[] = Array.from({ length: numDishes }, (_, index) => {
  const price = Mock.Random.integer(10, 100)
  const stock = Mock.Random.integer(0, 50)
  return {
    id: index + 1,
    name: Mock.Random.pick(dishNames),
    categoryId: Mock.Random.integer(1, 4),
    price,
    originalPrice: price + Mock.Random.integer(5, 20),
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=chinese%20food%20dish%20photography&image_size=portrait_4_3',
    stock,
    isOnSale: stock > 0,
    description: Mock.Random.pick(descriptions),
    sales: Mock.Random.integer(50, 500),
    likes: Mock.Random.integer(20, 200)
  }
})

export let dishIdCounter = mockDishes.length + 1

export function getNextDishId(): number {
  return dishIdCounter++
}
