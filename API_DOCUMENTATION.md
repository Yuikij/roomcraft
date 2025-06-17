# 家居物品管理系统 - API 接口文档

## 概述

本文档定义了家居物品管理系统的完整 RESTful API 接口，支持房间管理、家具布局、物品库存、过期管理、库存管理和整理功能等核心业务。

## 前后端职责分工

基于当前localStorage存储结构分析，明确前后端职责：

### 🎯 前端职责 (客户端处理)
- **实时交互状态**：拖拽过程中的临时位置显示
- **本地缓存管理**：减少API调用的临时状态缓存
- **UI状态控制**：模态框、展开折叠、高亮效果
- **数据验证**：表单输入的基础验证
- **数据计算**：基于现有数据的实时计算（统计、过滤、排序）
- **通知显示**：基于API数据生成的前端通知展示
- **路由和导航**：页面跳转和URL参数管理

### 🚀 后端职责 (API处理)
- **数据持久化**：所有CRUD操作的最终数据存储
- **业务逻辑**：复杂的业务规则计算和验证
- **数据一致性**：跨表关联和事务处理
- **认证授权**：用户身份验证和权限控制
- **数据聚合**：复杂查询和统计分析
- **文件管理**：图片上传、存储和CDN服务
- **通知推送**：实时通知的生成和推送
- **数据备份**：定时备份和恢复服务

## 基础信息

- **API 版本**: v1
- **基础路径**: `/api/v1`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": []
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 分页响应

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "查询成功",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 1. 房间管理 API

### 1.1 获取房间列表

```http
GET /api/v1/rooms
```

**查询参数**:
- `page` (integer, optional): 页码，默认 1
- `size` (integer, optional): 每页大小，默认 20
- `type` (string, optional): 房间类型过滤
- `search` (string, optional): 名称搜索关键词

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-string",
        "name": "我的卧室",
        "type": "bedroom",
        "color": "#3B82F6",
        "description": "主卧室",
        "globalX": 50,
        "globalY": 50,
        "globalWidth": 200,
        "globalHeight": 150,
        "furnitureCount": 3,
        "itemCount": 15,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### 1.2 获取房间详情

```http
GET /api/v1/rooms/{roomId}
```

**路径参数**:
- `roomId` (string, required): 房间ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "name": "我的卧室",
    "type": "bedroom",
    "color": "#3B82F6",
    "description": "主卧室",
    "globalX": 50,
    "globalY": 50,
    "globalWidth": 200,
    "globalHeight": 150,
    "furniture": [
      {
        "id": "furniture-uuid",
        "name": "衣柜",
        "type": "wardrobe",
        "x": 50,
        "y": 50,
        "width": 150,
        "height": 60,
        "color": "#8b7355",
        "compartments": [
          {
            "id": "compartment-uuid",
            "name": "上层",
            "type": "shelf",
            "sortOrder": 0
          }
        ]
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 1.3 创建房间

```http
POST /api/v1/rooms
```

**请求体**:
```json
{
  "name": "新房间",
  "type": "bedroom",
  "color": "#3B82F6",
  "description": "房间描述",
  "globalX": 50,
  "globalY": 50,
  "globalWidth": 200,
  "globalHeight": 150
}
```

### 1.4 更新房间

```http
PUT /api/v1/rooms/{roomId}
```

**请求体**: 同创建房间

### 1.5 删除房间

```http
DELETE /api/v1/rooms/{roomId}
```

### 1.6 更新房间全局位置

```http
PATCH /api/v1/rooms/{roomId}/position
```

**请求体**:
```json
{
  "globalX": 100,
  "globalY": 100,
  "globalWidth": 220,
  "globalHeight": 170
}
```

**说明**：
- 前端负责拖拽过程中的实时位置显示
- 拖拽结束后调用此API保存最终位置
- 支持批量更新多个房间位置

## 2. 家具管理 API

### 2.1 获取房间家具列表

```http
GET /api/v1/rooms/{roomId}/furniture
```

### 2.2 获取家具详情

```http
GET /api/v1/furniture/{furnitureId}
```

### 2.3 创建家具

```http
POST /api/v1/rooms/{roomId}/furniture
```

**请求体**:
```json
{
  "name": "新衣柜",
  "type": "wardrobe",
  "x": 50,
  "y": 50,
  "width": 150,
  "height": 60,
  "color": "#8b7355",
  "description": "主衣柜"
}
```

### 2.4 更新家具

```http
PUT /api/v1/furniture/{furnitureId}
```

### 2.5 删除家具

```http
DELETE /api/v1/furniture/{furnitureId}
```

### 2.6 更新家具位置

```http
PATCH /api/v1/furniture/{furnitureId}/position
```

**请求体**:
```json
{
  "x": 100,
  "y": 100,
  "width": 160,
  "height": 70,
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**说明**：
- 前端负责拖拽和调整大小的实时预览
- 操作完成后调用此API保存位置变更
- updatedAt字段由前端提供，确保时间戳一致性

## 3. 家具分区管理 API

### 3.1 获取家具分区列表

```http
GET /api/v1/furniture/{furnitureId}/compartments
```

### 3.2 创建分区

```http
POST /api/v1/furniture/{furnitureId}/compartments
```

**请求体**:
```json
{
  "name": "上层",
  "type": "shelf",
  "sortOrder": 0
}
```

### 3.3 更新分区

```http
PUT /api/v1/compartments/{compartmentId}
```

### 3.4 删除分区

```http
DELETE /api/v1/compartments/{compartmentId}
```

## 4. 物品管理 API

### 4.1 获取物品列表

```http
GET /api/v1/items
```

**查询参数**:
- `page` (integer, optional): 页码，默认 1
- `size` (integer, optional): 每页大小，默认 20
- `roomId` (string, optional): 房间ID过滤
- `category` (string, optional): 物品类别过滤
- `status` (string, optional): 状态过滤 (active, archived, discarded)
- `search` (string, optional): 名称搜索关键词
- `hasExpiryManagement` (boolean, optional): 是否启用过期管理
- `hasStockManagement` (boolean, optional): 是否启用库存管理

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid-string",
        "name": "夏季T恤",
        "category": "clothing",
        "description": "白色棉质T恤",
        "quantity": 3,
        "roomId": "room-uuid",
        "roomName": "我的卧室",
        "furnitureId": "furniture-uuid",
        "furnitureName": "衣柜",
        "compartmentId": "compartment-uuid",
        "compartmentName": "上层",
        "x": 100,
        "y": 100,
        "width": 60,
        "height": 40,
        "tags": ["夏季", "日常"],
        "status": "active",
        "imageUrl": "https://example.com/image.jpg",
        "lastUsed": "2024-01-01T00:00:00Z",
        "hasExpiryManagement": false,
        "hasStockManagement": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### 4.2 获取物品详情

```http
GET /api/v1/items/{itemId}
```

### 4.3 创建物品

```http
POST /api/v1/items
```

**请求体**:
```json
{
  "name": "新物品",
  "category": "other",
  "description": "物品描述",
  "quantity": 1,
  "roomId": "room-uuid",
  "furnitureId": "furniture-uuid",
  "compartmentId": "compartment-uuid",
  "tags": ["标签1", "标签2"],
  "hasExpiryManagement": true,
  "purchaseDate": "2024-01-01",
  "expiryDate": "2024-12-31",
  "reminderEnabled": true,
  "reminderDays": 7,
  "hasStockManagement": true,
  "minStock": 2,
  "maxStock": 10,
  "stockUnit": "个"
}
```

### 4.4 更新物品

```http
PUT /api/v1/items/{itemId}
```

### 4.5 删除物品

```http
DELETE /api/v1/items/{itemId}
```

### 4.6 更新物品位置

```http
PATCH /api/v1/items/{itemId}/position
```

**请求体**:
```json
{
  "x": 120,
  "y": 120,
  "width": 70,
  "height": 50,
  "roomId": "room-uuid",
  "furnitureId": "furniture-uuid", 
  "compartmentId": "compartment-uuid"
}
```

**说明**：
- 支持物品在房间内的自由拖拽（无家具约束）
- 支持物品在家具分区间的移动
- 前端处理拖拽的实时位置显示，完成后调用API持久化
- 位置变更可能涉及所属容器的改变

### 4.7 更新物品库存

```http
PATCH /api/v1/items/{itemId}/stock
```

**请求体**:
```json
{
  "quantity": 5,
  "operation": "set",
  "notes": "手动调整库存"
}
```

### 4.8 批量更新物品

```http
PATCH /api/v1/items/batch
```

**请求体**:
```json
{
  "itemIds": ["uuid1", "uuid2"],
  "updates": {
    "roomId": "new-room-id",
    "furnitureId": "new-furniture-id",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 4.9 标记物品为最近使用

```http
PATCH /api/v1/items/{itemId}/use
```

**请求体**:
```json
{
  "usedAt": "2024-01-01T00:00:00Z"
}
```

### 4.10 上传物品图片

```http
POST /api/v1/items/{itemId}/image
```

**请求体** (multipart/form-data):
- `image` (file): 图片文件

**响应示例**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://example.com/uploads/items/uuid.jpg"
  }
}
```

### 4.11 删除物品图片

```http
DELETE /api/v1/items/{itemId}/image
```

## 5. 搜索 API

### 5.1 全局搜索

```http
GET /api/v1/search
```

**查询参数**:
- `q` (string, required): 搜索关键词
- `type` (string, optional): 搜索类型 (items, rooms, furniture, all)
- `page` (integer, optional): 页码
- `size` (integer, optional): 每页大小

**说明**：
- 前端负责实时搜索的UI响应和防抖处理
- 复杂搜索逻辑（如全文检索）由后端处理
- 支持搜索结果的缓存优化

## 6. 过期管理 API

### 6.1 获取过期物品列表

```http
GET /api/v1/expiry/items
```

**查询参数**:
- `status` (string, optional): 过期状态 (expired, near_expiry, fresh, all)
- `showConsumed` (boolean, optional): 是否显示已消耗物品，默认false

**说明**：
- 前端负责过期状态的实时计算和展示
- 后端提供基础数据，前端根据当前时间计算过期状态
- 支持过期物品的分类和排序

### 6.2 获取过期通知

```http
GET /api/v1/expiry/notifications
```

**说明**：
- 后端生成通知数据，前端负责通知的展示和交互
- 通知的显示逻辑（弹窗、提示条）由前端控制
- 支持通知的本地缓存和状态管理

### 6.3 标记物品为已消耗

```http
POST /api/v1/items/{itemId}/consume
```

### 6.4 批量处理过期物品

```http
POST /api/v1/expiry/batch-consume
```

**请求体**:
```json
{
  "itemIds": ["uuid1", "uuid2", "uuid3"]
}
```

### 6.5 忽略过期提醒

```http
DELETE /api/v1/expiry/notifications/{notificationId}
```

## 7. 库存管理 API

### 7.1 获取库存统计

```http
GET /api/v1/stock/statistics
```

### 7.2 获取库存不足物品

```http
GET /api/v1/stock/low-stock
```

### 7.3 获取缺货物品

```http
GET /api/v1/stock/out-of-stock
```

### 7.4 获取库存通知

```http
GET /api/v1/stock/notifications
```

### 7.5 标记库存通知为已读

```http
POST /api/v1/stock/notifications/mark-read
```

**请求体**:
```json
{
  "notificationIds": ["notification1", "notification2"]
}
```

### 7.6 更新库存阈值

```http
PATCH /api/v1/items/{itemId}/stock-thresholds
```

**请求体**:
```json
{
  "minStock": 5,
  "maxStock": 20,
  "stockUnit": "个"
}
```

## 8. 整理模式 API

### 8.1 获取整理候选物品

```http
GET /api/v1/organization/candidates
```

### 8.2 创建整理活动

```http
POST /api/v1/organization/activities
```

### 8.3 记录整理决定

```http
POST /api/v1/organization/activities/{activityId}/decisions
```

### 8.4 完成整理活动

```http
POST /api/v1/organization/activities/{activityId}/complete
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "activityId": "activity-uuid",
    "totalItems": 15,
    "keptItems": 10,
    "discardedItems": 5,
    "completedAt": "2024-01-01T00:00:00Z",
    "summary": {
      "categoriesProcessed": ["clothing", "books"],
      "spaceSaved": "估计节省了30%的存储空间",
      "recommendations": ["建议定期整理衣物", "考虑捐赠不需要的书籍"]
    }
  }
}
```

### 8.5 获取整理活动历史

```http
GET /api/v1/organization/activities
```

**查询参数**:
- `page` (integer, optional): 页码，默认 1
- `size` (integer, optional): 每页大小，默认 20
- `status` (string, optional): 活动状态过滤

**响应示例**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "activity-uuid",
        "title": "春季衣物整理",
        "status": "completed",
        "totalItems": 20,
        "processedItems": 20,
        "keptItems": 15,
        "discardedItems": 5,
        "startedAt": "2024-01-01T10:00:00Z",
        "completedAt": "2024-01-01T11:30:00Z",
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### 8.6 重置整理候选物品

```http
POST /api/v1/organization/reset-candidates
```

**请求体**:
```json
{
  "thresholdMonths": 6
}
```

## 9. 仪表盘 API

### 9.1 获取仪表盘数据

```http
GET /api/v1/dashboard
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalRooms": 5,
      "totalItems": 150,
      "totalFurniture": 20,
      "lowStockItems": 8,
      "expiredItems": 3,
      "nearExpiryItems": 12
    },
    "recentItems": [
      {
        "id": "item-uuid",
        "name": "新添加的物品",
        "category": "electronics",
        "quantity": 1,
        "roomName": "书房",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "stockAlerts": [
      {
        "id": "alert-uuid",
        "type": "low_stock",
        "message": "充电器库存不足",
        "itemId": "item-uuid",
        "priority": "medium"
      }
    ],
    "expiryAlerts": [
      {
        "id": "alert-uuid",
        "type": "near_expiry",
        "message": "牛奶将在3天后过期",
        "itemId": "item-uuid",
        "priority": "high"
      }
    ],
    "roomsOverview": [
      {
        "id": "room-uuid",
        "name": "卧室",
        "itemCount": 25,
        "furnitureCount": 4,
        "lowStockCount": 2,
        "expiredCount": 0
      }
    ]
  }
}
```

## 10. 系统配置 API

### 10.1 获取系统配置

```http
GET /api/v1/settings
```

### 10.2 更新系统配置

```http
PUT /api/v1/settings/{key}
```

**请求体**:
```json
{
  "value": "配置值"
}
```

### 10.3 批量更新系统配置

```http
PATCH /api/v1/settings
```

**请求体**:
```json
{
  "defaultExpiryReminderDays": 7,
  "defaultStockThresholds": {
    "clothing": 5,
    "food": 3,
    "medicine": 2
  },
  "organizationThresholdMonths": 6
}
```

## 11. 通知管理 API

### 11.1 获取所有通知

```http
GET /api/v1/notifications
```

**查询参数**:
- `type` (string, optional): 通知类型 (expiry, stock, organization, system)
- `status` (string, optional): 通知状态 (unread, read, dismissed)
- `page` (integer, optional): 页码
- `size` (integer, optional): 每页大小

### 11.2 标记通知为已读

```http
PATCH /api/v1/notifications/mark-read
```

**请求体**:
```json
{
  "notificationIds": ["uuid1", "uuid2"]
}
```

### 11.3 忽略通知

```http
DELETE /api/v1/notifications/dismiss
```

**请求体**:
```json
{
  "notificationIds": ["uuid1", "uuid2"]
}
```

### 11.4 获取未读通知数量

```http
GET /api/v1/notifications/unread-count
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 15,
    "byType": {
      "expiry": 8,
      "stock": 5,
      "organization": 2,
      "system": 0
    }
  }
}
```

## 12. 文件上传 API

### 12.1 通用文件上传

```http
POST /api/v1/files/upload
```

**请求体** (multipart/form-data):
- `file` (file): 文件
- `type` (string): 文件类型 (item_image, room_image, etc.)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "fileId": "file-uuid",
    "url": "https://example.com/uploads/file.jpg",
    "filename": "original-filename.jpg",
    "size": 1024000,
    "contentType": "image/jpeg"
  }
}
```

### 12.2 删除文件

```http
DELETE /api/v1/files/{fileId}
```

## 13. 数据同步 API

### 13.1 批量同步数据

```http
POST /api/v1/sync/batch
```

**请求体**:
```json
{
  "rooms": [
    {
      "id": "room-uuid",
      "operation": "update", 
      "data": {
        "globalX": 100,
        "globalY": 100,
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    }
  ],
  "items": [
    {
      "id": "item-uuid", 
      "operation": "update",
      "data": {
        "x": 50,
        "y": 50,
        "lastUsed": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    }
  ]
}
```

**说明**：
- 支持多个实体的批量操作
- 减少频繁的单个API调用
- 适用于复杂操作完成后的数据同步

### 13.2 获取数据更新时间戳

```http
GET /api/v1/sync/timestamps
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "rooms": {
      "room-uuid1": "2024-01-01T00:00:00Z",
      "room-uuid2": "2024-01-02T00:00:00Z"
    },
    "items": {
      "item-uuid1": "2024-01-01T00:00:00Z"
    },
    "lastSync": "2024-01-01T00:00:00Z"
  }
}
```

**说明**：
- 用于前端判断本地数据是否需要更新
- 支持增量同步策略
- 减少不必要的数据传输

### 13.3 增量数据同步

```http
GET /api/v1/sync/delta
```

**查询参数**:
- `since` (string, required): 上次同步时间戳
- `types` (string, optional): 需要同步的数据类型，逗号分隔

## 14. 统计分析 API

### 14.1 获取使用统计

```http
GET /api/v1/analytics/usage
```

**查询参数**:
- `startDate` (string, optional): 开始日期 (YYYY-MM-DD)
- `endDate` (string, optional): 结束日期 (YYYY-MM-DD)
- `granularity` (string, optional): 统计粒度 (daily, weekly, monthly)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "itemAdditions": [
      {"date": "2024-01-01", "count": 5},
      {"date": "2024-01-02", "count": 3}
    ],
    "organizationActivities": [
      {"date": "2024-01-01", "count": 1, "itemsProcessed": 20}
    ],
    "categoryDistribution": {
      "clothing": 45,
      "electronics": 30,
      "books": 25
    }
  }
}
```

### 14.2 获取空间利用率

```http
GET /api/v1/analytics/space-utilization
```

**说明**：
- 复杂的统计计算由后端处理
- 前端负责图表展示和交互
- 支持数据的可视化渲染

### 14.3 获取过期趋势

```http
GET /api/v1/analytics/expiry-trends
```

## 错误代码说明

| 错误代码 | HTTP状态码 | 说明 |
|---------|-----------|------|
| VALIDATION_ERROR | 400 | 参数验证失败 |
| NOT_FOUND | 404 | 资源不存在 |
| DUPLICATE_RESOURCE | 409 | 资源重复 |
| BUSINESS_ERROR | 422 | 业务逻辑错误 |
| FILE_TOO_LARGE | 413 | 文件过大 |
| UNSUPPORTED_FILE_TYPE | 415 | 不支持的文件类型 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率限制 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## 数据传输对象 (DTO)

### RoomDTO
```java
public class RoomDTO {
    private String id;
    private String name;
    private String type;
    private String color;
    private String description;
    private Integer globalX;
    private Integer globalY;
    private Integer globalWidth;
    private Integer globalHeight;
    private Integer furnitureCount;
    private Integer itemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<FurnitureDTO> furniture;
    // getters and setters
}
```

### ItemDTO
```java
public class ItemDTO {
    private String id;
    private String name;
    private String category;
    private String description;
    private Integer quantity;
    private String roomId;
    private String roomName;
    private String furnitureId;
    private String furnitureName;
    private String compartmentId;
    private String compartmentName;
    private Integer x;
    private Integer y;
    private Integer width;
    private Integer height;
    private List<String> tags;
    private String status;
    private String imageUrl;
    private LocalDateTime lastUsed;
    
    // 过期管理字段
    private Boolean hasExpiryManagement;
    private LocalDate purchaseDate;
    private LocalDate expiryDate;
    private LocalDate productionDate;
    private Integer shelfLife;
    private Boolean reminderEnabled;
    private Integer reminderDays;
    private String batchNumber;
    private String brand;
    private Boolean isConsumed;
    
    // 库存管理字段
    private Boolean hasStockManagement;
    private Integer minStock;
    private Integer maxStock;
    private String stockUnit;
    private String stockLocation;
    private String supplier;
    private LocalDate lastPurchaseDate;
    private BigDecimal averageUsage;
    private String stockNotes;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // getters and setters
}

### NotificationDTO
```java
public class NotificationDTO {
    private String id;
    private String type; // expiry, stock, organization, system
    private String title;
    private String message;
    private String priority; // high, medium, low
    private String status; // unread, read, dismissed
    private String itemId;
    private String route;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    // getters and setters
}

### OrganizationActivityDTO
```java
public class OrganizationActivityDTO {
    private String id;
    private String title;
    private String status; // in_progress, completed, cancelled
    private Integer totalItems;
    private Integer processedItems;
    private Integer keptItems;
    private Integer discardedItems;
    private List<String> categoriesProcessed;
    private Map<String, Object> summary;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    // getters and setters
}

### DashboardStatsDTO
```java
public class DashboardStatsDTO {
    private Integer totalRooms;
    private Integer totalItems;
    private Integer totalFurniture;
    private Integer lowStockItems;
    private Integer expiredItems;
    private Integer nearExpiryItems;
    private List<ItemDTO> recentItems;
    private List<NotificationDTO> alerts;
    private List<RoomOverviewDTO> roomsOverview;
    // getters and setters
}
``` 

## 安全性说明

### 认证和授权
- 所有API接口都需要有效的JWT Token
- Token应在请求头中携带：`Authorization: Bearer <token>`
- Token有效期建议设置为24小时，支持刷新机制

### 数据验证
- 所有输入数据都应进行严格的服务端验证
- 文件上传需要检查文件类型和大小限制
- SQL注入和XSS攻击防护

### 接口限制
- 实施请求频率限制，防止滥用
- 大文件上传建议使用分片上传
- 批量操作应限制处理数量上限

## 性能优化建议

### 数据库优化
- 对常用查询字段添加索引
- 使用数据库连接池
- 考虑读写分离和缓存策略

### 接口优化
- 支持字段选择性返回（只返回需要的字段）
- 实施适当的分页和排序
- 使用缓存减少重复计算

### 文件处理
- 图片上传后自动压缩和生成缩略图
- 使用CDN加速文件访问
- 定期清理无效文件

## 业务规则补充

### 时间戳处理
- 所有时间字段使用ISO 8601格式
- 服务端统一使用UTC时间
- 客户端根据用户时区显示

### 数据一致性
- 删除房间时需要处理关联的家具和物品
- 删除家具时需要处理关联的物品
- 物品状态变更需要同步更新相关统计

### 通知机制
- 实时通知推送（WebSocket或Server-Sent Events）
- 支持通知偏好设置
- 通知历史记录保留期限设置

### 数据导入导出
- 支持批量导入物品数据（CSV/Excel格式）
- 提供数据备份和恢复功能
- 支持数据同步到云端存储

## LocalStorage迁移指南

### 当前存储结构分析

基于提供的localStorage数据：

```javascript
// home_inventory_rooms
[{
  "id": "b090b14b-2689-41b2-a7e9-3489020e93db",
  "name": "我的卧室",
  "type": "bedroom", 
  "color": "#3B82F6",
  "description": "",
  "globalX": 603,
  "globalY": 192,
  "furniture": [{
    "id": "ffd323ac-82c9-4852-99db-89eb1cea5e25",
    "name": "衣柜",
    "type": "wardrobe",
    "x": 389,
    "y": 0,
    "width": 197,
    "height": 168,
    "color": "#8b7355",
    "compartments": [...]
  }]
}]

// home_inventory_items  
[{
  "id": "70228108-4fdf-4e1d-a749-428c05bd82be",
  "name": "夏季T恤",
  "category": "clothing",
  "quantity": 3,
  "roomId": "b090b14b-2689-41b2-a7e9-3489020e93db",
  "furnitureId": "ffd323ac-82c9-4852-99db-89eb1cea5e25",
  "compartmentId": "714262b6-ffda-4398-96e3-e3b0015c3e63",
  "x": undefined,  // 在家具分区内
  "y": undefined
}, {
  "id": "357d4418-1e84-4e90-8bac-28754a112831", 
  "name": "手机充电器",
  "x": 243,  // 直接放在房间内
  "y": 0,
  "furnitureId": "",
  "compartmentId": ""
}]
```

### 迁移策略

#### 1. 数据导入API调用顺序

```javascript
// 1. 导入房间数据（不包含家具）
const roomData = {
  name: room.name,
  type: room.type, 
  color: room.color,
  description: room.description,
  globalX: room.globalX,
  globalY: room.globalY
};
const roomResponse = await fetch('/api/v1/rooms', {
  method: 'POST',
  body: JSON.stringify(roomData)
});

// 2. 导入家具数据
for (const furniture of room.furniture) {
  const furnitureData = {
    name: furniture.name,
    type: furniture.type,
    x: furniture.x,
    y: furniture.y, 
    width: furniture.width,
    height: furniture.height,
    color: furniture.color
  };
  await fetch(`/api/v1/rooms/${roomId}/furniture`, {
    method: 'POST',
    body: JSON.stringify(furnitureData)
  });
  
  // 3. 导入分区数据
  for (const compartment of furniture.compartments) {
    await fetch(`/api/v1/furniture/${furnitureId}/compartments`, {
      method: 'POST',
      body: JSON.stringify(compartment)
    });
  }
}

// 4. 导入物品数据
for (const item of items) {
  const itemData = {
    ...item,
    // 保持现有的位置和关联关系
    x: item.x || null,
    y: item.y || null,
    roomId: item.roomId,
    furnitureId: item.furnitureId || null,
    compartmentId: item.compartmentId || null
  };
  await fetch('/api/v1/items', {
    method: 'POST', 
    body: JSON.stringify(itemData)
  });
}
```

#### 2. 前端适配要点

**状态管理改造**：
```javascript
// 原来的localStorage直接操作
roomStorage.updateRoom(roomId, updatedRoom);

// 改为API调用
const updateRoom = async (roomId, updates) => {
  const response = await fetch(`/api/v1/rooms/${roomId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
  if (response.ok) {
    // 更新本地状态
    setRooms(rooms.map(r => r.id === roomId ? {...r, ...updates} : r));
  }
};
```

**批量操作优化**：
```javascript
// 拖拽结束后批量同步位置
const syncPositions = async (changes) => {
  await fetch('/api/v1/sync/batch', {
    method: 'POST',
    body: JSON.stringify({
      rooms: changes.rooms,
      furniture: changes.furniture, 
      items: changes.items
    })
  });
};
```

#### 3. 渐进式迁移方案

**阶段1：双写模式**
- 继续使用localStorage作为主存储
- 同时写入API，验证数据一致性
- 保持现有功能正常运行

**阶段2：读取切换**  
- API作为数据源，localStorage作为缓存
- 出现问题时可快速回退
- 逐步优化API性能

**阶段3：完全迁移**
- 移除localStorage依赖
- 启用完整的后端功能
- 数据备份和恢复机制 