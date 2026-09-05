# Travel Handbook Generator 1.0

用一份 `trip.yaml` 自动生成适合手机查看、打印和分享的旅行手册。模板包含倒计时、此刻关注 NEXT、每日时间线、地图入口、预订摘要、发布前确认闸门和隐私检查。

> 仓库中的东京与镰仓行程完全为虚构示例，不包含真实订单或个人资料。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/CynthiaTMSI/travel-handbook-generator)

## 朋友使用只需三步

1. 点击 **Use this template** 创建自己的仓库，或点击上方 **Deploy to Cloudflare**。
2. 把攻略文字和订单截图交给 ChatGPT，并复制 [中文使用指南](./GUIDE-中文.md) 中的固定指令。
3. 所有疑点确认后更新 `data/trip.yaml`；GitHub 更新会触发 Cloudflare 自动构建和部署。

## 安全机制

- `review.status` 不是 `approved` 时，构建失败。
- `review.unresolved` 仍有项目时，构建失败。
- 出现待定词、日期错误、时间重叠或缺失字段时，构建失败。
- 出现订单号、二维码、邮箱、电话、护照、银行卡等敏感字段或内容时，构建失败。
- 原始订单截图不进入公开网站。

## 项目结构

```text
data/trip.yaml             唯一的行程内容来源
src/template.html          页面结构
src/styles.css             视觉与移动端、打印样式
src/app.js                 倒计时、NEXT和内容渲染
scripts/                   生成、确认与隐私检查
dist/                      Cloudflare发布目录
AGENTS.md                  给AI的固定工作规则
GUIDE-中文.md              非技术用户使用说明
```

## 快速开始

```bash
npm install
npm run build
```

详细步骤见 [GUIDE-中文.md](./GUIDE-中文.md)。

封面示例图片：Bryan MacKinnon，Public Domain，来源 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:TokyoSkylineFromAfar.jpg)。

## License

代码使用 MIT License。示例封面图片遵循其来源页标注的 Public Domain 授权。
