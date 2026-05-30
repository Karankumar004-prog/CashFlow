import React, { useState, useEffect, useRef, useMemo } from "react";
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'; // This is also needed for web, as we use it for local backups
import { Haptics } from '@capacitor/haptics'; // <-- Add this new import

// ─── TRANSLATIONS (i18n) ──────────────────────────────────────────────────────
const DICT = {
  English: { home: "Home", stats: "Stats", txns: "Txns", accounts: "Accounts", settings: "Settings", myFinances: "My Finances", welcome: "Welcome back 👋", totalBalance: "Total Balance", income: "Income", expense: "Expense", savingsRate: "Savings Rate", analytics: "Analytics", net: "NET", topSpending: "Top Spending", allAccs: "All Accounts", netWorth: "NET WORTH", addTxn: "Add Transaction", addInc: "💚 Add Income", addExp: "💸 Add Expense", note: "Note", date: "Date", category: "Category", account: "Account", saveChanges: "💾 Save Changes", cancel: "Cancel", confirm: "Confirm", delete: "Delete", search: "Search…", noTxns: "No transactions found.", clear: "Clear", appearance: "Appearance", regional: "Regional", security: "Security", customCats: "Custom Categories", appPwd: "App Password", cloudSync: "Google Drive Sync", localBkp: "Local Backup", add: "+ Add", remove: "Remove", editAcc: "Edit Account", addAcc: "Add Account", all: "All", day: "Day", week: "Week", month: "Month", year: "Year", in: "In", out: "Out", name: "Name", icon: "Icon", color: "Color", type: "Type", m1: "Jan", m2: "Feb", m3: "Mar", m4: "Apr", m5: "May", m6: "Jun", m7: "Jul", m8: "Aug", m9: "Sep", m10: "Oct", m11: "Nov", m12: "Dec", generateReport: "Generate Report", reportPreview: "Report Preview", preview: "Preview", exportCsv: "Export CSV", printPdf: "Print / PDF", backBtn: "Back", changePwd: "Change Password", setPwd: "Set Password", currentPin: "Current PIN", newPin: "New PIN", confirmPin: "Confirm PIN", savePwd: "Save Password", removePwd: "Remove Password", nowBtn: "Now" },
  Español: { home: "Inicio", stats: "Estadísticas", txns: "Transacciones", accounts: "Cuentas", settings: "Ajustes", myFinances: "Mis Finanzas", welcome: "Bienvenido 👋", totalBalance: "Saldo Total", income: "Ingresos", expense: "Gastos", savingsRate: "Tasa de Ahorro", analytics: "Análisis", net: "NETO", topSpending: "Mayores Gastos", allAccs: "Todas las Cuentas", netWorth: "PATRIMONIO NETO", addTxn: "Añadir Transacción", addInc: "💚 Añadir Ingreso", addExp: "💸 Añadir Gasto", note: "Nota", date: "Fecha", category: "Categoría", account: "Cuenta", saveChanges: "💾 Guardar", cancel: "Cancelar", confirm: "Confirmar", delete: "Eliminar", search: "Buscar…", noTxns: "No hay transacciones.", clear: "Limpiar", appearance: "Apariencia", regional: "Regional", security: "Seguridad", customCats: "Categorías Propias", appPwd: "Clave de App", cloudSync: "Sincronizar Google Drive", localBkp: "Copia Local", add: "+ Añadir", remove: "Eliminar", editAcc: "Editar Conta", addAcc: "Añadir Conta", all: "Todo", day: "Día", week: "Semana", month: "Mes", year: "Año", in: "Ent", out: "Sal", name: "Nombre", icon: "Ícono", color: "Cor", type: "Tipo", m1: "Ene", m2: "Feb", m3: "Mar", m4: "Abr", m5: "May", m6: "Jun", m7: "Jul", m8: "Ago", m9: "Sep", m10: "Oct", m11: "Nov", m12: "Dic" },
  हिन्दी: { home: "होम", stats: "आंकड़े", txns: "लेन-देन", accounts: "खाते", settings: "सेटिंग्स", myFinances: "मेरा वित्त", welcome: "वापसी पर स्वागत है 👋", totalBalance: "कुल शेष", income: "आय", expense: "खर्च", savingsRate: "बचत दर", analytics: "विश्लेषण", net: "शुद्ध", topSpending: "शीर्ष खर्च", allAccs: "सभी खाते", netWorth: "कुल संपत्ति", addTxn: "लेन-देन जोड़ें", addInc: "💚 आय जोड़ें", addExp: "💸 खर्च जोड़ें", note: "नोट", date: "तारीख", category: "श्रेणी", account: "खाता", saveChanges: "💾 सहेजें", cancel: "रद्द करें", confirm: "पुष्टि करें", delete: "हटाएं", search: "खोजें…", noTxns: "कोई लेन-देन नहीं मिला।", clear: "साफ़ करें", appearance: "दिखावट", regional: "क्षेत्रीय", security: "सुरक्षा", customCats: "कस्टम श्रेणियाँ", appPwd: "ऐप पासवर्ड", cloudSync: "Google Drive सिंक", localBkp: "स्थानीय बैकअप", add: "+ जोड़ें", remove: "हटाएं", editAcc: "खाता संपादित करें", addAcc: "खाता जोड़ें", all: "सभी", day: "दिन", week: "सप्ताह", month: "महीना", year: "वर्ष", in: "आवक", out: "जावक", name: "नाम", icon: "आइकन", color: "रंग", type: "प्रकार", m1: "जन", m2: "फ़र", m3: "मार्च", m4: "अप्रैल", m5: "मई", m6: "जून", m7: "जुला", m8: "अग", m9: "सित", m10: "अक्टू", m11: "नव", m12: "दिस" },
  Français: { home: "Accueil", stats: "Stats", txns: "Trans", accounts: "Comptes", settings: "Paramètres", myFinances: "Mes Finances", welcome: "Bon retour 👋", totalBalance: "Solde Total", income: "Revenus", expense: "Dépenses", savingsRate: "Taux d'Épargne", analytics: "Analytique", net: "NET", topSpending: "Top Dépenses", allAccs: "Tous les Comptes", netWorth: "VALEUR NETTE", addTxn: "Ajouter Trans", addInc: "💚 Ajouter Revenu", addExp: "💸 Ajouter Dépense", note: "Note", date: "Date", category: "Catégorie", account: "Compte", saveChanges: "💾 Enregistrer", cancel: "Annuler", confirm: "Confirmer", delete: "Supprimer", search: "Rechercher…", noTxns: "Aucune transaction.", clear: "Effacer", appearance: "Apparence", regional: "Régional", security: "Sécurité", customCats: "Catégories Perso", appPwd: "Mot de passe", cloudSync: "Sync Google Drive", localBkp: "Sauvegarde Locale", add: "+ Ajouter", remove: "Retirer", editAcc: "Modifier Compte", addAcc: "Ajouter Compte", all: "Tout", day: "Jour", week: "Semaine", month: "Mois", year: "Année", in: "Entrée", out: "Sortie", name: "Nom", icon: "Icône", color: "Couleur", type: "Type", m1: "Jan", m2: "Fév", m3: "Mar", m4: "Avr", m5: "Mai", m6: "Juin", m7: "Jul", m8: "Aoû", m9: "Sep", m10: "Oct", m11: "Nov", m12: "Déc" },
  Deutsch: { home: "Start", stats: "Stats", txns: "Trans", accounts: "Konten", settings: "Einst", myFinances: "Meine Finanzen", welcome: "Willkommen zurück 👋", totalBalance: "Gesamtsaldo", income: "Einnahmen", expense: "Ausgaben", savingsRate: "Sparquote", analytics: "Analytik", net: "NETTO", topSpending: "Top Ausgaben", allAccs: "Alle Konten", netWorth: "REINVERMÖGEN", addTxn: "Trans hinzufügen", addInc: "💚 Einnahme", addExp: "💸 Ausgabe", note: "Notiz", date: "Datum", category: "Kategorie", account: "Konto", saveChanges: "💾 Speichern", cancel: "Abbrechen", confirm: "Bestätigen", delete: "Löschen", search: "Suchen…", noTxns: "Keine Transaktionen.", clear: "Löschen", appearance: "Aussehen", regional: "Regional", security: "Sicherheit", customCats: "Eigene Kategorien", appPwd: "App Passwort", cloudSync: "Google Drive Sync", localBkp: "Lokales Backup", add: "+ Hinzufügen", remove: "Entfernen", editAcc: "Konto bearbeiten", addAcc: "Konto hinzufügen", all: "Alle", day: "Tag", week: "Woche", month: "Monat", year: "Jahr", in: "Eingang", out: "Ausgang", name: "Name", icon: "Symbol", color: "Farbe", type: "Typ", m1: "Jan", m2: "Feb", m3: "Mär", m4: "Apr", m5: "Mai", m6: "Jun", m7: "Jul", m8: "Aug", m9: "Sep", m10: "Okt", m11: "Nov", m12: "Dez" },
  العربية: { home: "الرئيسية", stats: "إحصائيات", txns: "معاملات", accounts: "حسابات", settings: "إعدادات", myFinances: "أموالي", welcome: "مرحباً بعودتك 👋", totalBalance: "إجمالي الرصيد", income: "دخل", expense: "مصروف", savingsRate: "معدل التوفير", analytics: "تحليلات", net: "الصافي", topSpending: "أعلى النفقات", allAccs: "كل الحسابات", netWorth: "صافي الثروة", addTxn: "إضافة معاملة", addInc: "💚 إضافة دخل", addExp: "💸 إضافة مصروف", note: "ملاحظة", date: "التاريخ", category: "فئة", account: "حساب", saveChanges: "💾 حفظ", cancel: "إلغاء", confirm: "تأكيد", delete: "حذف", search: "بحث…", noTxns: "لا توجد معاملات.", clear: "مسح", appearance: "المظهر", regional: "إقليمي", security: "الأمان", customCats: "فئات مخصصة", appPwd: "كلمة مرور التطبيق", cloudSync: "مزامنة Drive", localBkp: "نسخة محلية", add: "+ إضافة", remove: "إزالة", editAcc: "تعديل الحساب", addAcc: "إضافة حساب", all: "الكل", day: "يوم", week: "أسبوع", month: "شهر", year: "سنة", in: "داخل", out: "خارج", name: "الاسم", icon: "أيقونة", color: "لون", type: "نوع", m1: "يناير", m2: "فبراير", m3: "مارس", m4: "أبريل", m5: "مايو", m6: "يونيو", m7: "يوليو", m8: "أغسطس", m9: "سبتمبر", m10: "أكتوبر", m11: "نوفمبر", m12: "ديسمبر" },
  中文: { home: "首页", stats: "统计", txns: "交易", accounts: "账户", settings: "设置", myFinances: "我的财务", welcome: "欢迎回来 👋", totalBalance: "总余额", income: "收入", expense: "支出", savingsRate: "储蓄率", analytics: "分析", net: "净额", topSpending: "最高支出", allAccs: "所有账户", netWorth: "净资产", addTxn: "添加交易", addInc: "💚 添加收入", addExp: "💸 添加支出", note: "备注", date: "日期", category: "类别", account: "账户", saveChanges: "💾 保存更改", cancel: "取消", confirm: "确认", delete: "删除", search: "搜索…", noTxns: "未找到交易。", clear: "清除", appearance: "外观", regional: "区域", security: "安全", customCats: "自定义类别", appPwd: "应用密码", cloudSync: "Drive 同步", localBkp: "本地备份", add: "+ 添加", remove: "移除", editAcc: "编辑账户", addAcc: "添加账户", all: "全部", day: "日", week: "周", month: "月", year: "年", in: "收入", out: "支出", name: "名称", icon: "图标", color: "颜色", type: "类型", m1: "1月", m2: "2月", m3: "3月", m4: "4月", m5: "5月", m6: "6月", m7: "7月", m8: "8月", m9: "9月", m10: "10月", m11: "11月", m12: "12月" },
  Português: { home: "Início", stats: "Stats", txns: "Trans", accounts: "Contas", settings: "Ajustes", myFinances: "Minhas Finanças", welcome: "Bem-vindo de volta 👋", totalBalance: "Saldo Total", income: "Receitas", expense: "Despesas", savingsRate: "Taxa de Poupança", analytics: "Análise", net: "LÍQUIDO", topSpending: "Maiores Gastos", allAccs: "Todas as Contas", netWorth: "PATRIMÔNIO LÍQUIDO", addTxn: "Adicionar Trans", addInc: "💚 Adic Receita", addExp: "💸 Adic Despesa", note: "Nota", date: "Data", category: "Categoria", account: "Conta", saveChanges: "💾 Salvar", cancel: "Cancelar", confirm: "Confirmar", delete: "Excluir", search: "Buscar…", noTxns: "Nenhuma transação.", clear: "Limpar", appearance: "Aparência", regional: "Regional", security: "Segurança", customCats: "Categorias Pers", appPwd: "Senha do App", cloudSync: "Sync Google Drive", localBkp: "Backup Local", add: "+ Adicionar", remove: "Remover", editAcc: "Editar Conta", addAcc: "Adic Conta", all: "Tudo", day: "Dia", week: "Semana", month: "Mês", year: "Ano", in: "Ent", out: "Saída", name: "Nome", icon: "Ícone", color: "Cor", type: "Tipo", m1: "Jan", m2: "Fev", m3: "Mar", m4: "Abr", m5: "Mai", m6: "Jun", m7: "Jul", m8: "Ago", m9: "Set", m10: "Out", m11: "Nov", m12: "Dez" }
};

// ─── THEMES ──────────────────────────────────────────────────────────────────
const DARK = {
  bg: "#0f1016",
  bg2: "#1a1b26",
  bg3: "#252636",
  text: "#f0f0f5",
  sub: "#9495a5",
  muted: "#626375",
  accent: "#8A6DFF",
  adk: "#6448D4",
  nav: "#0f1016",
  green: "#00D09E",
  red: "#FF5C5C",
  sep: "rgba(255,255,255,0.08)"
};
// Replace your existing LIGHT constant with this one:
const LIGHT = { 
  bg: "#f4f4f9", 
  bg2: "#ffffff", 
  bg3: "#e0e0ea", // <-- Darkened for better button contrast
  text: "#1a1a2e", 
  sub: "#666677", 
  muted: "#a0a0b0", 
  accent: "#7C5DFA", 
  adk: "#5335d4", 
  nav: "#ffffff", 
  green: "#00a870", 
  red: "#e53935", 
  sep: "rgba(0,0,0,0.09)" // <-- Darkened for better borders
};
// ─── DATA ────────────────────────────────────────────────────────────────────
const CATS = {
  income: [
    { id: "salary", l: "Salary", i: "💼", c: "#00C896" }, { id: "freelance", l: "Freelance", i: "💻", c: "#00B8D9" },
    { id: "investment", l: "Invest", i: "📈", c: "#36B37E" }, { id: "gift", l: "Gift", i: "🎁", c: "#6554C0" },
    { id: "rental", l: "Rental", i: "🏠", c: "#00A870" }, { id: "business", l: "Business", i: "🏢", c: "#0065FF" },
    { id: "bonus", l: "Bonus", i: "⭐", c: "#FF8B00" }, { id: "oth_i", l: "Other", i: "✨", c: "#888888" },
  ],
  expense: [
    { id: "food", l: "Food", i: "🍔", c: "#FF4D4D" }, { id: "transport", l: "Transport", i: "🚗", c: "#FF8B00" },
    { id: "shopping", l: "Shopping", i: "🛍️", c: "#E040FB" }, { id: "bills", l: "Bills", i: "📄", c: "#FF7452" },
    { id: "health", l: "Health", i: "❤️", c: "#FF4D4D" }, { id: "fun", l: "Fun", i: "🎬", c: "#BF2600" },
    { id: "education", l: "Study", i: "📚", c: "#FF8B00" }, { id: "rent", l: "Rent", i: "🏠", c: "#FF4D4D" },
    { id: "travel", l: "Travel", i: "✈️", c: "#00B8D9" }, { id: "fitness", l: "Fitness", i: "💪", c: "#36B37E" },
    { id: "oth_e", l: "Other", i: "📦", c: "#888888" },
  ],
};
const CURR = [{ code: "USD", sym: "$" }, { code: "EUR", sym: "€" }, { code: "GBP", sym: "£" }, { code: "JPY", sym: "¥" }, { code: "INR", sym: "₹" }, { code: "PKR", sym: "₨" }, { code: "AED", sym: "د.إ" }, { code: "CAD", sym: "CA$" }];
const LANGS = ["English", "Español", "हिन्दी", "Français", "Deutsch", "العربية", "中文", "Português"];
const NFMTS = ["1,234.56", "1.234,56", "1234.56"];
const ATYPES = { bank: "Usable / Current", savings: "Savings Account", cash: "Physical Cash", investment: "Investments", credit: "Credits & Loans", wallet: "Digital Wallet" };

const SEED_TXNS = []; // Completely empty for production

const SEED_ACCS = [
  // Provide one default account so new users can log expenses immediately
  { id: "a1", name: "Main Account", icon: "🏦", color: "#7C5DFA", type: "bank" }
];
const DEF_CFG = { theme: "dark", currency: "INR", language: "English", numberFormat: "1,234.56", timeFormat: "12-hour", showTime: false, autoBackup: false, lastBackup: null, passwordEnabled: false, password: "" };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const today = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split("T")[0];
};
const nowT = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const getSym = s => CURR.find(c => c.code === (s?.currency || "USD"))?.sym || "$";
const fmtTime = (t, s) => {
  if (!t) return "";
  if (s?.timeFormat === "12-hour") { const [h, m] = t.split(":"); const H = +h; return `${H % 12 || 12}:${m} ${H >= 12 ? "PM" : "AM"}`; }
  return t;
};
const money = (n, s) => {
  const sy = getSym(s), f = s?.numberFormat || "1,234.56";
  if (f === "1.234,56") return sy + n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (f === "1234.56") return sy + n.toFixed(2);
  return sy + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n);
};

const getCat = (id, xc = []) => [...CATS.income, ...CATS.expense, ...xc].find(c => c.id === id) || { l: id, i: "•", c: "#888" };
const byPeriod = (list, p) => {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), td = today();
  const ym = `${y}-${String(m + 1).padStart(2, "0")}`;
  const ds = new Date(now); ds.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
  const de = new Date(ds); de.setDate(ds.getDate() + 6);
  const ws = new Date(ds.getTime() - (ds.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
  const we = new Date(de.getTime() - (de.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
  return list.filter(t => {
    if (p === "all") return true;
    if (p === "daily") return t.date === td;
    if (p === "weekly") return t.date >= ws && t.date <= we;
    if (p === "monthly") return t.date.startsWith(ym);
    if (p === "yearly") return t.date.startsWith(`${y}`);
    return true;
  });
};
function useLS(key, init) {
  const [v, setV] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { } }, [key, v]);
  return [v, setV];
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
function GlobalStyle({ T }) {
  const ref = useRef(null);
  const isDark = T.bg === "#0f1016"; // Fixed: Now correctly matches the new DARK.bg hex
  const calFilter = isDark ? "invert(.55)" : "invert(.35)";
  const cssLines = [
    "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }",
    "html, body { overscroll-behavior-y: none; touch-action: pan-y; }",
    "body { background: " + T.bg + "; font-family: 'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; -webkit-font-smoothing: antialiased; }",
    "button, [role=button] { font-family: inherit; cursor: pointer; border: 0 solid transparent !important; outline: none; background: transparent; -webkit-tap-highlight-color: transparent; -webkit-appearance: none; appearance: none; box-shadow: none; }",
    "button::-moz-focus-inner { border: 0; padding: 0; }",
    "input, select, textarea { font-family: inherit; outline: none; border: none; background: transparent; -webkit-appearance: none; appearance: none; -webkit-tap-highlight-color: transparent; }",
    "input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }",
    "input[type=date]::-webkit-calendar-picker-indicator { filter: " + calFilter + "; cursor: pointer; }",
    "select option { background: " + T.bg2 + "; color: " + T.text + "; }",
    "::-webkit-scrollbar { display: none; } * { scrollbar-width: none; }",
    "@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }",
    "@keyframes slideUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }",
    "@keyframes dropDown { from { opacity:0; transform:translateY(-8px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }",
    "@keyframes toastPop { from { opacity:0; transform:translateX(-50%) translateY(8px) scale(.92); } to { opacity:1; transform:translateX(-50%) translateY(0) scale(1); } }",
    "@keyframes shake    { 0%,100%{transform:translateX(0);} 15%,45%,75%{transform:translateX(-10px);} 30%,60%{transform:translateX(10px);} }",
    "button, [role=button] { transition: opacity .2s ease, transform .2s cubic-bezier(0.25, 0.8, 0.25, 1), background .2s ease, box-shadow .2s ease; }",
    "button:active, [role=button]:active { transform: scale(.93); opacity:.8; }",
    ".fab-btn { transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease !important; }",
    ".fab-btn:hover { transform: scale(1.06) !important; }",
    ".fab-btn:active { transform: scale(.90) !important; }",
    ".nav-item { transition: color .2s ease, transform .2s cubic-bezier(0.25, 0.8, 0.25, 1); }",
    ".nav-item:active { transform: scale(.85); }",
    ".tx-card { transition: transform .2s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow .2s ease; }",
    ".tx-card:active { transform: scale(.975); background: " + T.bg3 + " !important; }",
    ".period-pill { transition: background .2s ease, color .2s ease, border-color .2s ease, transform .15s ease; }",
    ".period-pill:active { transform: scale(.92); }",
    ".pin-btn { transition: transform .15s cubic-bezier(.4,0,.2,1), background .2s ease, box-shadow .2s ease; }",
    ".pin-btn:active { transform: scale(.85); background: " + T.bg3 + " !important; box-shadow: none !important; }",
    ".sheet-enter { animation: slideUp .35s cubic-bezier(.2,.8,.2,1) both; }",
    ".overlay-enter { animation: fadeIn .25s ease both; }",
    ".drop-enter { animation: dropDown .25s cubic-bezier(.2,.8,.2,1) both; }",
    ".toast-enter { animation: toastPop .35s cubic-bezier(.34,1.56,.64,1) both; }",
    "@keyframes barGrow { from { width:0 !important; } }", 
    ".bar-fill { animation: barGrow 1s cubic-bezier(.2,.8,.2,1) both; }",
    "@keyframes tabSlide { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }",
    ".tab-content { animation: tabSlide .35s cubic-bezier(0.2, 0.8, 0.2, 1) both; }",
    ".shake-anim { animation: shake .4s cubic-bezier(.36,.07,.19,.97) both; }",
  ].join(" ");

  if (ref.current) ref.current.textContent = cssLines;
  useEffect(() => { if (ref.current) ref.current.textContent = cssLines; });
  return React.createElement("style", { ref });
}

// ─── BASE UI ──────────────────────────────────────────────────────────────────
const s = {
  row: (extra = {}) => ({ display: "flex", alignItems: "center", ...extra }),
  col: (extra = {}) => ({ display: "flex", flexDirection: "column", ...extra }),
  card: (T, extra = {}) => ({ background: T.bg2, borderRadius: 20, padding: "18px", ...extra }),
};

function PBar({ p, set, T, tr }) {
  return (
    <div style={s.row({ gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 })}>
      {[["all", tr("all")], ["daily", tr("day")], ["weekly", tr("week")], ["monthly", tr("month")], ["yearly", tr("year")]].map(([v, l]) => (
        <button key={v} onClick={() => set(v)} className="period-pill"
          style={{
            padding: "8px 16px", borderRadius: 24, fontSize: 13, fontWeight: p === v ? 700 : 500, flexShrink: 0,
            background: p === v ? T.accent + "25" : T.bg3, color: p === v ? T.accent : T.sub,
            border: `1.5px solid ${p === v ? T.accent + "80" : "transparent"}`
          }}>
          {l}
        </button>
      ))}
    </div>
  );
}

function TxCard({ t, cfg, cCats, T, onEdit, onDel, accs, showAcc }) {
  const isTransfer = t.type === "transfer";
  const cat = isTransfer ? { i: "🔄", c: T.muted, l: "Transfer" } : getCat(t.cat, cCats);
  
  const acc = showAcc ? accs?.find(a => a.id === t.aid) : null;
  const toAcc = isTransfer && showAcc ? accs?.find(a => a.id === t.toAid) : null;
  
  const accString = (acc && toAcc) ? `${acc.name} ➔ ${toAcc.name}` : (acc ? acc.name : "");
  const amtColor = isTransfer ? T.text : (t.type === "income" ? T.green : T.red);
  const amtPrefix = isTransfer ? "" : (t.type === "income" ? "+" : "-");

  return (
    <div className="tx-card" style={s.row({ background: T.bg2, borderRadius: 16, padding: "12px 16px", marginBottom: 10, gap: 12 })}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: isTransfer ? T.bg3 : cat.c + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
        {cat.i}
      </div>
      <div style={s.col({ flex: 1, minWidth: 0 })}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.note || (isTransfer ? "Account Transfer" : "")}</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {cat.l} · {t.date}{cfg.showTime && t.time ? ` · ${fmtTime(t.time, cfg)}` : ""}{accString ? ` · ${accString}` : ""}
        </div>
      </div>
      <div style={s.col({ alignItems: "flex-end", flexShrink: 0, gap: 6 })}>
        <div style={{ fontSize: 15, fontWeight: 800, color: amtColor }}>
          {amtPrefix}{money(t.amt, cfg)}
        </div>
        <div style={s.row({ gap: 6 })}>
          <button onClick={onEdit} aria-label="Edit" style={{ padding: "6px 10px", borderRadius: 8, background: T.bg3, color: T.sub }}>{EditIco}</button>
          <button onClick={onDel} aria-label="Delete" style={{ padding: "6px 10px", borderRadius: 8, background: T.bg3, color: T.red }}>{DelIco}</button>
        </div>
      </div>
    </div>
  );
}

function PieChart({ inc, exp, T, cfg, tr }) {
  const total = inc + exp;
  if (!total) return <div style={{ textAlign: "center", color: T.muted, padding: "32px 0", fontSize: 14 }}>{tr("noTxns")}</div>;
  const R = 65, CX = 75, CY = 75;
  const toXY = a => { const r = (a - 90) * Math.PI / 180; return { x: CX + R * Math.cos(r), y: CY + R * Math.sin(r) }; };
  const arc = (s2, e) => {
    if (e - s2 >= 359.9) return `M${CX} ${CY - R} A${R} ${R} 0 1 1 ${CX - .01} ${CY - R} Z`;
    const p = toXY(s2), q = toXY(e), lg = e - s2 > 180 ? 1 : 0;
    return `M${CX} ${CY} L${p.x} ${p.y} A${R} ${R} 0 ${lg} 1 ${q.x} ${q.y} Z`;
  };
  const iAng = (inc / total) * 360, iPct = Math.round((inc / total) * 100), ePct = 100 - iPct;
  return (
    <div style={s.row({ gap: 20, alignItems: "center" })}>
      <svg width={150} height={150} viewBox="0 0 150 150" style={{ flexShrink: 0 }}>
        {exp > 0 && <path d={arc(iAng >= 360 ? 0 : iAng, 360)} fill={T.red} opacity=".9" />}
        {inc > 0 && iAng > 0 && <path d={arc(0, Math.min(iAng, 359.9))} fill={T.green} opacity=".9" />}
        <circle cx={CX} cy={CY} r={46} fill={T.bg2} />
        <text x={CX} y={CY - 4} textAnchor="middle" fill={T.muted} fontSize="10" fontWeight="700" fontFamily="DM Sans,sans-serif">{tr("net")}</text>
        <text x={CX} y={CY + 14} textAnchor="middle" fill={inc >= exp ? T.green : T.red} fontSize="16" fontWeight="800" fontFamily="DM Sans,sans-serif">
          {inc >= exp ? "+" : "-"}{Math.abs(iPct - ePct)}%
        </text>
      </svg>
      <div style={s.col({ flex: 1, gap: 16 })}>
        {[[T.green, tr("income"), inc, iPct], [T.red, tr("expense"), exp, ePct]].map(([c, l, v, pct]) => (
          <div key={l}>
            <div style={s.row({ justifyContent: "space-between", marginBottom: 4 })}>
              <div style={s.row({ gap: 8 })}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
                <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{l}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: c }}>{pct}%</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{money(v, cfg)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sheet({ T, onClose, title, children, small }) {
  return (
    <div onClick={onClose}
      className="overlay-enter" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
      <div onClick={e => e.stopPropagation()}
        className="sheet-enter" style={{ background: T.bg, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: small ? 380 : 768, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={s.row({ justifyContent: "space-between", marginBottom: 20 })}>
          <span style={{ fontSize: 18, fontWeight: 800, color: T.text }}>{title}</span>
          <button onClick={onClose} aria-label="Close" style={{ fontSize: 24, color: T.muted, padding: "0 4px", lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AccDrop({ accs, selId, onChange, T, tr }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const sel = accs.find(a => a.id === selId);
  const items = [{ id: "all", name: tr("allAccs"), icon: "💼", color: T.accent, type: "" }, ...accs];

  useEffect(() => {
    if (!open) return;
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", h, true);
    return () => document.removeEventListener("pointerdown", h, true);
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: "relative", flex: 1, minWidth: 0, overflow: "visible" }}>
      <div role="button" onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", height: 40, padding: "0 8px 0 0" }}>
        <span style={{ fontSize: 22 }}>{sel ? sel.icon : "💼"}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
          {sel ? sel.name : tr("allAccs")}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div className="drop-enter" style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, minWidth: 240,
          zIndex: 9999, borderRadius: 16, overflow: "hidden",
          background: T.bg2, boxShadow: "0 10px 40px rgba(0,0,0,.6)",
        }}>
          {items.map((a, i) => {
            const active = selId === a.id;
            return (
              <div key={a.id} role="button" onClick={() => { onChange(a.id); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer",
                  background: active ? a.color + "18" : i % 2 === 0 ? T.bg2 : T.bg3,
                  borderBottom: i < items.length - 1 ? `1px solid ${T.sep}` : "none",
                  WebkitTapHighlightColor: "transparent",
                }}>
                <span style={{ fontSize: 20 }}>{a.icon}</span>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: active ? 800 : 600, color: active ? a.color : T.text }}>{a.name}</span>
                  {a.type && <span style={{ fontSize: 11, color: T.muted }}>{ATYPES[a.type] || a.type}</span>}
                </div>
                {active && <span style={{ color: a.color, fontSize: 15, fontWeight: 800 }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IBtn({ onClick, active, T, children }) {
  return (
    <button onClick={onClick}
      style={{
        width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? T.accent + "22" : T.bg3,
        border: `1.5px solid ${active ? T.accent + "70" : "transparent"}`
      }}>
      {children}
    </button>
  );
}

const SearchIco = (color) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const PdfIco = (color) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" /></svg>;
const CalIco = (color) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;

// ---> NEW COMPONENTS ADDED HERE <---
const CalcIco = (color) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="8.01" y2="10" /><line x1="12" y1="10" x2="12.01" y2="10" /><line x1="16" y1="10" x2="16.01" y2="10" /><line x1="8" y1="14" x2="8.01" y2="14" /><line x1="12" y1="14" x2="12.01" y2="14" /><line x1="16" y1="14" x2="16.01" y2="14" /><line x1="8" y1="18" x2="8.01" y2="18" /><line x1="12" y1="18" x2="16" y2="18" /></svg>;

const AppLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" style={{ borderRadius: size * 0.22, flexShrink: 0 }}>
    <rect width="512" height="512" rx="112" fill="#1a1b26" />
    <g transform="translate(0, -35)">
      <rect x="106" y="251" width="220" height="140" rx="24" fill="#8A6DFF" />
      <line x1="106" y1="290" x2="326" y2="290" stroke="#0f1016" strokeWidth="20" opacity="0.25" />
      <rect x="178" y="133" width="220" height="140" rx="24" fill="#000000" opacity="0.3" />
      <rect x="186" y="121" width="220" height="140" rx="24" fill="#00D09E" />
      <line x1="186" y1="160" x2="406" y2="160" stroke="#0f1016" strokeWidth="20" opacity="0.25" />
      <rect x="216" y="206" width="38" height="28" rx="6" fill="#0f1016" opacity="0.3" />
      <line x1="216" y1="220" x2="254" y2="220" stroke="#0f1016" strokeWidth="3" opacity="0.3" />
      <line x1="235" y1="206" x2="235" y2="234" stroke="#0f1016" strokeWidth="3" opacity="0.3" />
    </g>
    <text x="256" y="435" fontFamily="'DM Sans', sans-serif" fontSize="46" fontWeight="800" textAnchor="middle" letterSpacing="1">
      <tspan fill="#f0f0f5">Cash</tspan><tspan fill="#00D09E">Flow</tspan>
    </text>
  </svg>
);

const EditIco = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DelIco = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

function Inp({ T, style, ...props }) {
  return <input style={{ background: T.bg3, borderRadius: 12, color: T.text, fontSize: 14, padding: "12px 14px", width: "100%", boxSizing: "border-box", ...style }} {...props} />;
}
function Lbl({ T, children }) {
  return <div style={{ fontSize: 11, color: T.muted, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{children}</div>;
}
function SHd({ T, children }) {
  return <div style={{ fontSize: 11, color: T.muted, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10, marginTop: 24 }}>{children}</div>;
}
function Toggle({ value, onChange, T }) {
  return (
    <div onClick={() => onChange(!value)}
      style={{ width: 48, height: 26, borderRadius: 13, background: value ? T.accent : T.bg3, cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: value ? 24 : 2, transition: "left .2s", boxShadow: "0 2px 5px rgba(0,0,0,.3)" }} />
    </div>
  );
}
function FBtn({ T, children, onClick, style }) {
  return (
    <button onClick={onClick} style={{ width: "100%", padding: "14px", borderRadius: 14, background: T.bg3, color: T.text, fontSize: 14, fontWeight: 700, boxSizing: "border-box", ...style }}>
      {children}
    </button>
  );
}

// ─── PIN LOCK SCREEN ───────────────────────────────────────────────────────────
function LockScreen({ T, cfg, onUnlock, tr }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  const handlePress = async (n) => {
    if (err) return;
    const next = pin + n;
    setPin(next);
    if (next.length === cfg.password.length) {
      if (next === cfg.password) setTimeout(onUnlock, 150);
      else {
        setErr(true);
        try { await Haptics.vibrate(); } catch (e) { } // Triggers device vibration on wrong PIN
        // Wait 500ms so the user sees the red dots shake before clearing
        setTimeout(() => { setPin(""); setErr(false); }, 500);
      }
    }
  };
  const handleDel = () => setPin(p => p.slice(0, -1));

  return (
    <div style={{ position: "fixed", inset: 0, background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ marginBottom: 32 }}><AppLogo size={72} /></div>
      <div style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 24 }}>{tr("appPwd") || "App Password"}</div>
      
      {/* SHAKE ANIMATION AND RED DOTS */}
      <div className={err ? "shake-anim" : ""} style={s.row({ gap: 14, marginBottom: 48, height: 20 })}>
        {Array.from({ length: cfg.password.length }).map((_, i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: err ? T.red : (i < pin.length ? T.accent : T.bg3), transition: "background .2s ease" }} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, width: "100%", maxWidth: 300 }}>
        {/* ADDED .pin-btn CLASS AND SHADOWS FOR LIGHT MODE POP */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} className="pin-btn" onClick={() => handlePress(n.toString())} style={{ height: 70, borderRadius: 35, background: T.bg2, fontSize: 26, fontWeight: 600, color: T.text, boxShadow: `0 4px 12px ${T.sep}` }}>{n}</button>
        ))}
        <div />
        <button className="pin-btn" onClick={() => handlePress("0")} style={{ height: 70, borderRadius: 35, background: T.bg2, fontSize: 26, fontWeight: 600, color: T.text, boxShadow: `0 4px 12px ${T.sep}` }}>0</button>
        <button className="pin-btn" onClick={handleDel} style={{ height: 70, borderRadius: 35, background: "transparent", fontSize: 26, color: T.muted }}>⌫</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [txns, setTxns] = useLS("cf_txns", SEED_TXNS);
  const [accs, setAccs] = useLS("cf_accs", SEED_ACCS);
  const [cCats, setCCats] = useLS("cf_ccats", []);
  const [cfg, setCfg] = useLS("cf_cfg", DEF_CFG);
  const [gUser, setGUser] = useLS("cf_guser", null);

  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [unlocked, setUnlocked] = useState(!cfg.passwordEnabled);

  // 1. Re-lock app when sent to background
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && cfg.passwordEnabled) {
        setUnlocked(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [cfg.passwordEnabled]);

  // 2. Lock Zooming on mobile via viewport tag injection
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
  }, []);

  const T = cfg.theme === "light" ? LIGHT : DARK;

  // 3. Request permissions on first boot for new installs
  useEffect(() => {
    const initPerms = async () => {
      try {
        const status = await Filesystem.checkPermissions();
        if (status.publicStorage === 'prompt') {
          await Filesystem.requestPermissions();
        }
      } catch (e) { /* Ignore web/iOS fallback errors */ }
    };
    initPerms();
  }, []);

  // Helper to verify permissions before exporting
  const ensureStoragePermission = async () => {
    try {
      let status = await Filesystem.checkPermissions();
      if (status.publicStorage !== 'granted') {
        status = await Filesystem.requestPermissions();
      }
      return status.publicStorage === 'granted';
    } catch (e) {
      return true; // Failsafe for web browsers where this native plugin doesn't apply
    }
  };

  // Translation Engine
  const tr = (key) => DICT[cfg.language]?.[key] || DICT["English"][key] || key;

  const showToast = (msg, color) => { setToast({ msg, color: color || T.accent }); setTimeout(() => setToast(null), 2500); };
  const openModal = (type, data = {}) => setModal({ type, data });
  const closeModal = () => setModal(null);
  const setSetting = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  const accsB = useMemo(() => accs.map(a => {
    const inc = txns.filter(t => t.aid === a.id && t.type === "income").reduce((s, t) => s + t.amt, 0);
    const exp = txns.filter(t => t.aid === a.id && t.type === "expense").reduce((s, t) => s + t.amt, 0);
    
    // Double-Entry Transfer Logic
    const trOut = txns.filter(t => t.aid === a.id && t.type === "transfer").reduce((s, t) => s + t.amt, 0);
    const trIn = txns.filter(t => t.toAid === a.id && t.type === "transfer").reduce((s, t) => s + t.amt, 0);

    return { ...a, balance: inc - exp - trOut + trIn, tIn: inc, tEx: exp };
  }), [accs, txns]);

  const allCats = useMemo(() => ({
    income: [...CATS.income, ...cCats.filter(c => c.type === "income")],
    expense: [...CATS.expense, ...cCats.filter(c => c.type === "expense")],
  }), [cCats]);

  // CRUD
  const addTxn = t => { setTxns(p => [{ ...t, id: Date.now() }, ...p]); showToast(t.type === "income" ? "💚 " + tr("income") : "💸 " + tr("expense")); closeModal(); };
  const editTxn = t => { setTxns(p => p.map(x => x.id === t.id ? t : x)); showToast(tr("saveChanges").split(" ")[1]); closeModal(); };
  const delTxn = id => { setTxns(p => p.filter(t => t.id !== id)); showToast(tr("remove"), T.muted); closeModal(); };
  const addAcc = a => { setAccs(p => [...p, { ...a, id: "a" + Date.now() }]); showToast("Account added"); closeModal(); };
  const editAcc = a => { setAccs(p => p.map(x => x.id === a.id ? a : x)); showToast(tr("saveChanges").split(" ")[1]); closeModal(); };
  const delAcc = id => { if (accs.length <= 1) { showToast("Need at least one account", T.red); return; } setAccs(p => p.filter(a => a.id !== id)); setTxns(p => p.filter(t => t.aid !== id)); showToast(tr("remove"), T.muted); closeModal(); };
  const addCat = c => { setCCats(p => [...p, { ...c, id: "c" + Date.now() }]); showToast("Category added"); closeModal(); };

  const delCat = id => {
    const isUsed = txns.some(t => t.cat === id);
    if (isUsed) {
      showToast("⚠️ Category is in use", T.red);
    } else {
      setCCats(p => p.filter(c => c.id !== id));
      showToast(tr("remove"), T.muted);
    }
  };
  
  // Backup to Native Android Folder
  const localBackup = async () => {
    const hasPerm = await ensureStoragePermission();
    if (!hasPerm) {
      showToast("Can't Export: Permission not granted", T.red);
      return;
    }

    const data = JSON.stringify({ txns, accs, cCats, cfg, at: new Date().toISOString() }, null, 2);
    try {
      await Filesystem.writeFile({
        path: `CashFlowPro/backup/cf-backup-${today()}.json`,
        data: data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true
      });
      showToast("💾 Saved to Documents/CashFlowPro/backup");
    } catch (e) {
      showToast("Can't Export: Permission not granted", T.red);
    }
  };

  const localRestore = async (f) => {
    try {
      const text = await f.text(); // Modern Web API, bypasses FileReader limits on Android
      const d = JSON.parse(text);
      if (d.txns) setTxns(d.txns); if (d.accs) setAccs(d.accs); if (d.cCats) setCCats(d.cCats); if (d.cfg) setCfg(d.cfg);
      showToast("✅ Restored");
      closeModal();
    } catch (err) {
      showToast("Invalid file format", T.red);
    }
  };

  // Export CSV directly to Native Folder
  const exportReport = async (from, to, aF) => {
    const hasPerm = await ensureStoragePermission();
    if (!hasPerm) {
      showToast("Can't Export: Permission not granted", T.red);
      return;
    }

    const rows = txns.filter(t => t.date >= from && t.date <= to && (aF === "all" || t.aid === aF)).sort((a, b) => a.date.localeCompare(b.date));

    // 1. Create CSV Header
    let csvContent = "Date,Note,Category,Income,Expense,Balance\n";

    // ... (keep the rest of your CSV loop exactly the same) ...

    try {
      const fileName = `CF-Report-${Date.now()}.csv`;
      const fullPath = `CashFlowPro/Statements/${fileName}`;

      try {
        await Filesystem.mkdir({ path: 'CashFlowPro/Statements', directory: Directory.Documents, recursive: true });
      } catch (e) { }

      await Filesystem.writeFile({
        path: fullPath,
        data: csvContent,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

      showToast(`✅ CSV Exported to Documents/${fullPath}`);
      closeModal();
    } catch (err) {
      showToast("Can't Export: Permission not granted", T.red);
      console.error(err);
    }
  };

  // Google Drive
  // WARNING: You must replace G_ID with your own Google Client ID from the Google Cloud Console.
  const G_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
  const G_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
  const G_FILE = "cashflow-backup.json";

  const loadGapi = () => new Promise((res, rej) => {
    if (window.gapi) { window.gapi.load("client:auth2", res); return; }
    const el = document.createElement("script"); el.src = "https://apis.google.com/js/api.js";
    el.onload = () => window.gapi.load("client:auth2", res); el.onerror = () => { showToast("Network error. Check connection.", T.red); rej(); }; document.head.appendChild(el);
  });
  const gLogin = async () => {
    if (G_ID.startsWith("YOUR")) { showToast("Currently Under Development", T.red); return null; }
    await loadGapi();
    try {
      await window.gapi.client.init({ clientId: G_ID, scope: G_SCOPE, discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"] });
      const auth = window.gapi.auth2.getAuthInstance();
      if (!auth.isSignedIn.get()) await auth.signIn();
      const p = auth.currentUser.get().getBasicProfile();
      setGUser({ name: p.getName(), email: p.getEmail(), avatar: p.getImageUrl() });
      return auth.currentUser.get().getAuthResponse().access_token;
    } catch (err) {
      showToast("Google Sign-In Cancelled or Failed", T.red);
      return null;
    }
  };
  const gSignOut = async () => { const a = window.gapi?.auth2?.getAuthInstance(); if (a) await a.signOut(); setGUser(null); showToast("Signed out"); };
  const driveBackup = async () => {
    showToast("Connecting…"); try {
      const tok = await gLogin(); if (!tok) return;
      const data = JSON.stringify({ txns, accs, cCats, cfg, at: new Date().toISOString() });
      const ls = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${G_FILE}'&fields=files(id)`, { headers: { Authorization: `Bearer ${tok}` } });
      const { files } = await ls.json(); const fid = files?.[0]?.id;
      const fm = new FormData();
      fm.append("metadata", new Blob([JSON.stringify({ name: G_FILE, ...(!fid && { parents: ["appDataFolder"] }) })], { type: "application/json" }));
      fm.append("file", new Blob([data], { type: "application/json" }));
      const r = await fetch(`https://www.googleapis.com/upload/drive/v3/files${fid ? `/${fid}` : ""}?uploadType=multipart`, { method: fid ? "PATCH" : "POST", headers: { Authorization: `Bearer ${tok}` }, body: fm });
      if (!r.ok) throw new Error(await r.text());
      setSetting("lastBackup", new Date().toISOString()); showToast("☁️ Backed up to Drive");
    } catch (e) { showToast(e.message, T.red); }
  };
  const driveRestore = async () => {
    showToast("Fetching…"); try {
      const tok = await gLogin(); if (!tok) return;
      const ls = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${G_FILE}'&fields=files(id)`, { headers: { Authorization: `Bearer ${tok}` } });
      const { files } = await ls.json(); if (!files?.length) { showToast("No backup found", T.red); return; }
      const dl = await fetch(`https://www.googleapis.com/drive/v3/files/${files[0].id}?alt=media`, { headers: { Authorization: `Bearer ${tok}` } });
      const d = await dl.json();
      if (d.txns) setTxns(d.txns); if (d.accs) setAccs(d.accs); if (d.cCats) setCCats(d.cCats); if (d.cfg) setCfg(d.cfg);
      showToast("☁️ Restored"); closeModal();
    } catch (e) { showToast(e.message, T.red); }
  };
  useEffect(() => {
    if (!cfg.autoBackup || !gUser) return;
    const last = cfg.lastBackup ? new Date(cfg.lastBackup) : null;
    if (!last || (Date.now() - last) / 86400000 >= 7) driveBackup();
  }, [cfg.autoBackup, gUser]); // <-- Updated array

  const TABS = [{ id: "home", ic: "⊞", lb: tr("home") }, { id: "stats", ic: "◈", lb: tr("stats") }, { id: "txns", ic: "≡", lb: tr("txns") }, { id: "accounts", ic: "◫", lb: tr("accounts") }, { id: "settings", ic: "⚙", lb: tr("settings") }];

  if (!unlocked) return <LockScreen T={T} cfg={cfg} onUnlock={() => setUnlocked(true)} tr={tr} />;

  return (
    <div style={{ height: "100dvh", width: "100vw", margin: "0 auto", background: T.bg, color: T.text, fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
      <GlobalStyle T={T} />

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "0 16px", paddingBottom: 110 }}>
        {tab === "home" && <HomeTab txns={txns} accs={accsB} cfg={cfg} cCats={cCats} T={T} openModal={openModal} onEdit={t => openModal("editTx", { tx: t })} onDel={id => openModal("delTx", { id })} tr={tr} />}
        {tab === "stats" && <StatsTab txns={txns} cfg={cfg} cCats={cCats} T={T} tr={tr} />}
        {tab === "txns" && <TxnsTab txns={txns} cfg={cfg} cCats={cCats} T={T} accs={accs} onEdit={t => openModal("editTx", { tx: t })} onDel={id => openModal("delTx", { id })} openModal={openModal} tr={tr} />}
        {tab === "accounts" && <AccountsTab accs={accsB} cfg={cfg} T={T} onAdd={() => openModal("addAcc")} onEdit={a => openModal("editAcc", { acc: a })} onDel={id => openModal("delAcc", { id })} tr={tr} />}
        {tab === "settings" && <SettingsTab cfg={cfg} setSetting={setSetting} T={T} localBackup={localBackup} driveBackup={driveBackup} driveRestore={driveRestore} openModal={openModal} gUser={gUser} gLogin={() => gLogin().then(t => t && showToast("✅ Signed in"))} gSignOut={gSignOut} cCats={cCats} onAddCat={() => openModal("addCat")} onDelCat={delCat} G_ID={G_ID} tr={tr} />}
      </div>

      <button className="fab-btn" onClick={() => openModal("addTx")}
        style={{ position: "fixed", bottom: 80, right: 16, width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg,${T.accent},${T.adk})`, color: "#fff", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 101, boxShadow: `0 8px 24px ${T.accent}55` }}>
        +
      </button>

      <nav style={{ position: "fixed", bottom: 0, left: 0, width: "100%", background: T.nav, borderTop: `1px solid ${T.sep}`, display: "flex", justifyContent: "space-around", padding: "8px 0 20px", zIndex: 100 }}>
        {TABS.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className="nav-item" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 8px", color: tab === n.id ? T.accent : T.muted, minWidth: 56 }}>
            <span style={{ fontSize: 20 }}>{n.ic}</span>
            <span style={{ fontSize: 10, fontWeight: tab === n.id ? 800 : 500 }}>{n.lb}</span>
          </button>
        ))}
      </nav>

      {modal?.type === "addTx" && <TxModal T={T} accs={accs} allCats={allCats} cfg={cfg} onSubmit={addTxn} onClose={closeModal} tr={tr} />}
      {modal?.type === "editTx" && <TxModal T={T} accs={accs} allCats={allCats} cfg={cfg} onSubmit={editTxn} onClose={closeModal} editTx={modal.data.tx} tr={tr} />}
      {modal?.type === "delTx" && <ConfirmDlg T={T} title={tr("remove") + "?"} sub="This cannot be undone." danger onConfirm={() => delTxn(modal.data.id)} onClose={closeModal} tr={tr} />}
      {modal?.type === "addAcc" && <AccModal T={T} onSubmit={addAcc} onClose={closeModal} tr={tr} />}
      {modal?.type === "editAcc" && <AccModal T={T} onSubmit={editAcc} onClose={closeModal} editAcc={modal.data.acc} tr={tr} />}
      {modal?.type === "delAcc" && <ConfirmDlg T={T} title={tr("remove") + "?"} sub="All transactions deleted." danger onConfirm={() => delAcc(modal.data.id)} onClose={closeModal} tr={tr} />}
      {modal?.type === "cash" && <CashModal T={T} cfg={cfg} onClose={closeModal} tr={tr} />}
      {modal?.type === "restore" && <RestoreModal T={T} onLocal={localRestore} onDrive={() => { closeModal(); driveRestore(); }} onClose={closeModal} tr={tr} />}
      {modal?.type === "addCat" && <CatModal T={T} onSubmit={addCat} onClose={closeModal} tr={tr} />}
      {modal?.type === "pin" && <PinModal T={T} cfg={cfg} setCfg={setCfg} onClose={closeModal} showToast={showToast} tr={tr} />}
      {modal?.type === "report" && <ReportModal T={T} txns={txns} accs={accs} cCats={cCats} cfg={cfg} onClose={closeModal} onExport={exportReport} tr={tr} />}

      {toast && (
        <div style={{ position: "fixed", bottom: 96, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", borderRadius: 24, color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,.4)", zIndex: 400, maxWidth: "85vw", textAlign: "center", lineHeight: 1.4, wordBreak: "break-word", background: toast.color, animation: "toastPop .25s ease" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeTab({ txns, accs, cfg, cCats, T, openModal, tr }) {
  const [p, setP] = useState("monthly");
  const ft = byPeriod(txns, p);
  const inc = ft.filter(t => t.type === "income").reduce((s, t) => s + t.amt, 0);
  const exp = ft.filter(t => t.type === "expense").reduce((s, t) => s + t.amt, 0);
  const tot = accs.reduce((s, a) => s + a.balance, 0);
  const sav = inc > 0 ? Math.max(0, Math.min(100, ((inc - exp) / inc) * 100)) : 0;
  return (
    <div className="tab-content" style={{ paddingBottom: 20 }}>
      <div style={s.row({ justifyContent: "space-between", padding: "20px 2px 14px" })}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>{tr("myFinances")}</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{tr("welcome")}</div>
        </div>
        <div style={s.row({ gap: 8 })}>
          <IBtn onClick={() => openModal("cash")} T={T}>{CalcIco(T.sub)}</IBtn>
          <IBtn onClick={() => openModal("report")} T={T}>{PdfIco(T.sub)}</IBtn>
        </div>
      </div>
      <PBar p={p} set={setP} T={T} tr={tr} />

      <div style={{ background: `linear-gradient(135deg,${T.accent}28,${T.bg2} 70%)`, borderRadius: 24, padding: "24px 20px", marginBottom: 16, transition: "background .3s ease" }}>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>{tr("totalBalance")}</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: T.text, letterSpacing: "-1px", margin: "8px 0 20px" }}>{money(tot, cfg)}</div>
        <div style={s.row({ borderTop: `1px solid ${T.sep}`, paddingTop: 16 })}>
          {[["income", inc, T.green], ["expense", exp, T.red]].map(([lb, v, c], i) => (
            <div key={lb} style={s.row({ flex: 1, gap: 10, ...(i ? { paddingLeft: 16, borderLeft: `1px solid ${T.sep}`, marginLeft: 16 } : {}) })}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{tr(lb)}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: c }}>{money(v, cfg)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.card(T, { marginBottom: 16 })}>
        <div style={s.row({ justifyContent: "space-between", marginBottom: 10 })}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{tr("savingsRate")}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: sav > 0 ? T.green : T.red }}>{sav.toFixed(0)}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 4, background: T.bg3 }}>
          <div className="bar-fill" style={{ height: "100%", width: `${sav}%`, borderRadius: 4, background: T.green }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
        {accs.map(a => (
          <div key={a.id} style={{ background: a.color + "14", borderRadius: 18, padding: "16px", flexShrink: 0 }}>
            <div style={{ fontSize: 24 }}>{a.icon}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 6, fontWeight: 600 }}>{a.name}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: a.balance >= 0 ? T.text : T.red, marginTop: 4 }}>{money(a.balance, cfg)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function StatsTab({ txns, cfg, cCats, T, tr }) {
  const now = new Date();
  const [sM, setSM] = useState(now.getMonth());
  const [sY, setSY] = useState(now.getFullYear());

  const sixM = useMemo(() => {
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      arr.push({ month: d.getMonth(), year: d.getFullYear(), label: tr("m" + (d.getMonth() + 1)), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` });
    }
    return arr;
  }, [cfg.language]); // Fixed: Depends strictly on language setting now

  const key = `${sY}-${String(sM + 1).padStart(2, "0")}`;
  const mt = txns.filter(t => t.date.startsWith(key));
  const mInc = mt.filter(t => t.type === "income").reduce((s, t) => s + t.amt, 0);
  const mExp = mt.filter(t => t.type === "expense").reduce((s, t) => s + t.amt, 0);

  const cm = {};
  mt.filter(t => t.type === "expense").forEach(t => { cm[t.cat] = (cm[t.cat] || 0) + t.amt; });
  const top = Object.entries(cm).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const bars = sixM.map(m => {
    const bi = txns.filter(t => t.type === "income" && t.date.startsWith(m.key)).reduce((s, t) => s + t.amt, 0);
    const be = txns.filter(t => t.type === "expense" && t.date.startsWith(m.key)).reduce((s, t) => s + t.amt, 0);
    return { ...m, i: bi, e: be };
  });
  const maxB = Math.max(...bars.flatMap(b => [b.i, b.e]), 1);

  return (
    <div className="tab-content" style={{ paddingBottom: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, padding: "20px 2px 16px" }}>{tr("analytics")}</div>

      <div style={s.row({ gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 })}>
        {sixM.map(m => {
          const active = sM === m.month && sY === m.year;
          return (
            <button key={m.key} onClick={() => { setSM(m.month); setSY(m.year); }}
              style={{
                padding: "8px 16px", borderRadius: 24, fontSize: 13, fontWeight: active ? 800 : 500, flexShrink: 0,
                background: active ? T.accent + "22" : T.bg3, color: active ? T.accent : T.sub,
                border: `1.5px solid ${active ? T.accent + "80" : "transparent"}`
              }}>
              {m.label}
            </button>
          );
        })}
      </div>

      <div style={s.card(T, { marginBottom: 16 })}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 4, textAlign: "center" }}>{tr("m" + (sM + 1))} {sY}</div>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 20, textAlign: "center" }}>{mt.length} transactions</div>
        <PieChart inc={mInc} exp={mExp} T={T} cfg={cfg} tr={tr} />
      </div>

      <div style={s.card(T, { marginBottom: 16 })}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 24, textAlign: "center" }}>6-Month Overview</div>
        <div style={s.row({ gap: 8, alignItems: "flex-end", height: 120 })}>
          {bars.map((b, i) => {
            const active = sM === b.month && sY === b.year;
            return (
              <div key={i} onClick={() => { setSM(b.month); setSY(b.year); }}
                style={s.col({ flex: 1, alignItems: "center", gap: 6, cursor: "pointer" })}>
                <div style={s.row({ gap: 4, alignItems: "flex-end", height: 100 })}>
                  <div style={{ width: 10, borderRadius: "4px 4px 0 0", background: T.green, height: `${(b.i / maxB) * 100}px`, opacity: active ? 1 : .3, transition: "height .7s,opacity .2s" }} />
                  <div style={{ width: 10, borderRadius: "4px 4px 0 0", background: T.red, height: `${(b.e / maxB) * 100}px`, opacity: active ? 1 : .3, transition: "height .7s,opacity .2s" }} />
                </div>
                <span style={{ fontSize: 10, color: active ? T.accent : T.muted, fontWeight: active ? 800 : 500 }}>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {top.length > 0 && (
        <div style={s.card(T)}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 16 }}>{tr("topSpending")}</div>
          {top.map(([id, amt]) => {
            const c = getCat(id, cCats), pct = mExp > 0 ? (amt / mExp) * 100 : 0;
            return (
              <div key={id} style={{ marginBottom: 14 }}>
                <div style={s.row({ justifyContent: "space-between", marginBottom: 6 })}>
                  <div style={s.row({ gap: 10 })}>
                    <span style={{ fontSize: 18 }}>{c.i}</span>
                    <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{c.l}</span>
                  </div>
                  <span style={{ fontSize: 13, color: T.red, fontWeight: 800 }}>{money(amt, cfg)} <span style={{ color: T.muted, fontSize: 11 }}>({pct.toFixed(0)}%)</span></span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: T.bg3 }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: c.c, transition: "width 1s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
function TxnsTab({ txns, cfg, cCats, T, accs, onEdit, onDel, openModal, tr }) {
  const [p, setP] = useState("all");
  const [typeF, setTypeF] = useState("all");
  const [query, setQuery] = useState("");
  const [accF, setAccF] = useState("all");
  const [showS, setShowS] = useState(false);
  const [showDR, setShowDR] = useState(false);
  const [fromD, setFromD] = useState("");
  const [toD, setToD] = useState("");
  const srRef = useRef(null);

  useEffect(() => { if (showS && srRef.current) srRef.current.focus(); }, [showS]);

  const list = useMemo(() => {
    let r = byPeriod(txns, p);
    if (typeF !== "all") r = r.filter(t => t.type === typeF);
    if (accF !== "all") r = r.filter(t => t.aid === accF);
    if (fromD) r = r.filter(t => t.date >= fromD);
    if (toD) r = r.filter(t => t.date <= toD);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter(t => t.note.toLowerCase().includes(q) || getCat(t.cat, cCats).l.toLowerCase().includes(q) || t.date.includes(q) || String(t.amt).includes(q));
    }
    return [...r].sort((a, b) => b.date.localeCompare(a.date));
  }, [txns, p, typeF, query, accF, fromD, toD, cCats]);

  const sIn = list.filter(t => t.type === "income").reduce((s, t) => s + t.amt, 0);
  const sOut = list.filter(t => t.type === "expense").reduce((s, t) => s + t.amt, 0);

  return (
    <div className="tab-content" style={{ paddingBottom: 20 }}>
      <div style={s.row({ justifyContent: "space-between", padding: "20px 2px 16px", gap: 12, overflow: "visible", position: "relative", zIndex: 10 })}>
        <AccDrop accs={accs} selId={accF} onChange={setAccF} T={T} tr={tr} />
        <div style={s.row({ gap: 8, flexShrink: 0 })}>
          <IBtn onClick={() => setShowS(v => !v)} active={showS} T={T}>{SearchIco(showS ? T.accent : T.sub)}</IBtn>
          <IBtn onClick={() => openModal("report")} T={T}>{PdfIco(T.sub)}</IBtn>
          <IBtn onClick={() => setShowDR(v => !v)} active={showDR} T={T}>{CalIco(showDR ? T.accent : T.sub)}</IBtn>
        </div>
      </div>

      {showS && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>{SearchIco(T.muted)}</div>
          <input ref={srRef} value={query} onChange={e => setQuery(e.target.value)} placeholder={tr("search")}
            style={{ background: T.bg2, borderRadius: 14, color: T.text, fontSize: 14, padding: "12px 36px 12px 40px", width: "100%", boxSizing: "border-box" }} />
          {query && <button onClick={() => setQuery("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 18 }}>✕</button>}
        </div>
      )}

      {showDR && (
        <div style={s.row({ gap: 10, marginBottom: 16 })}>
          {[["From", fromD, setFromD], ["To", toD, setToD]].map(([l, v, sv]) => (
            <div key={l} style={s.col({ flex: 1 })}>
              <div style={{ fontSize: 11, color: T.muted, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{l}</div>
              <input type="date" value={v} onChange={e => sv(e.target.value)}
                style={{ background: T.bg2, borderRadius: 12, color: T.text, fontSize: 13, padding: "10px 12px", width: "100%", boxSizing: "border-box" }} />
            </div>
          ))}
          {(fromD || toD) && <button onClick={() => { setFromD(""); setToD(""); }} style={{ alignSelf: "flex-end", padding: "10px 12px", borderRadius: 12, background: T.red + "15", color: T.red, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{tr("clear")}</button>}
        </div>
      )}

      <PBar p={p} set={setP} T={T} tr={tr} />

      <div style={s.row({ gap: 8, marginBottom: 16 })}>
        {[["all", tr("all"), ""], ["income", tr("income"), T.green], ["expense", tr("expense"), T.red], ["transfer", "Transfer", T.sub]].map(([v, l, c]) => (
          <button key={v} onClick={() => setTypeF(v)}
            style={{
              flex: 1, padding: "10px 6px", borderRadius: 14, fontSize: 13, fontWeight: typeF === v ? 800 : 600,
              background: typeF === v ? (c || T.accent) + "18" : T.bg2, color: typeF === v ? (c || T.accent) : T.sub,
              border: `1.5px solid ${typeF === v ? (c || T.accent) + "60" : "transparent"}`
            }}>
            {v === "income" ? "💚 " : v === "expense" ? "💸 " : ""}{l}
          </button>
        ))}
      </div>

      {list.length > 0 && (
        <div style={s.row({ gap: 10, marginBottom: 16 })}>
          {[["In", sIn, T.green], ["Out", sOut, T.red], ["Net", sIn - sOut, sIn - sOut >= 0 ? T.green : T.red]].map(([l, v, c]) => (
            <div key={l} style={s.col({ flex: 1, background: c + "12", borderRadius: 14, padding: "12px 14px" })}>
              <span style={{ fontSize: 11, color: c, fontWeight: 800 }}>{tr(l.toLowerCase())}</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: c, marginTop: 4 }}>{money(Math.abs(v), cfg)}</span>
            </div>
          ))}
          <span style={{ alignSelf: "center", fontSize: 12, fontWeight: 700, color: T.muted, flexShrink: 0, padding: "0 4px" }}>{list.length}</span>
        </div>
      )}

      {list.length === 0 && <div style={{ textAlign: "center", color: T.muted, padding: "40px 0", fontSize: 14, fontWeight: 600 }}>{tr("noTxns")}</div>}
      {list.map(t => (
        <TxCard key={t.id} t={t} cfg={cfg} cCats={cCats} T={T} onEdit={() => onEdit(t)} onDel={() => onDel(t.id)} accs={accs} showAcc />
      ))}
    </div>
  );
}

// ─── ACCOUNTS ─────────────────────────────────────────────────────────────────
function AccountsTab({ accs, cfg, T, onAdd, onEdit, onDel, tr }) {
  const total = accs.reduce((s, a) => s + a.balance, 0);
  return (
    <div className="tab-content" style={{ paddingBottom: 20 }}>
      <div style={s.row({ justifyContent: "space-between", padding: "20px 2px 16px" })}>
        <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>{tr("accounts")}</div>
        <button onClick={onAdd} style={{ padding: "8px 16px", borderRadius: 12, background: T.bg3, color: T.sub, fontSize: 13, fontWeight: 700 }}>{tr("add")}</button>
      </div>

      <div style={{ background: `linear-gradient(135deg,${T.accent}20,${T.bg2})`, borderRadius: 20, padding: "24px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase" }}>{tr("netWorth")}</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: T.text, marginTop: 8 }}>{money(total, cfg)}</div>
      </div>

      {accs.map(a => (
        <div key={a.id} style={s.card(T, { marginBottom: 12 })}>
          <div style={s.row({ gap: 14 })}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: a.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{a.icon}</div>
            <div style={s.col({ flex: 1 })}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>{a.name}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontWeight: 600 }}>{ATYPES[a.type] || a.type}</div>
            </div>
            <div style={s.col({ alignItems: "flex-end", gap: 8 })}>
              <div style={{ fontSize: 18, fontWeight: 900, color: a.balance >= 0 ? T.text : T.red }}>{money(a.balance, cfg)}</div>
              <div style={s.row({ gap: 6 })}>
                <button onClick={() => onEdit(a)} aria-label="Edit" style={{ padding: "6px 10px", borderRadius: 8, background: T.bg3, color: T.sub }}>{EditIco}</button>
                <button onClick={() => onDel(a.id)} aria-label="Delete" style={{ padding: "6px 10px", borderRadius: 8, background: T.bg3, color: T.red }}>{DelIco}</button>
              </div>
            </div>
          </div>
          <div style={s.row({ paddingTop: 14, marginTop: 14, borderTop: `1px solid ${T.sep}` })}>
            {[["income", a.tIn || 0, T.green], ["expense", a.tEx || 0, T.red]].map(([l, v, c]) => (
              <div key={l} style={s.col({ flex: 1, alignItems: "center" })}>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>{tr(l)}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: c, marginTop: 2 }}>{money(v, cfg)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsTab({ cfg, setSetting, T, localBackup, driveBackup, driveRestore, openModal, gUser, gLogin, gSignOut, cCats, onAddCat, onDelCat, G_ID, tr }) {
  const isDummyClient = G_ID.startsWith("YOUR");

  return (
    <div className="tab-content" style={{ paddingBottom: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, padding: "20px 2px 16px" }}>{tr("settings")}</div>

      <SHd T={T}>{tr("appearance")}</SHd>
      <div style={s.card(T, { marginBottom: 8 })}>
        <div style={s.row({ gap: 10 })}>
          {[["dark", "🌑 Dark"], ["light", "☀️ Light"]].map(([v, l]) => (
            <button key={v} onClick={() => setSetting("theme", v)}
              style={{
                flex: 1, padding: "12px", borderRadius: 14, fontSize: 14, fontWeight: 700,
                background: cfg.theme === v ? T.accent + "22" : T.bg3, color: cfg.theme === v ? T.accent : T.sub,
                border: `1.5px solid ${cfg.theme === v ? T.accent + "80" : "transparent"}`
              }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <SHd T={T}>{tr("regional")}</SHd>
      <div style={{ background: T.bg2, borderRadius: 20, overflow: "hidden", marginBottom: 8 }}>
        {[
          { lb: "Currency", k: "currency", opts: CURR.map(c => c.code), display: CURR.map(c => `${c.sym} ${c.code}`) },
          { lb: "Language", k: "language", opts: LANGS },
          { lb: "Number Format", k: "numberFormat", opts: NFMTS },
          { lb: "Time Format", k: "timeFormat", opts: ["12-hour", "24-hour"] },
        ].map((item, i, arr) => (
          <div key={item.k} style={{ padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${T.sep}` : "none" }}>
            <Lbl T={T}>{item.lb}</Lbl>
            <select value={cfg[item.k]} onChange={e => setSetting(item.k, e.target.value)}
              style={{ background: T.bg3, borderRadius: 12, color: T.text, fontSize: 14, fontWeight: 600, padding: "10px 14px", width: "100%" }}>
              {(item.display || item.opts).map((o, j) => <option key={j} value={item.opts[j]}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      <SHd T={T}>Transaction Time</SHd>
      <div style={s.card(T, { marginBottom: 8 })}>
        <div style={s.row({ justifyContent: "space-between" })}>
          <div>
            <div style={{ fontSize: 15, color: T.text, fontWeight: 700 }}>Show Time Field</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Log time with transactions</div>
          </div>
          <Toggle value={cfg.showTime || false} onChange={v => setSetting("showTime", v)} T={T} />
        </div>
      </div>

      <SHd T={T}>{tr("security")}</SHd>
      <div style={s.card(T, { marginBottom: 8 })}>
        <div style={s.row({ justifyContent: "space-between" })}>
          <div>
            <div style={{ fontSize: 15, color: T.text, fontWeight: 700 }}>{tr("appPwd")}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>PIN lock to secure app</div>
          </div>
          <button onClick={() => openModal("pin")} style={{ padding: "8px 16px", borderRadius: 12, background: T.bg3, color: T.sub, fontSize: 13, fontWeight: 700 }}>
            {cfg.passwordEnabled ? "Change" : "Enable"}
          </button>
        </div>
      </div>

      <SHd T={T}>{tr("cloudSync")}</SHd>
      <div style={s.card(T, { marginBottom: 8 })}>
        {isDummyClient && !gUser && (
          <div style={{ background: T.red + "15", border: `1px solid ${T.red}40`, padding: "12px", borderRadius: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.red }}>⚠️ Under Construction</div>
            <div style={{ fontSize: 11, color: T.red, marginTop: 4, opacity: 0.8 }}>Google Drive Cloud Sync is currently under construction.</div>
          </div>
        )}

        {gUser ? (
          <>
            <div style={s.row({ gap: 12, marginBottom: 16, padding: "12px", background: T.bg3, borderRadius: 16 })}>
              {gUser.avatar && <img src={gUser.avatar} style={{ width: 40, height: 40, borderRadius: "50%" }} alt="" />}
              <div style={s.col({ flex: 1 })}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{gUser.name}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{gUser.email}</div>
              </div>
              <button onClick={gSignOut} style={{ color: T.red, fontSize: 13, fontWeight: 700, padding: "0 8px" }}>Sign out</button>
            </div>
            <div style={s.row({ justifyContent: "space-between", marginBottom: 14 })}>
              <div>
                <div style={{ fontSize: 14, color: T.text, fontWeight: 700 }}>Auto Backup</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Weekly automatic backup</div>
              </div>
              <Toggle value={cfg.autoBackup || false} onChange={v => setSetting("autoBackup", v)} T={T} />
            </div>
            {cfg.lastBackup && <div style={{ fontSize: 11, color: T.muted, marginBottom: 14, fontWeight: 600 }}>Last: {new Date(cfg.lastBackup).toLocaleString()}</div>}
            <div style={s.row({ gap: 10 })}>
              <button onClick={driveBackup} style={{ flex: 1, padding: "12px", borderRadius: 14, fontWeight: 800, fontSize: 14, background: "linear-gradient(135deg,#4285F4,#34A853)", color: "#fff" }}>☁️ Backup</button>
              <button onClick={driveRestore} style={{ flex: 1, padding: "12px", borderRadius: 14, fontWeight: 800, fontSize: 14, background: "#4285F415", color: "#4285F4", border: "1.5px solid #4285F440" }}>📥 Restore</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 16, lineHeight: 1.6, fontWeight: 500 }}>Sign in with Google to sync data to your private Drive folder.</div>
            <button onClick={gLogin} style={{ width: "100%", padding: "14px", borderRadius: 14, background: isDummyClient ? T.bg3 : "linear-gradient(135deg,#4285F4,#34A853)", color: isDummyClient ? T.sub : "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill={isDummyClient ? T.sub : "#fff"} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill={isDummyClient ? T.sub : "#fff"} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill={isDummyClient ? T.sub : "#fff"} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill={isDummyClient ? T.sub : "#fff"} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </>
        )}
      </div>

      <SHd T={T}>{tr("localBkp")}</SHd>
      <div style={s.row({ gap: 10, marginBottom: 8 })}>
        <FBtn T={T} onClick={localBackup} style={{ flex: 1 }}>💾 Export</FBtn>
        <FBtn T={T} onClick={() => openModal("restore")} style={{ flex: 1 }}>📂 Import</FBtn>
      </div>

      <SHd T={T}>{tr("customCats")}</SHd>
      <div style={s.card(T, { marginBottom: 8 })}>
        <FBtn T={T} onClick={onAddCat} style={{ marginBottom: 14, background: T.accent + "15", color: T.accent }}>{tr("add")}</FBtn>
        {cCats.length === 0 && <div style={{ fontSize: 13, color: T.muted, textAlign: "center", fontWeight: 500 }}>No custom categories</div>}
        {cCats.map(c => (
          <div key={c.id} style={s.row({ gap: 12, marginBottom: 12 })}>
            <span style={{ fontSize: 22 }}>{c.i || c.icon}</span>
            <div style={s.col({ flex: 1 })}>
              <div style={{ fontSize: 14, color: T.text, fontWeight: 700 }}>{c.l || c.label}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{c.type}</div>
            </div>
            <button onClick={() => onDelCat(c.id)} style={{ color: T.red, fontSize: 16, padding: "0 8px" }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>CashFlow Pro v5.1</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontWeight: 600 }}>No ads · Private · Secure</div>
        
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.sep}` }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700 }}>Owned by Engineers Classic Innovator: Mr White</div>
          <a href="#" target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 11, color: T.accent, marginTop: 6, fontWeight: 600, textDecoration: "none" }}>
            For More applications or Update suggestion Visit (Soon Coming)
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function TxModal({ T, accs, allCats, cfg, onSubmit, onClose, editTx, tr }) {
  const [type, setType] = useState(editTx?.type || "expense");
  const [form, setForm] = useState({
    aid: editTx?.aid || accs[0]?.id || "",
    toAid: editTx?.toAid || (accs.length > 1 ? accs[1].id : ""), // Destination Account
    cat: editTx?.cat || "",
    amt: editTx?.amt?.toString() || "",
    note: editTx?.note || "",
    date: editTx?.date || today(),
    time: editTx?.time || nowT(),
  });
  const [err, setErr] = useState("");
  const cats = allCats[type] || [];
  const ac = type === "income" ? T.green : type === "expense" ? T.red : T.accent;
  const sy = getSym(cfg);

  const submit = () => {
    if (!form.amt || isNaN(+form.amt) || +form.amt <= 0) { setErr("Enter a valid amount"); return; }
    if (type !== "transfer" && !form.cat) { setErr("Select a category"); return; }
    if (!form.aid) { setErr("Select an account"); return; }
    if (type === "transfer") {
      if (!form.toAid) { setErr("Select a destination account"); return; }
      if (form.aid === form.toAid) { setErr("Source and destination must be different"); return; }
    }
    onSubmit({ ...(editTx || {}), ...form, amt: parseFloat(form.amt), type });
  };

  return (
    <Sheet T={T} onClose={onClose} title={editTx ? tr("saveChanges") : tr("addTxn")}>
      <div style={s.row({ gap: 10, marginBottom: 20 })}>
        {[["expense", "💸 " + tr("expense"), T.red], ["income", "💚 " + tr("income"), T.green], ["transfer", "🔄 Transfer", T.accent]].map(([v, l, c]) => (
          <button key={v} onClick={() => { setType(v); setForm(f => ({ ...f, cat: "" })); setErr(""); }}
            style={{
              flex: 1, padding: "12px", borderRadius: 16, fontSize: 13, fontWeight: 800,
              background: type === v ? c + "18" : T.bg3, color: type === v ? c : T.sub,
              border: `2px solid ${type === v ? c + "70" : "transparent"}`
            }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ background: ac + "12", borderRadius: 20, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: ac, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
          {type === "income" ? tr("income") : type === "expense" ? tr("expense") : "Transfer Amount"}
        </div>
        <div style={s.row({ gap: 6, alignItems: "center" })}>
          <span style={{ fontSize: 28, color: ac, opacity: .6, fontWeight: 800 }}>{sy}</span>
          <input type="number" inputMode="decimal" value={form.amt}
            onChange={e => { setForm(f => ({ ...f, amt: e.target.value })); setErr(""); }}
            placeholder="0.00"
            style={{ flex: 1, background: "none", fontSize: 44, fontWeight: 900, color: ac, minWidth: 0, letterSpacing: "-1px" }} />
        </div>
      </div>

      <Lbl T={T}>{type === "transfer" ? "From Account" : tr("account")}</Lbl>
      {accs.length > 2 ? (
        <select value={form.aid} onChange={e => setForm(f => ({ ...f, aid: e.target.value }))}
          style={{ background: T.bg3, borderRadius: 12, color: T.text, fontSize: 14, fontWeight: 600, padding: "12px 14px", width: "100%", marginBottom: 20 }}>
          {accs.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
        </select>
      ) : (
        <div style={s.row({ gap: 10, marginBottom: 20, flexWrap: "wrap" })}>
          {accs.map(a => (
            <button key={a.id} onClick={() => setForm(f => ({ ...f, aid: a.id }))}
              style={{
                padding: "10px 14px", borderRadius: 14, fontSize: 13, fontWeight: 700,
                background: form.aid === a.id ? a.color + "20" : T.bg3, color: form.aid === a.id ? a.color : T.sub,
                border: `1.5px solid ${form.aid === a.id ? a.color + "70" : "transparent"}`
              }}>
              {a.icon} {a.name}
            </button>
          ))}
        </div>
      )}

      {type === "transfer" ? (
        <>
          <Lbl T={T}>To Account</Lbl>
          {accs.length > 2 ? (
            <select value={form.toAid} onChange={e => setForm(f => ({ ...f, toAid: e.target.value }))}
              style={{ background: T.bg3, borderRadius: 12, color: T.text, fontSize: 14, fontWeight: 600, padding: "12px 14px", width: "100%", marginBottom: 20 }}>
              {accs.map(a => <option key={`to-${a.id}`} value={a.id}>{a.icon} {a.name}</option>)}
            </select>
          ) : (
            <div style={s.row({ gap: 10, marginBottom: 20, flexWrap: "wrap" })}>
              {accs.map(a => (
                <button key={`to-${a.id}`} onClick={() => setForm(f => ({ ...f, toAid: a.id }))}
                  style={{
                    padding: "10px 14px", borderRadius: 14, fontSize: 13, fontWeight: 700,
                    background: form.toAid === a.id ? a.color + "20" : T.bg3, color: form.toAid === a.id ? a.color : T.sub,
                    border: `1.5px solid ${form.toAid === a.id ? a.color + "70" : "transparent"}`
                  }}>
                  {a.icon} {a.name}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <Lbl T={T}>{tr("category")}</Lbl>
          {/* ... Categories mapping remains exactly the same below here ... */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
            {cats.map(c => (
              <button key={c.id} onClick={() => { setForm(f => ({ ...f, cat: c.id })); setErr(""); }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px 4px", borderRadius: 16,
                  background: form.cat === c.id ? c.c + "18" : T.bg3,
                  border: `1.5px solid ${form.cat === c.id ? c.c + "70" : "transparent"}`
                }}>
                <span style={{ fontSize: 24, lineHeight: 1 }}>{c.i}</span>
                <span style={{ fontSize: 11, color: form.cat === c.id ? c.c : T.muted, fontWeight: 700, textAlign: "center" }}>{c.l}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div style={s.row({ gap: 12, marginBottom: cfg.showTime ? 12 : 20 })}>
        <div style={s.col({ flex: 1 })}>
          <Lbl T={T}>{tr("note")}</Lbl>
          <Inp T={T} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Description…" />
        </div>
        <div style={s.col({ flex: 1 })}>
          <Lbl T={T}>{tr("date")}</Lbl>
          <Inp T={T} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
      </div>

      {cfg.showTime && (
        <div style={s.col({ marginBottom: 20 })}>
          <Lbl T={T}>Time</Lbl>
          <div style={s.row({ gap: 8 })}>
            <Inp T={T} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={{ flex: 1 }} />
            <button onClick={() => setForm(f => ({ ...f, time: nowT() }))}
              style={{ padding: "12px 16px", borderRadius: 12, background: T.accent + "18", color: T.accent, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
              {tr("nowBtn") || "Now"}
            </button>
          </div>
        </div>
      )}

      {err && <div style={{ background: T.red + "14", borderRadius: 12, padding: "10px 14px", color: T.red, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>⚠️ {err}</div>}

      <button onClick={submit}
        style={{ width: "100%", padding: "16px", borderRadius: 16, background: type === "income" ? `linear-gradient(135deg,${T.green},#009e78)` : type === "expense" ? `linear-gradient(135deg,${T.red},#c02020)` : `linear-gradient(135deg,${T.accent},${T.adk})`, color: "#fff", fontSize: 15, fontWeight: 800, boxShadow: `0 6px 20px ${ac}30`, marginTop: 4 }}>
        {editTx ? tr("saveChanges") : type === "income" ? tr("addInc") : type === "expense" ? tr("addExp") : "Add Transfer"}
      </button>
    </Sheet>
  );
}

function AccModal({ T, onSubmit, onClose, editAcc, tr }) {
  const ICONS = ["🏦", "💰", "💳", "🏧", "💵", "🏠", "📈", "💼", "🎯", "⭐"];
  const COLORS = ["#7C5DFA", "#00C896", "#FF4D4D", "#FF8B00", "#0065FF", "#00B8D9", "#6554C0", "#FF5BA0", "#36B37E", "#FF7452"];
  const TYPES = Object.entries(ATYPES);
  const [form, setForm] = useState(editAcc || { name: "", icon: "🏦", color: "#7C5DFA", type: "bank" });
  return (
    <Sheet T={T} onClose={onClose} title={editAcc ? tr("editAcc") : tr("addAcc")}>
      <Lbl T={T}>{tr("name")}</Lbl>
      <Inp T={T} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Bank" style={{ marginBottom: 16 }} />
      <Lbl T={T}>{tr("icon")}</Lbl>
      <div style={s.row({ gap: 10, flexWrap: "wrap", marginBottom: 16 })}>
        {ICONS.map(ic => <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{ width: 44, height: 44, borderRadius: 12, fontSize: 22, background: form.icon === ic ? T.accent + "22" : T.bg3, border: `2px solid ${form.icon === ic ? T.accent : "transparent"}` }}>{ic}</button>)}
      </div>
      <Lbl T={T}>{tr("color")}</Lbl>
      <div style={s.row({ gap: 12, flexWrap: "wrap", marginBottom: 16 })}>
        {COLORS.map(c => <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 32, height: 32, borderRadius: "50%", background: c, boxShadow: form.color === c ? `0 0 0 3px ${T.text}` : "none" }} />)}
      </div>
      <Lbl T={T}>{tr("type")}</Lbl>
      <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
        style={{ background: T.bg3, borderRadius: 12, color: T.text, fontSize: 14, fontWeight: 600, padding: "12px 14px", width: "100%", marginBottom: 24 }}>
        {TYPES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <button onClick={() => form.name.trim() && onSubmit(form)}
        style={{ width: "100%", padding: "16px", borderRadius: 16, background: `linear-gradient(135deg,${T.accent},${T.adk})`, color: "#fff", fontSize: 15, fontWeight: 800 }}>
        {editAcc ? tr("saveChanges") : tr("addAcc")}
      </button>
    </Sheet>
  );
}

function CashModal({ T, cfg, onClose, tr }) {
  const sy = getSym(cfg);
  const DENOMS = cfg.currency === "PKR" ? [5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1] : cfg.currency === "INR" ? [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1] : [100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05, 0.01];
  const [counts, setCounts] = useState({});
  const total = DENOMS.reduce((s, d) => s + d * (parseInt(counts[d] || 0)), 0);
  return (
    <Sheet T={T} onClose={onClose} title="Cash Counter">
      <div style={{ background: T.accent + "18", borderRadius: 20, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>TOTAL</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: T.text, marginTop: 4 }}>{sy}{total.toFixed(2)}</div>
      </div>
      <div style={{ maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
        {DENOMS.map(d => (
          <div key={d} style={s.row({ gap: 10, marginBottom: 8, padding: "10px 14px", background: T.bg2, borderRadius: 14 })}>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: T.text }}>{sy}{d}</span>
            <button onClick={() => setCounts(c => ({ ...c, [d]: Math.max(0, (parseInt(c[d] || 0) - 1)) }))} style={{ width: 32, height: 32, borderRadius: "50%", background: T.bg3, color: T.text, fontSize: 20, fontWeight: 600 }}>−</button>
            <input type="number" value={counts[d] || ""} onChange={e => setCounts(c => ({ ...c, [d]: e.target.value }))}
              style={{ width: 48, textAlign: "center", background: T.bg3, borderRadius: 10, padding: 6, color: T.text, fontSize: 14, fontWeight: 700 }} />
            <button onClick={() => setCounts(c => ({ ...c, [d]: (parseInt(c[d] || 0) + 1) }))} style={{ width: 32, height: 32, borderRadius: "50%", background: T.accent, color: "#fff", fontSize: 20, fontWeight: 600 }}>+</button>
            <span style={{ width: 70, textAlign: "right", fontSize: 13, fontWeight: 800, color: T.accent }}>{sy}{(d * (parseInt(counts[d] || 0))).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setCounts({})} style={{ width: "100%", padding: "12px", borderRadius: 14, background: T.bg3, color: T.sub, fontSize: 13, fontWeight: 700, marginTop: 12 }}>🔄 Reset</button>
    </Sheet>
  );
}

function RestoreModal({ T, onLocal, onDrive, onClose, tr }) {
  const ref = useRef();
  return (
    <Sheet T={T} onClose={onClose} title="Restore Backup">
      <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
        <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 24, fontWeight: 500 }}>Restore from a local JSON file or Google Drive.</div>
        <input ref={ref} type="file" accept=".json" style={{ display: "none" }} onChange={e => e.target.files[0] && onLocal(e.target.files[0])} />
        <FBtn T={T} onClick={() => ref.current.click()} style={{ marginBottom: 12, padding: "16px", borderRadius: 16 }}>📱 Choose Local File</FBtn>
        <button onClick={onDrive} style={{ width: "100%", padding: "16px", borderRadius: 16, background: "linear-gradient(135deg,#4285F4,#34A853)", color: "#fff", fontSize: 14, fontWeight: 800 }}>☁️ Restore from Google Drive</button>
      </div>
    </Sheet>
  );
}

function CatModal({ T, onSubmit, onClose, tr }) {
  const EM = ["🛒", "🎸", "🐕", "🌿", "🧘", "🎮", "🏊", "🖼️", "🔧", "🚀", "💡", "🎯", "🌎", "🍕", "☕", "🎵", "🏋️", "🌸"];
  const CL = ["#8A6DFF", "#00D09E", "#FF5C5C", "#FF8B00", "#0065FF", "#00B8D9", "#FF5BA0"];
  // State maps precisely to the category object keys expected by getCat: l=label, i=icon, c=color
  const [form, setForm] = useState({ l: "", i: "🛒", c: "#8A6DFF", type: "expense" });

  return (
    <Sheet T={T} onClose={onClose} title="Add Category">
      <Lbl T={T}>{tr("name")}</Lbl>
      <Inp T={T} value={form.l} onChange={e => setForm(f => ({ ...f, l: e.target.value }))} placeholder="Category name" style={{ marginBottom: 16 }} />

      <Lbl T={T}>{tr("type")}</Lbl>
      <div style={s.row({ gap: 10, marginBottom: 16 })}>
        {["expense", "income"].map(v => (
          <button key={v} onClick={() => setForm(f => ({ ...f, type: v }))}
            style={{
              flex: 1, padding: "12px", borderRadius: 14, fontSize: 14, fontWeight: 700,
              background: form.type === v ? T.accent + "22" : T.bg3, color: form.type === v ? T.accent : T.sub,
              border: `2px solid ${form.type === v ? T.accent + "70" : "transparent"}`
            }}>
            {tr(v)}
          </button>
        ))}
      </div>

      <Lbl T={T}>{tr("icon")}</Lbl>
      <div style={s.row({ gap: 8, flexWrap: "wrap", marginBottom: 16 })}>
        {EM.map(e => (
          <button key={e} onClick={() => setForm(f => ({ ...f, i: e }))}
            style={{
              width: 40, height: 40, borderRadius: 12, fontSize: 20,
              background: form.i === e ? T.accent + "40" : T.bg3,
              border: `2px solid ${form.i === e ? T.text : "transparent"}`, // <-- Fixed: Adapts to Light/Dark Mode
              boxShadow: form.i === e ? `0 0 12px ${T.accent}80` : "none",
              transform: form.i === e ? "scale(1.15)" : "none", 
              transition: "all .2s ease"
            }}>
            {e}
          </button>
        ))}
      </div>

      <Lbl T={T}>{tr("color")}</Lbl>
      <div style={s.row({ gap: 12, marginBottom: 24 })}>
        {CL.map(c => (
          <button key={c} onClick={() => setForm(f => ({ ...f, c: c }))}
            style={{
              width: 32, height: 32, borderRadius: "50%", background: c,
              boxShadow: form.c === c ? `0 0 0 3px ${T.bg}, 0 0 0 5px ${T.text}` : "none", // <-- Fixed: Adapts to Light/Dark Mode
              transform: form.c === c ? "scale(1.15)" : "none",
              transition: "all .2s ease"
            }} />
        ))}
      </div>

      <button onClick={() => { if (form.l.trim()) { onSubmit(form); closeModal(); } }}
        style={{ width: "100%", padding: "16px", borderRadius: 16, background: `linear-gradient(135deg,${T.accent},${T.adk})`, color: "#fff", fontSize: 15, fontWeight: 800 }}>
        Add Category
      </button>
    </Sheet>
  );
}

function ReportModal({ T, txns, accs, cCats, cfg, onClose, onExport, tr }) {
  const td = today();
  const [from, setFrom] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`);
  const [to, setTo] = useState(td);
  const [aF, setAF] = useState("all");
  const [prev, setPrev] = useState(false);
  const now = new Date();
  const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fyStart = `${fyStartYear}-04-01`;

  const PRE = [
    { l: "This Month", f: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`, t: td },
    { l: "Last Month", f: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0], t: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0] },
    { l: "This Fin. Year", f: fyStart, t: td },
    { l: "All Time", f: "2000-01-01", t: td },
  ];
  const rows = txns.filter(t => t.date >= from && t.date <= to && (aF === "all" || t.aid === aF)).sort((a, b) => a.date.localeCompare(b.date));
  const inc = rows.filter(t => t.type === "income").reduce((s, t) => s + t.amt, 0);
  const exp = rows.filter(t => t.type === "expense").reduce((s, t) => s + t.amt, 0);
  const sy = getSym(cfg);
  let run = 0; const rb = rows.map(t => { run += t.type === "income" ? t.amt : -t.amt; return { ...t, bal: run }; });

  if (prev) return (
    <Sheet T={T} onClose={onClose} title={tr("reportPreview")||"Report Preview"}>
      <div style={{ background: T.bg3, borderRadius: 16, padding: "16px", marginBottom: 16 }}>
        <div style={s.row({ gap: 12, marginBottom: 12 })}>
          <AppLogo size={42} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>CashFlow Report</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{new Date().toLocaleString()}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: T.sub }}>{from} → {to} · {rows.length} transactions</div>
      </div>

      <div style={s.row({ gap: 10, marginBottom: 16 })}>
        {[["IN", inc, T.green], ["OUT", exp, T.red], ["NET", inc - exp, inc - exp >= 0 ? T.green : T.red]].map(([l, v, c]) => (
          <div key={l} style={s.col({ flex: 1, background: T.bg3, borderRadius: 12, padding: "14px" })}>
            <div style={{ fontSize: 10, color: T.muted, fontWeight: 800, letterSpacing: 1 }}>{l}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: c, marginTop: 6 }}>{sy}{Math.abs(v).toFixed(0)}</div>
          </div>
        ))}
      </div>

      <div style={{ background: T.bg3, borderRadius: 12, overflow: "hidden", marginBottom: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 360 }}>
          <thead>
            <tr style={{ background: T.bg2 }}>
              {["Date", "Note", "Cat", "In", "Out", "Bal"].map(h => (
                <th key={h} style={{ padding: "10px 8px", textAlign: "left", color: T.muted, fontWeight: 700, fontSize: 11, borderBottom: `1px solid ${T.sep}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rb.slice(0, 16).map((t, i) => {
              const c = getCat(t.cat, cCats);
              return (
                <tr key={t.id} style={{ borderBottom: i !== 15 && i !== rb.length - 1 ? `1px solid ${T.sep}` : "none" }}>
                  <td style={{ padding: "10px 8px", color: T.muted, fontSize: 11, whiteSpace: "nowrap" }}>{t.date}</td>
                  <td style={{ padding: "10px 8px", color: T.text, fontWeight: 600, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.note}</td>
                  <td style={{ padding: "10px 8px", whiteSpace: "nowrap", color: T.text }}>{c.i} {c.l}</td>
                  <td style={{ padding: "10px 8px", color: T.green, fontWeight: 800, whiteSpace: "nowrap" }}>{t.type === "income" ? `${sy}${t.amt.toFixed(2)}` : ""}</td>
                  <td style={{ padding: "10px 8px", color: T.red, fontWeight: 800, whiteSpace: "nowrap" }}>{t.type === "expense" ? `${sy}${t.amt.toFixed(2)}` : ""}</td>
                  <td style={{ padding: "10px 8px", fontWeight: 800, color: T.text, whiteSpace: "nowrap" }}>{sy}{Math.abs(t.bal).toFixed(0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rb.length > 16 && <div style={{ padding: "10px", textAlign: "center", fontSize: 11, color: T.muted, borderTop: `1px solid ${T.sep}` }}>+{rb.length - 16} more in full report</div>}
      </div>

      <div style={s.row({ gap: 12 })}>
        <button onClick={() => setPrev(false)} style={{ flex: 1, padding: "14px", borderRadius: 12, background: T.bg3, color: T.text, fontSize: 14, fontWeight: 600 }}>← {tr("backBtn")||"Back"}</button>
        <button onClick={() => onExport(from, to, aF)} style={{ flex: 2, padding: "14px", borderRadius: 12, background: `linear-gradient(135deg,${T.accent},${T.adk})`, color: "#fff", fontSize: 14, fontWeight: 700 }}>🖨️ {tr("exportCsv")||"Export CSV"}</button>
      </div>
    </Sheet>
  );

  return (
    <Sheet T={T} onClose={onClose} title={tr("generateReport")||"Generate Report"}>
      <div style={s.row({ gap: 6, flexWrap: "wrap", marginBottom: 14 })}>
        {PRE.map(p => <button key={p.l} onClick={() => { setFrom(p.f); setTo(p.t); }} style={{ padding: "5px 11px", borderRadius: 18, fontSize: 11, background: T.bg3, color: T.sub }}>{p.l}</button>)}
      </div>
      {[["From", from, setFrom], ["To", to, setTo]].map(([l, v, sv]) => (
        <div key={l} style={s.col({ marginBottom: 11 })}>
          <Lbl T={T}>{l}</Lbl>
          <Inp T={T} type="date" value={v} onChange={e => sv(e.target.value)} />
        </div>
      ))}
      <Lbl T={T}>{tr("account") || "Account"}</Lbl>
      <select value={aF} onChange={e => setAF(e.target.value)}
        style={{ background: T.bg3, borderRadius: 10, color: T.text, fontSize: 13, padding: "10px 12px", width: "100%", marginBottom: 20 }}>
        <option value="all">{tr("allAccs") || "All Accounts"}</option>
        {accs.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
      </select>

      <div style={s.row({ gap: 12 })}>
        <button onClick={() => setPrev(true)}
          style={{ flex: 1, padding: "16px", borderRadius: 16, background: T.bg3, color: T.text, fontSize: 14, fontWeight: 700 }}>
          👁️ {tr("preview")||"Preview"}
        </button>
        <button onClick={() => onExport(from, to, aF)}
          style={{ flex: 1, padding: "16px", borderRadius: 16, background: `linear-gradient(135deg,${T.accent},${T.adk})`, color: "#fff", fontSize: 14, fontWeight: 800 }}>
          🖨️ {tr("exportCsv")||"Export CSV"}
        </button>
      </div>
    </Sheet>
  );
}

function PinModal({ T, cfg, setCfg, onClose, showToast, tr }) {
  const [old, setOld] = useState("");
  const [pin, setPin] = useState("");
  const [conf, setConf] = useState("");

  const save = () => {
    if (cfg.passwordEnabled && old !== cfg.password) { showToast("Current PIN is incorrect", T.red); return; }
    if (pin.length < 4) { showToast("4+ digits required", T.red); return; }
    if (pin !== conf) { showToast("New PINs don't match", T.red); return; }

    setCfg(c => ({ ...c, passwordEnabled: true, password: pin }));
    showToast("🔒 Password saved");
    onClose();
  };

  const remove = () => {
    if (cfg.passwordEnabled && old !== cfg.password) { showToast("Current PIN is incorrect", T.red); return; }
    setCfg(c => ({ ...c, passwordEnabled: false, password: "" }));
    showToast("🔓 Password removed");
    onClose();
  };

  return (
    <Sheet T={T} onClose={onClose} title={cfg.passwordEnabled ? (tr("changePwd")||"Change Password") : (tr("setPwd")||"Set Password")}>
      {cfg.passwordEnabled && (
        <div style={s.col({ marginBottom: 16 })}>
          <Lbl T={T}>{tr("currentPin")||"Current PIN"}</Lbl>
          <Inp T={T} type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={old} onChange={e => setOld(e.target.value.replace(/\D/g, ""))} placeholder="••••" style={{ fontSize: 24, letterSpacing: 10, fontWeight: 800, textAlign: "center" }} />
        </div>
      )}

      {[[tr("newPin")||"New PIN", pin, setPin], [tr("confirmPin")||"Confirm PIN", conf, setConf]].map(([l, v, sv]) => (
        <div key={l} style={s.col({ marginBottom: 16 })}>
          <Lbl T={T}>{l}</Lbl>
          <Inp T={T} type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={v} onChange={e => sv(e.target.value.replace(/\D/g, ""))} placeholder="••••" style={{ fontSize: 24, letterSpacing: 10, fontWeight: 800, textAlign: "center" }} />
        </div>
      ))}

      <button onClick={save} style={{ width: "100%", padding: "16px", borderRadius: 16, background: `linear-gradient(135deg,${T.accent},${T.adk})`, color: "#fff", fontSize: 15, fontWeight: 800, marginTop: 8 }}>
        {tr("savePwd")||"Save Password"}
      </button>

      {cfg.passwordEnabled && (
        <button onClick={remove}
          style={{ width: "100%", marginTop: 12, padding: "14px", borderRadius: 14, color: T.red, fontSize: 14, fontWeight: 700, background: T.red + "15" }}>
          {tr("removePwd")||"Remove Password"}
        </button>
      )}
    </Sheet>
  );
}

function ConfirmDlg({ T, title, sub, onConfirm, onClose, danger, tr }) {
  return (
    <Sheet T={T} onClose={onClose} title={title} small>
      <div style={{ fontSize: 14, color: T.muted, marginBottom: 24, fontWeight: 500 }}>{sub}</div>
      <div style={s.row({ gap: 10 })}>
        <button onClick={onClose} style={{ flex: 1, padding: "14px", borderRadius: 14, background: T.bg3, color: T.sub, fontSize: 14, fontWeight: 700 }}>{tr("cancel")}</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: "14px", borderRadius: 14, background: danger ? `linear-gradient(135deg,${T.red},#b01010)` : `linear-gradient(135deg,${T.accent},${T.adk})`, color: "#fff", fontSize: 14, fontWeight: 800 }}>
          {danger ? tr("delete") : tr("confirm")}
        </button>
      </div>
    </Sheet>
  );
}