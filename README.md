# Piggy CMS

基于 Directus 的本地开发环境，包含 PostgreSQL 数据库和 directus-sync 工具用于数据库 schema 同步。

## 项目结构

```
piggy-cms/
├── Dockerfile                    # Directus 主容器 Dockerfile
├── docker-compose.yml            # Docker Compose 配置
├── .env.example                  # 环境变量模板
├── directus-config/              # Directus 配置目录（通过 directus-sync 同步）
├── directus-sync-cmd/            # directus-sync 相关配置
│   ├── Dockerfile                # directus-sync 容器 Dockerfile
│   └── directus-sync.config.js   # directus-sync 配置文件
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
- directus-sync 已预装在 Directus 容器中

### 3. 访问 Directus

打开浏览器访问：http://localhost:8055

使用 `.env` 文件中配置的 `DIRECTUS_ADMIN_EMAIL` 和 `DIRECTUS_ADMIN_PASSWORD` 登录。

### 4. 创建 Directus Token（用于 directus-sync）

1. 登录 Directus 管理界面
2. 进入 Settings > Access Tokens
3. 创建新的 Token
4. 将 Token 复制到 `.env` 文件的 `DIRECTUS_ADMIN_TOKEN` 字段

## Directus Sync 使用说明

directus-sync@3.4.0 已预装在 Directus 容器中。你可以通过 exec 到容器中执行同步操作。

### 同步 Schema

```bash
# Exec 到 Directus 容器中
docker compose exec directus sh

# 在容器内执行同步命令
# 从 Directus 拉取 schema 到本地
directus-sync pull

# 将本地 schema 推送到 Directus
directus-sync push
```

或者直接执行单条命令：

```bash
# 从 Directus 拉取 schema 到本地
docker compose exec directus directus-sync pull

# 将本地 schema 推送到 Directus
docker compose exec directus directus-sync push
```

### Railway 部署说明

在 Railway 上部署时，由于只能运行一个 Directus 实例，请使用以下方式执行同步：

```bash
# 通过 Railway CLI 或 Web 界面 exec 到容器中
railway run directus-sync pull  # 拉取 schema
railway run directus-sync push  # 推送 schema
```

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

### Directus Sync 配置
- `DIRECTUS_URL`: Directus API URL（本地开发：http://localhost:8055，容器内：http://directus:8055，Railway：使用环境变量中的 PUBLIC_URL）
- `DIRECTUS_ADMIN_TOKEN`: Directus 管理员 Token（需要先创建）
- `DIRECTUS_SYNC_DUMP_PATH`: Schema 导出路径（默认：/directus/directus-config）

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
2. 确保 `.env` 文件中的 `DIRECTUS_ADMIN_TOKEN` 已配置，否则 directus-sync 无法正常工作
3. `data/` 和 `uploads/` 目录会被持久化，删除容器不会丢失数据
4. 生产环境部署时，务必更改 `SECRET` 和数据库密码

