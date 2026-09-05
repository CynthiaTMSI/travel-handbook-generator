import { fail, readTripSource } from "./lib.mjs";

const { raw, data } = await readTripSource();
const errors = [];
const forbiddenKeys = /(?:passport|护照|booking[_-]?reference|confirmation[_-]?code|订单号|预约编号|qr[_-]?code|二维码|barcode|条形码|ticket[_-]?code|取票码|hotel[_-]?pin|信用卡|card[_-]?number|cvv|邮箱|email|手机号|phone)/i;

function inspect(value, trail = "root") {
  if (Array.isArray(value)) return value.forEach((item, index) => inspect(item, `${trail}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.test(key)) errors.push(`发现禁止公开的字段：${trail}.${key}`);
    inspect(child, `${trail}.${key}`);
  }
}

inspect(data);

const contentPatterns = [
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "疑似邮箱地址"],
  [/(?:\d[ -]*?){14,19}/, "疑似银行卡号或超长数字编号"],
  [/BEGIN (?:RSA |EC )?PRIVATE KEY/, "私钥"],
  [/(?:password|secret|token)\s*:/i, "密码、密钥或令牌字段"]
];

for (const [pattern, label] of contentPatterns) {
  if (pattern.test(raw)) errors.push(`发现${label}`);
}

if (errors.length) fail(errors);
else console.log("✓ 公开内容隐私检查通过");
