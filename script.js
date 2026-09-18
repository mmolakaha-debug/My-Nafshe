/* =========================================================
   نقشه‌راه محمد — script.js
   همه اطلاعات در LocalStorage ذخیره می‌شود (بدون بک‌اند).

   ترتیب فایل:
   1) داده‌های ثابت (تسک‌ها، درس‌ها، نقشه راه، زبان، عادت‌ها)
   2) ابزارهای کمکی
   3) وضعیت برنامه (state) + ذخیره و بارگذاری
   4) XP و سطح و Streak
   5) رندر هر بخش
   6) رویدادها
   7) شروع برنامه
   ========================================================= */

/* ---------- 1) داده‌های ثابت ---------- */

const STORAGE_KEY = "roadmap-mohammad-v1";

// تسک‌های پیش‌فرض هر روز
const DEFAULT_DAILY = [
  { id: "d-math",   title: "ریاضی",                minutes: 30, xp: 20 },
  { id: "d-arabic", title: "عربی",                 minutes: 20, xp: 15 },
  { id: "d-code",   title: "HTML / برنامه‌نویسی",  minutes: 20, xp: 25 },
  { id: "d-review", title: "مرور کوتاه",           minutes: 5,  xp: 10 }
];

// تسک‌های «روز کم‌انرژی»
const EMERGENCY_TASKS = [
  { id: "d-sos-math", title: "۱۰ دقیقه ریاضی", minutes: 10, xp: 10 },
  { id: "d-sos-html", title: "۱۰ دقیقه HTML",  minutes: 10, xp: 10 }
];

// درس‌های پایه نهم (level از ۵)
const SUBJECTS = [
  { name: "ریاضی",    level: 1, prio: "خیلی بالا", prioClass: "prio-high", goal: "تقویت جدی" },
  { name: "عربی",     level: 2, prio: "بالا",      prioClass: "prio-high", goal: "تقویت" },
  { name: "فارسی",    level: 3, prio: "متوسط",     prioClass: "prio-mid",  goal: "بهبود" },
  { name: "علوم",     level: 4, prio: "متوسط",     prioClass: "prio-mid",  goal: "حفظ سطح" },
  { name: "انگلیسی",  level: 5, prio: "بالا",      prioClass: "prio-high", goal: "حفظ نقطه قوت" },
  { name: "مطالعات",  level: 4, prio: "پایین‌تر",  prioClass: "prio-low",  goal: "مرور" },
  { name: "دینی",     level: 4, prio: "پایین‌تر",  prioClass: "prio-low",  goal: "مرور" },
  { name: "قرآن",     level: 3, prio: "متوسط",     prioClass: "prio-mid",  goal: "تقویت" },
  { name: "آمادگی",   level: 5, prio: "پایین‌تر",  prioClass: "prio-low",  goal: "مرور" }
];

// نقشه راه برنامه‌نویسی
const ROADMAP = [
  {
    id: "html", title: "HTML", desc: "ساختار صفحه؛ اولین قدم واقعی.",
    tasks: ["ساختار HTML", "Heading و Paragraph", "Link و Image", "Table", "Form", "Semantic HTML", "ساخت اولین سایت شخصی"]
  },
  {
    id: "css", title: "CSS", desc: "ظاهر و چیدمان صفحه.",
    tasks: ["Selector و رنگ‌ها", "Box Model", "Flexbox", "Grid", "Responsive و Media Query", "انیمیشن ساده", "بازطراحی سایت شخصی"]
  },
  {
    id: "js", title: "JavaScript", desc: "جایی که صفحه زنده می‌شود.",
    tasks: ["متغیر و نوع داده", "شرط و حلقه", "تابع", "آرایه و آبجکت", "DOM و رویدادها", "LocalStorage", "ساخت یک اپ کوچک"]
  },
  {
    id: "git", title: "Git & GitHub", desc: "نگه‌داری کد و نمایش کارها.",
    tasks: ["نصب Git", "commit و log", "branch و merge", "ساخت ریپازیتوری", "push و pull", "انتشار با GitHub Pages"]
  },
  {
    id: "react", title: "React / TypeScript", desc: "ابزار حرفه‌ای‌ها برای رابط کاربری.",
    tasks: ["Component", "Props و State", "Hooks", "مقدمات TypeScript", "ساخت یک پروژه با React"]
  },
  {
    id: "backend", title: "Backend", desc: "سمت سرور و داده.",
    tasks: ["مفهوم سرور و API", "Node.js مقدماتی", "پایگاه داده مقدماتی", "ساخت یک API کوچک"]
  },
  {
    id: "focus", title: "انتخاب تخصص", desc: "وقتی پایه محکم شد، مسیر را انتخاب کن.",
    tasks: ["بررسی مسیر Frontend", "بررسی مسیر Backend", "بررسی مسیرهای دیگر", "انتخاب مسیر و برنامه ۶ ماهه"]
  }
];

// انگلیسی
const ENGLISH_TASKS = [
  { id: "en-listen", title: "۱۵ دقیقه Listening", xp: 10 },
  { id: "en-read",   title: "۱۰ دقیقه Reading",   xp: 10 },
  { id: "en-words",  title: "یادگیری لغات جدید",  xp: 10 }
];

// آلمانی
const GERMAN_LEVELS = [
  { id: "a1", title: "A1", tasks: ["الفبا و تلفظ", "معرفی خود", "اعداد و زمان", "۳۰۰ کلمه پایه", "جمله‌های ساده روزمره"] },
  { id: "a2", title: "A2", tasks: ["زمان گذشته", "خرید و رستوران", "۸۰۰ کلمه", "نوشتن ایمیل کوتاه", "مکالمه ساده"] },
  { id: "b1", title: "B1", tasks: ["بیان نظر", "متن‌های متوسط", "۱۵۰۰ کلمه", "نامه رسمی", "گفتگوی روزمره روان"] },
  { id: "b2", title: "B2", tasks: ["بحث و استدلال", "متن تخصصی", "۳۰۰۰ کلمه", "نوشتن مقاله کوتاه", "آمادگی آزمون B2"] }
];

// عادت‌ها
const HABITS = [
  { id: "h-study", title: "مطالعه" },
  { id: "h-code",  title: "برنامه‌نویسی" },
  { id: "h-lang",  title: "زبان" },
  { id: "h-sleep", title: "خواب بهتر" },
  { id: "h-phone", title: "گوشی کمتر" }
];

// سطح‌ها بر اساس XP
const LEVELS = [
  { min: 0,    name: "Level 1 — شروع" },
  { min: 300,  name: "Level 2 — در مسیر" },
  { min: 800,  name: "Level 3 — منظم" },
  { min: 1500, name: "Level 4 — سازنده" },
  { min: 2500, name: "Level 5 — حرفه‌ای" }
];

// برنامه ساعتی روز مدرسه (پاییز)
const SCHEDULE_SCHOOL = [
  { id: "wake",  time: "۰۶:۴۵", title: "بیدار شدن",
    tasks: ["مرتب کردن تخت", "شستن صورت و مسواک", "صبحانه", "آماده شدن برای مدرسه"] },
  { id: "school", time: "۰۷:۳۰ تا ۱۳:۰۰", title: "مدرسه",
    tasks: ["حضور در مدرسه", "انجام تکالیف یا یادداشت نکات مهم", "مرور کوتاه درس‌های همان روز"] },
  { id: "lunch", time: "۱۳:۰۰ تا ۱۴:۰۰", title: "ناهار و استراحت",
    tasks: ["ناهار", "استراحت واقعی", "کمی استفاده آزاد از گوشی"] },
  { id: "homework", time: "۱۴:۰۰ تا ۱۵:۳۰", title: "درس‌های مدرسه",
    tasks: ["انجام تکالیف", "مرور درس‌های همان روز", "تمرکز بیشتر روی درس‌های ضعیف‌تر"] },
  { id: "rest1", time: "۱۵:۳۰ تا ۱۶:۰۰", title: "استراحت",
    tasks: ["استراحت کوتاه"] },
  { id: "code", time: "۱۶:۰۰ تا ۱۷:۰۰", title: "برنامه‌نویسی",
    tasks: ["انجام برنامه‌نویسی طبق مسیر آموزشی"], link: "coding", linkLabel: "مشاهده مسیر برنامه‌نویسی" },
  { id: "rest2", time: "۱۷:۰۰ تا ۱۷:۳۰", title: "استراحت",
    tasks: ["استراحت کوتاه"] },
  { id: "lang", time: "۱۷:۳۰ تا ۱۸:۱۵", title: "زبان انگلیسی",
    tasks: ["مطالعه زبان", "لغات", "Listening یا تمرین"], link: "language", linkLabel: "مشاهده بخش زبان" },
  { id: "free", time: "۱۸:۱۵ به بعد", title: "زمان آزاد",
    tasks: ["تفریح", "موسیقی", "فیلم یا انیمه", "خانواده", "استفاده آزاد از گوشی"] },
  { id: "prep", time: "۲۲:۰۰", title: "آماده شدن برای خواب",
    tasks: ["جمع کردن وسایل فردا", "آماده کردن لباس و کیف", "قطع فعالیت‌های سنگین"] },
  { id: "sleep", time: "۲۳:۰۰", title: "خواب",
    tasks: ["خواب به موقع"] }
];

// برنامه ساعتی روز تعطیل — زمان بیشتر برای برنامه‌نویسی، درس، زبان و تفریح
const SCHEDULE_HOLIDAY = [
  { id: "wake", time: "۰۸:۳۰", title: "بیدار شدن",
    tasks: ["مرتب کردن تخت", "صبحانه"] },
  { id: "study", time: "۰۹:۰۰ تا ۱۰:۳۰", title: "مرور و تقویت درس ضعیف",
    tasks: ["مرور درس‌های ضعیف‌تر", "تمرین و تکرار"] },
  { id: "rest1", time: "۱۰:۳۰ تا ۱۱:۰۰", title: "استراحت",
    tasks: ["استراحت کوتاه"] },
  { id: "code1", time: "۱۱:۰۰ تا ۱۲:۳۰", title: "برنامه‌نویسی",
    tasks: ["ادامه مسیر آموزشی برنامه‌نویسی", "کار روی پروژه شخصی"], link: "coding", linkLabel: "مشاهده مسیر برنامه‌نویسی" },
  { id: "lunch", time: "۱۲:۳۰ تا ۱۴:۰۰", title: "ناهار و استراحت",
    tasks: ["ناهار", "استراحت واقعی"] },
  { id: "lang", time: "۱۴:۰۰ تا ۱۵:۰۰", title: "زبان انگلیسی",
    tasks: ["مطالعه زبان", "لغات", "Listening یا تمرین"], link: "language", linkLabel: "مشاهده بخش زبان" },
  { id: "free1", time: "۱۵:۰۰ تا ۱۶:۳۰", title: "زمان آزاد",
    tasks: ["تفریح", "ورزش یا پیاده‌روی"] },
  { id: "code2", time: "۱۶:۳۰ تا ۱۸:۰۰", title: "برنامه‌نویسی یا پروژه شخصی",
    tasks: ["ادامه پروژه شخصی", "تمرین بیشتر"], link: "coding", linkLabel: "مشاهده مسیر برنامه‌نویسی" },
  { id: "free2", time: "۱۸:۰۰ به بعد", title: "زمان آزاد",
    tasks: ["تفریح", "موسیقی", "فیلم یا انیمه", "خانواده"] },
  { id: "prep", time: "۲۳:۰۰", title: "آماده شدن برای خواب",
    tasks: ["قطع فعالیت‌های سنگین"] },
  { id: "sleep", time: "۲۳:۳۰", title: "خواب",
    tasks: ["خواب به موقع"] }
];

const XP_TASK_ROADMAP = 15;  // XP هر تسک نقشه راه
const XP_TASK_GERMAN = 10;   // XP هر تسک آلمانی
const XP_TASK_SCHEDULE = 5;  // XP هر آیتم برنامه روزانه ساعتی
const XP_PERFECT_DAY = 50;   // پاداش انجام کامل برنامه روز

/* ---------- 2) ابزارهای کمکی ---------- */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// یادداشت می‌کنیم کدام مرحله‌ها باز هستند تا بعد از رندر دوباره بسته نشوند
const openBoxes = new Set();

// تبدیل عدد انگلیسی به فارسی برای نمایش
function fa(num) {
  return String(num).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

// تاریخ امروز به شکل YYYY-MM-DD (برای مقایسه روزها)
function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

function monthKey() {
  return todayKey().slice(0, 7); // YYYY-MM
}

// درصد سالم (بدون تقسیم بر صفر)
function percent(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

// نمایش پیام کوتاه
let toastTimer = null;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2200);
}

/* ---------- 3) وضعیت برنامه ---------- */

function freshDaily() {
  // کپی تازه از تسک‌های روزانه با تیک خالی
  return DEFAULT_DAILY.map((t) => ({ ...t, done: false }));
}

function defaultState() {
  return {
    date: todayKey(),      // روزی که تسک‌های روزانه برای آن ساخته شده
    daily: freshDaily(),
    checked: {},           // تیک تسک‌های بلندمدت: { taskId: true }
    schedule: {             // برنامه ساعتی امروز (پاییز و مدرسه)
      date: todayKey(),
      mode: "school",       // "school" یا "holiday"
      checked: {}           // { "school-code-0": true, ... }
    },
    xp: 0,
    streak: 0,
    lastActiveDay: null,   // آخرین روزی که حداقل یک کار انجام شد
    perfectDay: null,      // روزی که پاداش کامل گرفته شده
    projects: [],
    habits: {},            // { "2026-09": { "h-study": { "12": true } } }
    theme: "dark"
  };
}

let state = defaultState();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("ذخیره‌سازی ممکن نشد:", e);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...defaultState(), ...JSON.parse(raw) };
  } catch (e) {
    console.warn("خواندن اطلاعات ممکن نشد:", e);
    state = defaultState();
  }
  rolloverDay();
}

// اگر روز عوض شده باشد، برنامه امروز تازه می‌شود و Streak بررسی می‌شود
function rolloverDay() {
  const today = todayKey();
  if (state.date !== today) {
    state.date = today;
    state.daily = freshDaily();
    // اگر دیروز و پریروز هیچ کاری انجام نشده، Streak صفر می‌شود
    if (state.lastActiveDay !== yesterdayKey() && state.lastActiveDay !== today) {
      state.streak = 0;
    }
    save();
  }
  if (!state.schedule || state.schedule.date !== today) {
    state.schedule = { date: today, mode: "school", checked: {} };
    save();
  }
}

/* ---------- 4) XP، سطح و Streak ---------- */

function addXp(amount) {
  state.xp = Math.max(0, state.xp + amount);
}

function currentLevel() {
  let level = LEVELS[0];
  let index = 0;
  LEVELS.forEach((l, i) => {
    if (state.xp >= l.min) { level = l; index = i; }
  });
  const next = LEVELS[index + 1] || null;
  return { level, next, index };
}

// وقتی حداقل یک کار امروز انجام شد، روز «فعال» حساب می‌شود
function markActiveToday() {
  const today = todayKey();
  if (state.lastActiveDay === today) return;
  state.streak = state.lastActiveDay === yesterdayKey() ? state.streak + 1 : 1;
  state.lastActiveDay = today;
}

// اگر همه تسک‌های امروز تیک خوردند، یک بار پاداش روز کامل داده می‌شود
function checkPerfectDay() {
  const today = todayKey();
  const all = state.daily.length > 0 && state.daily.every((t) => t.done);
  if (all && state.perfectDay !== today) {
    state.perfectDay = today;
    addXp(XP_PERFECT_DAY);
    toast(`روز کامل شد — ${fa(XP_PERFECT_DAY)}+ XP`);
  }
}

/* ---------- 5) رندر ---------- */

/* — برنامه امروز — */
function renderToday() {
  const list = $("#todayList");
  list.innerHTML = "";

  state.daily.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " is-done" : "");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = task.done;
    input.id = "chk-" + task.id;

    const label = document.createElement("label");
    label.className = "task-text";
    label.setAttribute("for", input.id);
    label.textContent = task.title;

    const meta = document.createElement("span");
    meta.className = "task-meta";
    meta.textContent = `${fa(task.minutes)} دقیقه • ${fa(task.xp)} XP`;

    input.addEventListener("change", () => {
      task.done = input.checked;
      addXp(input.checked ? task.xp : -task.xp);
      if (input.checked) markActiveToday();
      checkPerfectDay();
      save();
      renderAll();
    });

    li.append(input, label, meta);
    list.appendChild(li);
  });

  const done = state.daily.filter((t) => t.done).length;
  const total = state.daily.length;
  const pct = percent(done, total);

  const bar = $("#todayBar");
  bar.style.width = pct + "%";
  bar.classList.toggle("is-full", pct === 100);
  $("#todayCaption").textContent = `${fa(pct)}٪ از برنامه امروز`;

  return { done, total, pct };
}

/* — خلاصه داشبورد — */
function renderSummary(today) {
  $("#summaryToday").textContent = `امروز ${fa(today.done)} از ${fa(today.total)} کار انجام شده`;

  const { level } = currentLevel();
  $("#summaryXp").textContent = `XP: ${fa(state.xp)} — ${level.name}`;

  let msg;
  if (today.pct === 100) msg = "امروز کامل شد. فردا فقط ادامه بده.";
  else if (today.pct >= 50) msg = "عالیه؛ امروزت رو ساختی.";
  else msg = "فقط یک کار کوچک انجام بده؛ لازم نیست امروز کامل باشی.";
  $("#summaryMessage").textContent = msg;

  $("#statStreak").textContent = fa(state.streak);
}

/* — برنامه روزانه ساعتی — */

// لیست بلوک‌های امروز بر اساس حالت انتخاب‌شده (مدرسه/تعطیل)
function scheduleList() {
  return state.schedule.mode === "holiday" ? SCHEDULE_HOLIDAY : SCHEDULE_SCHOOL;
}

// محاسبه پیشرفت کل برنامه ساعتی امروز
function scheduleProgress() {
  const mode = state.schedule.mode;
  let total = 0, done = 0;
  scheduleList().forEach((block) => {
    block.tasks.forEach((_, i) => {
      total++;
      if (state.schedule.checked[`${mode}-${block.id}-${i}`]) done++;
    });
  });
  return { done, total, pct: percent(done, total) };
}

function renderDaily() {
  const mode = state.schedule.mode;

  // دکمه‌های انتخاب حالت روز
  $$("#scheduleModeToggle .mode-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.mode === mode);
  });

  // بلوک‌های ساعتی
  const wrap = $("#scheduleBlocks");
  wrap.innerHTML = "";

  scheduleList().forEach((block) => {
    const card = document.createElement("section");
    card.className = "card schedule-block";

    const head = document.createElement("div");
    head.className = "schedule-block-head";
    head.innerHTML = `
      <span class="schedule-time">${block.time}</span>
      <span class="schedule-block-title">${block.title}</span>`;
    card.appendChild(head);

    const items = block.tasks.map((t, i) => ({ id: `${mode}-${block.id}-${i}`, title: t }));
    const list = buildTaskList(items, XP_TASK_SCHEDULE, { checked: state.schedule.checked });
    card.appendChild(list);

    if (block.link) {
      const linkBtn = document.createElement("button");
      linkBtn.type = "button";
      linkBtn.className = "schedule-link";
      linkBtn.textContent = block.linkLabel || "مشاهده بخش مربوطه";
      linkBtn.addEventListener("click", () => showView(block.link));
      card.appendChild(linkBtn);
    }

    wrap.appendChild(card);
  });

  // پیشرفت کلی امروز (در همین صفحه و در داشبورد)
  const sp = scheduleProgress();

  const bar = $("#scheduleBar");
  bar.style.width = sp.pct + "%";
  bar.classList.toggle("is-full", sp.pct === 100);
  $("#scheduleTopCaption").textContent = `پیشرفت امروز: ${fa(sp.pct)}٪`;

  const dashBar = $("#dashScheduleBar");
  dashBar.style.width = sp.pct + "%";
  dashBar.classList.toggle("is-full", sp.pct === 100);
  $("#dashScheduleCaption").textContent = `${fa(sp.pct)}٪ از برنامه ساعتی امروز`;
  $("#dashScheduleModeBadge").textContent = mode === "holiday" ? "روز تعطیل" : "روز مدرسه";
}

/* — درس‌ها — */
function renderSubjects() {
  const body = $("#subjectsBody");
  body.innerHTML = "";

  SUBJECTS.forEach((s) => {
    const pct = percent(s.level, 5);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${fa(s.level)}/۵</td>
      <td class="${s.prioClass}">${s.prio}</td>
      <td>${s.goal}</td>
      <td class="cell-bar">
        <div class="progress" style="margin-top:0">
          <div class="progress-bar${pct === 100 ? " is-full" : ""}" style="width:${pct}%"></div>
        </div>
        <span class="progress-caption">${fa(pct)}٪</span>
      </td>`;
    body.appendChild(tr);
  });
}

/* — یک لیست تسک قابل تیک برای بخش‌های بلندمدت (و برنامه روزانه) —
   options.checked: آبجکتی که تیک‌ها در آن ذخیره می‌شود (پیش‌فرض: state.checked) */
function buildTaskList(items, xpPerTask, options = {}) {
  const store = options.checked || state.checked;

  const ul = document.createElement("ul");
  ul.className = "task-list";

  items.forEach((item) => {
    const li = document.createElement("li");
    const isDone = !!store[item.id];
    li.className = "task" + (isDone ? " is-done" : "");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = isDone;
    input.id = "chk-" + item.id;

    const label = document.createElement("label");
    label.className = "task-text";
    label.setAttribute("for", input.id);
    label.textContent = item.title;

    input.addEventListener("change", () => {
      if (input.checked) {
        store[item.id] = true;
        addXp(xpPerTask);
        markActiveToday();
      } else {
        delete store[item.id];
        addXp(-xpPerTask);
      }
      save();
      renderAll();
    });

    li.append(input, label);
    ul.appendChild(li);
  });

  return ul;
}

/* — نقشه راه برنامه‌نویسی — */
function stageStatus(stage) {
  const ids = stage.tasks.map((_, i) => `${stage.id}-${i}`);
  const done = ids.filter((id) => state.checked[id]).length;
  const pct = percent(done, ids.length);
  let status = "Not Started";
  if (pct === 100) status = "Completed";
  else if (done > 0) status = "In Progress";
  return { done, total: ids.length, pct, status };
}

function renderRoadmap() {
  const wrap = $("#roadmapList");
  wrap.innerHTML = "";

  ROADMAP.forEach((stage, index) => {
    const st = stageStatus(stage);

    const li = document.createElement("li");
    li.className = "tl-item";

    const dot = document.createElement("div");
    dot.className = "tl-dot" + (st.status === "Completed" ? " is-done" : "");
    dot.setAttribute("aria-hidden", "true");

    const card = document.createElement("div");
    card.className = "card";

    const head = document.createElement("button");
    head.className = "stage-head";
    head.type = "button";
    head.setAttribute("aria-expanded", "false");
    head.innerHTML = `
      <span class="card-title">${fa(index + 1)}. ${stage.title}</span>
      <span>
        <span class="badge ${st.status === "Completed" ? "is-done" : st.status === "In Progress" ? "is-doing" : ""}">
          ${st.status === "Completed" ? "تمام شده" : st.status === "In Progress" ? "در حال انجام" : "شروع نشده"}
        </span>
        <span class="chev" aria-hidden="true">▾</span>
      </span>`;

    const desc = document.createElement("p");
    desc.className = "stage-desc";
    desc.textContent = stage.desc;

    const bar = document.createElement("div");
    bar.className = "progress";
    bar.innerHTML = `<div class="progress-bar${st.pct === 100 ? " is-full" : ""}" style="width:${st.pct}%"></div>`;

    const cap = document.createElement("p");
    cap.className = "progress-caption";
    cap.textContent = `${fa(st.done)} از ${fa(st.total)} — ${fa(st.pct)}٪`;

    const boxKey = "stage-" + stage.id;
    const body = document.createElement("div");
    body.className = "stage-body";
    body.appendChild(
      buildTaskList(
        stage.tasks.map((t, i) => ({ id: `${stage.id}-${i}`, title: t })),
        XP_TASK_ROADMAP
      )
    );

    // اگر قبلاً باز بوده، باز بماند
    if (openBoxes.has(boxKey)) {
      body.classList.add("is-open");
      head.setAttribute("aria-expanded", "true");
      head.querySelector(".chev").classList.add("is-open");
    }

    head.addEventListener("click", () => {
      const open = body.classList.toggle("is-open");
      if (open) openBoxes.add(boxKey); else openBoxes.delete(boxKey);
      head.setAttribute("aria-expanded", String(open));
      head.querySelector(".chev").classList.toggle("is-open", open);
    });

    card.append(head, desc, bar, cap, body);
    li.append(dot, card);
    wrap.appendChild(li);
  });
}

/* — زبان — */
function renderLanguage() {
  // انگلیسی
  const enWrap = $("#englishList");
  enWrap.replaceWith(Object.assign(buildTaskList(ENGLISH_TASKS, 10), { id: "englishList" }));

  const enDone = ENGLISH_TASKS.filter((t) => state.checked[t.id]).length;
  $("#enBadge").textContent = fa(percent(enDone, ENGLISH_TASKS.length)) + "٪";

  // آلمانی
  const deWrap = $("#germanLevels");
  deWrap.innerHTML = "";

  let deDone = 0, deTotal = 0;

  GERMAN_LEVELS.forEach((lvl) => {
    const items = lvl.tasks.map((t, i) => ({ id: `de-${lvl.id}-${i}`, title: t }));
    const done = items.filter((i) => state.checked[i.id]).length;
    deDone += done;
    deTotal += items.length;

    const box = document.createElement("div");
    box.className = "level";

    const head = document.createElement("button");
    head.className = "level-head";
    head.type = "button";
    head.setAttribute("aria-expanded", "false");
    head.innerHTML = `
      <span class="level-title">${lvl.title}</span>
      <span>
        <span class="badge ${done === items.length ? "is-done" : done > 0 ? "is-doing" : ""}">
          ${fa(done)} از ${fa(items.length)}
        </span>
        <span class="chev" aria-hidden="true">▾</span>
      </span>`;

    const boxKey = "level-" + lvl.id;
    const body = document.createElement("div");
    body.className = "level-body";
    body.appendChild(buildTaskList(items, XP_TASK_GERMAN));

    if (openBoxes.has(boxKey)) {
      body.classList.add("is-open");
      head.setAttribute("aria-expanded", "true");
      head.querySelector(".chev").classList.add("is-open");
    }

    head.addEventListener("click", () => {
      const open = body.classList.toggle("is-open");
      if (open) openBoxes.add(boxKey); else openBoxes.delete(boxKey);
      head.setAttribute("aria-expanded", String(open));
      head.querySelector(".chev").classList.toggle("is-open", open);
    });

    box.append(head, body);
    deWrap.appendChild(box);
  });

  $("#deBadge").textContent = fa(percent(deDone, deTotal)) + "٪";
}

/* — پروژه‌ها — */
function renderProjects() {
  const wrap = $("#projectList");
  wrap.innerHTML = "";
  $("#projCount").textContent = `${fa(state.projects.length)} پروژه`;

  if (state.projects.length === 0) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "هنوز پروژه‌ای اضافه نکرده‌ای. با «اولین سایت شخصی» شروع کن.";
    wrap.appendChild(p);
    return;
  }

  state.projects.forEach((proj) => {
    const card = document.createElement("article");
    card.className = "project" + (proj.done ? " is-done" : "");

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = proj.name;

    const desc = document.createElement("p");
    desc.className = "card-text";
    desc.textContent = proj.desc || "بدون توضیح";

    const tech = document.createElement("p");
    tech.className = "task-meta";
    tech.textContent = proj.tech ? `تکنولوژی: ${proj.tech}` : "تکنولوژی مشخص نشده";

    const bar = document.createElement("div");
    bar.className = "progress";
    bar.innerHTML = `<div class="progress-bar${proj.progress >= 100 ? " is-full" : ""}" style="width:${proj.progress}%"></div>`;

    const cap = document.createElement("p");
    cap.className = "progress-caption";
    cap.textContent = `${fa(proj.progress)}٪`;

    // ردیف تیک «تمام شد»
    const doneRow = document.createElement("div");
    doneRow.className = "project-row";
    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.id = "proj-chk-" + proj.id;
    chk.checked = !!proj.done;
    const chkLabel = document.createElement("label");
    chkLabel.setAttribute("for", chk.id);
    chkLabel.textContent = "این پروژه تمام شد";
    chk.addEventListener("change", () => {
      proj.done = chk.checked;
      if (chk.checked) { proj.status = "Completed"; proj.progress = 100; }
      save();
      renderAll();
    });
    doneRow.append(chk, chkLabel);

    // تغییر وضعیت و حذف
    const actions = document.createElement("div");
    actions.className = "project-actions";

    const select = document.createElement("select");
    select.setAttribute("aria-label", `وضعیت پروژه ${proj.name}`);
    [["Not Started", "شروع نشده"], ["In Progress", "در حال انجام"], ["Completed", "تمام شده"]]
      .forEach(([value, text]) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = text;
        if (proj.status === value) opt.selected = true;
        select.appendChild(opt);
      });
    select.addEventListener("change", () => {
      proj.status = select.value;
      if (proj.status === "Completed") { proj.progress = 100; proj.done = true; }
      save();
      renderAll();
    });

    const del = document.createElement("button");
    del.className = "btn btn-danger btn-sm";
    del.type = "button";
    del.textContent = "حذف";
    del.addEventListener("click", () => {
      state.projects = state.projects.filter((p) => p.id !== proj.id);
      save();
      renderAll();
      toast("پروژه حذف شد");
    });

    actions.append(select, del);

    card.append(title, desc, tech, bar, cap, doneRow, actions);

    if (proj.link) {
      const a = document.createElement("a");
      a.className = "project-link";
      a.href = proj.link;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "مشاهده در GitHub";
      card.appendChild(a);
    }

    wrap.appendChild(card);
  });
}

/* — عادت‌ها — */
function renderHabits() {
  const mKey = monthKey();
  const [year, month] = mKey.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayNum = new Date().getDate();

  if (!state.habits[mKey]) state.habits[mKey] = {};
  const monthData = state.habits[mKey];

  $("#habitMonth").textContent = `ماه جاری: ${fa(year)}/${fa(String(month).padStart(2, "0"))}`;

  // سر ستون‌ها (روزها)
  const head = $("#habitHead");
  head.innerHTML = '<th class="habit-name" scope="col">عادت</th>';
  for (let d = 1; d <= daysInMonth; d++) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = fa(d);
    head.appendChild(th);
  }

  // ردیف‌ها
  const body = $("#habitBody");
  body.innerHTML = "";
  let done = 0;
  const total = HABITS.length * daysInMonth;

  HABITS.forEach((habit) => {
    if (!monthData[habit.id]) monthData[habit.id] = {};
    const row = document.createElement("tr");

    const th = document.createElement("th");
    th.scope = "row";
    th.className = "habit-name";
    th.textContent = habit.title;
    row.appendChild(th);

    for (let d = 1; d <= daysInMonth; d++) {
      const td = document.createElement("td");
      const cell = document.createElement("button");
      cell.type = "button";
      const on = !!monthData[habit.id][d];
      if (on) done++;
      cell.className = "habit-cell" + (on ? " is-on" : "") + (d === todayNum ? " is-today" : "");
      cell.setAttribute("aria-pressed", String(on));
      cell.setAttribute("aria-label", `${habit.title} — روز ${d}`);

      cell.addEventListener("click", () => {
        if (monthData[habit.id][d]) delete monthData[habit.id][d];
        else monthData[habit.id][d] = true;
        save();
        renderHabits();
      });

      td.appendChild(cell);
      row.appendChild(td);
    }

    body.appendChild(row);
  });

  $("#habitBadge").textContent = fa(percent(done, total)) + "٪";
}

/* — پیشرفت کلی و XP — */
function countLongTerm() {
  let total = 0, done = 0;

  ROADMAP.forEach((stage) => {
    stage.tasks.forEach((_, i) => {
      total++;
      if (state.checked[`${stage.id}-${i}`]) done++;
    });
  });

  ENGLISH_TASKS.forEach((t) => {
    total++;
    if (state.checked[t.id]) done++;
  });

  GERMAN_LEVELS.forEach((lvl) => {
    lvl.tasks.forEach((_, i) => {
      total++;
      if (state.checked[`de-${lvl.id}-${i}`]) done++;
    });
  });

  return { done, total, pct: percent(done, total) };
}

function renderProgress() {
  const overall = countLongTerm();

  $("#statOverall").textContent = fa(overall.pct);
  const oBar = $("#overallBar");
  oBar.style.width = overall.pct + "%";
  oBar.classList.toggle("is-full", overall.pct === 100);
  $("#overallCaption").textContent =
    `${fa(overall.done)} از ${fa(overall.total)} کار بلندمدت — ${fa(overall.pct)}٪`;

  const { level, next } = currentLevel();
  $("#levelBadge").textContent = level.name;
  $("#xpValue").textContent = fa(state.xp);

  if (next) {
    const span = next.min - level.min;
    const pct = Math.min(100, percent(state.xp - level.min, span));
    $("#xpBar").style.width = pct + "%";
    $("#xpCaption").textContent = `${fa(next.min - state.xp)} XP تا ${next.name}`;
  } else {
    $("#xpBar").style.width = "100%";
    $("#xpBar").classList.add("is-full");
    $("#xpCaption").textContent = "بالاترین سطح";
  }
}

/* — رندر کامل — */
function renderAll() {
  const today = renderToday();
  renderSummary(today);
  renderDaily();
  renderSubjects();
  renderRoadmap();
  renderLanguage();
  renderProjects();
  renderHabits();
  renderProgress();
}

/* ---------- 6) رویدادها ---------- */

// جابه‌جایی بین بخش‌ها
function showView(id) {
  $$(".view").forEach((v) => v.classList.toggle("is-visible", v.id === id));
  $$(".nav-item").forEach((b) => {
    const active = b.dataset.target === id;
    b.classList.toggle("is-active", active);
    if (active) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  $("#" + id).focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const dark = state.theme === "dark";
  $("#themeIcon").textContent = dark ? "☀️" : "🌙";
  $("#themeLabel").textContent = dark ? "حالت روشن" : "حالت تاریک";
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  save();
}

function resetDay() {
  state.daily = freshDaily();
  save();
  renderAll();
  toast("برنامه امروز از نو شروع شد");
}

function resetSchedule() {
  state.schedule.checked = {};
  save();
  renderAll();
  toast("برنامه ساعتی امروز از نو شروع شد");
}

function bindEvents() {
  // ناوبری
  $("#nav").addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-item");
    if (btn) showView(btn.dataset.target);
  });

  // تم
  $("#themeToggle").addEventListener("click", toggleTheme);
  $("#themeToggle2").addEventListener("click", toggleTheme);

  // شروع دوباره روز
  $("#resetDay").addEventListener("click", resetDay);
  $("#resetDay2").addEventListener("click", resetDay);

  // برنامه روزانه ساعتی: تعویض روز مدرسه / تعطیل
  $("#scheduleModeToggle").addEventListener("click", (e) => {
    const btn = e.target.closest(".mode-btn");
    if (!btn) return;
    state.schedule.mode = btn.dataset.mode;
    save();
    renderAll();
  });

  $("#resetSchedule").addEventListener("click", resetSchedule);

  // دکمه داشبورد برای رفتن به برنامه کامل روز
  $("#goDailyBtn").addEventListener("click", () => showView("daily"));

  // پاک کردن همه اطلاعات
  $("#resetAll").addEventListener("click", () => {
    if (!confirm("همه اطلاعات پاک شود؟ این کار برگشت‌پذیر نیست.")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    applyTheme();
    renderAll();
    toast("همه اطلاعات پاک شد");
  });

  // دکمه روز کم‌انرژی
  $("#emergencyBtn").addEventListener("click", () => {
    let added = 0;
    EMERGENCY_TASKS.forEach((t) => {
      if (!state.daily.some((d) => d.id === t.id)) {
        state.daily.push({ ...t, done: false });
        added++;
      }
    });
    save();
    renderAll();
    showView("dashboard");
    toast(added ? "دو کار کوچک به برنامه امروز اضافه شد" : "این دو کار از قبل در برنامه امروز هست");
  });

  // افزودن پروژه
  $("#projectForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#projName").value.trim();
    if (!name) return;

    state.projects.push({
      id: "p-" + Date.now(),
      name,
      desc: $("#projDesc").value.trim(),
      tech: $("#projTech").value.trim(),
      status: $("#projStatus").value,
      progress: Math.min(100, Math.max(0, Number($("#projProgress").value) || 0)),
      link: $("#projLink").value.trim(),
      done: $("#projStatus").value === "Completed"
    });

    e.target.reset();
    $("#projProgress").value = 0;
    save();
    renderAll();
    toast("پروژه اضافه شد");
  });
}

/* ---------- 7) شروع ---------- */

function init() {
  load();
  applyTheme();
  bindEvents();
  renderAll();
}

document.addEventListener("DOMContentLoaded", init);

/* ---------- 8) پشتیبان‌گیری، نصب و کار بدون اینترنت ---------- */

// گرفتن فایل پشتیبان (JSON)
document.addEventListener("DOMContentLoaded", () => {
  $("#exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roadmap-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("فایل پشتیبان ساخته شد");
  });

  // بازگرداندن اطلاعات از فایل
  $("#importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        state = { ...defaultState(), ...data };
        rolloverDay();
        save();
        applyTheme();
        renderAll();
        toast("اطلاعات برگردانده شد");
      } catch (err) {
        toast("فایل معتبر نیست");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  });
});

// دکمه نصب (در کروم اندروید و دسکتاپ)
let installEvent = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installEvent = e;
  const card = document.getElementById("installCard");
  if (card) card.hidden = false;
});

document.addEventListener("DOMContentLoaded", () => {
  $("#installBtn").addEventListener("click", async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    installEvent = null;
    document.getElementById("installCard").hidden = true;
  });
});

window.addEventListener("appinstalled", () => toast("برنامه نصب شد"));

// ثبت Service Worker برای اجرا بدون اینترنت
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Service Worker ثبت نشد:", err);
    });
  });
}
