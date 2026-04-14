/**
 * 刷新数据库中所有时间戳相关数据
 * 将时间戳随机改为2026年4月10日往前的30天内随机生成
 */

require('dotenv').config(); // 加载环境变量
const mongoose = require('mongoose');

// 引入数据库连接
require('../db/connect');

// 引入所有模型以确保注册
require('../models/adminModel');
require('../models/userModel');
require('../models/bookModel');
require('../models/commentModel');
require('../models/interviewModel');
require('../models/issueModel');
require('../models/typeModel');

// 定义需要更新的集合和字段
const collectionsToUpdate = [
  { modelName: 'userModel', fields: ['registerDate', 'lastLoginDate'] },
  { modelName: 'bookModel', fields: ['onShelfDate'] },
  { modelName: 'issueModel', fields: ['issueDate'] },
  { modelName: 'commentModel', fields: ['commentDate'] },
  { modelName: 'interviewModel', fields: ['onShelfDate'] }
];

// 生成随机时间戳函数
// 范围：2026年3月11日 00:00:00 到 2026年4月10日 23:59:59
function generateRandomTimestamp() {
  const startDate = new Date('2026-03-11T00:00:00.000Z'); // UTC时间
  const endDate = new Date('2026-04-10T23:59:59.999Z');

  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  const randomTime = Math.floor(Math.random() * (endTime - startTime + 1)) + startTime;

  return randomTime.toString(); // 返回字符串格式，与原格式一致
}

// 更新集合的函数
async function updateCollection(modelName, fields) {
  const Model = mongoose.model(modelName);

  console.log(`开始更新模型: ${modelName}`);

  const documents = await Model.find({});
  console.log(`找到 ${documents.length} 个文档`);

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];

    // 更新每个字段
    fields.forEach(field => {
      if (doc[field] !== undefined) {
        doc[field] = generateRandomTimestamp();
      }
    });

    await doc.save();

    if ((i + 1) % 100 === 0) {
      console.log(`已更新 ${i + 1} 个文档`);
    }
  }

  console.log(`模型 ${modelName} 更新完成`);
}

// 主函数
async function refreshTimestamps() {
  try {
    console.log('开始刷新时间戳...');

    // 等待数据库连接
    await new Promise((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
    });

    for (const collection of collectionsToUpdate) {
      await updateCollection(collection.modelName, collection.fields);
    }

    console.log('所有时间戳刷新完成！');
  } catch (error) {
    console.error('刷新过程中出现错误:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 运行脚本
refreshTimestamps();
