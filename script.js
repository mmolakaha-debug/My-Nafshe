/* =========================================================
   مسیر من — script.js
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

// برنامه هفتگی نهم — بر اساس فایل «برنامه هفتگی نهم 2.pdf»
const WEEKLY_SCHOOL_TIMETABLE = {
  0: { day: "شنبه", lessons: ["عربی", "فرهنگ و هنر", "مطالعات اجتماعی"] },
  1: { day: "یکشنبه", lessons: ["زبان انگلیسی", "معارف اسلامی", "املا و نگارش"] },
  2: { day: "دوشنبه", lessons: ["تربیت بدنی", "علوم تجربی", "ریاضی"] },
  3: { day: "سه‌شنبه", lessons: ["قرآن", "فارسی", "مطالعات اجتماعی / علوم تجربی"] },
  4: { day: "چهارشنبه", lessons: ["ریاضی", "آمادگی دفاعی", "کار و فناوری"] },
  5: { day: "پنجشنبه", lessons: [] },
  6: { day: "جمعه", lessons: [] }
};
function schoolWeekdayIndex(date = new Date()) { return (date.getDay() + 1) % 7; }
function todaySchoolLessons() { return WEEKLY_SCHOOL_TIMETABLE[schoolWeekdayIndex()]?.lessons || []; }
function renderWeeklyTimetable() {
  const wrap = $("#weeklyTimetable"); if (!wrap) return;
  const todayIndex = schoolWeekdayIndex(); wrap.innerHTML = "";
  Object.entries(WEEKLY_SCHOOL_TIMETABLE).forEach(([key, info]) => {
    const row=document.createElement("div"); row.className="weekly-day-row"+(Number(key)===todayIndex?" is-today":"");
    const day=document.createElement("div"); day.className="weekly-day-name"; day.textContent=info.day;
    const lessons=document.createElement("div"); lessons.className="weekly-lessons";
    if(!info.lessons.length){const empty=document.createElement("span");empty.className="weekly-empty";empty.textContent="کلاسی در فایل ثبت نشده";lessons.appendChild(empty);}
    else info.lessons.forEach((lesson,i)=>{const chip=document.createElement("span");chip.className="weekly-lesson";chip.innerHTML="<b>"+fa(i+1)+"</b>"+lesson;lessons.appendChild(chip);});
    row.append(day,lessons); wrap.appendChild(row);
  });
  const lessons=todaySchoolLessons();
  setText("#weeklySchoolDayBadge",WEEKLY_SCHOOL_TIMETABLE[todayIndex]?.day||"امروز");
  setText("#weeklySchoolTodayHint",lessons.length?"زنگ‌های امروز از برنامه مدرسه":"برای امروز زنگی در فایل ثبت نشده");
  setText("#weeklyStudyNote",lessons.length?"⏰ زمان مطالعه ثابت می‌ماند: ۱۴:۰۰ تا ۱۵:۳۰؛ این بازه بین درس‌های امروز تقسیم می‌شود.":"⏰ زمان مطالعه ثابت می‌ماند: ۱۴:۰۰ تا ۱۵:۳۰؛ امروز می‌توانی آن را برای مرور عقب‌ماندگی‌ها استفاده کنی.");
}

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


/* ---------- موتور پروفایل تحصیلی برنامه‌ساز ---------- */
const FIELD_OPTIONS = [
  { value:"math", label:"ریاضی فیزیک" },
  { value:"experimental", label:"علوم تجربی" },
  { value:"humanities", label:"ادبیات و علوم انسانی" },
  { value:"vocational-computer", label:"فنی‌وحرفه‌ای — شبکه و نرم‌افزار رایانه" },
  { value:"kar-danesh-computer", label:"کاردانش — رایانه" }
];
const COMMON_SUBJECTS = [
  {name:"ریاضی",level:1,prio:"خیلی بالا",prioClass:"prio-high",goal:"تقویت پایه"},
  {name:"فارسی",level:3,prio:"متوسط",prioClass:"prio-mid",goal:"بهبود"},
  {name:"علوم",level:4,prio:"متوسط",prioClass:"prio-mid",goal:"حفظ سطح"},
  {name:"انگلیسی",level:5,prio:"بالا",prioClass:"prio-high",goal:"حفظ نقطه قوت"},
  {name:"مطالعات",level:4,prio:"پایین‌تر",prioClass:"prio-low",goal:"مرور"},
  {name:"دینی",level:4,prio:"پایین‌تر",prioClass:"prio-low",goal:"مرور"},
  {name:"قرآن",level:3,prio:"متوسط",prioClass:"prio-mid",goal:"تقویت"},
  {name:"عربی",level:2,prio:"بالا",prioClass:"prio-high",goal:"تقویت"}
];
const CURRICULUMS = {
  7: COMMON_SUBJECTS, 8: COMMON_SUBJECTS,
  9: [
    {name:"ریاضی",level:1,prio:"خیلی بالا",prioClass:"prio-high",goal:"تقویت جدی"},
    {name:"عربی",level:2,prio:"بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"فارسی",level:3,prio:"متوسط",prioClass:"prio-mid",goal:"بهبود"},
    {name:"علوم",level:4,prio:"متوسط",prioClass:"prio-mid",goal:"حفظ سطح"},
    {name:"انگلیسی",level:5,prio:"بالا",prioClass:"prio-high",goal:"حفظ نقطه قوت"},
    {name:"مطالعات",level:4,prio:"پایین‌تر",prioClass:"prio-low",goal:"مرور"},
    {name:"دینی",level:4,prio:"پایین‌تر",prioClass:"prio-low",goal:"مرور"},
    {name:"قرآن",level:3,prio:"متوسط",prioClass:"prio-mid",goal:"تقویت"},
    {name:"آمادگی",level:5,prio:"پایین‌تر",prioClass:"prio-low",goal:"مرور"}
  ],
  "10-math": [
    {name:"ریاضی",level:2,prio:"خیلی بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"فیزیک",level:2,prio:"خیلی بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"شیمی",level:3,prio:"بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"هندسه",level:3,prio:"متوسط",prioClass:"prio-mid",goal:"تمرین"},
    {name:"فارسی",level:3,prio:"متوسط",prioClass:"prio-mid",goal:"مرور"},
    {name:"انگلیسی",level:5,prio:"بالا",prioClass:"prio-high",goal:"حفظ سطح"},
    {name:"دینی",level:4,prio:"پایین‌تر",prioClass:"prio-low",goal:"مرور"}
  ],
  "10-experimental": [
    {name:"زیست",level:3,prio:"خیلی بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"شیمی",level:3,prio:"خیلی بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"فیزیک",level:2,prio:"بالا",prioClass:"prio-high",goal:"تمرین"},
    {name:"ریاضی",level:2,prio:"بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"فارسی",level:3,prio:"متوسط",prioClass:"prio-mid",goal:"مرور"},
    {name:"انگلیسی",level:5,prio:"بالا",prioClass:"prio-high",goal:"حفظ سطح"},
    {name:"دینی",level:4,prio:"پایین‌تر",prioClass:"prio-low",goal:"مرور"}
  ],
  "10-humanities": [
    {name:"ادبیات",level:3,prio:"خیلی بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"علوم و فنون ادبی",level:2,prio:"خیلی بالا",prioClass:"prio-high",goal:"تمرین"},
    {name:"جامعه‌شناسی",level:3,prio:"بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"منطق",level:3,prio:"متوسط",prioClass:"prio-mid",goal:"تمرین"},
    {name:"عربی",level:2,prio:"بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"انگلیسی",level:5,prio:"بالا",prioClass:"prio-high",goal:"حفظ سطح"},
    {name:"دینی",level:4,prio:"پایین‌تر",prioClass:"prio-low",goal:"مرور"}
  ],
  "10-vocational-computer": [
    {name:"ریاضی",level:2,prio:"بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"دانش فنی",level:3,prio:"خیلی بالا",prioClass:"prio-high",goal:"یادگیری"},
    {name:"نصب و راه‌اندازی سیستم",level:3,prio:"خیلی بالا",prioClass:"prio-high",goal:"تمرین"},
    {name:"تولید محتوای الکترونیک",level:4,prio:"بالا",prioClass:"prio-high",goal:"تمرین"},
    {name:"انگلیسی",level:5,prio:"بالا",prioClass:"prio-high",goal:"حفظ سطح"},
    {name:"فارسی",level:3,prio:"متوسط",prioClass:"prio-mid",goal:"مرور"},
    {name:"دینی",level:4,prioClass:"prio-low",goal:"مرور"}
  ],
  "10-kar-danesh-computer": [
    {name:"ریاضی",level:2,prio:"بالا",prioClass:"prio-high",goal:"تقویت"},
    {name:"مهارت‌های رایانه",level:3,prio:"خیلی بالا",prioClass:"prio-high",goal:"تمرین"},
    {name:"نرم‌افزار و کاربرد رایانه",level:3,prio:"خیلی بالا",prioClass:"prio-high",goal:"تمرین"},
    {name:"تولید محتوا",level:4,prio:"بالا",prioClass:"prio-high",goal:"تمرین"},
    {name:"انگلیسی",level:5,prio:"بالا",prioClass:"prio-high",goal:"حفظ سطح"},
    {name:"فارسی",level:3,prio:"متوسط",prioClass:"prio-mid",goal:"مرور"},
    {name:"دینی",level:4,prioClass:"prio-low",goal:"مرور"}
  ]
};
function fieldOptionsForGrade(grade){ return grade>=10 ? FIELD_OPTIONS : [{value:"",label:"برای پایه‌های هفتم تا نهم رشته ندارد"}]; }
function gradeText(grade){ return ["","","","","","","","هفتم","هشتم","نهم","دهم","یازدهم","دوازدهم"][Math.max(7,Math.min(12,Number(grade)||9))] || "نهم"; }
function fieldText(field){ return FIELD_OPTIONS.find(x=>x.value===field)?.label || "بدون رشته"; }
function curriculumForProfile(grade,field){
  if(grade<=9) return CURRICULUMS[grade] || CURRICULUMS[9];
  return CURRICULUMS[grade+"-"+field] || CURRICULUMS[grade+"-math"] || CURRICULUMS["10-math"];
}
const DEFAULT_PROFILE = {
  configured:false, userName:"", grade:9, field:"", goal:"معدل بالا", freeMinutes:90,
  wakeTime:"06:45", sleepHours:8.5, schoolStart:"07:30", schoolEnd:"13:00", commuteMinutes:30,
  subjectLevels:Object.fromEntries(CURRICULUMS[9].map(s=>[s.name,s.level]))
};
function normalizeTime(value,fallback){ return typeof value==="string" && /^\d{2}:\d{2}$/.test(value) ? value : fallback; }
function normalizeProfile(input){
  const p=(input && typeof input==="object" && !Array.isArray(input)) ? input : {};
  const grade=Math.min(12,Math.max(7,Number(p.grade)||9));
  const field=grade>=10 && FIELD_OPTIONS.some(x=>x.value===p.field) ? p.field : (grade>=10 ? "math" : "");
  const goals=["معدل بالا","آمادگی امتحانات","تعادل درس و مهارت","یادگیری مهارت و برنامه‌نویسی"];
  const goal=goals.includes(p.goal)?p.goal:"معدل بالا";
  const userName=typeof p.userName==="string"?p.userName.trim().slice(0,30):"";
  const freeMinutes=Math.min(300,Math.max(30,Number(p.freeMinutes)||90));
  const sleepHours=Math.min(12,Math.max(6,Number(p.sleepHours)||8.5));
  const commuteMinutes=Math.min(180,Math.max(0,Number(p.commuteMinutes)||0));
  const curriculum=curriculumForProfile(grade,field);
  const incoming=p.subjectLevels && typeof p.subjectLevels==="object" ? p.subjectLevels : {};
  const subjectLevels={};
  curriculum.forEach(s=>{ const n=Number(incoming[s.name]); subjectLevels[s.name]=Number.isFinite(n)&&n>=1&&n<=4?Math.round(n):Math.min(4,Math.max(1,s.level)); });
  return {configured:p.configured===true,userName,grade,field,goal,freeMinutes,wakeTime:normalizeTime(p.wakeTime,"06:45"),sleepHours,schoolStart:normalizeTime(p.schoolStart,"07:30"),schoolEnd:normalizeTime(p.schoolEnd,"13:00"),commuteMinutes,subjectLevels};
}
function applyAcademicProfile(profileInput){
  const p=normalizeProfile(profileInput), curriculum=curriculumForProfile(p.grade,p.field);
  SUBJECTS.splice(0,SUBJECTS.length,...curriculum.map(s=>({...s})));
  if(typeof state!=="undefined" && state.school){
    Object.keys(state.school).forEach(key=>{ if(["goal","grades","weekly","studyDays"].includes(key)) return; if(!curriculum.some(s=>s.name===key)) delete state.school[key]; });
  }
  return p;
}
function buildPersonalDailyTasks(profileInput){
  const profile=normalizeProfile(profileInput);
  const ranked=[...SUBJECTS].sort((a,b)=>(profile.subjectLevels[a.name]||a.level)-(profile.subjectLevels[b.name]||b.level));
  let remaining=Math.max(30,Math.round(profile.freeMinutes));
  const tasks=[];
  const academicShare=profile.goal==="یادگیری مهارت و برنامه‌نویسی"?0.50:profile.goal==="تعادل درس و مهارت"?0.60:profile.goal==="آمادگی امتحانات"?0.85:0.70;
  const academicTotal=Math.min(remaining,Math.max(20,Math.round(remaining*academicShare)));
  let academicLeft=academicTotal;
  ranked.slice(0,Math.min(3,ranked.length)).forEach((subject,index)=>{
    if(academicLeft<=0)return;
    const desired=index===0?25:index===1?20:15;
    const slotsLeft=Math.max(1,Math.min(3,ranked.length)-index);
    const minutes=Math.min(desired,Math.max(10,Math.round(academicLeft/slotsLeft)));
    tasks.push({id:"planner-subject-"+index,title:subject.name+" — تمرین و مرور",minutes,xp:subject.level<=2?20:15,cat:"درس",done:false});
    academicLeft-=minutes;remaining-=minutes;
  });
  const codeShare=profile.goal==="معدل بالا"||profile.goal==="آمادگی امتحانات"?0.18:profile.goal==="تعادل درس و مهارت"?0.28:0.38;
  const codeMinutes=Math.min(remaining,Math.max(0,Math.round(profile.freeMinutes*codeShare)));
  if(codeMinutes>=10){tasks.push({id:"planner-code",title:"برنامه‌نویسی — مسیر شخصی",minutes:codeMinutes,xp:20,cat:"برنامه‌نویسی",done:false});remaining-=codeMinutes}
  const languageMinutes=Math.min(remaining,Math.max(0,Math.min(20,Math.round(profile.freeMinutes*0.15))));
  if(languageMinutes>=10){tasks.push({id:"planner-language",title:"زبان انگلیسی — تمرین کوتاه",minutes:languageMinutes,xp:10,cat:"زبان",done:false});remaining-=languageMinutes}
  if(remaining>=10)tasks.push({id:"planner-review",title:"مرور کوتاه و جمع‌بندی",minutes:remaining,xp:10,cat:"درس",done:false});
  return tasks.length?tasks:[{id:"planner-minimum",title:"یک کار کوچک از مهم‌ترین اولویت امروز",minutes:Math.min(30,profile.freeMinutes),xp:10,cat:"هدف",done:false}];
}
function freshDaily(profileOverride=DEFAULT_PROFILE){
  const profile=normalizeProfile(profileOverride);
  return profile.configured?buildPersonalDailyTasks(profile):DEFAULT_DAILY.map((t)=>({...t,done:false}));
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
    calendarSelected: null, // "1405-MM-DD" — آخرین روز انتخاب‌شده در تقویم
    calendar: {},          // اطلاعات ثبت‌شده هر روز تقویم
    xp: 0,
    streak: 0,
    lastActiveDay: null,   // آخرین روزی که حداقل یک کار انجام شد
    perfectDay: null,      // روزی که پاداش کامل گرفته شده
    projects: [],
    habits: {},            // { "2026-09": { "h-study": { "12": true } } }
    school: { goal: 18.5, grades: {}, weekly: {}, studyDays: {} },
    profile: normalizeProfile(DEFAULT_PROFILE),
    focus: { date: todayKey(), sessions: 0, minutes: 0 },  // جلسه‌های تمرکز امروز
    theme: "dark"
  };
}

let state = defaultState();


function hmToMinutes(value){
  if(typeof value!=="string")return 0;
  const normalized=value.replace(/[۰-۹]/g,(d)=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  const parts=normalized.split(":").map(Number);
  if(parts.length!==2||!Number.isFinite(parts[0])||!Number.isFinite(parts[1]))return 0;
  return Math.max(0,Math.min(1439,parts[0]*60+parts[1]));
}
function faTime(totalMinutes){
  const m=((Math.round(totalMinutes)%1440)+1440)%1440;
  const h=Math.floor(m/60),min=m%60;
  return fa(String(h).padStart(2,"0")+":"+String(min).padStart(2,"0"));
}
function scheduleBlock(id,start,end,title,tasks,extra={}){
  return {id,time:faTime(start)+(end==null?"":" تا "+faTime(end)),title,tasks,...extra};
}
function plannerStudySegments(profile,totalMinutes){
  const segments=[];
  const personal=buildPersonalDailyTasks(profile).filter((x)=>x.minutes>0);
  let remaining=totalMinutes;
  personal.forEach((task)=>{
    if(remaining<=0)return;
    const minutes=Math.min(remaining,task.minutes);
    segments.push({
      id:"planner-"+task.id,
      minutes,
      title:task.title,
      tasks:["انجام "+task.title],
      link:task.cat==="برنامه‌نویسی"?"coding":task.cat==="زبان"?"language":null,
      linkLabel:task.cat==="برنامه‌نویسی"?"مشاهده مسیر برنامه‌نویسی":task.cat==="زبان"?"مشاهده بخش زبان":null
    });
    remaining-=minutes;
  });
  return segments;
}
function buildPersonalSchedule(mode="school"){
  const p=normalizeProfile(state.profile||DEFAULT_PROFILE);
  const wake=hmToMinutes(p.wakeTime),schoolStart=hmToMinutes(p.schoolStart),schoolEnd=hmToMinutes(p.schoolEnd);
  const bedtime=wake-Math.round(p.sleepHours*60),blocks=[],commute=p.commuteMinutes;
  let cursor=wake;
  blocks.push(scheduleBlock("planner-wake",cursor,cursor+20,"بیدار شدن و شروع آرام روز",["صبحانه، مرتب کردن تخت و آماده شدن"]));cursor+=20;
  if(mode==="school"){
    const leave=Math.max(cursor,schoolStart-commute);
    if(leave>cursor)blocks.push(scheduleBlock("planner-morning",cursor,leave,"آماده شدن برای مدرسه",["صبحانه و آماده‌سازی وسایل"]));
    if(commute>0)blocks.push(scheduleBlock("planner-commute-go",leave,schoolStart,"رفت‌وآمد به مدرسه",["رفتن به مدرسه"]));
    blocks.push(scheduleBlock("planner-school",schoolStart,schoolEnd,"مدرسه",["حضور در مدرسه و ثبت نکات مهم"]));
    cursor=schoolEnd;
    if(commute>0){blocks.push(scheduleBlock("planner-commute-home",cursor,cursor+commute,"بازگشت به خانه",["استراحت ذهنی در مسیر"]));cursor+=commute}
    blocks.push(scheduleBlock("planner-lunch",cursor,cursor+60,"ناهار",["ناهار و کمی فاصله از درس"]));cursor+=60;
    blocks.push(scheduleBlock("planner-rest",cursor,cursor+30,"استراحت واقعی",["استراحت بدون فشار"]));cursor+=30;
  }else{
    blocks.push(scheduleBlock("planner-breakfast",cursor,cursor+30,"صبحانه و شروع روز",["صبحانه و آماده شدن"]));cursor+=30;
    blocks.push(scheduleBlock("planner-holiday-rest",cursor,cursor+20,"استراحت صبحگاهی",["کمی استراحت و فاصله از صفحه"]));cursor+=20;
    const lunchStart=cursor+Math.min(150,Math.max(90,p.freeMinutes));
    blocks.push(scheduleBlock("planner-lunch-holiday",lunchStart,lunchStart+60,"ناهار",["ناهار و استراحت"]));
    cursor=lunchStart+60;
  }
  const guard=mode==="school"?90:120,maxWindow=Math.max(0,bedtime-cursor-guard),studyTotal=Math.min(p.freeMinutes,maxWindow);
  const segments=plannerStudySegments(p,studyTotal);
  segments.forEach((seg,i)=>{
    if(seg.minutes<=0||cursor+seg.minutes>bedtime-guard)return;
    const end=cursor+seg.minutes;
    blocks.push(scheduleBlock(seg.id+"-"+i,cursor,end,seg.title,seg.tasks,{link:seg.link||null,linkLabel:seg.linkLabel||null}));
    cursor=end;
    if(i<segments.length-1&&cursor+10<bedtime-guard){blocks.push(scheduleBlock("planner-break-"+i,cursor,cursor+10,"استراحت کوتاه",["آب، کشش سبک و فاصله از صفحه"]));cursor+=10}
  });
  const dinnerStart=Math.max(cursor,bedtime-75);
  if(dinnerStart>cursor)blocks.push(scheduleBlock("planner-free",cursor,dinnerStart,"زمان آزاد",["تفریح، موسیقی، خانواده یا سرگرمی"]));
  const dinnerEnd=Math.min(bedtime-30,dinnerStart+30);
  if(dinnerEnd>dinnerStart)blocks.push(scheduleBlock("planner-dinner",dinnerStart,dinnerEnd,"شام و جمع‌بندی روز",["شام و آماده‌سازی کارهای فردا"]));
  if(bedtime>dinnerEnd)blocks.push(scheduleBlock("planner-prep",Math.max(dinnerEnd,bedtime-30),bedtime,"آماده شدن برای خواب",["کم کردن نور و صفحه‌نمایش، آماده کردن وسایل فردا"]));
  blocks.push(scheduleBlock("planner-sleep",bedtime,null,"خواب",["خواب هدف: "+String(p.sleepHours).replace(".","٫")+" ساعت"]));
  return blocks;
}
function renderPlannerSubjects(){
  const wrap=$("#plannerSubjectGrid");if(!wrap)return;wrap.innerHTML="";
  const profile=state.profile||DEFAULT_PROFILE;
  SUBJECTS.forEach((subject)=>{
    const row=document.createElement("div");row.className="planner-subject-row";
    const label=document.createElement("label");label.textContent=subject.name;
    const select=document.createElement("select");select.className="planner-subject-level";select.dataset.subject=subject.name;
    [["1","خیلی ضعیف"],["2","ضعیف"],["3","متوسط"],["4","خوب"]].forEach((item)=>{
      const opt=document.createElement("option");opt.value=item[0];opt.textContent=item[1];
      if(Number(profile.subjectLevels[subject.name]||subject.level)===Number(item[0]))opt.selected=true;
      select.appendChild(opt);
    });
    row.append(label,select);wrap.appendChild(row);
  });
}
function populatePlannerFieldOptions(){
  const grade=Number($("#plannerGrade")?.value||state.profile?.grade||9),field=$("#plannerField");if(!field)return;
  const current=field.value||state.profile?.field||"math";field.innerHTML="";
  if(grade<10){const opt=document.createElement("option");opt.value="";opt.textContent="برای پایه‌های هفتم تا نهم رشته ندارد";field.appendChild(opt);field.disabled=true;return}
  field.disabled=false;
  fieldOptionsForGrade(grade).forEach((item)=>{const opt=document.createElement("option");opt.value=item.value;opt.textContent=item.label;if(item.value===current)opt.selected=true;field.appendChild(opt)});
}
function renderPlanner(){
  const form=$("#plannerForm");if(!form)return;
  const p=normalizeProfile(state.profile||DEFAULT_PROFILE);
  setText("#plannerStatus",p.configured?"برنامه شخصی فعال است":"هنوز تنظیم نشده");
  setText("#plannerGradeText",gradeText(p.grade));
  setText("#plannerFieldText",p.grade>=10?fieldText(p.field):"بدون رشته");
  setText("#plannerTimeText",fa(p.freeMinutes)+" دقیقه");
  setText("#plannerSleepText",String(p.sleepHours).replace(".","٫")+" ساعت");
  setText("#plannerSchoolText",p.schoolStart+" تا "+p.schoolEnd);
  const grade=$("#plannerGrade");if(grade)grade.value=String(p.grade);
  const field=$("#plannerField");populatePlannerFieldOptions();if(field&&p.grade>=10)field.value=p.field||"math";
  $("#plannerFreeMinutes").value=String(p.freeMinutes);$("#plannerWakeTime").value=p.wakeTime;$("#plannerSleepHours").value=p.sleepHours;
  $("#plannerSchoolStart").value=p.schoolStart;$("#plannerSchoolEnd").value=p.schoolEnd;$("#plannerCommute").value=p.commuteMinutes;$("#plannerGoal").value=p.goal;
  renderPlannerSubjects();
  const preview=$("#plannerPreview");if(preview){preview.innerHTML="";buildPersonalSchedule("school").slice(0,8).forEach((block)=>{const item=document.createElement("div");item.className="planner-preview-item";item.innerHTML="<span>"+block.time+"</span><strong>"+block.title+"</strong>";preview.appendChild(item)})}
  const priorities=$("#plannerPriorityList");if(priorities){priorities.innerHTML="";[...SUBJECTS].sort((a,b)=>(p.subjectLevels[a.name]||a.level)-(p.subjectLevels[b.name]||b.level)).slice(0,5).forEach((subject,i)=>{const item=document.createElement("div");item.className="planner-priority";item.innerHTML="<span>"+fa(i+1)+"</span><strong>"+subject.name+"</strong><small>"+subject.prio+"</small>";priorities.appendChild(item)})}
}
function savePlannerProfile(){
  const grade=Number($("#plannerGrade")?.value||9),field=grade>=10?($("#plannerField")?.value||"math"):"";
  const p=normalizeProfile({
    configured:true,grade,field,goal:$("#plannerGoal")?.value||"معدل بالا",freeMinutes:Number($("#plannerFreeMinutes")?.value||90),
    wakeTime:$("#plannerWakeTime")?.value||"06:45",sleepHours:Number($("#plannerSleepHours")?.value||8.5),
    schoolStart:$("#plannerSchoolStart")?.value||"07:30",schoolEnd:$("#plannerSchoolEnd")?.value||"13:00",
    commuteMinutes:Number($("#plannerCommute")?.value||30),subjectLevels:{}
  });
  $("#plannerSubjectGrid .planner-subject-level").forEach((select)=>{p.subjectLevels[select.dataset.subject]=Number(select.value)});
  state.profile=p;state.school.weekly={};state.school.studyDays={};applyAcademicProfile(state.profile);
  state.daily=freshDaily(state.profile);state.schedule={date:todayKey(),mode:"school",checked:{}};
  save();renderAll();toast("پروفایل ذخیره شد و برنامه اختصاصی تو ساخته شد ✨");
}
function openPlanner(){showView("planner");const form=$("#plannerForm");if(form)form.scrollIntoView({behavior:"smooth",block:"start"})}
function save() {
  try {
    // ذخیره اطلاعات روی همین دستگاه
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

    // ثبت زمان آخرین تغییر برای سیستم Sync
    localStorage.setItem("my-nafshe-local-revision", String(Date.now()));
    localStorage.setItem("my-nafshe-local-dirty", "1");

    // ارسال خودکار تغییرات به Cloud
    if (
      window.MyNafsheSync &&
      navigator.onLine &&
      window.MyNafsheSync.getSyncAccountId()
    ) {
      window.MyNafsheSync.scheduleSync(
        JSON.parse(JSON.stringify(state))
      );
    }

  } catch (e) {
    console.warn("ذخیره‌سازی ممکن نشد:", e);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...defaultState(), ...JSON.parse(raw) };
    state.profile = normalizeProfile(state.profile || DEFAULT_PROFILE);
    if (!state.calendar || typeof state.calendar !== "object" || Array.isArray(state.calendar)) state.calendar = {};
    if (state.calendarSelected && typeof state.calendarSelected === "object" && Number.isFinite(Number(state.calendarSelected.month)) && Number.isFinite(Number(state.calendarSelected.day))) {
      state.calendarSelected = calendarDateKey(Number(state.calendarSelected.month), Number(state.calendarSelected.day));
    }
    applyAcademicProfile(state.profile);
  } catch (e) {
    console.warn("خواندن اطلاعات ممکن نشد:", e);
    state = defaultState();
  }
  rolloverDay();
}

// اگر روز عوض شده باشد، برنامه امروز تازه می‌شود و Streak بررسی می‌شود
function rolloverDay() {
  state.profile = normalizeProfile(state.profile || DEFAULT_PROFILE);
  if (!state.calendar || typeof state.calendar !== "object" || Array.isArray(state.calendar)) state.calendar = {};
  if (state.calendarSelected && typeof state.calendarSelected === "object" && Number.isFinite(Number(state.calendarSelected.month)) && Number.isFinite(Number(state.calendarSelected.day))) {
    state.calendarSelected = calendarDateKey(Number(state.calendarSelected.month), Number(state.calendarSelected.day));
  }
  applyAcademicProfile(state.profile);
  const today = todayKey();
  if (state.date !== today) {
    state.date = today;
    state.daily = freshDaily(state.profile || DEFAULT_PROFILE);
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
  if (!Number.isFinite(Number(state.school.goal))) state.school.goal = 18.5;
  if (!state.school.grades || typeof state.school.grades !== "object") state.school.grades = {};
  if (!state.school.weekly || typeof state.school.weekly !== "object") state.school.weekly = {};
  if (!state.school.studyDays || typeof state.school.studyDays !== "object") state.school.studyDays = {};
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
  const activeProfile=normalizeProfile(state.profile||DEFAULT_PROFILE);
  setText("#heroRoute","از "+gradeText(activeProfile.grade)+" ← مهارت ← درآمد ← مهاجرت");
  setText("#statCurrentGrade","پایه "+gradeText(activeProfile.grade)+(activeProfile.grade>=10?" • "+fieldText(activeProfile.field):""));
  setText("#journeyGrade",gradeText(activeProfile.grade));
  setText("#schoolSubtitle",activeProfile.grade>=10?"برنامه‌ریزی اختصاصی پایه "+gradeText(activeProfile.grade)+" — "+fieldText(activeProfile.field):"برنامه‌ریزی اختصاصی پایه "+gradeText(activeProfile.grade));
  setText("#dailySubtitle",activeProfile.configured?"برنامه ساعتی ساخته‌شده مخصوص شرایط تو":"برنامه ساعتی پایه پیش‌فرض؛ بعد از ساخت پروفایل شخصی می‌شود");
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

function calendarDateKey(month, day) {
  return `1405-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function calendarTodayKey() {
  const today = todayJalali1405();
  return today ? calendarDateKey(today.month, today.day) : null;
}

function calendarDayParts(key) {
  const m = String(key || "").match(/^1405-(\\d{2})-(\\d{2})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  if (month < 1 || month > 12 || day < 1 || day > MONTH_LENGTHS_1405[month - 1]) return null;
  return { month, day };
}

function calendarDayData(key) {
  if (!state.calendar || typeof state.calendar !== "object" || Array.isArray(state.calendar)) state.calendar = {};
  if (!state.calendar[key] || typeof state.calendar[key] !== "object") state.calendar[key] = {};
  return state.calendar[key];
}

function calendarScore(dayData) {
  if (!dayData || typeof dayData !== "object") return 0;
  let score = 0;
  if (String(dayData.summary || "").trim()) score += 35;
  if (dayData.tasksDone === true) score += 35;
  if (Number(dayData.focusMinutes) > 0) score += Math.min(20, Number(dayData.focusMinutes) / 3);
  if (dayData.mood) score += 10;
  return Math.min(100, Math.round(score));
}

function calendarPrevKey(key) {
  const parts = calendarDayParts(key);
  if (!parts) return null;
  if (parts.day > 1) return calendarDateKey(parts.month, parts.day - 1);
  if (parts.month <= 1) return null;
  return calendarDateKey(parts.month - 1, MONTH_LENGTHS_1405[parts.month - 2]);
}

function renderCalendarMonths() {
  const wrap = $("#calendarMonths");
  if (!wrap) return;
  wrap.innerHTML = "";

  const todayKey1405 = calendarTodayKey();
  let selected = calendarDayParts(state.calendarSelected) ? state.calendarSelected : todayKey1405;
  if (selected) state.calendarSelected = selected;

  PERSIAN_MONTHS.forEach((name, idx) => {
    const month = idx + 1;
    const length = MONTH_LENGTHS_1405[idx];
    const firstWeekday = weekdayIndex1405(month, 1);

    const card = document.createElement("section");
    card.className = "card cal-month";

    const head = document.createElement("button");
    head.type = "button";
    head.className = "stage-head";
    const currentMonth = todayKey1405 && todayKey1405.slice(5, 7) === String(month).padStart(2, "0");
    head.setAttribute("aria-expanded", currentMonth ? "true" : "false");
    head.innerHTML = `<span class="card-title">${name} ۱۴۰۵</span><span class="chev${currentMonth ? " is-open" : ""}" aria-hidden="true">▾</span>`;

    const body = document.createElement("div");
    body.className = "stage-body" + (currentMonth ? " is-open" : "");

    const weekHead = document.createElement("div");
    weekHead.className = "cal-grid cal-grid-head";
    WEEKDAYS_FA.forEach((w) => {
      const c = document.createElement("span");
      c.textContent = w[0];
      c.title = w;
      weekHead.appendChild(c);
    });

    const grid = document.createElement("div");
    grid.className = "cal-grid";

    for (let i = 0; i < firstWeekday; i++) {
      grid.appendChild(document.createElement("span"));
    }

    for (let day = 1; day <= length; day++) {
      const key = calendarDateKey(month, day);
      const data = state.calendar?.[key] || {};
      const score = calendarScore(data);
      const holiday = holidayLabel1405(month, day);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.dataset.date = key;
      if (holiday || weekdayIndex1405(month, day) === 6) btn.classList.add("is-holiday");
      if (key === todayKey1405) btn.classList.add("is-today");
      if (key === selected) btn.classList.add("is-selected");
      if (score > 0) btn.classList.add("has-data");
      btn.innerHTML = `<span class="cal-day-num">${fa(day)}</span>${score > 0 ? `<span class="cal-day-score" style="--day-score:${score}%"></span>` : ""}`;
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

  renderCalendarDetail();
  renderCalendarInsights();
}

function selectCalendarDay(key) {
  if (!calendarDayParts(key)) return;
  state.calendarSelected = key;
  save();
  renderCalendarMonths();
}

function renderCalendarDetail() {
  const box = $("#calendarDetail");
  if (!box) return;

  const key = calendarDayParts(state.calendarSelected) ? state.calendarSelected : calendarTodayKey();
  if (!key) {
    box.hidden = true;
    return;
  }

  const parts = calendarDayParts(key);
  const data = state.calendar?.[key] || {};
  const score = calendarScore(data);
  const weekday = WEEKDAYS_FA[weekdayIndex1405(parts.month, parts.day)];
  const holiday = holidayLabel1405(parts.month, parts.day);
  const isFriday = weekdayIndex1405(parts.month, parts.day) === 6;
  const today = key === calendarTodayKey();

  let typeLine;
  if (holiday) typeLine = `نوع روز: 🔴 تعطیل رسمی — ${holiday}`;
  else if (isFriday) typeLine = "نوع روز: 🟡 تعطیل هفتگی (جمعه)";
  else typeLine = "نوع روز: 🏫 روز مدرسه";

  const done = state.daily.filter((t) => t.done).length;
  const total = state.daily.length;
  const todayLine = today ? `<p class="progress-caption">امروز است — ${fa(done)} از ${fa(total)} کار برنامه امروز انجام شده.</p>` : "";

  box.hidden = false;
  box.innerHTML = `
    <div class="cal-detail-top">
      <div>
        <span class="eyebrow">روز انتخاب‌شده</span>
        <h2 class="card-title">📅 ${weekday} ${fa(parts.day)} ${PERSIAN_MONTHS[parts.month - 1]} ۱۴۰۵</h2>
        <p class="school-hint">${score}% از روزت ثبت شده</p>
      </div>
      <div class="cal-big-score" style="--day-score:${score}%"><strong>${fa(score)}٪</strong></div>
    </div>
    <div class="cal-progress"><span style="width:${score}%"></span></div>
    <div class="cal-editor-grid">
      <label>📝 خلاصه روز<textarea id="calSummary" maxlength="280" placeholder="امروز چه کارهایی کردی؟ چه چیزی یاد گرفتی؟"></textarea></label>
      <label>😊 حال امروز<select id="calMood">
        <option value="">انتخاب کن</option>
        <option value="great">خیلی خوب</option>
        <option value="good">خوب</option>
        <option value="normal">معمولی</option>
        <option value="hard">سخت</option>
      </select></label>
      <label>⏱️ دقیقه تمرکز<input id="calFocus" type="number" min="0" max="600" value="0"></label>
      <label class="cal-check">☑️ کار اصلی روز<input id="calTasksDone" type="checkbox"></label>
    </div>
    <div class="cal-detail-actions">
      <button class="btn btn-primary" id="calSaveDay" type="button">ذخیره روز</button>
      <button class="btn btn-ghost" id="calClearDay" type="button">پاک کردن اطلاعات</button>
    </div>
  `;

  $("#calSummary").value = String(data.summary || "");
  $("#calMood").value = String(data.mood || "");
  $("#calFocus").value = String(Math.max(0, Number(data.focusMinutes) || 0));
  $("#calTasksDone").checked = data.tasksDone === true;

  $("#calSaveDay").onclick = () => {
    const day = calendarDayData(key);
    day.summary = $("#calSummary").value.trim().slice(0, 280);
    day.mood = $("#calMood").value;
    day.focusMinutes = Math.max(0, Math.min(600, Number($("#calFocus").value) || 0));
    day.tasksDone = $("#calTasksDone").checked;
    if (!day.summary && !day.mood && day.focusMinutes === 0 && !day.tasksDone) {
      delete state.calendar[key];
    }
    save();
    renderCalendarMonths();
    toast("خلاصه روز ذخیره شد ✨");
  };

  $("#calClearDay").onclick = () => {
    if (state.calendar) delete state.calendar[key];
    save();
    renderCalendarMonths();
    toast("اطلاعات این روز پاک شد");
  };
}

function renderCalendarInsights() {
  const entries = Object.entries(state.calendar || {})
    .map(([key, data]) => [key, data, calendarScore(data)])
    .filter(([key, data, score]) => Boolean(calendarDayParts(key)) && score > 0);

  const done = entries.length;
  const good = entries.filter((entry) => entry[2] >= 70).length;

  let streak = 0;
  let cursor = calendarTodayKey();
  let guard = 0;
  while (cursor && guard++ < 366) {
    const data = state.calendar?.[cursor];
    if (!data || calendarScore(data) <= 0) break;
    streak++;
    cursor = calendarPrevKey(cursor);
  }

  const selected = calendarDayParts(state.calendarSelected) ? state.calendarSelected : calendarTodayKey();
  const monthPrefix = selected ? selected.slice(0, 7) : "";
  const monthEntries = entries.filter((entry) => entry[0].startsWith(monthPrefix));
  const monthScore = monthEntries.length
    ? Math.round(monthEntries.reduce((sum, entry) => sum + entry[2], 0) / monthEntries.length)
    : 0;
  const yearScore = done
    ? Math.round(entries.reduce((sum, entry) => sum + entry[2], 0) / done)
    : 0;

  setText("#calDoneDays", fa(done));
  setText("#calGoodDays", fa(good));
  setText("#calCurrentStreak", fa(streak));
  setText("#calMonthScore", fa(monthScore) + "٪");
  setText("#calendarYearScore", fa(yearScore) + "٪");
}

/* — برنامه روزانه ساعتی — */

// لیست بلوک‌های امروز بر اساس حالت انتخاب‌شده (مدرسه/تعطیل)
function scheduleList() {
  if (state.schedule.mode === "holiday") return SCHEDULE_HOLIDAY;
  // زمان اصلی مطالعه عمداً ثابت می‌ماند: ۱۴:۰۰ تا ۱۵:۳۰.
  // برنامه شخصی فقط محتوای درس‌ها را تغییر می‌دهد، نه ساعت مطالعه را.
  const base = SCHEDULE_SCHOOL.map((block) => ({...block, tasks:[...(block.tasks||[])]}));
  const lessons = todaySchoolLessons();
  if (!lessons.length) return base;
  const targetIndex = base.findIndex((block) => block.id === "homework");
  if (targetIndex < 0) return base;
  const target = base[targetIndex];
  const total = 90;
  const tasks = lessons.map((lesson,i)=>lesson+" — "+(Math.floor(total/lessons.length)+(i<total%lessons.length?1:0))+" دقیقه مرور/تمرین");
  base[targetIndex]={...target,title:"درس‌های امروز مدرسه",time:"۱۴:۰۰ تا ۱۵:۳۰",tasks:tasks.concat(["جمع‌بندی کوتاه و آماده‌سازی کیف فردا"])};
  return base;
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


/* — مرکز مدرسه — */
const SCHOOL_DAYS=["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"];
function schoolGradeValues(){const a=[];SUBJECTS.forEach(s=>(Array.isArray(state.school?.grades?.[s.name])?state.school.grades[s.name]:[]).forEach(v=>{const n=Number(v);if(Number.isFinite(n)&&n>=0&&n<=20)a.push(n)}));return a}
function schoolGradeAverage(){const a=schoolGradeValues();return a.length?a.reduce((x,y)=>x+y,0)/a.length:null}
function schoolMissionSubject(){return [...SUBJECTS].sort((a,b)=>subjectPct(a)-subjectPct(b))[0]}
function renderSchoolCenter(){
 const avg=schoolAverage(), ga=schoolGradeAverage(), vals=schoolGradeValues();
 setText("#schoolAvg",fa(avg)+"٪");setText("#dashSchoolAvg2",`میانگین ${fa(avg)}٪`);setText("#schoolGradeAvg",ga===null?"—":ga.toFixed(1));setText("#schoolGradesCount",fa(vals.length));setText("#schoolGradesBadge",fa(vals.length)+" نمره");setText("#schoolGoalDisplay",String(state.school?.goal??18.5).replace(".", "٫"));setText("#schoolGradePct",fa(avg)+"٪");
 const ring=$("#schoolGradeRing");if(ring)ring.style.setProperty("--school-progress",avg+"%");
 const cards=$("#schoolSubjectCards");if(cards){cards.innerHTML="";SUBJECTS.forEach(s=>{const p=subjectPct(s),d=document.createElement("div");d.className="school-subject";d.innerHTML=`<div class="school-subject-head"><strong>${s.name}</strong><span>${fa(p)}٪</span></div><div class="progress"><div class="progress-bar ${p===100?"is-full":""}" style="width:${p}%"></div></div><div class="school-subject-foot"><span>${s.prio}</span><span>${s.goal}</span></div>`;const r=document.createElement("input");r.type="range";r.min=0;r.max=100;r.step=5;r.value=p;r.className="range";r.addEventListener("input",()=>{state.school[s.name]=Number(r.value);renderSchoolCenter();renderSchoolDash()});r.addEventListener("change",()=>{save();renderStats()});d.appendChild(r);cards.appendChild(d)})}
 const grades=$("#schoolGradesTable");if(grades){grades.innerHTML="";SUBJECTS.forEach(s=>{const row=document.createElement("div");row.className="school-grade-row";const vals=Array.isArray(state.school?.grades?.[s.name])?state.school.grades[s.name]:[];row.innerHTML=`<strong>${s.name}</strong><div class="school-grade-values"></div><span class="school-grade-row-avg"></span>`;const wrap=row.querySelector(".school-grade-values");for(let i=0;i<3;i++){const inp=document.createElement("input");inp.type="number";inp.min=0;inp.max=20;inp.step=.25;inp.placeholder="نمره "+(i+1);inp.value=vals[i]??"";inp.addEventListener("change",()=>{if(!state.school.grades)state.school.grades={};const a=Array.isArray(state.school.grades[s.name])?state.school.grades[s.name].slice(0,3):[];a[i]=inp.value===""?null:Math.min(20,Math.max(0,Number(inp.value)));state.school.grades[s.name]=a;save();renderSchoolCenter();renderStats()});wrap.appendChild(inp)}const good=vals.filter(v=>Number.isFinite(Number(v))).map(Number);row.querySelector(".school-grade-row-avg").textContent=good.length?(good.reduce((a,b)=>a+b,0)/good.length).toFixed(1):"—";grades.appendChild(row)})}
 const m=schoolMissionSubject();if(m){const mins=m.name==="ریاضی"?25:20;setText("#schoolMissionTitle",m.name);setText("#schoolMissionText",fa(mins)+" دقیقه "+(m.name==="ریاضی"?"تمرین پایه":"مرور و تمرین"));setText("#schoolMissionXp",m.level<=2?"+۲۵ XP":"+۲۰ XP");setText("#schoolMissionHint",`ضعیف‌ترین وضعیت فعلی: ${fa(subjectPct(m))}٪`);setText("#schoolMissionIcon",m.name==="ریاضی"?"📐":m.name==="عربی"?"📝":"📚")}
 const week=$("#schoolWeek");if(week){week.innerHTML="";SCHOOL_DAYS.forEach(day=>{const l=document.createElement("label");l.className="school-week-row";const cb=document.createElement("input");cb.type="checkbox";cb.checked=!!state.school.weekly?.[day];cb.addEventListener("change",()=>{state.school.weekly[day]=cb.checked;if(cb.checked)state.school.studyDays[todayKey()]=true;save();renderSchoolCenter()});l.append(cb);l.insertAdjacentHTML("beforeend",`<span class="school-week-day">${day}</span><span class="school-week-task">مطالعه اصلی</span>`);week.appendChild(l)})}
 const pri=$("#schoolPriorityList");if(pri){pri.innerHTML="";[...SUBJECTS].sort((a,b)=>subjectPct(a)-subjectPct(b)).slice(0,5).forEach((s,i)=>{const p=subjectPct(s),r=document.createElement("div");r.className="school-priority-row";r.innerHTML=`<span class="priority-rank">${fa(i+1)}</span><strong>${s.name}</strong><div class="progress"><div class="progress-bar" style="width:${p}%"></div></div><span>${fa(p)}٪</span>`;pri.appendChild(r)})}
}
function startSchoolMission(){const m=schoolMissionSubject();if(!m)return;const mins=m.name==="ریاضی"?25:20;focusSetMinutes(mins);showView("dashboard");setTimeout(()=>focusStart(),120);toast(`ماموریت ${m.name} شروع شد • ${fa(mins)} دقیقه`)}

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

/* — تایمر تمرکز — با preset، زمان دلخواه، وضعیت و حفظ تنظیمات در LocalStorage — */
const FOCUS_MIN_OPTIONS = [5, 10, 15, 25, 30, 45, 50, 60];
const FOCUS_TIMER_KEY = "my-nafshe-focus-timer";
const focusTimer = { minutes: 25, remaining: 25 * 60, endAt: 0, timer: null, running: false };

function focusStatusText() {
  if (focusTimer.running) return "در حال تمرکز";
  if (focusTimer.remaining === 0) return "تکمیل شد";
  if (focusTimer.remaining !== focusTimer.minutes * 60) return "متوقف";
  return "آماده";
}

function saveFocusTimer() {
  try {
    localStorage.setItem(FOCUS_TIMER_KEY, JSON.stringify({
      minutes: focusTimer.minutes,
      remaining: focusTimer.remaining,
      endAt: focusTimer.endAt,
      running: focusTimer.running
    }));
  } catch {}
}

function loadFocusTimer() {
  try {
    const raw = localStorage.getItem(FOCUS_TIMER_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    const minutes = Number(saved.minutes);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) return;
    focusTimer.minutes = minutes;
    focusTimer.remaining = Math.max(0, Number(saved.remaining) || minutes * 60);
    focusTimer.endAt = Number(saved.endAt) || 0;
    focusTimer.running = saved.running === true;
    if (focusTimer.running && focusTimer.endAt > Date.now()) {
      focusTimer.timer = setInterval(focusTick, 500);
    } else if (focusTimer.running && focusTimer.endAt <= Date.now()) {
      focusTimer.remaining = 0;
      focusTimer.running = false;
      focusFinish();
    }
  } catch {}
}

function renderFocus() {
  const total = Math.max(1, focusTimer.minutes * 60);
  const elapsed = Math.max(0, total - focusTimer.remaining);
  const pct = Math.min(100, Math.round((elapsed / total) * 100));
  const mm = String(Math.floor(focusTimer.remaining / 60)).padStart(2, "0");
  const ss = String(focusTimer.remaining % 60).padStart(2, "0");
  setText("#focusTime", fa(`${mm}:${ss}`));
  setText("#focusMinLabel", `${fa(focusTimer.minutes)} دقیقه`);
  setText("#focusStatus", focusStatusText());

  const ring = $("#focusRing");
  if (ring) {
    ring.style.setProperty("--focus-progress", pct + "%");
    ring.classList.toggle("is-running", focusTimer.running);
    ring.classList.toggle("is-complete", focusTimer.remaining === 0);
  }

  const startBtn = $("#focusStart");
  const pauseBtn = $("#focusPause");
  if (startBtn) startBtn.disabled = focusTimer.running;
  if (pauseBtn) pauseBtn.disabled = !focusTimer.running;

  $$("#focusModes .mode-btn").forEach((btn) => {
    btn.classList.toggle("is-active", Number(btn.dataset.focusMin) === focusTimer.minutes);
  });

  const custom = $("#focusCustomMinutes");
  if (custom && document.activeElement !== custom) {
    custom.value = FOCUS_MIN_OPTIONS.includes(focusTimer.minutes) ? "" : String(focusTimer.minutes);
  }
  const sessions = state.focus ? state.focus.sessions : 0;
  setText("#focusBadge", `${fa(sessions)} جلسه امروز`);
}

function focusStop() {
  clearInterval(focusTimer.timer);
  focusTimer.timer = null;
  focusTimer.running = false;
  saveFocusTimer();
}

function focusTick() {
  if (!focusTimer.running) return;
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
  saveFocusTimer();
  setText("#focusMsg", "تمرکز کن؛ فقط روی یک کار.");
  renderFocus();
}

function focusPause() {
  if (!focusTimer.running) return;
  focusTick();
  focusStop();
  setText("#focusMsg", "تایمر متوقف شد؛ هر وقت خواستی ادامه بده.");
  renderFocus();
}

function focusReset() {
  focusStop();
  focusTimer.remaining = focusTimer.minutes * 60;
  focusTimer.endAt = 0;
  localStorage.removeItem(FOCUS_TIMER_KEY);
  setText("#focusMsg", "تایمر از نو آماده شد.");
  renderFocus();
}

function focusSetMinutes(min) {
  if (!Number.isFinite(min) || min < 1 || min > 180) return;
  focusStop();
  focusTimer.minutes = Math.round(min);
  focusTimer.remaining = focusTimer.minutes * 60;
  focusTimer.endAt = 0;
  setText("#focusMsg", `${fa(focusTimer.minutes)} دقیقه انتخاب شد.`);
  saveFocusTimer();
  renderFocus();
}

function focusApplyCustom() {
  const input = $("#focusCustomMinutes");
  const min = Number(input?.value);
  if (!Number.isInteger(min) || min < 1 || min > 180) {
    setText("#focusMsg", "زمان دلخواه باید بین ۱ تا ۱۸۰ دقیقه باشد.");
    input?.focus();
    return;
  }
  focusSetMinutes(min);
}

function focusFinish() {
  focusStop();
  focusTimer.remaining = 0;
  focusTimer.endAt = 0;
  if (!state.focus || state.focus.date !== todayKey()) {
    state.focus = { date: todayKey(), sessions: 0, minutes: 0 };
  }
  state.focus.sessions += 1;
  state.focus.minutes += focusTimer.minutes;
  save();
  localStorage.removeItem(FOCUS_TIMER_KEY);
  setText("#focusMsg", `آفرین! ${fa(focusTimer.minutes)} دقیقه تمرکز کامل شد. کمی استراحت کن.`);
  toast("جلسه تمرکز تمام شد 🎉");
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  renderFocus();
  renderStats();
}

/* — رندر کامل — */
function userDisplayName(){
  const name=normalizeProfile(state.profile||DEFAULT_PROFILE).userName;
  return name || "کاربر";
}
function updateUserIdentityUI(){
  const name=userDisplayName();
  setText("#brandText", `گام (${name})`);
  setText("#heroGreeting", `سلام ${name} 👋`);
  const mark=$("#userNameBtn");
  if(mark){ mark.textContent=name==="کاربر"?"👤":name.charAt(0); mark.title=`کاربر: ${name} — تغییر نام`; }
}

function appDialogRequest({title="گام",message="",value="",mode="input",confirmText="تأیید",cancelText="لغو",icon="✨",placeholder=""}={}){
  const dlg=$("#appDialog"), form=$("#appDialogForm"), input=$("#appDialogInput");
  if(!dlg || !form) return Promise.resolve(null);
  $("#appDialogTitle").textContent=title;
  $("#appDialogMessage").textContent=message;
  $("#appDialogIcon").textContent=icon;
  $("#appDialogConfirm").textContent=confirmText;
  $("#appDialogCancel").textContent=cancelText;
  input.value=value || "";
  input.placeholder=placeholder || "";
  dlg.dataset.mode=mode;
  input.hidden=mode!=="input";
  const handler=()=>{
    dlg.removeEventListener("close",handler);
    resolveDialog?.(dlg.returnValue==="confirm" ? (mode==="input" ? input.value : true) : null);
  };
  let resolveDialog;
  const promise=new Promise(resolve=>{resolveDialog=resolve;});
  dlg.addEventListener("close",handler);
  if(typeof dlg.showModal==="function") dlg.showModal();
  else { resolveDialog(null); return promise; }
  requestAnimationFrame(()=>{ if(mode==="input") input.focus(); else $("#appDialogConfirm")?.focus(); });
  return promise;
}

async function askForUserName(force=false){
  const current=normalizeProfile(state.profile||DEFAULT_PROFILE).userName;
  if(current && !force){ updateUserIdentityUI(); return; }
  const answer=await appDialogRequest({
    title: current ? "تغییر نام" : "خوش اومدی 👋",
    message:"اسم شما چیه؟ این اسم داخل برنامه نمایش داده می‌شود.",
    value:current,
    mode:"input",
    confirmText:"ذخیره",
    cancelText:"بعداً",
    icon:"👤",
    placeholder:"مثلاً محمد"
  });
  if(answer===null) { updateUserIdentityUI(); return; }
  const name=String(answer).trim().slice(0,30);
  state.profile=normalizeProfile({...state.profile,userName:name});
  save();
  updateUserIdentityUI();
  toast(name ? `خوش اومدی ${name} 👋` : "نام کاربر ثبت نشد");
}

function renderAll() {
  const today = renderToday();
  renderSummary(today);
  renderPlanner();
  renderDaily();
  renderWeeklyTimetable();
  renderCalendarMonths();
  renderSubjects();
  renderSchoolCenter();
  renderRoadmap();
  renderLanguage();
  renderProjects();
  renderHabits();
  renderProgress();
  renderStats();
  renderFocus();
  updateUserIdentityUI();
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
    appDialogRequest({
      title:"افزودن کار",
      message:"عنوان کاری که می‌خواهی به برنامه امروز اضافه شود را وارد کن.",
      value:preset.title,
      mode:"input",
      confirmText:"افزودن",
      cancelText:"لغو",
      icon:"➕",
      placeholder:"مثلاً تمرین HTML"
    }).then(title=>{
      if (title && String(title).trim() && addCustomTask(String(title).trim(), preset.cat, 20)) toast("کار اضافه شد");
    });
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
  // سازنده برنامه شخصی
  $("#plannerGrade")?.addEventListener("change", () => {
    populatePlannerFieldOptions();
    const grade = Number($("#plannerGrade").value || 9);
    const field = $("#plannerField").value || (grade >= 10 ? "math" : "");
    applyAcademicProfile({ ...normalizeProfile(state.profile || DEFAULT_PROFILE), grade, field });
    renderPlannerSubjects();
  });
  $("#plannerField")?.addEventListener("change", () => {
    const p = normalizeProfile(state.profile || DEFAULT_PROFILE);
    applyAcademicProfile({ ...p, grade:Number($("#plannerGrade").value || p.grade), field:$("#plannerField").value || "math" });
    renderPlannerSubjects();
  });
  $("#plannerForm")?.addEventListener("submit", (e) => { e.preventDefault(); savePlannerProfile(); });
  $("#openPlannerBtn")?.addEventListener("click", openPlanner);
  $("#openPlannerSettingsBtn")?.addEventListener("click", openPlanner);

  // نام کاربر
  $("#userNameBtn")?.addEventListener("click", () => askForUserName(true));

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
  $("#schoolMissionStart").addEventListener("click", startSchoolMission);
  $("#schoolResetWeek").addEventListener("click", () => { state.school.weekly={}; save(); renderSchoolCenter(); toast("برنامه هفتگی از نو آماده شد"); });

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

  $("#focusCustomApply").addEventListener("click", focusApplyCustom);
  $("#focusCustomMinutes").addEventListener("keydown", (e) => {
    if (e.key === "Enter") focusApplyCustom();
  });

  // تقویم ۱۴۰۵: کلیک روی یک روز
  $("#calendarMonths").addEventListener("click", (e) => {
    const btn = e.target.closest(".cal-day");
    if (!btn || btn.classList.contains("cal-empty")) return;
    selectCalendarDay(btn.dataset.date);
  });

  // پاک کردن همه اطلاعات
  $("#resetAll").addEventListener("click", async () => {
    const ok=await appDialogRequest({
      title:"پاک کردن اطلاعات",
      message:"همه اطلاعات پاک شود؟ این کار برگشت‌پذیر نیست.",
      mode:"confirm",
      confirmText:"پاک کردن",
      cancelText:"لغو",
      icon:"⚠️"
    });
    if(!ok) return;
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
  loadFocusTimer();
  bindEvents();
  renderAll();
}

document.addEventListener("DOMContentLoaded", init);

document.addEventListener("DOMContentLoaded", () => {
  updateUserIdentityUI();
  if (!state.profile?.userName) {
    setTimeout(() => askForUserName(false), 350);
  }
  if (!state.profile?.configured) setTimeout(() => showView("planner"), 250);
});

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

  const knownKeys = ["date", "daily", "checked", "schedule", "xp", "streak", "projects", "habits", "theme", "school", "focus", "profile"];
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

  if (isObj(data.profile)) {
    const p=normalizeProfile(data.profile);
    out.profile={...p,subjectLevels:{}};
    if(isObj(data.profile.subjectLevels))Object.keys(data.profile.subjectLevels).slice(0,100).forEach((k)=>{const n=Number(data.profile.subjectLevels[k]);if(Number.isFinite(n)&&n>=1&&n<=4)out.profile.subjectLevels[k]=Math.round(n)});
    out.profile.configured=data.profile.configured===true;
    out.profile.userName=typeof data.profile.userName==="string"?data.profile.userName.trim().slice(0,30):"";
  }
  if (isObj(data.school)) {
    out.school={goal:18.5,grades:{},weekly:{},studyDays:{}};
    const g=Number(data.school.goal);if(Number.isFinite(g))out.school.goal=Math.min(20,Math.max(10,g));
    Object.keys(data.school).forEach((key)=>{if(["goal","grades","weekly","studyDays"].includes(key))return;if(numOk(data.school[key]))out.school[key]=Math.min(100,Math.round(data.school[key]/5)*5)});
    if(isObj(data.school.grades))Object.keys(data.school.grades).slice(0,100).forEach(k=>{const a=Array.isArray(data.school.grades[k])?data.school.grades[k]:[];out.school.grades[k]=a.slice(0,3).map(v=>Number.isFinite(Number(v))?Math.min(20,Math.max(0,Number(v))):null)});
    if(isObj(data.school.weekly))Object.keys(data.school.weekly).slice(0,7).forEach(k=>{if(data.school.weekly[k]===true)out.school.weekly[k]=true});
    if(isObj(data.school.studyDays))Object.keys(data.school.studyDays).slice(0,370).forEach(k=>{if(dateOk(k)&&data.school.studyDays[k]===true)out.school.studyDays[k]=true});
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
    a.download = `my-path-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("فایل پشتیبان ساخته شد");
  });

  // بازگرداندن اطلاعات از فایل
  $("#importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const clean = sanitizeState(JSON.parse(reader.result));
        if (!clean) {
          toast("این فایل پشتیبان این برنامه نیست");
        } else if (await appDialogRequest({
          title:"بازگردانی پشتیبان",
          message:"اطلاعات فعلی با محتوای این فایل جایگزین شود؟",
          mode:"confirm",
          confirmText:"بازگردانی",
          cancelText:"لغو",
          icon:"↩️"
        })) {
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


/* ---------- 9) اتصال خودکار Sync UI و دریافت Cloud ---------- */
(function setupCloudSync() {
  const CODE_KEY = "my-nafshe-sync-code";

  function statusText(status) {
    return ({
      off: "⚪ متصل نیست",
      connected: "🟢 متصل",
      syncing: "🔄 در حال همگام‌سازی",
      offline: "🟠 آفلاین",
      error: "🔴 خطا"
    })[status] || "⚪ متصل نیست";
  }

  function renderSyncUI() {
    const api = window.MyNafsheSync;
    const status = api?.getSyncStatus?.() || "off";
    const statusEl = document.getElementById("syncStatus");
    if (statusEl) statusEl.textContent = statusText(status);

    const code = localStorage.getItem(CODE_KEY);
    const box = document.getElementById("syncCodeBox");
    const codeEl = document.getElementById("syncCode");
    if (code && box && codeEl) {
      codeEl.textContent = code;
      box.hidden = false;
    }
  }

  function showCode(code) {
    if (!code) return;
    localStorage.setItem(CODE_KEY, code);
    renderSyncUI();
  }

  window.addEventListener("my-nafshe-sync-status", renderSyncUI);

  window.addEventListener("my-nafshe-cloud-data", (event) => {
    const cloudData = event.detail;
    if (!cloudData) return;

    try {
      const clean = sanitizeState(cloudData);
      if (!clean) return;

      state = clean;
      rolloverDay();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.removeItem("my-nafshe-local-dirty");
      applyTheme();
      renderAll();
      toast("اطلاعات بین دستگاه‌ها همگام شد ☁️");
    } catch (error) {
      console.error("Cloud data apply failed:", error);
    }
  });

  window.addEventListener("my-nafshe-sync-online", () => {
    if (window.MyNafsheSync?.getSyncAccountId?.()) {
      window.MyNafsheSync.syncNow(state).catch(console.error);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    renderSyncUI();

    document.getElementById("createSyncBtn")?.addEventListener("click", async () => {
      const api = window.MyNafsheSync;
      if (!api) return;
      const btn = document.getElementById("createSyncBtn");
      try {
        btn.disabled = true;
        const code = await api.createSyncAccount();
        showCode(code);
        await api.syncNow(state, { push: true });
        toast("Sync Code ساخته شد ☁️");
      } catch (e) {
        console.error(e);
        toast("ساخت Sync Code انجام نشد");
      } finally {
        btn.disabled = false;
        renderSyncUI();
      }
    });

    document.getElementById("connectSyncBtn")?.addEventListener("click", async () => {
      const api = window.MyNafsheSync;
      if (!api) return;
      const code = await appDialogRequest({
        title:"اتصال دستگاه",
        message:"Sync Code دستگاه اصلی را وارد کن تا این دستگاه به همان اطلاعات وصل شود.",
        mode:"input",
        confirmText:"اتصال",
        cancelText:"لغو",
        icon:"🔗",
        placeholder:"Sync Code"
      });
      if (!code?.trim()) return;

      const btn = document.getElementById("connectSyncBtn");
      try {
        btn.disabled = true;
        await api.connectExistingSync(code.trim());
        localStorage.removeItem("my-nafshe-local-dirty");
        const cloud = await api.pullCloudData();
        if (cloud?.data) {
          const clean = sanitizeState(cloud.data);
          if (clean) {
            state = clean;
            rolloverDay();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            localStorage.setItem("my-nafshe-local-revision", String(cloud.revision || 0));
            applyTheme();
            renderAll();
          }
        }
        toast("این دستگاه به اطلاعات اصلی وصل شد ☁️");
      } catch (e) {
        console.error(e);
        toast("اتصال انجام نشد؛ Sync Code را بررسی کن");
      } finally {
        btn.disabled = false;
        renderSyncUI();
      }
    });

    document.getElementById("syncNowBtn")?.addEventListener("click", async () => {
      const api = window.MyNafsheSync;
      if (!api) return;
      const btn = document.getElementById("syncNowBtn");
      try {
        btn.disabled = true;
        await api.syncNow(state, { push: true });
        toast("همگام‌سازی انجام شد ☁️");
      } catch (e) {
        console.error(e);
        toast("همگام‌سازی انجام نشد");
      } finally {
        btn.disabled = false;
        renderSyncUI();
      }
    });

    document.getElementById("copySyncCode")?.addEventListener("click", async () => {
      const code = localStorage.getItem(CODE_KEY);
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        toast("Sync Code کپی شد 📋");
      } catch {
        toast("کپی خودکار در دسترس نیست");
      }
    });

    setTimeout(async () => {
      const api = window.MyNafsheSync;
      if (!api?.getSyncAccountId?.()) return;
      try {
        if (localStorage.getItem("my-nafshe-local-dirty") === "1") {
          await api.syncNow(state, { push: true });
        } else {
          await api.syncNow(state);
        }
        renderSyncUI();
      } catch (e) {
        console.warn("Initial sync failed:", e);
      }
    }, 1200);
  });
})();
