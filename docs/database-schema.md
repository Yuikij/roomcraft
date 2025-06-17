# 家居物品管理系统 - 数据库建表文档

## 概述

本文档定义了家居物品管理系统的完整数据库架构，支持房间管理、家具布局、物品库存、过期管理、库存管理和整理功能等核心业务。

## 数据库设计原则

- 遵循第三范式，减少数据冗余
- 支持扩展性，预留业务发展空间
- 考虑性能优化，合理设置索引
- 保证数据完整性，设置适当的约束

## 数据库表结构

### 1. 房间表 (rooms)

```sql
CREATE TABLE `rooms` (
  `id` VARCHAR(36) NOT NULL COMMENT '房间唯一标识(UUID)',
  `name` VARCHAR(100) NOT NULL COMMENT '房间名称',
  `type` ENUM('bedroom', 'living_room', 'kitchen', 'bathroom', 'study', 'dining_room', 'balcony', 'storage', 'other') NOT NULL DEFAULT 'other' COMMENT '房间类型',
  `color` VARCHAR(7) NOT NULL DEFAULT '#0ea5e9' COMMENT '房间颜色(HEX)',
  `description` TEXT COMMENT '房间描述',
  `global_x` INT DEFAULT 50 COMMENT '全局视图X坐标',
  `global_y` INT DEFAULT 50 COMMENT '全局视图Y坐标', 
  `global_width` INT DEFAULT 200 COMMENT '全局视图宽度',
  `global_height` INT DEFAULT 150 COMMENT '全局视图高度',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房间信息表';
```

### 2. 家具表 (furniture)

```sql
CREATE TABLE `furniture` (
  `id` VARCHAR(36) NOT NULL COMMENT '家具唯一标识(UUID)',
  `room_id` VARCHAR(36) NOT NULL COMMENT '所属房间ID',
  `name` VARCHAR(100) NOT NULL COMMENT '家具名称',
  `type` ENUM('wardrobe', 'desk', 'bed', 'shelf', 'cabinet', 'drawer', 'bookcase', 'sofa', 'table', 'chair', 'other') NOT NULL DEFAULT 'other' COMMENT '家具类型',
  `x` INT NOT NULL DEFAULT 0 COMMENT '房间内X坐标',
  `y` INT NOT NULL DEFAULT 0 COMMENT '房间内Y坐标',
  `width` INT NOT NULL DEFAULT 100 COMMENT '家具宽度',
  `height` INT NOT NULL DEFAULT 100 COMMENT '家具高度',
  `color` VARCHAR(7) NOT NULL DEFAULT '#6b7280' COMMENT '家具颜色(HEX)',
  `description` TEXT COMMENT '家具描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE,
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家具信息表';
```

### 3. 家具分区表 (furniture_compartments)

```sql
CREATE TABLE `furniture_compartments` (
  `id` VARCHAR(36) NOT NULL COMMENT '分区唯一标识(UUID)',
  `furniture_id` VARCHAR(36) NOT NULL COMMENT '所属家具ID',
  `name` VARCHAR(100) NOT NULL COMMENT '分区名称',
  `type` ENUM('shelf', 'drawer', 'compartment', 'section', 'other') NOT NULL DEFAULT 'other' COMMENT '分区类型',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`furniture_id`) REFERENCES `furniture`(`id`) ON DELETE CASCADE,
  INDEX `idx_furniture_id` (`furniture_id`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家具分区表';
```

### 4. 物品表 (items)

```sql
CREATE TABLE `items` (
  `id` VARCHAR(36) NOT NULL COMMENT '物品唯一标识(UUID)',
  `name` VARCHAR(200) NOT NULL COMMENT '物品名称',
  `category` ENUM('clothing', 'books', 'electronics', 'documents', 'kitchenware', 'cosmetics', 'toys', 'tools', 'medicine', 'accessories', 'food', 'other') NOT NULL DEFAULT 'other' COMMENT '物品类别',
  `description` TEXT COMMENT '物品描述',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '物品数量',
  `room_id` VARCHAR(36) NOT NULL COMMENT '所在房间ID',
  `furniture_id` VARCHAR(36) COMMENT '所在家具ID',
  `compartment_id` VARCHAR(36) COMMENT '所在分区ID',
  `x` INT COMMENT '房间内X坐标(用于可视化)',
  `y` INT COMMENT '房间内Y坐标(用于可视化)',
  `width` INT DEFAULT 60 COMMENT '显示宽度',
  `height` INT DEFAULT 40 COMMENT '显示高度',
  `tags` JSON COMMENT '标签数组',
  `status` ENUM('active', 'archived', 'discarded') NOT NULL DEFAULT 'active' COMMENT '物品状态',
  `image_url` VARCHAR(500) COMMENT '物品图片URL',
  `last_used` TIMESTAMP NULL COMMENT '最后使用时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 过期管理字段
  `has_expiry_management` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否启用过期管理',
  `purchase_date` DATE COMMENT '购买日期',
  `expiry_date` DATE COMMENT '过期日期',
  `production_date` DATE COMMENT '生产日期',
  `shelf_life` INT COMMENT '保质期(天数)',
  `reminder_enabled` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否启用过期提醒',
  `reminder_days` INT COMMENT '提前提醒天数',
  `batch_number` VARCHAR(100) COMMENT '批次号',
  `brand` VARCHAR(100) COMMENT '品牌',
  `is_consumed` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已消耗完',
  
  -- 库存管理字段
  `has_stock_management` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否启用库存管理',
  `min_stock` INT COMMENT '最低库存阈值',
  `max_stock` INT COMMENT '最高库存阈值',
  `stock_unit` VARCHAR(20) DEFAULT '个' COMMENT '库存单位',
  `stock_location` VARCHAR(200) COMMENT '库存位置描述',
  `supplier` VARCHAR(200) COMMENT '供应商',
  `last_purchase_date` DATE COMMENT '上次购买日期',
  `average_usage` DECIMAL(8,2) COMMENT '平均月用量',
  `stock_notes` TEXT COMMENT '库存备注',
  
  PRIMARY KEY (`id`),
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`furniture_id`) REFERENCES `furniture`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`compartment_id`) REFERENCES `furniture_compartments`(`id`) ON DELETE SET NULL,
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_furniture_id` (`furniture_id`),
  INDEX `idx_compartment_id` (`compartment_id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_expiry_date` (`expiry_date`),
  INDEX `idx_has_expiry_management` (`has_expiry_management`),
  INDEX `idx_has_stock_management` (`has_stock_management`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物品信息表';
```

### 5. 系统设置表 (system_settings)

```sql
CREATE TABLE `system_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '设置ID',
  `setting_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '设置键名',
  `setting_value` JSON COMMENT '设置值(JSON格式)',
  `description` VARCHAR(500) COMMENT '设置描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统设置表';
```

### 6. 整理活动记录表 (organization_activities)

```sql
CREATE TABLE `organization_activities` (
  `id` VARCHAR(36) NOT NULL COMMENT '活动唯一标识(UUID)',
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  `total_items_reviewed` INT NOT NULL DEFAULT 0 COMMENT '回顾物品总数',
  `items_kept` INT NOT NULL DEFAULT 0 COMMENT '保留物品数',
  `items_discarded` INT NOT NULL DEFAULT 0 COMMENT '丢弃物品数',
  `notes` TEXT COMMENT '活动备注',
  PRIMARY KEY (`id`),
  INDEX `idx_started_at` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='整理活动记录表';
```

### 7. 整理物品详情表 (organization_item_details)

```sql
CREATE TABLE `organization_item_details` (
  `id` VARCHAR(36) NOT NULL COMMENT '记录唯一标识(UUID)',
  `activity_id` VARCHAR(36) NOT NULL COMMENT '整理活动ID',
  `item_id` VARCHAR(36) COMMENT '物品ID(可能已被删除)',
  `item_name` VARCHAR(200) NOT NULL COMMENT '物品名称快照',
  `item_category` VARCHAR(50) NOT NULL COMMENT '物品类别快照',
  `action` ENUM('kept', 'discarded') NOT NULL COMMENT '处理动作',
  `reason` VARCHAR(500) COMMENT '处理原因',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`activity_id`) REFERENCES `organization_activities`(`id`) ON DELETE CASCADE,
  INDEX `idx_activity_id` (`activity_id`),
  INDEX `idx_item_id` (`item_id`),
  INDEX `idx_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='整理物品详情表';
```

## 初始化数据

### 房间类型标签数据

```sql
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES 
('room_type_labels', '{
  "bedroom": "卧室",
  "living_room": "客厅", 
  "kitchen": "厨房",
  "bathroom": "卫生间",
  "study": "书房",
  "dining_room": "餐厅",
  "balcony": "阳台",
  "storage": "储物间",
  "other": "其他"
}', '房间类型显示标签');
```

### 家具类型标签数据

```sql
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES 
('furniture_type_labels', '{
  "wardrobe": "衣柜",
  "desk": "书桌",
  "bed": "床",
  "shelf": "架子", 
  "cabinet": "橱柜",
  "drawer": "抽屉",
  "bookcase": "书柜",
  "sofa": "沙发",
  "table": "桌子",
  "chair": "椅子",
  "other": "其他"
}', '家具类型显示标签');
```

### 物品类别标签数据

```sql
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES 
('item_category_labels', '{
  "clothing": "服装",
  "books": "书籍",
  "electronics": "电子产品",
  "documents": "文件", 
  "kitchenware": "厨具",
  "cosmetics": "化妆品",
  "toys": "玩具",
  "tools": "工具",
  "medicine": "药品",
  "accessories": "配件",
  "food": "食品",
  "other": "其他"
}', '物品类别显示标签');
```

### 默认过期提醒配置

```sql
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES 
('default_reminder_days', '{
  "food": 3,
  "medicine": 7,
  "cosmetics": 30,
  "default": 7
}', '默认过期提醒天数配置');
```

### 默认库存阈值配置

```sql
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES 
('default_stock_thresholds', '{
  "food": {"lowStock": 2, "outOfStock": 1},
  "medicine": {"lowStock": 5, "outOfStock": 2},
  "cosmetics": {"lowStock": 1, "outOfStock": 0},
  "kitchenware": {"lowStock": 3, "outOfStock": 1},
  "tools": {"lowStock": 2, "outOfStock": 0},
  "default": {"lowStock": 3, "outOfStock": 1}
}', '默认库存阈值配置');
```

## 索引优化建议

1. **复合索引**：
   - `items` 表: `(room_id, status, category)`
   - `items` 表: `(has_expiry_management, expiry_date)`
   - `items` 表: `(has_stock_management, quantity)`

2. **全文索引**：
   - `items` 表的 `name` 和 `description` 字段可考虑添加全文索引以支持搜索

3. **分区策略**：
   - 如果数据量较大，可考虑对 `items` 表按 `created_at` 进行分区

## 数据一致性约束

1. **业务规则约束**：
   - 物品的家具必须属于同一房间
   - 物品的分区必须属于对应的家具
   - 过期日期不能早于生产日期或购买日期

2. **触发器建议**：
   - 创建触发器自动更新 `updated_at` 字段
   - 创建触发器验证日期逻辑的一致性
   - 创建触发器自动计算过期状态

## 备份与维护

1. **定期备份**：
   - 建议每日增量备份，每周全量备份
   - 重要配置表建议实时备份

2. **数据清理**：
   - 定期清理已废弃状态的物品数据
   - 定期归档历史整理活动记录

3. **性能监控**：
   - 监控慢查询，优化索引策略
   - 定期分析表空间使用情况 