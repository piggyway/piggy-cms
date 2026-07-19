# Piggy CMS

Local Directus development environment backed by PostgreSQL.

## 项目结构

```
piggy-cms/
├── Dockerfile                    # Directus 主容器 Dockerfile
├── docker-compose.yml            # Docker Compose 配置
├── .env.example                  # 环境变量模板
├── directus-config/              # Legacy schema snapshots (not loaded at runtime)
├── data/                         # 数据库数据持久化目录
│   └── postgres_data/            # PostgreSQL 数据目录
└── uploads/                      # Directus 上传文件目录
```

## 快速开始

### 1. 配置环境变量

复制环境变量模板文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，根据需要修改配置值。

### 2. 启动服务

```bash
docker compose up -d
```

这将启动以下服务：
- Directus 实例（端口：8055）

### 3. 访问 Directus

打开浏览器访问：http://localhost:8055

使用 `.env` 文件中配置的 `DIRECTUS_ADMIN_EMAIL` 和 `DIRECTUS_ADMIN_PASSWORD` 登录。

## 环境变量说明

### PostgreSQL 配置
- `POSTGRES_USER`: PostgreSQL 用户名
- `POSTGRES_PASSWORD`: PostgreSQL 密码
- `POSTGRES_DB`: PostgreSQL 数据库名
- `POSTGRES_PORT`: PostgreSQL 端口（默认：5432）

### Directus 配置
- `SECRET`: Directus 加密密钥（生产环境必须更改）
- `DB_CLIENT`: 数据库客户端类型（pg）
- `DB_HOST`: 数据库主机（postgres）
- `DB_PORT`: 数据库端口（5432）
- `DB_DATABASE`: 数据库名
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `DIRECTUS_ADMIN_EMAIL`: Directus 管理员邮箱
- `DIRECTUS_ADMIN_PASSWORD`: Directus 管理员密码
- `DIRECTUS_PORT`: Directus 服务端口（默认：8055）

## 常用命令

### 停止服务
```bash
docker compose down
```

### 查看日志
```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f directus
```

### 重启服务
```bash
docker compose restart
```

### 清理数据（注意：会删除所有数据）
```bash
docker compose down -v
```

## 注意事项

1. 首次启动时，Directus 会自动初始化数据库
2. `data/` 和 `uploads/` 目录会被持久化，删除容器不会丢失数据
3. 生产环境部署时，务必更改 `SECRET` 和数据库密码
