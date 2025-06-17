# 家居物品管理系统 - API 接口文档

## 概述

本文档定义了家居物品管理系统的完整 RESTful API 接口，支持房间管理、家具布局、物品库存、过期管理、库存管理和整理功能等核心业务。

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
  "height": 70
}
```

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
  "height": 50
}
```

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

## 6. 过期管理 API

### 6.1 获取过期物品列表

```http
GET /api/v1/expiry/items
```

### 6.2 获取过期通知

```http
GET /api/v1/expiry/notifications
```

### 6.3 标记物品为已消耗

```http
POST /api/v1/items/{itemId}/consume
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

## 9. 仪表盘 API

### 9.1 获取仪表盘数据

```http
GET /api/v1/dashboard
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

## 错误代码说明

| 错误代码 | HTTP状态码 | 说明 |
|---------|-----------|------|
| VALIDATION_ERROR | 400 | 参数验证失败 |
| NOT_FOUND | 404 | 资源不存在 |
| DUPLICATE_RESOURCE | 409 | 资源重复 |
| BUSINESS_ERROR | 422 | 业务逻辑错误 |
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
``` 