import { fail, parseMinutes, readTripSource } from "./lib.mjs";

const { data } = await readTripSource();
const errors = [];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

if (!data?.trip?.title) errors.push("trip.title 不能为空");
if (!datePattern.test(data?.trip?.start_date || "")) errors.push("trip.start_date 必须使用 YYYY-MM-DD");
if (!datePattern.test(data?.trip?.end_date || "")) errors.push("trip.end_date 必须使用 YYYY-MM-DD");
if (!data?.trip?.timezone) errors.push("trip.timezone 不能为空");
if (data?.trip?.start_date > data?.trip?.end_date) errors.push("旅行开始日期不能晚于结束日期");

if (data?.review?.status !== "approved") errors.push("review.status 尚未 approved，禁止生成正式网页");
if (!Array.isArray(data?.review?.unresolved)) errors.push("review.unresolved 必须是数组");
if (data?.review?.unresolved?.length) errors.push(`仍有 ${data.review.unresolved.length} 项待确认，禁止生成正式网页`);

if (!Array.isArray(data?.days) || !data.days.length) {
  errors.push("至少需要填写一天行程");
} else {
  const seenDates = new Set();
  for (const day of data.days) {
    if (!datePattern.test(day?.date || "")) errors.push(`行程日期格式错误：${day?.date || "空值"}`);
    if (seenDates.has(day.date)) errors.push(`行程日期重复：${day.date}`);
    seenDates.add(day.date);
    if (day.date < data.trip.start_date || day.date > data.trip.end_date) errors.push(`${day.date} 不在旅行日期范围内`);
    if (!day.title) errors.push(`${day.date} 缺少每日标题`);
    if (!Array.isArray(day.events)) errors.push(`${day.date} 的 events 必须是数组`);

    let previousEnd = -1;
    for (const event of day.events || []) {
      if (!timePattern.test(event?.time || "")) {
        errors.push(`${day.date}「${event?.title || "未命名项目"}」时间格式错误`);
        continue;
      }
      if (!event.title) errors.push(`${day.date} ${event.time} 缺少项目名称`);
      const start = parseMinutes(event.time);
      if (start < previousEnd) errors.push(`${day.date}「${event.title}」与上一项时间重叠`);
      previousEnd = start + Number(event.duration_minutes || 0);
      if (event.map_url && !/^https:\/\//.test(event.map_url)) errors.push(`${day.date}「${event.title}」地图链接必须使用 https`);
    }
  }
}

const uncertainWords = ["待定", "不确定", "可能", "二选一", "uncertain", "TBD", "TODO"];
const serialized = JSON.stringify(data);
for (const word of uncertainWords) {
  if (serialized.toLowerCase().includes(word.toLowerCase())) errors.push(`发现未确认标记「${word}」`);
}

if (errors.length) fail(errors);
else console.log("✓ 行程结构与确认状态检查通过");
