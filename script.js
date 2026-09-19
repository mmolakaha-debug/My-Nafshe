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
  { id: "d-math",   title: "ریاضی",                minutes: 30, xp: 20, cat: "درس" },
  { id: "d-arabic", title: "عربی",                 minutes: 20, xp: 15, cat: "درس" },
  { id: "d-code",   title: "HTML / برنامه‌نویسی",  minutes: 20, xp: 25, cat: "برنامه‌نویسی" },
  { id: "d-review", title: "مرور کوتاه",           minutes: 5,  xp: 10, cat: "درس" }
];

// دسته‌های مجاز برای کارهایی که خودت اضافه می‌کنی
const TASK_CATEGORIES = ["درس", "برنامه‌نویسی", "زبان", "هدف", "سایر"];
const XP_CUSTOM_TASK = 10;   // XP کارهایی که خودت اضافه می‌کنی

// تسک‌های «روز کم‌انرژی»
const EMERGENCY_TASKS = [
  { id: "d-sos-math", title: "۱۰ دقیقه ریاضی", minutes: 10, xp: 10, cat: "درس" },
  { id: "d-sos-html", title: "۱۰ دقیقه HTML",  minutes: 10, xp: 10, cat: "برنامه‌نویسی" }
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
  { id: "h-read",  title: "کتاب‌خوانی" },
  { id: "h-sport", title: "ورزش" },
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

// ===== تقویم ۱۴۰۵ =====
// نکته: این تقویم فقط برای سال ۱۴۰۵ (۲۱ مارس ۲۰۲۶ تا ۲۰ مارس ۲۰۲۷) دقیق است.
const PERSIAN_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];
// طول هر ماه در سال ۱۴۰۵ (سال عادی، اسفند ۲۹ روز)
const MONTH_LENGTHS_1405 = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
// شنبه = ۰ تا جمعه = ۶ (۱ فروردین ۱۴۰۵ روز شنبه بوده است)
const WEEKDAYS_FA = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

// تعطیلات رسمی سال ۱۴۰۵ — بر اساس تقویم رسمی کشور. کلید: "ماه-روز"
// این لیست داخلی و قابل ویرایش است؛ برای افزودن تعطیلی جدید فقط یک خط اضافه کن.
const HOLIDAYS_1405 = {
  "1-1": "جشن نوروز و عید سعید فطر",
  "1-2": "نوروز",
  "1-3": "نوروز",
  "1-4": "نوروز",
  "1-12": "روز جمهوری اسلامی ایران",
  "1-13": "روز طبیعت (سیزده‌به‌در)",
  "1-25": "شهادت امام جعفر صادق (ع)",
  "3-6": "عید سعید قربان",
  "3-14": "رحلت امام خمینی (ره) و عید سعید غدیر خم",
  "3-15": "قیام ۱۵ خرداد",
  "4-3": "تاسوعای حسینی",
  "4-4": "عاشورای حسینی",
  "5-13": "اربعین حسینی",
  "5-21": "رحلت رسول اکرم (ص) و شهادت امام حسن (ع)",
  "5-22": "شهادت امام رضا (ع)",
  "5-30": "شهادت امام حسن عسکری (ع)",
  "6-8": "میلاد پیامبر اکرم (ص) و امام جعفر صادق (ع)",
  "8-22": "شهادت حضرت فاطمه زهرا (س)",
  "10-2": "ولادت امام علی (ع) و روز پدر",
  "10-16": "مبعث پیامبر اکرم (ص)",
  "11-4": "ولادت امام زمان (عج)",
  "11-22": "پیروزی انقلاب اسلامی",
  "12-9": "شهادت امام علی (ع)",
  "12-19": "عید سعید فطر",
  "12-20": "تعطیل به مناسبت عید سعید فطر",
  "12-29": "روز ملی شدن صنعت نفت ایران"
};

// روز چندم سال است (۱ فروردین = ۱)
function dayOfYear1405(month, day) {
  let doy = day;
  for (let m = 1; m < month; m++) doy += MONTH_LENGTHS_1405[m - 1];
  return doy;
}

// اندیس روز هفته: ۰=شنبه ... ۶=جمعه
function weekdayIndex1405(month, day) {
  return (dayOfYear1405(month, day) - 1) % 7;
}

function holidayLabel1405(month, day) {
  return HOLIDAYS_1405[`${month}-${day}`] || null;
}

function isHoliday1405(month, day) {
  return !!holidayLabel1405(month, day) || weekdayIndex1405(month, day) === 6;
}

// تاریخ امروز را در تقویم ۱۴۰۵ محاسبه می‌کند (فقط در بازه این سال معتبر است)
function todayJalali1405() {
  const anchor = new Date(2026, 2, 21); // ۱ فروردین ۱۴۰۵ = ۲۱ مارس ۲۰۲۶
  const now = new Date();
  const anchorMid = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((todayMid - anchorMid) / 86400000) + 1;
  if (diff < 1 || diff > 365) return null;
  let doy = diff, m = 1;
  for (const len of MONTH_LENGTHS_1405) {
    if (doy <= len) break;
    doy -= len;
    m++;
  }
  return { month: m, day: doy };
}

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

// عدد با جداکننده هزارگان و ارقام فارسی: 1240 ← ۱٬۲۴۰
function faNum(num) {
  return fa(Number(num).toLocaleString("en-US")).replace(/,/g, "٬");
}

// متن یک المان را (اگر وجود داشت) عوض می‌کند
function setText(sel, text) {
  const el = $(sel);
  if (el) el.textContent = text;
}

// تاریخ شمسی امروز؛ از خود مرورگر گرفته می‌شود تا بعد از ۱۴۰۵ هم درست بماند
function persianDateLabel() {
  try {
    // اجزا را جدا می‌گیریم تا ترتیب نمایش همیشه «روز هفته ۲۸ شهریور ۱۴۰۵» باشد
    const parts = {};
    new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    }).formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
    if (!parts.weekday || !parts.day || !parts.month || !parts.year) throw new Error("incomplete");
    return `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`;
  } catch (e) {
    const t = todayJalali1405();
    return t ? `${WEEKDAYS_FA[weekdayIndex1405(t.month, t.day)]} ${fa(t.day)} ${PERSIAN_MONTHS[t.month - 1]} ۱۴۰۵` : "";
  }
}

// کل ردیف با کلیک روی هر جای آن تیک بخورد (کلیک روی خود تیک‌باکس و برچسب همان رفتار قبلی را دارد)
function makeRowToggle(li, input) {
  li.addEventListener("click", (e) => {
    if (e.target.closest("input, label, button, a")) return;
    input.click();
  });
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
    calendarSelected: null, // { month, day } — آخرین روزی که در تقویم انتخاب شده
    xp: 0,
    streak: 0,
    lastActiveDay: null,   // آخرین روزی که حداقل یک کار انجام شد
    perfectDay: null,      // روزی که پاداش کامل گرفته شده
    projects: [],
    habits: {},            // { "2026-09": { "h-study": { "12": true } } }
    school: {},            // پیشرفت درس‌ها: { "ریاضی": 35 } (درصد؛ اگر نبود از سطح پیش‌فرض ساخته می‌شود)
    focus: { date: todayKey(), sessions: 0, minutes: 0 },  // جلسه‌های تمرکز امروز
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
  if (!state.school || typeof state.school !== "object") state.school = {};
  if (!state.focus || state.focus.date !== today) {
    state.focus = { date: today, sessions: 0, minutes: 0 };
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

// اگر بعد از پاداش «روز کامل» یک تیک برداشته شود، پاداش هم برمی‌گردد (تا دوباره کامل شود)
function revokePerfectDay() {
  const today = todayKey();
  const all = state.daily.length > 0 && state.daily.every((t) => t.done);
  if (state.perfectDay === today && !all) {
    state.perfectDay = null;
    addXp(-XP_PERFECT_DAY);
  }
}

// تیک زدن یا برداشتن یک کار امروز؛ XP فقط یک بار اضافه و در برگشت دقیقاً کم می‌شود
function setDailyDone(task, done) {
  if (task.done === done) return;
  task.done = done;
  addXp(done ? task.xp : -task.xp);
  if (done) { markActiveToday(); checkPerfectDay(); }
  else revokePerfectDay();
  save();
  renderAll();
}

// اضافه کردن کار جدید به برنامه امروز
function addCustomTask(title, cat, minutes) {
  const clean = String(title).trim().slice(0, 60);
  if (!clean) return false;
  state.daily.push({
    id: "d-custom-" + Date.now(),
    title: clean,
    cat: TASK_CATEGORIES.includes(cat) ? cat : "سایر",
    minutes: Math.min(240, Math.max(5, Number(minutes) || 20)),
    xp: XP_CUSTOM_TASK,
    done: false
  });
  save();
  renderAll();
  return true;
}

// حذف کارهایی که خودت اضافه کرده‌ای (کارهای اصلی برنامه حذف نمی‌شوند)
function removeDailyTask(id) {
  const task = state.daily.find((t) => t.id === id);
  if (!task || DEFAULT_DAILY.some((d) => d.id === id)) return;
  if (task.done) addXp(-task.xp);
  state.daily = state.daily.filter((t) => t.id !== id);
  if (task.done) revokePerfectDay();
  checkPerfectDay();
  save();
  renderAll();
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

    const body = document.createElement("div");
    body.className = "task-body";

    const label = document.createElement("label");
    label.className = "task-text";
    label.setAttribute("for", input.id);
    label.textContent = task.title;

    // دسته + زمان + XP (کارهای قدیمی که دسته ندارند از روی کارهای پیش‌فرض پر می‌شوند)
    const known = DEFAULT_DAILY.concat(EMERGENCY_TASKS).find((d) => d.id === task.id);
    const cat = task.cat || (known && known.cat) || "";

    const tags = document.createElement("div");
    tags.className = "task-tags";
    if (cat) {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = cat;
      tags.appendChild(chip);
    }
    const meta = document.createElement("span");
    meta.className = "task-meta";
    meta.textContent = `${fa(task.minutes)} دقیقه • ${fa(task.xp)} XP`;
    tags.appendChild(meta);

    body.append(label, tags);
    input.addEventListener("change", () => setDailyDone(task, input.checked));

    li.append(input, body);

    if (!DEFAULT_DAILY.some((d) => d.id === task.id)) {
      const del = document.createElement("button");
      del.type = "button";
      del.className = "task-del";
      del.textContent = "✕";
      del.setAttribute("aria-label", `حذف «${task.title}»`);
      del.addEventListener("click", () => removeDailyTask(task.id));
      li.appendChild(del);
    }

    makeRowToggle(li, input);
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
  setText("#heroDate", persianDateLabel());
  setText("#heroPct", fa(today.pct) + "٪");
  setText("#heroStreak", fa(state.streak));
  setText("#heroDone", fa(today.done));
  setText("#heroLeft", fa(today.total - today.done));
  setText("#heroXp", faNum(state.xp));

  const ring = $("#heroRing");
  if (ring) {
    ring.style.setProperty("--p", today.pct);
    ring.classList.toggle("is-full", today.pct === 100);
    ring.setAttribute("aria-label", `${fa(today.pct)} درصد از کارهای امروز انجام شده`);
  }

  // سطح و نوار XP
  const { level, next, index } = currentLevel();
  setText("#heroLevel", `Level ${fa(index + 1)} — ${level.name.split("—")[1] ? level.name.split("—")[1].trim() : level.name}`);
  const xpBar = $("#heroXpBar");
  if (next) {
    const pct = Math.min(100, percent(state.xp - level.min, next.min - level.min));
    if (xpBar) xpBar.style.width = pct + "%";
    setText("#heroXpCaption", `${faNum(state.xp)} از ${faNum(next.min)} XP`);
  } else {
    if (xpBar) xpBar.style.width = "100%";
    setText("#heroXpCaption", `${faNum(state.xp)} XP — بالاترین سطح`);
  }

  let msg;
  if (today.pct === 100) msg = "امروز کامل شد. فردا فقط ادامه بده.";
  else if (today.pct >= 50) msg = "عالیه؛ امروزت رو ساختی.";
  else msg = "فقط یک کار کوچک انجام بده؛ لازم نیست امروز کامل باشی.";
  setText("#summaryMessage", msg);
}

/* — تقویم ۱۴۰۵ — */

// شبکه ۱۲ ماه را می‌سازد (فقط یک‌بار در شروع برنامه صدا زده می‌شود)
function renderCalendarMonths() {
  const wrap = $("#calendarMonths");
  wrap.innerHTML = "";
  const today = todayJalali1405();

  PERSIAN_MONTHS.forEach((name, idx) => {
    const month = idx + 1;
    const length = MONTH_LENGTHS_1405[idx];
    const firstWeekday = weekdayIndex1405(month, 1);
    const isCurrentMonth = today && today.month === month;

    const card = document.createElement("section");
    card.className = "card cal-month";

    const head = document.createElement("button");
    head.type = "button";
    head.className = "stage-head";
    head.setAttribute("aria-expanded", isCurrentMonth ? "true" : "false");
    head.innerHTML = `<span class="card-title">${name} ۱۴۰۵</span><span class="chev${isCurrentMonth ? " is-open" : ""}" aria-hidden="true">▾</span>`;

    const body = document.createElement("div");
    body.className = "stage-body" + (isCurrentMonth ? " is-open" : "");

    const weekHead = document.createElement("div");
    weekHead.className = "cal-grid cal-grid-head";
    WEEKDAYS_FA.forEach((w) => {
      const c = document.createElement("span");
      c.textContent = w[0]; // فقط حرف اول برای جا شدن در موبایل
      c.title = w;
      weekHead.appendChild(c);
    });

    const grid = document.createElement("div");
    grid.className = "cal-grid";
    for (let i = 0; i < firstWeekday; i++) {
      grid.appendChild(document.createElement("span"));
    }
    for (let day = 1; day <= length; day++) {
      const holiday = holidayLabel1405(month, day);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      if (holiday || weekdayIndex1405(month, day) === 6) btn.classList.add("is-holiday");
      if (today && today.month === month && today.day === day) btn.classList.add("is-today");
      btn.dataset.month = month;
      btn.dataset.day = day;
      btn.textContent = fa(day);
      if (holiday) btn.title = holiday;
      grid.appendChild(btn);
    }

    body.append(weekHead, grid);

    head.addEventListener("click", () => {
      const open = body.classList.toggle("is-open");
      head.setAttribute("aria-expanded", String(open));
      head.querySelector(".chev").classList.toggle("is-open", open);
    });

    card.append(head, body);
    wrap.appendChild(card);
  });
}

// یک روز از تقویم انتخاب می‌شود
function selectCalendarDay(month, day) {
  state.calendarSelected = { month, day };
  save();

  $$(".cal-day").forEach((btn) => {
    const match = Number(btn.dataset.month) === month && Number(btn.dataset.day) === day;
    btn.classList.toggle("is-selected", match);
  });

  renderCalendarDetail();
}

// پنل جزئیات روزِ انتخاب‌شده
function renderCalendarDetail() {
  const box = $("#calendarDetail");
  const sel = state.calendarSelected;
  if (!sel) { box.hidden = true; return; }

  const { month, day } = sel;
  const weekday = WEEKDAYS_FA[weekdayIndex1405(month, day)];
  const holiday = holidayLabel1405(month, day);
  const isFriday = weekdayIndex1405(month, day) === 6;
  const today = todayJalali1405();
  const isToday = today && today.month === month && today.day === day;

  let typeLine;
  if (holiday) typeLine = `نوع روز: 🔴 تعطیل رسمی — ${holiday}`;
  else if (isFriday) typeLine = "نوع روز: 🟡 تعطیل هفتگی (جمعه)";
  else typeLine = "نوع روز: 🏫 روز مدرسه";

  let todayLine = "";
  if (isToday) {
    const done = state.daily.filter((t) => t.done).length;
    const total = state.daily.length;
    todayLine = `<p class="progress-caption">امروز است — ${fa(done)} از ${fa(total)} کار برنامه امروز انجام شده.</p>`;
  }

  box.hidden = false;
  box.innerHTML = `
    <h2 class="card-title">📅 ${weekday} ${fa(day)} ${PERSIAN_MONTHS[month - 1]} ۱۴۰۵</h2>
    <p class="card-text">${typeLine}</p>
    ${todayLine}
  `;
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

// درصد پیشرفت یک درس: اگر خودت تنظیم کرده باشی همان، وگرنه از سطح پیش‌فرض (۱ تا ۵)
function subjectPct(subject) {
  const v = state.school && state.school[subject.name];
  return typeof v === "number" ? v : subject.level * 20;
}

function schoolAverage() {
  const sum = SUBJECTS.reduce((acc, s) => acc + subjectPct(s), 0);
  return Math.round(sum / SUBJECTS.length);
}

function renderSubjects() {
  const body = $("#subjectsBody");
  if (body) {
    body.innerHTML = "";

    SUBJECTS.forEach((s) => {
      const pct = subjectPct(s);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.name}</td>
        <td class="subject-level"></td>
        <td class="${s.prioClass}">${s.prio}</td>
        <td>${s.goal}</td>
        <td class="cell-bar"></td>`;

      const levelCell = tr.querySelector(".subject-level");
      const barCell = tr.querySelector(".cell-bar");

      const range = document.createElement("input");
      range.type = "range";
      range.className = "range";
      range.min = "0";
      range.max = "100";
      range.step = "5";
      range.value = String(pct);
      range.setAttribute("aria-label", `پیشرفت ${s.name}`);

      const track = document.createElement("div");
      track.className = "progress";
      track.style.marginTop = "4px";
      const fill = document.createElement("div");
      fill.className = "progress-bar";
      track.appendChild(fill);

      const cap = document.createElement("span");
      cap.className = "progress-caption";

      // فقط ظاهر همین ردیف را زنده به‌روز می‌کند
      const paint = (value) => {
        fill.style.width = value + "%";
        fill.classList.toggle("is-full", value === 100);
        cap.textContent = fa(value) + "٪";
        levelCell.textContent = `${fa(Math.round(value / 20))}/۵`;
      };
      paint(pct);

      range.addEventListener("input", () => {
        state.school[s.name] = Number(range.value);
        paint(Number(range.value));
      });
      range.addEventListener("change", () => {
        save();
        renderSchoolDash();
        renderStats();
      });

      barCell.append(range, track, cap);
      body.appendChild(tr);
    });
  }

  renderSchoolDash();
}

// کارت فشرده درس‌ها در داشبورد
function renderSchoolDash() {
  const wrap = $("#dashSchool");
  if (!wrap) return;
  wrap.innerHTML = "";

  SUBJECTS.forEach((s) => {
    const pct = subjectPct(s);
    const row = document.createElement("div");
    row.className = "mini-bar";

    const name = document.createElement("span");
    name.className = "mini-bar-label";
    name.textContent = s.name;

    const track = document.createElement("div");
    track.className = "progress";
    const fill = document.createElement("div");
    fill.className = "progress-bar" + (pct === 100 ? " is-full" : "");
    fill.style.width = pct + "%";
    track.appendChild(fill);

    const val = document.createElement("span");
    val.className = "mini-bar-value";
    val.textContent = fa(pct) + "٪";

    row.append(name, track, val);
    wrap.appendChild(row);
  });

  setText("#dashSchoolAvg", `میانگین ${fa(schoolAverage())}٪`);
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
    makeRowToggle(li, input);
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

    // فقط لینک‌های http/https باز می‌شوند
    if (proj.link && /^https?:\/\//i.test(proj.link)) {
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
        renderAll();
      });

      td.appendChild(cell);
      row.appendChild(td);
    }

    body.appendChild(row);
  });

  $("#habitBadge").textContent = fa(percent(done, total)) + "٪";
  renderHabitsToday();
}

/* — عادت‌های امروز (کارت داشبورد) — */

// آیا این عادت در آن روز انجام شده؟
function habitOn(habitId, date) {
  const m = state.habits[todayKey(date).slice(0, 7)];
  return !!(m && m[habitId] && m[habitId][date.getDate()]);
}

// چند روز پشت‌سرهم (تا امروز یا دیروز)
function habitStreak(habitId) {
  const d = new Date();
  if (!habitOn(habitId, d)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (habitOn(habitId, d) && n < 366) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// چند روز از ۷ روز اخیر (با امروز)
function habitWeekCount(habitId) {
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (habitOn(habitId, d)) n++;
  }
  return n;
}

function toggleHabitToday(habitId) {
  const mKey = monthKey();
  const day = new Date().getDate();
  if (!state.habits[mKey]) state.habits[mKey] = {};
  if (!state.habits[mKey][habitId]) state.habits[mKey][habitId] = {};
  const row = state.habits[mKey][habitId];
  if (row[day]) delete row[day];
  else row[day] = true;
  save();
  renderAll();
}

function renderHabitsToday() {
  const list = $("#habitToday");
  if (!list) return;
  list.innerHTML = "";
  const now = new Date();
  let doneToday = 0;

  HABITS.forEach((habit) => {
    const on = habitOn(habit.id, now);
    if (on) doneToday++;

    const li = document.createElement("li");
    li.className = "task" + (on ? " is-done" : "");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = on;
    input.id = "hchk-" + habit.id;
    input.addEventListener("change", () => toggleHabitToday(habit.id));

    const body = document.createElement("div");
    body.className = "task-body";

    const label = document.createElement("label");
    label.className = "task-text";
    label.setAttribute("for", input.id);
    label.textContent = habit.title;

    const meta = document.createElement("div");
    meta.className = "task-tags";
    const streakEl = document.createElement("span");
    streakEl.className = "task-meta";
    streakEl.textContent = `🔥 ${fa(habitStreak(habit.id))} روز`;
    const weekEl = document.createElement("span");
    weekEl.className = "task-meta";
    weekEl.textContent = `📅 ${fa(habitWeekCount(habit.id))}/۷ این هفته`;
    meta.append(streakEl, weekEl);

    body.append(label, meta);
    li.append(input, body);
    makeRowToggle(li, input);
    list.appendChild(li);
  });

  setText("#habitTodayBadge", `${fa(doneToday)} از ${fa(HABITS.length)}`);
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

// پیشرفت فقط نقشه راه برنامه‌نویسی
function countRoadmap() {
  let total = 0, done = 0;
  ROADMAP.forEach((stage) => {
    stage.tasks.forEach((_, i) => {
      total++;
      if (state.checked[`${stage.id}-${i}`]) done++;
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
  $("#xpValue").textContent = faNum(state.xp);

  if (next) {
    const span = next.min - level.min;
    const pct = Math.min(100, percent(state.xp - level.min, span));
    $("#xpBar").style.width = pct + "%";
    $("#xpCaption").textContent = `${faNum(state.xp)} از ${faNum(next.min)} XP — ${faNum(next.min - state.xp)} XP تا ${next.name}`;
  } else {
    $("#xpBar").style.width = "100%";
    $("#xpBar").classList.add("is-full");
    $("#xpCaption").textContent = "بالاترین سطح";
  }
}

/* — آمار — */
function renderStats() {
  const list = $("#statsList");
  if (!list) return;

  const done = state.daily.filter((t) => t.done).length;
  const total = state.daily.length;

  // عادت‌های ۷ روز اخیر
  let weekDone = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekDone += HABITS.filter((h) => habitOn(h.id, d)).length;
  }
  const weekPct = percent(weekDone, HABITS.length * 7);
  const coding = countRoadmap();
  const foc = state.focus || { sessions: 0, minutes: 0 };

  const rows = [
    { label: "کارهای امروز",        value: `${fa(done)} از ${fa(total)}`, pct: percent(done, total) },
    { label: "عادت‌های ۷ روز اخیر", value: fa(weekPct) + "٪",           pct: weekPct },
    { label: "برنامه‌نویسی",         value: fa(coding.pct) + "٪",        pct: coding.pct },
    { label: "مدرسه (میانگین)",      value: fa(schoolAverage()) + "٪",   pct: schoolAverage() },
    { label: "Streak",              value: `${fa(state.streak)} روز` },
    { label: "کل XP",               value: faNum(state.xp) },
    { label: "تمرکز امروز",          value: `${fa(foc.sessions)} جلسه • ${fa(foc.minutes)} دقیقه` }
  ];

  list.innerHTML = "";
  rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "stat-row";

    const label = document.createElement("span");
    label.className = "stat-row-label";
    label.textContent = r.label;

    const value = document.createElement("span");
    value.className = "stat-row-value";
    value.textContent = r.value;

    row.append(label, value);

    if (typeof r.pct === "number") {
      const track = document.createElement("div");
      track.className = "progress";
      const fill = document.createElement("div");
      fill.className = "progress-bar" + (r.pct === 100 ? " is-full" : "");
      fill.style.width = r.pct + "%";
      track.appendChild(fill);
      row.appendChild(track);
    }
    list.appendChild(row);
  });

  // ستون‌های ۷ روز اخیر (قدیمی‌ترین سمت راست، امروز سمت چپ)
  const bars = $("#weekBars");
  if (bars) {
    bars.innerHTML = "";
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const pct = percent(HABITS.filter((h) => habitOn(h.id, d)).length, HABITS.length);

      const col = document.createElement("div");
      col.className = "week-col" + (i === 0 ? " is-today" : "");
      col.title = `${fa(pct)}٪`;

      const track = document.createElement("div");
      track.className = "week-track";
      const bar = document.createElement("div");
      bar.className = "week-bar";
      bar.style.height = Math.max(4, pct) + "%";
      track.appendChild(bar);

      const name = document.createElement("span");
      name.textContent = WEEKDAYS_FA[(d.getDay() + 1) % 7][0]; // getDay: یکشنبه=۰ ← شنبه=۰

      col.append(track, name);
      bars.appendChild(col);
    }
  }
}

/* — تایمر تمرکز — (فقط در حافظه؛ با زمان پایان کار می‌کند تا با بسته شدن تب دقیق بماند) */
const focusTimer = { minutes: 25, remaining: 25 * 60, endAt: 0, timer: null, running: false };

function renderFocus() {
  const total = focusTimer.minutes * 60;
  const mm = String(Math.floor(focusTimer.remaining / 60)).padStart(2, "0");
  const ss = String(focusTimer.remaining % 60).padStart(2, "0");
  setText("#focusTime", fa(`${mm}:${ss}`));

  const bar = $("#focusBar");
  if (bar) bar.style.width = Math.round(((total - focusTimer.remaining) / total) * 100) + "%";

  const start = $("#focusStart");
  const pause = $("#focusPause");
  if (start) start.disabled = focusTimer.running;
  if (pause) pause.disabled = !focusTimer.running;

  $$("#focusModes .mode-btn").forEach((btn) => {
    btn.classList.toggle("is-active", Number(btn.dataset.focusMin) === focusTimer.minutes);
  });

  const sessions = state.focus ? state.focus.sessions : 0;
  setText("#focusBadge", `${fa(sessions)} جلسه امروز`);
}

function focusStop() {
  clearInterval(focusTimer.timer);
  focusTimer.timer = null;
  focusTimer.running = false;
}

function focusTick() {
  focusTimer.remaining = Math.max(0, Math.round((focusTimer.endAt - Date.now()) / 1000));
  if (focusTimer.remaining === 0) { focusFinish(); return; }
  renderFocus();
}

function focusStart() {
  if (focusTimer.running) return;
  if (focusTimer.remaining <= 0) focusTimer.remaining = focusTimer.minutes * 60;
  focusTimer.endAt = Date.now() + focusTimer.remaining * 1000;
  focusTimer.running = true;
  focusTimer.timer = setInterval(focusTick, 500);
  setText("#focusMsg", "تمرکز کن؛ فقط روی یک کار.");
  renderFocus();
}

function focusPause() {
  if (!focusTimer.running) return;
  focusTick();
  focusStop();
  setText("#focusMsg", "متوقف شد.");
  renderFocus();
}

function focusReset() {
  focusStop();
  focusTimer.remaining = focusTimer.minutes * 60;
  setText("#focusMsg", "");
  renderFocus();
}

function focusSetMinutes(min) {
  if (min !== 25 && min !== 50) return;
  focusStop();
  focusTimer.minutes = min;
  focusTimer.remaining = min * 60;
  setText("#focusMsg", "");
  renderFocus();
}

function focusFinish() {
  focusStop();
  focusTimer.remaining = 0;
  if (!state.focus) state.focus = { date: todayKey(), sessions: 0, minutes: 0 };
  state.focus.sessions += 1;
  state.focus.minutes += focusTimer.minutes;
  save();
  setText("#focusMsg", `آفرین! ${fa(focusTimer.minutes)} دقیقه تمرکز کامل شد. کمی استراحت کن.`);
  toast("جلسه تمرکز تمام شد 🎉");
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  renderFocus();
  renderStats();
}

/* — رندر کامل — */
function renderAll() {
  const today = renderToday();
  renderSummary(today);
  renderDaily();
  renderCalendarDetail();
  renderSubjects();
  renderRoadmap();
  renderLanguage();
  renderProjects();
  renderHabits();
  renderProgress();
  renderStats();
  renderFocus();
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

// تیک‌های امروز پاک می‌شوند و XP همان کارها (و پاداش روز کامل) کم می‌شود؛ خود کارها می‌مانند
function resetDay() {
  state.daily.forEach((t) => {
    if (t.done) addXp(-t.xp);
    t.done = false;
  });
  if (state.perfectDay === todayKey()) {
    state.perfectDay = null;
    addXp(-XP_PERFECT_DAY);
  }
  save();
  renderAll();
  toast("پیشرفت امروز پاک شد");
}

function resetSchedule() {
  addXp(-XP_TASK_SCHEDULE * Object.keys(state.schedule.checked).length);
  state.schedule.checked = {};
  save();
  renderAll();
  toast("برنامه ساعتی امروز از نو شروع شد");
}

/* — پنجره «افزودن کار» و دکمه‌های دسترسی سریع — */
const QUICK_PRESETS = {
  task:   { cat: "درس",          title: "" },
  study:  { cat: "درس",          title: "مطالعه" },
  coding: { cat: "برنامه‌نویسی", title: "تمرین برنامه‌نویسی" },
  goal:   { cat: "هدف",          title: "" }
};

function openTaskDialog(preset) {
  const dlg = $("#taskDialog");
  if (!dlg) return;
  $("#taskTitle").value = preset.title;
  $("#taskCat").value = preset.cat;
  $("#taskMinutes").value = 20;

  if (typeof dlg.showModal === "function") {
    dlg.showModal();
    $("#taskTitle").focus();
  } else {
    // مرورگرهای خیلی قدیمی: پنجره ساده
    const title = prompt("عنوان کار:", preset.title);
    if (title && addCustomTask(title, preset.cat, 20)) toast("کار اضافه شد");
  }
}

function handleQuick(kind) {
  if (kind === "habit") {
    showView("dashboard");
    const card = $("#habitTodayCard");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (QUICK_PRESETS[kind]) openTaskDialog(QUICK_PRESETS[kind]);
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
  $("#goSchoolBtn").addEventListener("click", () => showView("school"));

  // دسترسی سریع (یک شنونده برای همه دکمه‌ها)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-quick]");
    if (btn) handleQuick(btn.dataset.quick);
  });

  // پنجره افزودن کار
  $("#taskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = addCustomTask($("#taskTitle").value, $("#taskCat").value, $("#taskMinutes").value);
    if (!ok) return;
    $("#taskDialog").close();
    toast("کار به برنامه امروز اضافه شد");
  });
  $("#taskCancel").addEventListener("click", () => $("#taskDialog").close());

  // تایمر تمرکز
  $("#focusStart").addEventListener("click", focusStart);
  $("#focusPause").addEventListener("click", focusPause);
  $("#focusReset").addEventListener("click", focusReset);
  $("#focusModes").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-focus-min]");
    if (btn) focusSetMinutes(Number(btn.dataset.focusMin));
  });

  // تقویم ۱۴۰۵: کلیک روی یک روز
  $("#calendarMonths").addEventListener("click", (e) => {
    const btn = e.target.closest(".cal-day");
    if (!btn) return;
    selectCalendarDay(Number(btn.dataset.month), Number(btn.dataset.day));
  });

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
  renderCalendarMonths();
  renderCalendarDetail();
  renderAll();
}

document.addEventListener("DOMContentLoaded", init);

// اگر برنامه از دیروز باز مانده باشد، وقتی دوباره دیده شد روز جدید شروع می‌شود
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  if (state.date !== todayKey()) {
    rolloverDay();
    renderAll();
  }
});

/* ---------- 8) پشتیبان‌گیری، نصب و کار بدون اینترنت ---------- */

// فایل پشتیبان را قبل از استفاده بررسی و پاک‌سازی می‌کند.
// خروجی: state سالم، یا null اگر فایل مال این برنامه نباشد.
function sanitizeState(data) {
  const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  if (!isObj(data)) return null;

  const knownKeys = ["date", "daily", "checked", "schedule", "xp", "streak", "projects", "habits", "theme", "school", "focus"];
  if (!knownKeys.some((k) => k in data)) return null;

  const base = defaultState();
  const dateOk = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const numOk = (v) => typeof v === "number" && isFinite(v) && v >= 0;
  const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : "");
  const out = { ...base };

  out.xp = numOk(data.xp) ? Math.round(data.xp) : 0;
  out.streak = numOk(data.streak) ? Math.round(data.streak) : 0;
  out.theme = data.theme === "light" ? "light" : "dark";
  out.date = dateOk(data.date) ? data.date : base.date;
  out.lastActiveDay = dateOk(data.lastActiveDay) ? data.lastActiveDay : null;
  out.perfectDay = dateOk(data.perfectDay) ? data.perfectDay : null;

  if (Array.isArray(data.daily)) {
    out.daily = data.daily
      .filter((t) => isObj(t) && typeof t.id === "string" && typeof t.title === "string")
      .slice(0, 50)
      .map((t) => ({
        id: str(t.id, 60),
        title: str(t.title, 60),
        minutes: numOk(t.minutes) ? Math.min(240, t.minutes) : 10,
        xp: numOk(t.xp) ? Math.min(100, t.xp) : 10,
        cat: TASK_CATEGORIES.includes(t.cat) ? t.cat : undefined,
        done: t.done === true
      }));
  }

  if (isObj(data.checked)) {
    out.checked = {};
    Object.keys(data.checked).slice(0, 500).forEach((k) => {
      if (data.checked[k] === true) out.checked[k] = true;
    });
  }

  if (isObj(data.schedule)) {
    out.schedule = {
      date: dateOk(data.schedule.date) ? data.schedule.date : base.schedule.date,
      mode: data.schedule.mode === "holiday" ? "holiday" : "school",
      checked: {}
    };
    if (isObj(data.schedule.checked)) {
      Object.keys(data.schedule.checked).slice(0, 500).forEach((k) => {
        if (data.schedule.checked[k] === true) out.schedule.checked[k] = true;
      });
    }
  }

  const cs = data.calendarSelected;
  if (isObj(cs) && Number.isInteger(cs.month) && Number.isInteger(cs.day) &&
      cs.month >= 1 && cs.month <= 12 && cs.day >= 1 && cs.day <= MONTH_LENGTHS_1405[cs.month - 1]) {
    out.calendarSelected = { month: cs.month, day: cs.day };
  }

  if (Array.isArray(data.projects)) {
    const statuses = ["Not Started", "In Progress", "Completed"];
    out.projects = data.projects
      .filter((p) => isObj(p) && typeof p.name === "string" && p.name.trim())
      .slice(0, 100)
      .map((p, i) => ({
        id: typeof p.id === "string" ? str(p.id, 40) : "p-import-" + i,
        name: str(p.name, 80),
        desc: str(p.desc, 200),
        tech: str(p.tech, 80),
        status: statuses.includes(p.status) ? p.status : "In Progress",
        progress: numOk(p.progress) ? Math.min(100, Math.round(p.progress)) : 0,
        link: /^https?:\/\//i.test(p.link) ? str(p.link, 300) : "",
        done: p.done === true
      }));
  }

  if (isObj(data.habits)) {
    out.habits = {};
    Object.keys(data.habits).forEach((month) => {
      if (!/^\d{4}-\d{2}$/.test(month) || !isObj(data.habits[month])) return;
      out.habits[month] = {};
      Object.keys(data.habits[month]).forEach((hid) => {
        const days = data.habits[month][hid];
        if (!isObj(days)) return;
        out.habits[month][hid] = {};
        Object.keys(days).forEach((d) => {
          const n = Number(d);
          if (Number.isInteger(n) && n >= 1 && n <= 31 && days[d] === true) out.habits[month][hid][n] = true;
        });
      });
    });
  }

  if (isObj(data.school)) {
    out.school = {};
    SUBJECTS.forEach((s) => {
      const v = data.school[s.name];
      if (numOk(v)) out.school[s.name] = Math.min(100, Math.round(v / 5) * 5);
    });
  }

  if (isObj(data.focus) && dateOk(data.focus.date)) {
    out.focus = {
      date: data.focus.date,
      sessions: numOk(data.focus.sessions) ? Math.round(data.focus.sessions) : 0,
      minutes: numOk(data.focus.minutes) ? Math.round(data.focus.minutes) : 0
    };
  }

  return out;
}

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
        const clean = sanitizeState(JSON.parse(reader.result));
        if (!clean) {
          toast("این فایل پشتیبان این برنامه نیست");
        } else if (confirm("اطلاعات فعلی با محتوای این فایل جایگزین شود؟")) {
          state = clean;
          rolloverDay();
          save();
          applyTheme();
          renderAll();
          toast("اطلاعات برگردانده شد");
        }
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
