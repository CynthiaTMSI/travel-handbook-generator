# 使用指南

这套模板把网页外观和旅行内容分开。绝大多数情况下，只需要修改 `data/trip.yaml`。

## 推荐流程

1. 使用本仓库创建你自己的仓库。
2. 把文字攻略和订单截图提交给 ChatGPT。
3. 要求 ChatGPT 先列出“已确认、待确认、冲突、不得公开”的信息。
4. 回答全部待确认问题。
5. 让 ChatGPT 更新 `data/trip.yaml`，运行 `npm run build`。
6. 查看预览，确认后再发布。

## 可直接复制给 ChatGPT 的指令

> 请根据这个旅行手册模板制作我的旅行网页。我会提交文字攻略和订单截图。请先提取并整理全部信息；发现日期、时间、地点、预约状态、移动安排或截图内容存在不确定、缺失、冲突时，先向我集中确认。未经确认，不得把 review.status 改为 approved，也不得更新或发布正式网页。订单号、二维码、条形码、电话、邮箱、护照、会员号、取票码、酒店 PIN 及付款信息不得写入公开网页。截图只作为核对资料，不放入网页。所有问题确认后，更新 data/trip.yaml，运行 npm run build，并等待我批准发布。

## `trip.yaml` 的关键字段

- `trip`：旅行标题、日期、时区、人数和封面图。
- `review.status`：只能是 `pending` 或 `approved`。
- `review.unresolved`：所有尚未确认的问题。
- `highlights`：首页旅行摘要。
- `bookings`：只写适合公开的航班、酒店、餐厅或门票摘要。
- `days`：每日时间线。

有任何疑点时，请使用：

```yaml
review:
  status: pending
  unresolved:
    - "餐厅截图显示19:00，但文字攻略写19:30"
```

只在问题全部解决后改成：

```yaml
review:
  status: approved
  unresolved: []
```

## 本地检查与生成

需要 Node.js 20 或更新版本：

```bash
npm install
npm run build
```

生成后的网页在 `dist/`。可以用任意静态网页服务器预览。

## Cloudflare 部署

Cloudflare 构建设置：

- Build command：`npm run build`
- Deploy command：`npx wrangler deploy`

也可以在终端运行：

```bash
npm run deploy
```

首次部署前，建议修改 `wrangler.jsonc` 中的 `name`，避免与示例名称重复。

## 更换封面图

把可以公开使用的图片地址填入：

```yaml
trip:
  hero:
    image_url: "https://..."
    alt: "图片内容描述"
    credit: "摄影者 · 授权方式 · 来源"
    credit_url: "https://图片来源页"
```

请确认图片授权允许公开使用，并保留必要署名。

## 隐私原则

原始订单截图不要提交到 GitHub。`.gitignore` 已排除常见的私人资料目录，但这不能代替人工检查。即使仓库设为私有，只要 `dist/` 被部署，其中内容就会公开。
