const state = { trip: null, timer: null };

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("./trip.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.trip = await response.json();
    render(state.trip);
    updateTimePanels();
    state.timer = window.setInterval(updateTimePanels, 30_000);
  } catch (error) {
    document.querySelector("main").innerHTML = `<section class="section"><h1>旅行手册读取失败</h1><p>请重新运行构建并确认 trip.json 已生成。</p></section>`;
    console.error(error);
  }
});

function render(data) {
  const { trip, highlights = [], bookings = [], days = [] } = data;
  document.title = trip.title;
  setText("trip-title", trip.title);
  setText("trip-subtitle", trip.subtitle || "");
  setText("trip-dates", `${formatDate(trip.start_date, trip.timezone, true)} — ${formatDate(trip.end_date, trip.timezone, true)}`);

  const image = document.querySelector("#hero-image");
  image.src = trip.hero?.image_url || "";
  image.alt = trip.hero?.alt || "旅行目的地照片";
  const credit = document.querySelector("#hero-credit");
  credit.textContent = trip.hero?.credit || "";
  credit.href = trip.hero?.credit_url || "#";
  credit.hidden = !trip.hero?.credit;

  document.querySelector("#highlights").innerHTML = highlights.map(item => `
    <article class="highlight-card">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
    </article>`).join("");

  document.querySelector("#day-tabs").innerHTML = days.map((day, index) => `
    <a class="day-tab" href="#day-${index + 1}">D${index + 1} · ${escapeHtml(shortDate(day.date, trip.timezone))}</a>`).join("");

  document.querySelector("#days-list").innerHTML = days.map((day, index) => `
    <article class="day-card" id="day-${index + 1}">
      <header class="day-head">
        <span class="day-number">DAY ${String(index + 1).padStart(2, "0")}</span>
        <time class="day-date" datetime="${escapeHtml(day.date)}">${escapeHtml(shortDate(day.date, trip.timezone))}</time>
        <h3>${escapeHtml(day.title)}</h3>
        <p class="day-area">${escapeHtml(day.area || "")}</p>
        <p class="day-summary">${escapeHtml(day.summary || "")}</p>
      </header>
      <ol class="timeline">
        ${(day.events || []).map(event => `
          <li class="event">
            <time class="event-time" datetime="${escapeHtml(`${day.date}T${event.time}`)}">${escapeHtml(event.time)}</time>
            <div class="event-copy">
              <h4>${escapeHtml(event.title)}</h4>
              <p>${escapeHtml(event.detail || "")}</p>
            </div>
            ${event.map_url ? `<a class="map-link" href="${safeUrl(event.map_url)}" target="_blank" rel="noreferrer">地图 ↗</a>` : ""}
          </li>`).join("")}
      </ol>
    </article>`).join("");

  const typeNames = { flight: "航班", hotel: "酒店", restaurant: "餐厅", transport: "交通", ticket: "门票" };
  document.querySelector("#booking-list").innerHTML = bookings.map(item => `
    <article class="booking-card">
      <div class="booking-top">
        <span class="booking-type">${escapeHtml(typeNames[item.type] || item.type || "预订")}</span>
        <span class="status">${item.status === "confirmed" ? "已确认" : escapeHtml(item.status || "")}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.detail || "")}</p>
      <p>${escapeHtml(item.note || "")}</p>
    </article>`).join("");

  setText("generated-note", `行程时区：${trip.timezone} · 数据审核状态：已确认`);
}

function updateTimePanels() {
  const data = state.trip;
  if (!data) return;
  const timezone = data.trip.timezone;
  const nowParts = zonedParts(new Date(), timezone);
  const nowKey = `${nowParts.date}T${nowParts.time}`;
  const events = data.days.flatMap(day => (day.events || []).map(event => ({ ...event, date: day.date })));
  const next = events.find(event => `${event.date}T${event.time}` > nowKey);
  const start = zonedDateToUtc(data.trip.start_date, "00:00", timezone);
  const end = zonedDateToUtc(data.trip.end_date, "23:59", timezone);
  const now = new Date();

  if (now < start) {
    const diff = start - now;
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    setText("countdown-value", `${days}天 ${hours}小时`);
  } else if (now <= end) {
    setText("countdown-value", "旅途中");
  } else {
    setText("countdown-value", "旅程已结束");
  }

  if (next) {
    setText("next-title", next.title);
    setText("next-detail", `${formatDate(next.date, timezone)} · ${next.detail || ""}`);
    setText("next-time", next.time);
  } else {
    setText("next-title", now > end ? "旅程已圆满结束" : "今天暂无后续安排");
    setText("next-detail", now > end ? "这份手册仍可作为旅行记录保存。" : "享受自由时间。" );
    setText("next-time", "");
  }
}

function zonedParts(date, timezone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

function zonedDateToUtc(date, time, timezone) {
  const desired = new Date(`${date}T${time}:00Z`);
  const shown = zonedParts(desired, timezone);
  const shownAsUtc = new Date(`${shown.date}T${shown.time}:00Z`);
  return new Date(desired.getTime() - (shownAsUtc.getTime() - desired.getTime()));
}

function formatDate(date, timezone, includeYear = false) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: timezone,
    ...(includeYear ? { year: "numeric" } : {}),
    month: "long", day: "numeric", weekday: "short"
  }).format(new Date(`${date}T12:00:00Z`));
}

function shortDate(date, timezone) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: timezone, month: "2-digit", day: "2-digit", weekday: "short" }).format(new Date(`${date}T12:00:00Z`));
}

function setText(id, value) { document.querySelector(`#${id}`).textContent = value; }
function safeUrl(value) { try { const url = new URL(value); return url.protocol === "https:" ? escapeHtml(url.href) : "#"; } catch { return "#"; } }
function escapeHtml(value = "") { return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char]); }
