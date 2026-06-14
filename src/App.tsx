import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceDot,
} from "recharts";
import {
  Activity, ShieldCheck, GitBranch, FlaskConical, FileCheck2, LayoutGrid,
  Building2, ChevronRight, Radio, Clock, CheckCircle2, AlertTriangle,
  XCircle, Cpu, Zap, X, Info, Play, Lock, Database, Send, Sparkles, Table2, Map,
  ShoppingCart, Factory, Truck, Handshake, FileText,
} from "lucide-react";

/* ============ TOKENS ============ */
const C = {
  core: "#A100FF", deep: "#7500C0", dark: "#460073",
  ink: "#0A0A0F", soft: "#5B5B66", line: "#E8E8EC",
  faint: "#FAFAFA", bg: "#FFFFFF",
  red: "#C4314B", amber: "#B86E00", green: "#1E7145", grey: "#5B5B66",
  redBg: "#FBEAEE", amberBg: "#FBF3E6", greenBg: "#E9F3ED", purpBg: "#F6EBFF",
};
const FONT = "'Inter','Archivo',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const NUM = { fontVariantNumeric: "tabular-nums" };

/* ============ CANONICAL NUMBERS ============ */
const K = {
  ees: 70, eesAfter: 45,
  evar: 2.8, evarAfter: 1.2, reduction: 57,
  cost: 230, protectedV: 1.6, confidence: 84, runs: 10000,
  weeklyExposure: 3.8, tonnes: 500,
  domains: [
    { id: "procurement", name: "Procurement", icon: ShoppingCart, evar: 1.45, state: "High-Risk", driver: "Cocoa +18% MoM · cover 18 days (< 30-day policy)", steward: "M. Rossi", validated: "07:40", fresh: "ok", conf: 84 },
    { id: "production", name: "Production", icon: Factory, evar: 0.65, state: "Normal", driver: "Line 2 allergen window · OEE 71%", steward: "L. Greco", validated: "07:55", fresh: "ok", conf: 88 },
    { id: "logistics", name: "Logistics", icon: Truck, evar: 0.45, state: "Normal", driver: "Abidjan congestion +8 days lead time", steward: "M. Bianchi", validated: "26h ago", fresh: "stale", conf: 79 },
    { id: "commercial", name: "Commercial", icon: Handshake, evar: 0.25, state: "Pre-Alert", driver: "Forecast deviation widening — confidence 63%", steward: "S. Conti", validated: "08:05", fresh: "ok", conf: 63 },
  ],
  actions: [
    { a: "Advance purchase cocoa", vol: "500 t", cost: 120, conf: 85, clause: "§3.1 — max 4-week forward cover", drop: 0.9 },
    { a: "Hedge forward exposure", vol: "30%", cost: 60, conf: 81, clause: "§3.4 — hedging within board mandate", drop: 0.35 },
    { a: "Activate secondary supplier (Ecuador)", vol: "120 t", cost: 25, conf: 78, clause: "§2.2 — qualified supplier pool", drop: 0.2 },
    { a: "Reroute shipment from Abidjan", vol: "1 vessel", cost: 25, conf: 75, clause: "§5.1 — approved alternate lanes", drop: 0.15 },
  ],
};

const TREND = [2.1, 2.2, 2.35, 2.3, 2.55, 2.6, 2.75, 2.8].map((v, i) => ({ w: `W${i + 1}`, evar: v }));

const BACKTEST = [
  ["Jan 24", 4.6], ["Mar 24", 6.8], ["May 24", 8.9], ["Jul 24", 8.1], ["Sep 24", 9.6],
  ["Nov 24", 10.8], ["Jan 25", 12.1], ["Mar 25", 10.2], ["May 25", 8.4], ["Jul 25", 7.1],
  ["Sep 25", 5.6], ["Nov 25", 4.4], ["Jan 26", 3.6], ["Feb 26", 4.9], ["Mar 26", 5.4],
  ["Apr 26", 4.6], ["May 26", 4.2],
].map(([m, p]) => ({ m, price: p }));

const AUDIT_SEED = [
  { id: 23, title: "Logistics reroute — Valencia lane", ts: "Jun 05 · 11:32", approver: "Operations Lead", before: 0.6, after: 0.35, outcome: "Validated · 91% realized", status: "passed", ref: "AUD-23-0087" },
  { id: 22, title: "Demand spike — promotional pre-build", ts: "May 29 · 09:18", approver: "Operations Director", before: 1.1, after: 0.7, outcome: "Validated · 96% realized", status: "passed", ref: "AUD-22-0081" },
  { id: 21, title: "Cocoa partial hedge", ts: "May 22 · 14:05", approver: "—", before: 1.4, after: null, outcome: "Figure mismatch → returned to Procurement Agent, regenerated, passed as #21b", status: "blocked", ref: "AUD-21-0076" },
  { id: "21b", title: "Cocoa partial hedge (regenerated)", ts: "May 22 · 14:41", approver: "Operations Director", before: 1.4, after: 0.9, outcome: "Validated · 88% realized", status: "passed", ref: "AUD-21-0077" },
  { id: 20, title: "Energy spot — schedule shift", ts: "May 15 · 10:22", approver: "Shift Supervisor", before: 0.3, after: 0.18, outcome: "Validated · 93% realized", status: "passed", ref: "AUD-20-0071" },
  { id: 19, title: "Advance purchase 300t — Ivory Coast", ts: "May 08 · 09:47", approver: "Operations Director", before: 1.6, after: 0.7, outcome: "Validated · 93% realized (proj. €0.9M, real. €0.84M)", status: "passed", ref: "AUD-19-0064" },
  { id: 18, title: "Supplier B qualification fast-track", ts: "Apr 30 · 16:10", approver: "Operations Lead", before: 0.5, after: 0.3, outcome: "Validated · 87% realized", status: "passed", ref: "AUD-18-0059" },
  { id: 17, title: "EUDR documentation gap closure", ts: "Apr 24 · 11:55", approver: "Operations Lead", before: 0.25, after: 0.1, outcome: "Validated · 100% realized", status: "passed", ref: "AUD-17-0052" },
];

const REGISTRY = [
  ["Exposure Orchestrator", "0", "Deterministic state machine", "v1.4"],
  ["Procurement Agent", "1", "LLM sub-orchestrator", "v1.3"],
  ["— Market Signal", "1.1", "LLM specialist", "v1.2"],
  ["— Contract & Supplier", "1.1", "LLM specialist (graph)", "v1.1"],
  ["— Hedging", "1.1", "LLM specialist (policy-bounded)", "v1.2"],
  ["Production Agent", "1", "LLM constraint / veto agent", "v1.1"],
  ["Logistics Agent", "1", "LLM agent", "v1.0"],
  ["Commercial Agent", "1", "LLM agent (opportunity-primary)", "v1.1"],
  ["Audit Agent", "×", "1 LLM check + 3 deterministic validators", "v1.5"],
];

const AMBIENT = [
  { who: "Signal layer", kind: "det", msg: () => `ICE cocoa tick: €${(4180 + Math.round(Math.random() * 60)).toLocaleString()}/t (+0.${Math.ceil(Math.random() * 4)}%)` },
  { who: "Signal layer", kind: "det", msg: () => "Drewry freight index refreshed — no anomaly" },
  { who: "Signal layer", kind: "det", msg: () => "Copernicus rainfall data ingested · West Africa block 4" },
  { who: "Commercial Agent", kind: "ai", msg: () => "Forecast deviation check: 9.4% — below 10% escalation threshold" },
  { who: "Orchestrator", kind: "det", msg: () => "Heartbeat · 14 signal feeds nominal · cycle state persisted" },
  { who: "Learning loop", kind: "det", msg: () => "T+4 outcome recorded for Packet #19: projected €0.90M, realized €0.84M (93%) — confidence model recalibrated" },
  { who: "Signal layer", kind: "det", msg: () => "EUR-Lex monitor: no new EUDR requirements in last 24h" },
];

/* ============ EPISODE SCRIPT ============ */
const EPISODE = [
  { t: 400, who: "Signal layer", kind: "det", ts: "09:12", msg: "ICE cocoa +18% MoM · ICCO deficit 180k MT · Copernicus rainfall anomaly → cocoa z-score +2.3 — threshold breach", hot: true },
  { t: 2200, who: "Exposure Orchestrator", kind: "det", ts: "09:12", msg: "Procurement Agent → HIGH-RISK state. Event-driven — not waiting for the monthly meeting.", fx: "procHigh" },
  { t: 4400, who: "Market Signal · sub-agent", kind: "ai", ts: "09:13", msg: "Structured market view: price €4,200/t, trend up, supply deficit confirmed, weather anomaly flagged. 3 citations." },
  { t: 6600, who: "Contract & Supplier · sub-agent", kind: "ai", ts: "09:14", msg: "Cover 18 days — below 30-day policy minimum · Supplier A concentration 48% · forward contract €3,870/t expires in 6 weeks." },
  { t: 8800, who: "Hedging · sub-agent", kind: "ai", ts: "09:15", msg: "3 candidate actions formulated within policy §3.1 (max 4-week forward cover). No winner selected — portfolio choice belongs to the engines." },
  { t: 11000, who: "Quantification Engine", kind: "det", ts: "09:16", msg: "Graph traversal: cocoa → 3 recipes → 11 SKUs → 2 lines → 4 customers. Exposure priced deterministically: €1.45M domain EVaR.", fx: "mapPath" },
  { t: 13200, who: "Orchestrator → Logistics", kind: "det", ts: "09:17", msg: "Cascade: 500t inbound, Valencia, T+14 — validate port capacity." },
  { t: 14200, who: "Orchestrator → Production", kind: "det", ts: "09:17", msg: "Cascade: validate schedule weeks T+2 to T+6 against changeover constraints." },
  { t: 15200, who: "Orchestrator → Commercial", kind: "det", ts: "09:17", msg: "Cascade: supply secured for promotional period — update commitments." },
  { t: 17200, who: "Production Agent", kind: "ai", ts: "09:18", msg: "CONSTRAINT CATCH: Line 2 allergen window conflicts with proposed run → shift to Line 3, +€8k changeover cost. Feasible.", hot: true },
  { t: 19400, who: "Monte Carlo Engine", kind: "det", ts: "09:19", msg: "Running 10,000 paths × 4 portfolios · GBM cocoa vol 28% · demand error · lead-time delay…", fx: "mc" },
  { t: 23600, who: "Monte Carlo Engine", kind: "det", ts: "09:21", msg: "Complete. Optimal portfolio D: EVaR €2.8M → €1.2M (−57%) at €230k cost. P10/P50/P90 bands attached." },
  { t: 25600, who: "Audit Agent", kind: "ai", ts: "09:23", msg: "Groundedness ✓ — every claim cites a graph path, clause or precedent", fx: "audit1" },
  { t: 26600, who: "Audit Agent", kind: "det", ts: "09:23", msg: "Numerical integrity ✓ — all figures byte-match engine output" },
  { t: 27600, who: "Audit Agent", kind: "det", ts: "09:23", msg: "Policy compliance ✓ · Completeness ✓ — packet released" },
  { t: 29400, who: "Exposure Orchestrator", kind: "det", ts: "09:24", msg: "Decision Packet #24 ready — approver tier: Operations Director (> €200k). 12 minutes from signal.", fx: "packet", hot: true },
];

/* ============ COSO ERM 2017 ============ */
const COSO_COMPONENTS = [
  ["Governance & Culture", "Approval tiers, named owners, risk appetite as grounding"],
  ["Strategy & Objective-Setting", "Risk appetite bounds what agents may recommend"],
  ["Performance", "Risk identification (Risk Map) + severity assessment (register)"],
  ["Review & Revision", "4-week outcome validation, drift suspension"],
  ["Information & Reporting", "Immutable audit trail, monthly EVaR digest"],
];

const RISK_REGISTER = [
  { id: 1, name: "Cocoa price shock (ICE +18% MoM)", cat: "Strategic", source: "external", likelihood: 4, impact: 1.45, velocity: "Days", response: "Hedge / transfer", owner: "Procurement" },
  { id: 2, name: "West Africa supply deficit & drought", cat: "Strategic", source: "external", likelihood: 3, impact: 0.90, velocity: "Weeks–Months", response: "Monitor / diversify origin", owner: "Procurement" },
  { id: 3, name: "Port congestion — Abidjan (+8d lead time)", cat: "Operational", source: "external", likelihood: 3, impact: 0.45, velocity: "Weeks", response: "Reduce / reroute", owner: "Logistics" },
  { id: 4, name: "Energy price spike (TTF)", cat: "Financial", source: "external", likelihood: 2, impact: 0.18, velocity: "Weeks", response: "Hedge / shift schedule", owner: "Production" },
  { id: 5, name: "Demand forecast deviation (9.4%)", cat: "Strategic", source: "external", likelihood: 3, impact: 0.25, velocity: "Weeks", response: "Monitor / pre-alert", owner: "Commercial" },
  { id: 6, name: "EUDR documentation gap", cat: "Compliance", source: "external", likelihood: 2, impact: 0.10, velocity: "Months", response: "Control / document", owner: "Compliance" },
  { id: 7, name: "Supplier concentration (48% Supplier A)", cat: "Strategic", source: "internal", likelihood: 3, impact: 0.55, velocity: "Months", response: "Diversify supplier base", owner: "Procurement" },
  { id: 8, name: "Inventory cover below 30-day policy (18d)", cat: "Operational", source: "internal", likelihood: 4, impact: 0.40, velocity: "Immediate", response: "Replenish to policy", owner: "Procurement" },
  { id: 9, name: "Line 2 allergen changeover constraint", cat: "Operational", source: "internal", likelihood: 3, impact: 0.65, velocity: "Immediate", response: "Reallocate to Line 3", owner: "Production" },
  { id: 10, name: "FX exposure on USD-priced contracts", cat: "Financial", source: "internal", likelihood: 2, impact: 0.12, velocity: "Weeks", response: "Forward FX cover", owner: "Finance" },
];

/* ============ SCENARIO ROOM VARIABLES ============ */
const VARIABLES = [
  { id: "cocoa", label: "Cocoa price", group: "external", unit: "%", min: 0, max: 40, step: 1, weight: 0.022 },
  { id: "demand", label: "Demand deviation", group: "external", unit: "%", min: 0, max: 30, step: 1, weight: 0.018 },
  { id: "lead", label: "Freight lead-time delay", group: "external", unit: " d", min: 0, max: 14, step: 1, weight: 0.045 },
  { id: "energy", label: "Energy price (TTF)", group: "external", unit: "%", min: 0, max: 30, step: 1, weight: 0.010 },
  { id: "fx", label: "EUR/USD FX move", group: "external", unit: "%", min: 0, max: 15, step: 1, weight: 0.014 },
  { id: "cover", label: "Inventory cover gap", group: "internal", unit: " d", min: 0, max: 20, step: 1, weight: 0.020 },
  { id: "concentration", label: "Supplier concentration", group: "internal", unit: "%", min: 0, max: 30, step: 1, weight: 0.012 },
  { id: "hedge", label: "Unhedged exposure", group: "internal", unit: "%", min: 0, max: 50, step: 5, weight: 0.009 },
  { id: "oee", label: "Line buffer lost (OEE)", group: "internal", unit: "%", min: 0, max: 25, step: 1, weight: 0.016 },
];
const VARMAP = Object.fromEntries(VARIABLES.map((v) => [v.id, v]));
const DEFAULT_ACTIVE = ["cocoa", "demand", "lead", "energy"];

const ACTION_POOL = [
  { id: "advance", label: "Advance purchase cocoa 500t", varId: "cocoa", cost: 120, conf: 85, clause: "§3.1 — max 4-week forward cover", maxDrop: 0.90 },
  { id: "hedgeFwd", label: "Hedge forward exposure 30%", varId: "hedge", cost: 60, conf: 81, clause: "§3.4 — hedging within board mandate", maxDrop: 0.55 },
  { id: "secSupplier", label: "Activate secondary supplier (Ecuador)", varId: "concentration", cost: 25, conf: 78, clause: "§2.2 — qualified supplier pool", maxDrop: 0.45 },
  { id: "reroute", label: "Reroute shipment from Abidjan", varId: "lead", cost: 25, conf: 75, clause: "§5.1 — approved alternate lanes", maxDrop: 0.40 },
  { id: "energyLock", label: "Lock energy forward / shift schedule", varId: "energy", cost: 18, conf: 80, clause: "§4.2 — energy procurement policy", maxDrop: 0.20 },
  { id: "fxHedge", label: "FX forward cover", varId: "fx", cost: 12, conf: 88, clause: "§3.6 — treasury policy", maxDrop: 0.12 },
  { id: "safetyStock", label: "Replenish inventory to 30-day cover", varId: "cover", cost: 40, conf: 83, clause: "§3.2 — inventory policy", maxDrop: 0.35 },
  { id: "reallocate", label: "Reallocate run to Line 3", varId: "oee", cost: 8, conf: 90, clause: "§1.3 — production constraint table", maxDrop: 0.25 },
  { id: "demandAlloc", label: "Adjust production allocation to demand", varId: "demand", cost: 15, conf: 79, clause: "§1.5 — S&OE variance rules", maxDrop: 0.30 },
];

const PRESETS = {
  "Cocoa Price Shock": { active: ["cocoa", "demand", "lead", "energy"], vals: { cocoa: 28, demand: 0, lead: 0, energy: 0 } },
  "Port Disruption": { active: ["cocoa", "lead", "concentration"], vals: { cocoa: 4, lead: 10, concentration: 12 } },
  "El Niño Drought": { active: ["cocoa", "lead", "energy", "cover"], vals: { cocoa: 28, lead: 4, energy: 6, cover: 6 } },
  "Demand Spike": { active: ["demand", "oee"], vals: { demand: 18, oee: 8 } },
  "FX & Energy Squeeze": { active: ["fx", "energy", "hedge"], vals: { fx: 10, energy: 15, hedge: 30 } },
};

/* ============ TOP RISKS & OPPORTUNITIES ============ */
const TOP_ITEMS = {
  external: [
    { h: "Cocoa price spike — €1.45M exposure", s: "Cocoa futures +18% MoM, z-score +2.3" },
    { h: "West Africa rainfall deficit", s: "Copernicus anomaly · Côte d'Ivoire + Ghana ≈ 60% of supply" },
    { h: "Abidjan port congestion +8 days", s: "Lead-time risk on 2 inbound vessels" },
    { h: "Demand forecast deviation 9.4%", s: "Approaching 10% escalation threshold — Commercial Pre-Alert" },
    { h: "EUDR documentation gap", s: "Traceability obligation on every cocoa shipment" },
  ],
  internal: [
    { h: "Supplier concentration 48% — Supplier A", s: "Single-source dependency on largest cocoa contract" },
    { h: "Inventory cover 18 days — below 30-day policy", s: "Procurement exposure compounds while cover gap persists" },
    { h: "Line 2 allergen changeover constraint", s: "Conflicts with proposed 500t run, weeks T+2–T+6" },
    { h: "FX exposure on USD-priced contracts", s: "Unhedged portion of forward cocoa contracts" },
  ],
  opp: [
    { h: "Early forward-cover window", s: "Lock 4-week cover before further run-up · est. €400k" },
    { h: "Secondary supplier activation", s: "Ecuador lot available · reduces 48% concentration" },
    { h: "Buying window — Packet #25", s: "Cocoa P50 below 90-day average · advance 200t · margin €140k" },
    { h: "Demand spike capture", s: "Promotional period demand +18% — reallocate Line 3 buffer" },
  ],
};
const TOP_TABS = [
  { id: "external", label: "External risks", icon: AlertTriangle },
  { id: "internal", label: "Internal risks", icon: AlertTriangle },
  { id: "opp", label: "Opportunities", icon: Zap },
];

/* ============ DECISION PACKETS ============ */
const PACKETS = [
  { id: 24, kind: "risk", title: "Cocoa Supply Shock — Advance Purchase + Hedge", sub: "Executive S&OP action required", tier: "Operations Director (> €200k)", icon: AlertTriangle, accent: C.red,
    m: [["Current EVaR", "€2.8M"], ["After portfolio", "€1.2M"], ["Cost", "€230k"]], headline: "−57% EVaR" },
  { id: 25, kind: "opportunity", title: "Buying Window — Cocoa P50 Below 90-Day Average", sub: "Opportunity packet · advance 200t", tier: "Operations Lead (€50k–200k)", icon: Zap, accent: C.green,
    m: [["Margin secured", "€140k"], ["Volume", "200 t"], ["Cost", "€55k"]], headline: "+€85k net value" },
];

/* ============ MASCOT ICON ============ */
const MascotIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M42 10 L60 22 L42 34" stroke={C.core} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="13" y="38" width="74" height="50" rx="25" fill={C.core} />
    <rect x="26" y="48" width="48" height="30" rx="15" fill="#fff" />
    <circle cx="40" cy="63" r="6" fill={C.ink} />
    <circle cx="60" cy="63" r="6" fill={C.ink} />
  </svg>
);

/* ============ UI PRIMITIVES ============ */
const Pill = ({ tone = "grey", children, style }) => {
  const m = { red: [C.red, C.redBg], amber: [C.amber, C.amberBg], green: [C.green, C.greenBg], grey: [C.grey, "#F1F1F4"], purple: [C.deep, C.purpBg] }[tone];
  return <span style={{ color: m[0], background: m[1], fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap", letterSpacing: 0.2, ...style }}>{children}</span>;
};
const stateTone = (s) => (s === "High-Risk" ? "red" : s === "Pre-Alert" ? "amber" : "green");
const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, boxShadow: "0 1px 2px rgba(10,10,15,0.04)", cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
);
const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: C.soft, marginBottom: 10 }}>{children}</div>
);
const Chev = () => <span style={{ color: C.core, fontWeight: 800, marginRight: 6 }}>&gt;</span>;
const Tag = ({ kind }) => kind === "ai"
  ? <Pill tone="purple" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Sparkles size={10} /> Claude · temp 0</Pill>
  : <Pill tone="grey" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Cpu size={10} /> deterministic — not AI</Pill>;

/* ============ EES GAUGE ============ */
function Gauge({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  const ang = -180 + (pct / 100) * 180;
  const arc = (a0, a1, color) => {
    const r = 80, cx = 100, cy = 95;
    const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`} stroke={color} strokeWidth={14} fill="none" strokeLinecap="butt" />;
  };
  const tone = pct >= 70 ? C.red : pct >= 40 ? C.amber : C.green;
  const label = pct >= 70 ? "High exposure" : pct >= 40 ? "Elevated" : "Controlled";
  return (
    <div style={{ position: "relative", width: 200, margin: "0 auto" }}>
      <svg width="200" height="118" viewBox="0 0 200 118">
        {arc(-180, -108, C.green + "55")}{arc(-108, -54, C.amber + "55")}{arc(-54, 0, C.red + "55")}
        {arc(-180, ang, tone)}
        <line x1="100" y1="95" x2={100 + 60 * Math.cos((ang * Math.PI) / 180)} y2={95 + 60 * Math.sin((ang * Math.PI) / 180)} stroke={C.ink} strokeWidth="3" style={{ transition: "all 1.2s cubic-bezier(.4,0,.2,1)" }} />
        <circle cx="100" cy="95" r="5" fill={C.ink} />
      </svg>
      <div style={{ textAlign: "center", marginTop: -28 }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: C.ink, letterSpacing: -1, ...NUM }}>{Math.round(pct)}<span style={{ fontSize: 15, fontWeight: 500, color: C.soft }}> / 100</span></div>
        <Pill tone={pct >= 70 ? "red" : pct >= 40 ? "amber" : "green"}>{`EES — ${label}`}</Pill>
      </div>
    </div>
  );
}

/* ============ RISK MAP ============ */
const NODES = [
  { id: "sig1", x: 60, y: 110, label: "ICE futures +18%", label2: "Now", t: "signal", coso: "Strategic", source: "external",
    summary: "External price signal · ICE Futures U.S., front-month cocoa.", evarM: null, conf: 88, ttImpact: "Now",
    why: "Confirms the cocoa price run-up that drives this cycle's exposure.",
    stats: [["Reading", "€4,200/t · +18% MoM"], ["z-score", "+2.3 (5-yr mean)"], ["Trigger", "Breaches Procurement z > 2.0"], ["Watched by", "Market Signal sub-agent"]] },
  { id: "sig2", x: 60, y: 230, label: "ICCO deficit 180k MT", label2: "Now", t: "signal", coso: "Strategic", source: "external",
    summary: "External supply signal · ICCO Quarterly Bulletin.", evarM: null, conf: 85, ttImpact: "Now",
    why: "Confirms the supply-side fundamentals behind the price signal.",
    stats: [["Reading", "Global deficit 180k MT"], ["Confirms", "Price run-up fundamentals"], ["Trigger", "Reinforces cocoa High-Risk"], ["Watched by", "Market Signal sub-agent"]] },
  { id: "sig3", x: 60, y: 350, label: "Copernicus rainfall", label2: "Now", t: "signal", coso: "Operational", source: "external",
    summary: "External weather signal · Copernicus, West-Africa block 4.", evarM: null, conf: 81, ttImpact: "Now",
    why: "Leading indicator of next-harvest yield risk in the two countries.",
    stats: [["Reading", "Rainfall below seasonal band"], ["Implication", "Yield risk Côte d'Ivoire + Ghana"], ["Horizon", "Next harvest window"], ["Watched by", "Market Signal sub-agent"]] },
  { id: "sig4", x: 60, y: 470, label: "Abidjan congestion", label2: "Now", t: "signal", coso: "Operational", source: "external", hot: false,
    summary: "External logistics signal · port congestion index.", evarM: null, conf: 79, ttImpact: "Now",
    why: "Separate logistics path — adds lead-time risk directly to Line 2.",
    stats: [["Reading", "+8 days lead time"], ["Affects", "2 inbound vessels"], ["Trigger", "Logistics lead-time > 7d rule"], ["Watched by", "Logistics agent"]] },
  { id: "cocoa", x: 250, y: 230, label: "Cocoa", label2: "€1.45M", t: "commodity", coso: "Financial", source: "external",
    summary: "Raw-material commodity · the dominant exposure driver this cycle.", evarM: 1.45, conf: 84, ttImpact: "+2d",
    why: "Propagates to 3 recipes, 11 SKUs, 2 lines and 4 customers.",
    recommendation: "Advance purchase 500t + hedge 30%",
    stats: [["Price", "€4,200/t · z +2.3"], ["Cover", "18 days (< 30-day policy)"], ["Owning agent", "Procurement"]],
    reach: "Propagates → 3 recipes → 11 SKUs → 2 lines → 4 customers" },
  { id: "energy", x: 250, y: 430, label: "Energy (TTF)", label2: "€0.18M", t: "commodity", coso: "Financial", source: "external", hot: false,
    summary: "Energy commodity · TTF gas, feeds production conversion cost.", evarM: 0.18, conf: 70, ttImpact: "+4d",
    why: "Secondary cost driver on Line 3 — not part of the cocoa path.",
    stats: [["Reading", "TTF +6% w/w"], ["Affects", "Line 2 / Line 3 cost"], ["Owning agent", "Production (cost model)"]] },
  { id: "r1", x: 430, y: 120, label: "Dark 70%", label2: "€620k", t: "recipe", coso: "Operational", source: "internal",
    summary: "Recipe · translation layer from cocoa price to product cost.", evarM: 0.62, conf: 80, ttImpact: "+4d",
    why: "Highest cocoa-content recipe — largest single recipe exposure.",
    recommendation: "Monitor cost pass-through to Line 2 SKUs",
    stats: [["Cocoa content", "70%"], ["Sensitivity", "€100/t → €0.07/unit"], ["Produces", "4 SKUs on Line 2"]] },
  { id: "r2", x: 430, y: 240, label: "Premium Mix", label2: "€480k", t: "recipe", coso: "Operational", source: "internal",
    summary: "Recipe · mid-cocoa blend across two lines.", evarM: 0.48, conf: 79, ttImpact: "+4d",
    why: "Spans both production lines — exposure splits downstream.",
    recommendation: "Monitor cost pass-through to Lines 2–3 SKUs",
    stats: [["Cocoa content", "55%"], ["Sensitivity", "€100/t → €0.05/unit"], ["Produces", "4 SKUs on Lines 2–3"]] },
  { id: "r3", x: 430, y: 360, label: "Seasonal Assort.", label2: "€350k", t: "recipe", coso: "Operational", source: "internal",
    summary: "Recipe · seasonal assortment, Easter pre-build exposure.", evarM: 0.35, conf: 77, ttImpact: "+4d",
    why: "Seasonal pre-build concentrates exposure into a short window.",
    recommendation: "Confirm pre-build volumes before forward cover expires",
    stats: [["Cocoa content", "48%"], ["Sensitivity", "€100/t → €0.04/unit"], ["Produces", "3 SKUs on Line 3"]] },
  { id: "sku1", x: 600, y: 100, label: "4 SKUs", label2: "€310k", t: "sku", coso: "Operational", source: "internal",
    summary: "Finished-goods cluster · Dark 70% family.", evarM: 0.31, conf: 78, ttImpact: "+8d",
    why: "Largest SKU cluster by exposure — all on Line 2.",
    recommendation: "No action required — covered by Line 2 portfolio",
    stats: [["Weekly volume", "~62 t"], ["Margin", "€1.90/unit"], ["Runs on", "Line 2"]] },
  { id: "sku2", x: 600, y: 230, label: "4 SKUs", label2: "€240k", t: "sku", coso: "Operational", source: "internal",
    summary: "Finished-goods cluster · Premium family.", evarM: 0.24, conf: 76, ttImpact: "+8d",
    why: "Split across both lines — exposure feeds two production paths.",
    recommendation: "No action required — covered by portfolio D",
    stats: [["Weekly volume", "~48 t"], ["Margin", "€2.40/unit"], ["Runs on", "Lines 2–3"]] },
  { id: "sku3", x: 600, y: 360, label: "3 SKUs", label2: "€180k", t: "sku", coso: "Operational", source: "internal",
    summary: "Finished-goods cluster · Seasonal family.", evarM: 0.18, conf: 74, ttImpact: "+8d",
    why: "Smallest cluster, but concentrated into the Easter window.",
    recommendation: "No action required — monitor pre-build schedule",
    stats: [["Weekly volume", "~31 t"], ["Margin", "€2.10/unit"], ["Runs on", "Line 3"]] },
  { id: "l1", x: 750, y: 160, label: "Line 2", label2: "€210k/wk", t: "line", coso: "Operational", source: "internal",
    summary: "Production line · constrained asset the Production agent vetoes against.", evarM: 0.21, conf: 82, ttImpact: "+13d",
    why: "Allergen changeover window conflicts with the proposed run.",
    recommendation: "Shift overflow run to Line 3 (+€8k changeover)",
    bottleneck: true, bottleneckLabel: "42% of downstream EVaR",
    stats: [["Utilization", "87%"], ["Constraint", "Allergen window Thu 22:00–04:00"], ["Changeover", "€8k to clear"], ["Serves", "Retailer X, Retailer Y"]] },
  { id: "l2", x: 750, y: 320, label: "Line 3", label2: "€90k/wk", t: "line", coso: "Operational", source: "internal",
    summary: "Production line · spare capacity for shifted runs.", evarM: 0.09, conf: 85, ttImpact: "+13d",
    why: "Receives shifted runs — the release valve for Line 2.",
    recommendation: "Accept shifted Dark 70% run from Line 2",
    stats: [["Utilization", "71%"], ["Constraint", "None binding"], ["Serves", "FMCG Z, Distributor W"]] },
  { id: "c1", x: 900, y: 90, label: "Retailer X", label2: "€160k", t: "customer", coso: "Compliance", source: "external",
    summary: "Customer · top-10 account, penalty clause on miss.", evarM: 0.16, conf: 75, ttImpact: "+13d",
    why: "Penalty clause makes this the highest-stakes customer exposure.",
    recommendation: "Protect OTIF — prioritize in Line 2 schedule",
    stats: [["OTIF commitment", "95%"], ["Contract", "Penalty on shortfall"], ["Fed by", "Line 2"]] },
  { id: "c2", x: 900, y: 210, label: "Retailer Y", label2: "€120k", t: "customer", coso: "Compliance", source: "external",
    summary: "Customer · promotional window weeks T+3–T+5.", evarM: 0.12, conf: 74, ttImpact: "+13d",
    why: "Promotional load lands inside the current exposure window.",
    recommendation: "Confirm promo volumes are within Line 2 capacity",
    stats: [["OTIF commitment", "94%"], ["Promo load", "Weeks T+3–T+5"], ["Fed by", "Line 2"]] },
  { id: "c3", x: 900, y: 330, label: "FMCG Z", label2: "€50k", t: "customer", coso: "Compliance", source: "external",
    summary: "Customer · key account, seasonal volume commitment.", evarM: 0.05, conf: 70, ttImpact: "+13d",
    why: "Smallest exposure on this path — low priority for mitigation.",
    recommendation: "No action required",
    stats: [["OTIF commitment", "92%"], ["Commitment", "Seasonal volume"], ["Fed by", "Line 3"]] },
  { id: "c4", x: 900, y: 450, label: "Distributor W", label2: "€80k", t: "customer", coso: "Compliance", source: "external",
    summary: "Customer · distributor, flexible delivery window.", evarM: 0.08, conf: 72, ttImpact: "+13d",
    why: "Flexible window absorbs minor schedule shifts without penalty.",
    recommendation: "No action required",
    stats: [["OTIF commitment", "90%"], ["Window", "Flexible"], ["Fed by", "Line 3"]] },
];
const HOTPATH = new Set([
  "sig1-cocoa","sig2-cocoa","sig3-cocoa",
  "cocoa-r1","cocoa-r2","cocoa-r3",
  "r1-sku1","r2-sku2","r3-sku3",
  "sku1-l1","sku2-l1","l1-c1","l1-c2",
]);

const EDGES = [
  { a: "sig1", b: "cocoa", label: "signal", w: 4, depth: 0 },
  { a: "sig2", b: "cocoa", label: "signal", w: 4, depth: 0 },
  { a: "sig3", b: "cocoa", label: "signal", w: 3.5, depth: 0 },
  { a: "sig4", b: "l1", label: "+8d lead", w: 2, depth: 3, hot: false },
  { a: "cocoa", b: "r1", label: "210 t/wk", w: 4, depth: 1 },
  { a: "cocoa", b: "r2", label: "180 t/wk", w: 3.4, depth: 1 },
  { a: "cocoa", b: "r3", label: "90 t/wk", w: 2.8, depth: 1 },
  { a: "energy", b: "l2", label: "cost", w: 1.5, depth: 3, hot: false },
  { a: "r1", b: "sku1", label: "4 SKUs", w: 3.4, depth: 2 },
  { a: "r2", b: "sku2", label: "4 SKUs", w: 2.8, depth: 2 },
  { a: "r3", b: "sku3", label: "3 SKUs", w: 2.2, depth: 2 },
  { a: "sku1", b: "l1", label: "62 t/wk", w: 3.4, depth: 3 },
  { a: "sku2", b: "l1", label: "26 t/wk", w: 2.2, depth: 3 },
  { a: "sku2", b: "l2", label: "22 t/wk", w: 2, depth: 3 },
  { a: "sku3", b: "l2", label: "31 t/wk", w: 2, depth: 3 },
  { a: "l1", b: "c1", label: "OTIF 95%", w: 2.8, depth: 4 },
  { a: "l1", b: "c2", label: "OTIF 94%", w: 2.2, depth: 4 },
  { a: "l2", b: "c3", label: "OTIF 92%", w: 1.2, depth: 4 },
  { a: "l2", b: "c4", label: "OTIF 90%", w: 1.6, depth: 4 },
];
const NODE_MAP = Object.fromEntries(NODES.map((n) => [n.id, n]));
const HOTNODES = new Set(NODES.filter((n) => n.hot !== false).map((n) => n.id));
const TIME_LABELS = [
  { t: "Now", x: 60 }, { t: "+2d", x: 250 }, { t: "+4d", x: 430 }, { t: "+8d", x: 600 }, { t: "+13d", x: 825 },
];
const downstreamEvar = (id) => {
  let total = 0; const seen = new Set();
  const walk = (nid) => { EDGES.forEach((e) => { if (e.a === nid && !seen.has(e.b)) { seen.add(e.b); const n = NODE_MAP[e.b]; if (n.evarM) total += n.evarM; walk(e.b); } }); };
  walk(id); return Math.round(total * 100) / 100;
};
const rOf = (n) => (n.evarM ? Math.min(34, 9 + Math.sqrt(n.evarM) * 21) : 9);
const NODE_COLORS = { signal: C.dark, commodity: C.core, recipe: C.deep, sku: "#8B6BB8", line: "#3D3D4E", customer: "#6E6E7A" };

function RiskMap({ pathActive }) {
  const [sel, setSel] = useState("cocoa");
  const [coso, setCoso] = useState(null);
  const [sourceFilter, setSourceFilter] = useState(null);
  const [view, setView] = useState("graph");
  const [infoOpen, setInfoOpen] = useState(false);
  const [regSel, setRegSel] = useState(null);
  const nm = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const selNode = nm[sel];
  const TYPE_LABEL = { signal: "signal", commodity: "commodity", recipe: "recipe", sku: "SKU cluster", line: "line", customer: "customer" };
  const outbound = EDGES.filter((e) => e[0] === sel).map((e) => ({ node: nm[e[1]], w: e[2] }));
  const inbound = EDGES.filter((e) => e[1] === sel).map((e) => ({ node: nm[e[0]], w: e[2] }));
  const onPath = pathActive && HOTNODES.has(sel);

  const Sidebar = (
    <div style={{ width: 200, flexShrink: 0 }}>
      <SectionLabel>COSO ERM lens</SectionLabel>
      {["Strategic", "Operational", "Financial", "Compliance"].map((c) => (
        <button key={c} onClick={() => setCoso(coso === c ? null : c)}
          style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 6, padding: "7px 10px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${coso === c ? C.core : C.line}`, background: coso === c ? C.purpBg : C.bg, color: coso === c ? C.deep : C.ink }}>{c}</button>
      ))}
      <div style={{ marginTop: 14 }}>
        <SectionLabel>Risk source</SectionLabel>
        {["external", "internal"].map((s) => (
          <button key={s} onClick={() => setSourceFilter(sourceFilter === s ? null : s)}
            style={{ display: "inline-block", marginRight: 6, marginBottom: 6, padding: "6px 11px", borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${sourceFilter === s ? C.core : C.line}`, background: sourceFilter === s ? C.purpBg : C.bg, color: sourceFilter === s ? C.deep : C.ink, textTransform: "capitalize" }}>{s}</button>
        ))}
      </div>
      <button onClick={() => setInfoOpen(!infoOpen)} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: FONT, color: C.deep, fontSize: 11.5, fontWeight: 700, padding: 0 }}>
        <Info size={13} /> {infoOpen ? "Hide" : "What is COSO ERM 2017?"}
      </button>
      {infoOpen && (
        <div style={{ marginTop: 8, padding: 10, background: C.faint, borderRadius: 8, fontSize: 11, color: C.soft, lineHeight: 1.55 }}>
          COSO ERM (2017) has five components. CocoaRisk's <b>Performance</b> component is what these two views implement: <i>identify</i> risk (propagation graph, Principle 10) and <i>assess severity</i> (likelihood × impact register, Principle 11). The four categories on the left are COSO's objective categories; "source" reflects whether a risk originates outside the company (market, weather, freight, FX, demand) or from its own positions (cover, supplier mix, hedging, capacity) — the same split used in the Scenario Room.
        </div>
      )}
      {view === "graph" && (
        <div style={{ marginTop: 18 }}>
          <SectionLabel>Legend</SectionLabel>
          {Object.entries(NODE_COLORS).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.soft, marginBottom: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: v }} /> {k}
            </div>
          ))}
          <div style={{ fontSize: 11, color: C.soft, marginTop: 8 }}>Edge thickness = volume · purple flow = active propagation</div>
        </div>
      )}
    </div>
  );

  const ViewToggle = (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <button onClick={() => setView("graph")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${view === "graph" ? C.core : C.line}`, background: view === "graph" ? C.purpBg : C.bg, color: view === "graph" ? C.deep : C.ink }}>
        <Map size={14} /> Propagation map
      </button>
      <button onClick={() => setView("register")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${view === "register" ? C.core : C.line}`, background: view === "register" ? C.purpBg : C.bg, color: view === "register" ? C.deep : C.ink }}>
        <Table2 size={14} /> Risk register
      </button>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 11.5, color: C.soft, alignSelf: "center" }}>
        {view === "graph" ? "Principle 10 — risk identification" : "Principle 11 — severity assessment"}
      </div>
    </div>
  );

  if (view === "graph") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {ViewToggle}
        <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
          {Sidebar}
          <Card style={{ flex: 1, padding: 8, position: "relative", overflow: "hidden" }}>
            <svg viewBox="0 0 980 540" style={{ width: "100%", height: "100%" }}>
              <style>{`@keyframes dashflow { to { stroke-dashoffset: -22; } }`}</style>
              {EDGES.map((edge) => {
                const { a, b } = edge;
                const A = nm[a], B = nm[b];
                if (!A || !B) return null;
                const hot = pathActive && HOTPATH.has(`${a}-${b}`);
                const dim = (coso && !(A.coso === coso || B.coso === coso)) || (sourceFilter && !(A.source === sourceFilter || B.source === sourceFilter));
                                    return (
                  <g key={`${a}-${b}`} opacity={dim ? 0.12 : 1}>
                    <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={hot ? C.core : C.line} strokeWidth={hot ? 2.5 : 1.5} />
                    {hot && <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={C.core} strokeWidth={2.5} strokeDasharray="4 18" style={{ animation: "dashflow 1.1s linear infinite" }} />}
                  </g>
                );
              })}
              {NODES.map((n) => {
                const hot = pathActive && HOTNODES.has(n.id);
                const dim = (coso && n.coso !== coso) || (sourceFilter && n.source !== sourceFilter);
                return (
                  <g key={n.id} onClick={() => setSel(n.id)} style={{ cursor: "pointer" }} opacity={dim ? 0.15 : 1}>
                    {hot && <circle cx={n.x} cy={n.y} r={n.id === "cocoa" ? 26 : 18} fill={C.core} opacity={0.14} />}
                    <circle cx={n.x} cy={n.y} r={n.id === "cocoa" ? 16 : 11} fill={NODE_COLORS[n.t]} stroke={sel === n.id ? C.core : "#fff"} strokeWidth={sel === n.id ? 3 : 2} />
                    <text x={n.x} y={n.y + (n.id === "cocoa" ? 32 : 26)} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={C.ink} fontFamily={FONT}>{n.label}</text>
                  </g>
                );
              })}
            </svg>
            <div style={{ position: "absolute", bottom: 10, left: 14, fontSize: 11.5, color: C.soft, fontStyle: "italic" }}>
              This is the model itself, not an illustration of it — the quantification engine prices exposure by walking these edges. Dashed ring = external-source node.
            </div>
          </Card>
          <Card style={{ width: 268, flexShrink: 0, padding: 16, overflowY: "auto" }}>
            <SectionLabel>Node detail</SectionLabel>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 7 }}>{selNode.label}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <Pill tone="purple">{selNode.coso}</Pill>
              <Pill tone="grey">{TYPE_LABEL[selNode.t]}</Pill>
              <Pill tone={selNode.source === "external" ? "amber" : "green"} style={{ textTransform: "capitalize" }}>{selNode.source}</Pill>
            </div>
            <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.55, marginBottom: 12 }}>{selNode.summary}</div>
            {onPath && (
              <div style={{ display: "flex", gap: 7, alignItems: "flex-start", padding: "8px 10px", background: C.purpBg, borderRadius: 8, marginBottom: 12 }}>
                <Zap size={13} color={C.core} style={{ marginTop: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, color: C.deep, lineHeight: 1.45 }}>On the live propagation path — contributes to the current €2.8M Enterprise EVaR.</span>
              </div>
            )}
            {selNode.stats && (
              <div style={{ padding: 12, background: C.faint, borderRadius: 8, fontSize: 12.5, marginBottom: 12 }}>
                {selNode.stats.map(([k, v], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingBottom: i < selNode.stats.length - 1 ? 8 : 0, marginBottom: i < selNode.stats.length - 1 ? 8 : 0, borderBottom: i < selNode.stats.length - 1 ? `1px solid ${C.line}` : "none" }}>
                    <span style={{ color: C.soft, flexShrink: 0 }}>{k}</span>
                    <b style={{ textAlign: "right", color: /EVaR|risk/i.test(k) ? C.red : C.ink, ...NUM }}>{v}</b>
                  </div>
                ))}
              </div>
            )}
            {selNode.reach && (
              <div style={{ fontSize: 12, color: C.deep, fontWeight: 600, lineHeight: 1.6, marginBottom: 14 }}>{selNode.reach}</div>
            )}
            {(inbound.length > 0 || outbound.length > 0) && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase", color: C.soft, marginBottom: 10 }}>Edges walked by the engine</div>
                {inbound.map((c, i) => (
                  <div key={`in${i}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 8 }}>
                    <span style={{ color: C.soft }}>{c.node.label}</span>
                    <span style={{ color: C.core, fontWeight: 700, fontSize: 14 }}>→</span>
                    <span style={{ fontWeight: 700, color: C.ink }}>this</span>
                  </div>
                ))}
                {outbound.map((c, i) => (
                  <div key={`out${i}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, color: C.ink }}>this</span>
                    <span style={{ color: C.core, fontWeight: 700, fontSize: 14 }}>→</span>
                    <span style={{ color: C.soft }}>{c.node.label}</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: C.soft, marginTop: 10, fontStyle: "italic", lineHeight: 1.55 }}>
                  Edge weights are the quantified attributes the engine multiplies along the path.{" "}
                  <span style={{ fontStyle: "normal", display: "inline-block", marginTop: 4 }}><Pill tone="grey" style={{ fontSize: 9.5 }}>simulated</Pill></span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  const filtered = RISK_REGISTER.filter((r) => (!coso || r.cat === coso) && (!sourceFilter || r.source === sourceFilter));
  const impactMax = 1.6;
  const sevTone = (l, im) => { const s = l + (im / impactMax) * 5; return s >= 7 ? C.red : s >= 4.5 ? C.amber : C.green; };
  const selRisk = filtered.find((r) => r.id === regSel) || filtered[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {ViewToggle}
      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        {Sidebar}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
          <Card style={{ padding: 16 }}>
            <SectionLabel>Severity heat map — likelihood × impact (Principle 11)</SectionLabel>
            <svg viewBox="0 0 560 280" style={{ width: "100%", maxWidth: 560, height: 230 }}>
              {[0, 1, 2, 3, 4].map((cx) => [0, 1, 2, 3, 4].map((cy) => {
                const im = (cx + 0.5) / 5 * impactMax, lk = cy + 1;
                return <rect key={`${cx}-${cy}`} x={40 + cx * 96} y={230 - (cy + 1) * 42} width={94} height={40} fill={sevTone(lk, im)} opacity={0.14} />;
              }))}
              {[1, 2, 3, 4, 5].map((l) => <text key={l} x={30} y={230 - l * 42 + 22} textAnchor="end" fontSize="11" fill={C.soft} fontFamily={FONT}>{l}</text>)}
              {[0, 1, 2, 3, 4].map((cx) => <text key={cx} x={40 + cx * 96 + 47} y={246} textAnchor="middle" fontSize="10.5" fill={C.soft} fontFamily={FONT}>€{((cx + 1) / 5 * impactMax).toFixed(1)}M</text>)}
              <text x={295} y={266} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.soft} fontFamily={FONT}>Impact (domain EVaR, €M)</text>
              <text x={14} y={120} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.soft} fontFamily={FONT} transform="rotate(-90 14 120)">Likelihood</text>
              {filtered.map((r) => {
                const x = 40 + Math.min(4, r.impact / impactMax * 5) * 96 + 47;
                const y = 230 - r.likelihood * 42 + 21;
                const on = selRisk?.id === r.id;
                return (
                  <g key={r.id} onClick={() => setRegSel(r.id)} style={{ cursor: "pointer" }}>
                    <circle cx={x} cy={y} r={on ? 9 : 6.5} fill={r.source === "external" ? C.core : C.deep} stroke="#fff" strokeWidth={2} />
                    {on && <text x={x} y={y - 12} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.ink} fontFamily={FONT}>#{r.id}</text>}
                  </g>
                );
              })}
            </svg>
            <div style={{ display: "flex", gap: 16, fontSize: 11, color: C.soft, marginTop: 4 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 99, background: C.core }} /> external</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 99, background: C.deep }} /> internal</span>
              <span>Cell shading = severity zone (green → amber → red)</span>
            </div>
          </Card>
          <Card style={{ padding: 0, overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead><tr style={{ background: C.dark, color: "#fff" }}>
                  {["#", "Risk", "COSO category", "Source", "Likelihood", "Impact (EVaR)", "Velocity", "Response", "Owner"].map((h) => <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, fontSize: 11 }}>{h}</th>)}
                </tr></thead>
                <tbody>{filtered.map((r) => (
                  <tr key={r.id} onClick={() => setRegSel(r.id)} style={{ borderTop: `1px solid ${C.line}`, background: selRisk?.id === r.id ? C.purpBg : C.bg, cursor: "pointer" }}>
                    <td style={{ padding: "9px 12px", fontWeight: 700, ...NUM }}>{r.id}</td>
                    <td style={{ padding: "9px 12px", fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: "9px 12px" }}><Pill tone="purple">{r.cat}</Pill></td>
                    <td style={{ padding: "9px 12px" }}><Pill tone={r.source === "external" ? "amber" : "green"} style={{ textTransform: "capitalize" }}>{r.source}</Pill></td>
                    <td style={{ padding: "9px 12px" }}>{"●".repeat(r.likelihood)}<span style={{ color: C.line }}>{"●".repeat(5 - r.likelihood)}</span></td>
                    <td style={{ padding: "9px 12px", fontWeight: 700, color: sevTone(r.likelihood, r.impact), ...NUM }}>€{r.impact.toFixed(2)}M</td>
                    <td style={{ padding: "9px 12px", color: C.soft }}>{r.velocity}</td>
                    <td style={{ padding: "9px 12px", color: C.soft }}>{r.response}</td>
                    <td style={{ padding: "9px 12px", color: C.soft }}>{r.owner}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div style={{ padding: "10px 14px", fontSize: 11, color: C.soft, borderTop: `1px solid ${C.line}` }}>
              10 risks identified across the 4 MVP domains · {RISK_REGISTER.filter((r) => r.source === "external").length} external / {RISK_REGISTER.filter((r) => r.source === "internal").length} internal · sums to the €2.8M Enterprise EVaR via the propagation graph, not by simple addition.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============ WATERFALL ============ */
function Waterfall() {
  const W = 760, H = 240, max = 3.0, x0 = 70, bw = 86, gap = 28;
  const y = (v) => 200 - (v / max) * 170;
  let cur = K.evar;
  const steps = K.actions.map((a, i) => { const top = cur; cur -= a.drop; return { ...a, top, bot: cur, i }; });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
      {[0, 1, 2, 3].map((g) => <line key={g} x1={40} x2={W - 10} y1={y(g)} y2={y(g)} stroke={C.line} strokeWidth={1} />)}
      {[0, 1, 2, 3].map((g) => <text key={g} x={34} y={y(g) + 4} fontSize="10.5" fill={C.soft} textAnchor="end" fontFamily={FONT}>€{g}M</text>)}
      <rect x={x0} y={y(K.evar)} width={bw} height={200 - y(K.evar)} fill={C.dark} rx={3} />
      <text x={x0 + bw / 2} y={y(K.evar) - 8} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink} fontFamily={FONT}>€2.8M</text>
      <text x={x0 + bw / 2} y={216} textAnchor="middle" fontSize="10.5" fill={C.soft} fontFamily={FONT}>Current EVaR</text>
      {steps.map((s) => {
        const x = x0 + (s.i + 1) * (bw + gap);
        return (
          <g key={s.i}>
            <line x1={x - gap} y1={y(s.top)} x2={x} y2={y(s.top)} stroke={C.soft} strokeDasharray="3 3" strokeWidth={1} />
            <rect x={x} y={y(s.top)} width={bw} height={y(s.bot) - y(s.top)} fill={C.core} rx={3} opacity={0.85} />
            <text x={x + bw / 2} y={y(s.top) - 8} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.deep} fontFamily={FONT}>−€{s.drop.toFixed(2)}M</text>
            <text x={x + bw / 2} y={216} textAnchor="middle" fontSize="10" fill={C.soft} fontFamily={FONT}>{s.a.split(" ").slice(0, 2).join(" ")}</text>
            <text x={x + bw / 2} y={228} textAnchor="middle" fontSize="9.5" fill={C.soft} fontFamily={FONT}>€{s.cost}k · {s.conf}%</text>
          </g>
        );
      })}
      {(() => { const x = x0 + 5 * (bw + gap); return (
        <g>
          <line x1={x - gap} y1={y(K.evarAfter)} x2={x} y2={y(K.evarAfter)} stroke={C.soft} strokeDasharray="3 3" strokeWidth={1} />
          <rect x={x} y={y(K.evarAfter)} width={bw} height={200 - y(K.evarAfter)} fill={C.green} rx={3} />
          <text x={x + bw / 2} y={y(K.evarAfter) - 8} textAnchor="middle" fontSize="13" fontWeight="700" fill={C.green} fontFamily={FONT}>€1.2M</text>
          <text x={x + bw / 2} y={216} textAnchor="middle" fontSize="10.5" fill={C.soft} fontFamily={FONT}>Residual (−57%)</text>
        </g>); })()}
    </svg>
  );
}

/* ============ OPPORTUNITY CHART (Packet #25) ============ */
function OpportunityChart() {
  const W = 480, H = 200, max = 0.16, x0 = 50, bw = 110, gap = 40;
  const y = (v) => 170 - (v / max) * 140;
  const bars = [
    { label: "Margin secured", v: 0.14, top: 0.14, bot: 0, color: C.green },
    { label: "Execution cost", v: -0.055, top: 0.14, bot: 0.085, color: C.red },
    { label: "Net value", v: 0.085, top: 0.085, bot: 0, color: C.deep },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 480 }}>
      {[0, 0.05, 0.10, 0.15].map((g) => <line key={g} x1={36} x2={W - 6} y1={y(g)} y2={y(g)} stroke={C.line} strokeWidth={1} />)}
      {[0, 0.05, 0.10, 0.15].map((g) => <text key={g} x={30} y={y(g) + 4} fontSize="10.5" fill={C.soft} textAnchor="end" fontFamily={FONT}>€{g.toFixed(2)}M</text>)}
      {bars.map((b, i) => {
        const x = x0 + i * (bw + gap);
        return (
          <g key={i}>
            <rect x={x} y={y(b.top)} width={bw} height={Math.max(2, y(b.bot) - y(b.top))} fill={b.color} rx={3} opacity={0.88} />
            <text x={x + bw / 2} y={y(b.top) - 8} textAnchor="middle" fontSize="13" fontWeight="800" fill={b.color} fontFamily={FONT}>{b.v >= 0 ? "+" : ""}€{b.v.toFixed(2)}M</text>
            <text x={x + bw / 2} y={186} textAnchor="middle" fontSize="10.5" fill={C.soft} fontFamily={FONT}>{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ============ MAIN APP ============ */
export default function FactoryMindDemo() {
  const [landing, setLanding] = useState(true);
  const [screen, setScreen] = useState("control");
  const [deptTab, setDeptTab] = useState("procurement");
  const [auditTab, setAuditTab] = useState("trail");
  const [feedOpen, setFeedOpen] = useState(false);
  const [feed, setFeed] = useState([]);
  const [episode, setEpisode] = useState("idle");
  const [packetReady, setPacketReady] = useState(false);
  const [approved, setApproved] = useState(false);
  const [approved25, setApproved25] = useState(false);
  const [selPacket, setSelPacket] = useState(24);
  const [evar, setEvar] = useState(K.evar);
  const [ees, setEes] = useState(K.ees);
  const [procState, setProcState] = useState("High-Risk");
  const [mapHot, setMapHot] = useState(false);
  const [toast, setToast] = useState(null);
  const [secs, setSecs] = useState(14);
  const [whyOpen, setWhyOpen] = useState(false);
  const [confOpen, setConfOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [trail, setTrail] = useState(AUDIT_SEED);
  const [mcBusy, setMcBusy] = useState(false);
  const [chartAnimated, setChartAnimated] = useState(false);
  const [topTab, setTopTab] = useState("external");
  const [reportOpen, setReportOpen] = useState(false);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMsgs, setAssistantMsgs] = useState([{ role: "ai", text: "Hi, I'm the FactoryMind assistant. Ask me about Enterprise EVaR, the Risk Map, or pending Decision Packets." }]);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantBusy, setAssistantBusy] = useState(false);

  const [activeVars, setActiveVars] = useState(() => Object.fromEntries(VARIABLES.map((v) => [v.id, DEFAULT_ACTIVE.includes(v.id)])));
  const [varVals, setVarVals] = useState(() => Object.fromEntries(VARIABLES.map((v) => [v.id, 0])));
  const [selectedActions, setSelectedActions] = useState(() => new Set());

  const timers = useRef([]);
  const feedRef = useRef(null);
  const assistantRef = useRef(null);

  const pushFeed = useCallback((e) => {
    setFeed((f) => [...f.slice(-40), { ...e, key: Date.now() + Math.random() }]);
  }, []);

  useEffect(() => {
    const hb = setInterval(() => {
      const a = AMBIENT[Math.floor(Math.random() * AMBIENT.length)];
      const now = new Date();
      pushFeed({ who: a.who, kind: a.kind, ts: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, msg: a.msg() });
      setSecs(0);
    }, 11000);
    const tick = setInterval(() => setSecs((s) => s + 1), 1000);
    const drift = setInterval(() => setEvar((v) => (approved ? v : Math.round((K.evar + (Math.random() - 0.5) * 0.04) * 100) / 100)), 6000);
    return () => { clearInterval(hb); clearInterval(tick); clearInterval(drift); };
  }, [pushFeed, approved]);

  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [feed]);
  useEffect(() => { if (assistantRef.current) assistantRef.current.scrollTop = assistantRef.current.scrollHeight; }, [assistantMsgs, assistantOpen]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const showToast = (msg) => { setToast(msg); timers.current.push(setTimeout(() => setToast(null), 4200)); };

  const runEpisode = () => {
    if (episode === "running") return;
    setEpisode("running"); setFeedOpen(true); setPacketReady(false); setApproved(false);
    setEvar(K.evar); setEes(K.ees); setMapHot(false);
    const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    EPISODE.forEach((s, i) => {
      timers.current.push(setTimeout(() => {
        pushFeed(s);
        if (s.fx === "procHigh") setProcState("High-Risk");
        if (s.fx === "mapPath") setMapHot(true);
        if (s.fx === "packet") { setPacketReady(true); setEpisode("done"); showToast("Decision Packet #24 ready — Operations Director approval required"); }
      }, reduced ? 150 * (i + 1) : s.t));
    });
  };

  const approve = () => {
    if (approved) return;
    setApproved(true);
    showToast("Packet #24 approved · logged to immutable audit trail");
    const now = new Date();
    setTrail((t) => [{ id: 24, title: "Cocoa supply shock — advance purchase + hedge", ts: `Live · ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, approver: "Operations Director", before: 2.8, after: 1.2, outcome: "Outcome validation scheduled T+4 weeks", status: "passed", ref: "AUD-24-0093" }, ...t]);
    pushFeed({ who: "Audit trail", kind: "det", ts: "now", msg: "Packet #24 approved by Operations Director — signal snapshot, simulation outputs, rationale and approver identity logged (immutable)" });
    let step = 0;
    const anim = setInterval(() => {
      step++;
      setEvar((v) => Math.max(K.evarAfter, Math.round((K.evar - (K.evar - K.evarAfter) * (step / 24)) * 100) / 100));
      setEes((v) => Math.max(K.eesAfter, Math.round(K.ees - (K.ees - K.eesAfter) * (step / 24))));
      if (step >= 24) clearInterval(anim);
    }, 110);
    timers.current.push(anim);
  };

  const approve25 = () => {
    if (approved25) return;
    setApproved25(true);
    showToast("Packet #25 approved · margin capture €140k scheduled");
    const now = new Date();
    setTrail((t) => [{ id: 25, title: "Buying window — advance 200t cocoa", ts: `Live · ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, approver: "Operations Lead", before: 0.14, after: null, outcome: "Margin capture €140k scheduled for realization T+4", status: "passed", ref: "AUD-25-0094" }, ...t]);
    pushFeed({ who: "Audit trail", kind: "det", ts: "now", msg: "Packet #25 approved by Operations Lead — opportunity logged to immutable audit trail" });
  };

  const askAnalyst = () => {
    if (chatBusy) return;
    setChatBusy(true);
    setChat((c) => [...c, { role: "user", text: "What if we wait two weeks before buying?" }]);
    pushFeed({ who: "Monte Carlo Engine", kind: "det", ts: "now", msg: "Re-run requested by analyst tool-call: 10,000 paths · scenario: delay purchase 2 weeks" });
    const answer = "Waiting two weeks raises projected EVaR from €1.2M to €2.6M and stockout probability from 7% to 24%, reducing expected value protected by €1.1M. The forward-cover window narrows below the 30-day policy minimum in week 2. Recommendation unchanged: approve Option D now.";
    timers.current.push(setTimeout(() => {
      setChat((c) => [...c, { role: "ai", text: "", full: answer }]);
      let i = 0;
      const typer = setInterval(() => {
        i += 3;
        setChat((c) => { const cc = [...c]; const last = cc[cc.length - 1]; cc[cc.length - 1] = { ...last, text: answer.slice(0, i) }; return cc; });
        if (i >= answer.length) { clearInterval(typer); setChatBusy(false); }
      }, 28);
      timers.current.push(typer);
    }, 1600));
  };

  const runMC = () => { setMcBusy(true); timers.current.push(setTimeout(() => setMcBusy(false), 1400)); };

  const assistantReply = (text) => {
    const t = text.toLowerCase();
    if (t.includes("evar") || t.includes("exposure") || t.includes("ees"))
      return `Enterprise EVaR is currently €${evar.toFixed(1)}M (EES ${ees}/100). Open the Risk Map to see which signals are driving it.`;
    if (t.includes("packet") || t.includes("approv"))
      return `2 packets this cycle: #24 (cocoa supply shock, ${approved ? "approved" : "pending Operations Director"}) and #25 (buying window, ${approved25 ? "approved" : "pending Operations Lead"}). Open Decision Packets to review.`;
    if (t.includes("cocoa"))
      return "Cocoa is +18% MoM (z-score +2.3), with cover at 18 days vs. a 30-day policy minimum — the dominant driver of this cycle's exposure.";
    if (t.includes("report"))
      return "Each of the 4 MVP domains — Procurement, Production, Logistics, Commercial — has a one-page report under Department Reports → Generate report.";
    if (t.includes("scenario") || t.includes("what if"))
      return "The Scenario Room lets you toggle external factors (cocoa, demand, lead-time, energy, FX) and internal factors (cover, supplier concentration, hedge ratio, OEE) and see EVaR, EES and the response portfolio update live.";
    return "I can help with Enterprise EVaR, the Risk Map, Decision Packets, Department Reports, or the Scenario Room — what would you like to check?";
  };
  const sendAssistant = () => {
    const text = assistantInput.trim();
    if (!text || assistantBusy) return;
    setAssistantMsgs((m) => [...m, { role: "user", text }]);
    setAssistantInput("");
    setAssistantBusy(true);
    timers.current.push(setTimeout(() => {
      setAssistantMsgs((m) => [...m, { role: "ai", text: assistantReply(text) }]);
      setAssistantBusy(false);
    }, 700));
  };

  const sEvar = Math.round(Math.min(6, K.evar * (1 + VARIABLES.reduce((acc, v) => acc + (activeVars[v.id] ? varVals[v.id] * v.weight : 0), 0))) * 100) / 100;
  const sEes = Math.min(100, Math.round((sEvar / 4.0) * 100));

  const availableActions = ACTION_POOL.filter((a) => activeVars[a.varId]);
  const dropFor = (a) => {
    const v = VARMAP[a.varId];
    return Math.round(a.maxDrop * (varVals[a.varId] / v.max) * 100) / 100;
  };
  const selectedList = availableActions.filter((a) => selectedActions.has(a.id));
  const totalDrop = selectedList.reduce((acc, a) => acc + dropFor(a), 0);
  const totalCost = selectedList.reduce((acc, a) => acc + a.cost, 0);
  const customEvar = Math.max(0.3, Math.round((sEvar - totalDrop) * 100) / 100);
  const valueProtected = Math.round((sEvar - customEvar) * 100) / 100;
  const confidence = selectedList.length ? Math.round(selectedList.reduce((acc, a) => acc + a.conf, 0) / selectedList.length) : K.confidence;

  const bandData = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8, base = K.evar + (sEvar - K.evar) * t;
    return { w: `T+${i}`, band: [Math.round(base * 0.62 * 100) / 100, Math.round(base * 1.45 * 100) / 100], p50: Math.round(base * 100) / 100, baseline: Math.round((K.evar * (1 + 0.05 * t)) * 100) / 100 };
  });

  const toggleVar = (id) => {
    setActiveVars((a) => {
      const next = { ...a, [id]: !a[id] };
      if (!next[id]) {
        setVarVals((vv) => ({ ...vv, [id]: 0 }));
        setSelectedActions((sa) => { const ns = new Set(sa); ACTION_POOL.filter((act) => act.varId === id).forEach((act) => ns.delete(act.id)); return ns; });
      }
      return next;
    });
  };
  const setVar = (id, val) => setVarVals((vv) => ({ ...vv, [id]: val }));
  const toggleAction = (id) => setSelectedActions((sa) => { const ns = new Set(sa); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });
  const applyPreset = (name) => {
    const p = PRESETS[name];
    setActiveVars((a) => { const next = { ...a }; VARIABLES.forEach((v) => { next[v.id] = p.active.includes(v.id); }); return next; });
    setVarVals((vv) => { const next = { ...vv }; VARIABLES.forEach((v) => { next[v.id] = p.active.includes(v.id) ? (p.vals[v.id] ?? 0) : 0; }); return next; });
    setSelectedActions(new Set());
    runMC();
  };

  const clockStr = (() => { const d = new Date(); return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); })();

  if (landing) {
    return (
      <div style={{ fontFamily: FONT, minHeight: "100vh", background: C.bg, color: C.ink, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.dark}, ${C.core})` }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 8vw", maxWidth: 1100 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <Pill tone="purple">Live demo · synthetic operating data</Pill>
            <Pill tone="grey">LUISS · Accenture Challenge 2026</Pill>
          </div>
          <div style={{ fontSize: "clamp(40px, 6.2vw, 76px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.04 }}>
            Enterprise exposure<br />is invisible.<br /><span style={{ color: C.core }}>We make it a decision.</span>
          </div>
          <div style={{ fontSize: 17, color: C.soft, marginTop: 26, maxWidth: 560, lineHeight: 1.6 }}>
            FactoryMind reads every signal that moves a manufacturer — cocoa, weather, freight, demand — quantifies the exposure in euros, simulates the alternatives, and delivers one governed decision for a human to approve.
          </div>
          <div style={{ marginTop: 38, display: "flex", gap: 14, alignItems: "center" }}>
            <button onClick={() => setLanding(false)} style={{ background: C.core, color: "#fff", border: "none", padding: "14px 26px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 800 }}>&gt;</span> Open the platform
            </button>
            <span style={{ fontSize: 13, color: C.soft }}>CocoaRisk — first FactoryMind implementation</span>
          </div>
        </div>
        <div style={{ padding: "18px 8vw", borderTop: `1px solid ${C.line}`, fontSize: 12, color: C.soft, display: "flex", justifyContent: "space-between" }}>
          <span>Academic project — LUISS Business School · strategy report for Accenture</span>
          <span>FactoryMind <b style={{ color: C.core }}>&gt;</b> CocoaRisk</span>
        </div>
      </div>
    );
  }

  const NAV = [
    ["control", "Control Center", LayoutGrid],
    ["map", "Risk Map", GitBranch],
    ["scenario", "Scenario Room", FlaskConical],
    ["packet", "Decision Packets", FileCheck2],
    ["dept", "Department Reports", Building2],
    ["audit", "Audit & Governance", ShieldCheck],
  ];

  const ControlCenter = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1.2fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 18 }} onClick={() => setScreen("map")}>
          <SectionLabel>Enterprise Exposure Score</SectionLabel>
          <Gauge value={ees} />
          <div style={{ fontSize: 11, color: C.soft, textAlign: "center", marginTop: 10 }}>Click → Risk Map, filtered to the active signal</div>
        </Card>
        <Card style={{ padding: 18 }}>
          <SectionLabel>Enterprise Value at Risk</SectionLabel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 46, fontWeight: 800, letterSpacing: -2, color: approved ? C.green : C.ink, transition: "color .6s", ...NUM }}>€{evar.toFixed(1)}M</span>
            {approved
              ? <Pill tone="green">−57% · portfolio executed</Pill>
              : <Pill tone="red">▲ +27% over 8 weeks</Pill>}
          </div>
          <div style={{ height: 110, marginTop: 6 }}>
            <ResponsiveContainer>
              <AreaChart data={approved ? [...TREND, { w: "Now", evar: K.evarAfter }] : TREND} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis dataKey="w" tick={{ fontSize: 10, fill: C.soft }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.soft }} axisLine={false} tickLine={false} domain={[0, 3.5]} />
                <Tooltip formatter={(v) => [`€${v}M`, "EVaR"]} contentStyle={{ fontSize: 12, fontFamily: FONT, border: `1px solid ${C.line}`, borderRadius: 8 }} />
                <Area dataKey="evar" stroke={C.core} strokeWidth={2.2} fill={C.core} fillOpacity={0.08} type="monotone" isAnimationActive={!chartAnimated} onAnimationEnd={() => setChartAnimated(true)} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: 11.5, color: C.soft }}>Weekly purchasing exposure on cocoa alone: <b style={NUM}>€{K.weeklyExposure}M</b> (~{K.tonnes} t/week)</div>
        </Card>
        <Card style={{ padding: 18 }}>
          <SectionLabel>Top risks & opportunities</SectionLabel>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {TOP_TABS.map((tb) => (
              <button key={tb.id} onClick={() => setTopTab(tb.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${topTab === tb.id ? C.core : C.line}`, background: topTab === tb.id ? C.purpBg : C.bg, color: topTab === tb.id ? C.deep : C.ink }}>
                <tb.icon size={12} color={topTab === tb.id ? C.deep : C.soft} /> {tb.label}
              </button>
            ))}
          </div>
          {TOP_ITEMS[topTab].map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", borderBottom: i < TOP_ITEMS[topTab].length - 1 ? `1px solid ${C.line}` : "none" }}>
              {topTab === "opp" ? <Zap size={15} color={C.green} style={{ marginTop: 2, flexShrink: 0 }} /> : <AlertTriangle size={15} color={topTab === "external" ? C.red : C.amber} style={{ marginTop: 2, flexShrink: 0 }} />}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{it.h}</div>
                <div style={{ fontSize: 11.5, color: C.soft }}>{it.s}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <SectionLabel>Domain exposure — 4 MVP areas</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
        {K.domains.map((d) => {
          const st = d.id === "procurement" ? procState : d.state;
          const Icon = d.icon;
          return (
            <Card key={d.id} style={{ padding: 16 }} onClick={() => { setDeptTab(d.id); setScreen("dept"); }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: C.purpBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={15} color={C.deep} />
                  </span>
                  {d.name}
                </span>
                <Pill tone={stateTone(st)}>{st}</Pill>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, ...NUM }}>€{d.evar.toFixed(2)}M</div>
              <div style={{ fontSize: 11, color: C.soft, margin: "6px 0 10px", lineHeight: 1.45, minHeight: 32 }}>{d.driver}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: d.fresh === "stale" ? C.amber : C.green }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: d.fresh === "stale" ? C.amber : C.green }} />
                {d.fresh === "stale" ? `Last validated ${d.validated} — refresh requested from ${d.steward}` : `Validated · ${d.steward} · ${d.validated}`}
              </div>
            </Card>
          );
        })}
      </div>

      <SectionLabel>Pending decision packets</SectionLabel>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {packetReady || approved ? (
          <div onClick={() => { setSelPacket(24); setScreen("packet"); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", cursor: "pointer", borderLeft: `4px solid ${approved ? C.green : C.core}` }}>
            <FileCheck2 size={18} color={approved ? C.green : C.core} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>#24 — Cocoa supply shock: advance purchase + hedge</div>
              <div style={{ fontSize: 11.5, color: C.soft }}>{approved ? "Approved by Operations Director · outcome validation T+4 weeks" : "Pending Operations Director approval (> €200k tier) · 12 min from signal"}</div>
            </div>
            {approved ? <Pill tone="green">Approved</Pill> : <Pill tone="amber">Pending</Pill>}
            <span style={{ color: C.core, fontSize: 13, fontWeight: 700 }}><Chev />Review packet</span>
          </div>
        ) : (
          <div style={{ padding: "16px 18px", fontSize: 13, color: C.soft, display: "flex", alignItems: "center", gap: 10 }}>
            <Radio size={15} color={C.core} /> No packets pending approval — the orchestrator is monitoring 14 signal feeds. Press <b style={{ color: C.deep }}>&gt; Run live episode</b> to replay the golden episode.
          </div>
        )}
        <div onClick={() => { setSelPacket(25); setScreen("packet"); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderTop: `1px solid ${C.line}`, cursor: "pointer" }}>
          <Zap size={16} color={C.green} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>#25 — Buying window: cocoa P50 below 90-day average · advance 200t</div>
            <div style={{ fontSize: 11.5, color: C.soft }}>Opportunity packet · margin secured €140k · single approval (Operations Lead, €50–200k tier)</div>
          </div>
          <Pill tone="green">{approved25 ? "Approved" : "Opportunity"}</Pill>
        </div>
      </Card>
    </div>
  );

  const ScenarioRoom = () => {
    const VarRow = (v) => (
      <div key={v.id} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            <input type="checkbox" checked={activeVars[v.id]} onChange={() => toggleVar(v.id)} style={{ accentColor: C.core }} />
            {v.label}
          </label>
          <b style={{ color: C.deep, ...NUM, fontSize: 12.5 }}>{activeVars[v.id] ? `+${varVals[v.id]}${v.unit}` : "off"}</b>
        </div>
        <input type="range" min={v.min} max={v.max} step={v.step} value={varVals[v.id]} disabled={!activeVars[v.id]}
          onChange={(e) => setVar(v.id, +e.target.value)} style={{ width: "100%", accentColor: C.core, opacity: activeVars[v.id] ? 1 : 0.35 }} />
      </div>
    );

    return (
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <div>
          <Card style={{ padding: 16, marginBottom: 14 }}>
            <SectionLabel>External factors</SectionLabel>
            <div style={{ fontSize: 11, color: C.soft, marginBottom: 10, lineHeight: 1.45 }}>Originate outside the company — market, weather, freight, FX, demand signal.</div>
            {VARIABLES.filter((v) => v.group === "external").map(VarRow)}
          </Card>
          <Card style={{ padding: 16, marginBottom: 14 }}>
            <SectionLabel>Internal factors</SectionLabel>
            <div style={{ fontSize: 11, color: C.soft, marginBottom: 10, lineHeight: 1.45 }}>Positions the company controls — cover, supplier mix, hedge ratio, line buffer. Check to add to the active scenario.</div>
            {VARIABLES.filter((v) => v.group === "internal").map(VarRow)}
          </Card>
          <Card style={{ padding: 16 }}>
            <SectionLabel>Named scenarios</SectionLabel>
            {Object.keys(PRESETS).map((p) => (
              <button key={p} onClick={() => applyPreset(p)} style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 6, padding: "8px 11px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${C.line}`, background: C.bg, color: C.ink }}>
                <Chev />{p}
              </button>
            ))}
            <button onClick={runMC} style={{ width: "100%", marginTop: 8, background: C.core, color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
              {mcBusy ? "Running 10,000 paths…" : "Run Monte Carlo"}
            </button>
            <div style={{ fontSize: 10.5, color: C.soft, marginTop: 6, textAlign: "center" }}>10,000 paths · deterministic engine · last run {mcBusy ? "now" : "4s ago"}</div>
          </Card>
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
            {[
              ["Scenario EVaR", `€${sEvar.toFixed(2)}M`, sEvar > K.evar ? `€${K.evar}M → €${sEvar.toFixed(2)}M` : "at baseline", sEvar > K.evar + 0.05 ? C.red : C.ink],
              ["Scenario EES", sEes, sEes >= 70 ? "High exposure" : sEes >= 40 ? "Elevated" : "Controlled", sEes >= 70 ? C.red : C.amber],
              ["Confidence", `${confidence}%`, selectedList.length ? `avg. of ${selectedList.length} actions` : "4-factor decomposition", C.ink],
              ["Custom portfolio EVaR", `€${customEvar.toFixed(2)}M`, `−€${valueProtected.toFixed(2)}M at €${totalCost}k`, C.green],
            ].map(([l, v, s, col], i) => (
              <Card key={i} style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: C.soft, fontWeight: 600, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: col, letterSpacing: -0.5, ...NUM }}>{v}</div>
                <div style={{ fontSize: 11, color: C.soft }}>{s}</div>
              </Card>
            ))}
          </div>
          <Card style={{ padding: 16, marginBottom: 14, opacity: mcBusy ? 0.45 : 1, transition: "opacity .3s" }}>
            <SectionLabel>Exposure bands — P10 / P50 / P90 (4-week horizon)</SectionLabel>
            <div style={{ height: 190 }}>
              <ResponsiveContainer>
                <ComposedChart data={bandData} margin={{ top: 6, right: 8, bottom: 0, left: -14 }}>
                  <CartesianGrid stroke={C.line} vertical={false} />
                  <XAxis dataKey="w" tick={{ fontSize: 10.5, fill: C.soft }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10.5, fill: C.soft }} axisLine={false} tickLine={false} unit="M" />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: FONT, border: `1px solid ${C.line}`, borderRadius: 8 }} />
                  <Area dataKey="band" stroke="none" fill={C.core} fillOpacity={0.12} name="P10–P90" />
                  <Line dataKey="p50" stroke={C.core} strokeWidth={2.4} dot={false} name="P50" />
                  <Line dataKey="baseline" stroke={C.soft} strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="Baseline" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px 0" }}>
              <SectionLabel>Build response portfolio</SectionLabel>
              <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 4, lineHeight: 1.45 }}>Only actions tied to an active variable are selectable — and each action's EVaR reduction scales with that variable's current value.</div>
            </div>
            {availableActions.length === 0 ? (
              <div style={{ padding: "18px 16px", fontSize: 12.5, color: C.soft }}>No variables active. Check an external or internal factor on the left to surface response actions.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead><tr style={{ background: C.dark, color: "#fff" }}>
                  {["", "Action", "Driver", "EVaR reduction", "Cost", "Confidence", "Policy clause"].map((h) => <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, fontSize: 11.5 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {availableActions.map((a) => {
                    const drop = dropFor(a);
                    const checked = selectedActions.has(a.id);
                    return (
                      <tr key={a.id} style={{ borderTop: `1px solid ${C.line}`, background: checked ? C.purpBg : C.bg }}>
                        <td style={{ padding: "10px 14px" }}><input type="checkbox" checked={checked} disabled={drop === 0} onChange={() => toggleAction(a.id)} style={{ accentColor: C.core }} /></td>
                        <td style={{ padding: "10px 14px", fontWeight: 600 }}><Chev />{a.label}</td>
                        <td style={{ padding: "10px 14px", color: C.soft }}>{VARMAP[a.varId].label}</td>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: drop > 0 ? C.green : C.soft, ...NUM }}>{drop > 0 ? `−€${drop.toFixed(2)}M` : "—"}</td>
                        <td style={{ padding: "10px 14px", ...NUM }}>€{a.cost}k</td>
                        <td style={{ padding: "10px 14px", ...NUM }}>{a.conf}%</td>
                        <td style={{ padding: "10px 14px" }}><Pill tone="grey">{a.clause}</Pill></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 12.5, color: C.soft }}>
                {selectedList.length} action{selectedList.length === 1 ? "" : "s"} selected · total cost <b style={{ color: C.ink, ...NUM }}>€{totalCost}k</b> · residual EVaR <b style={{ color: C.green, ...NUM }}>€{customEvar.toFixed(2)}M</b>
              </div>
              <div style={{ flex: 1 }} />
              <button onClick={() => { setSelPacket(24); setScreen("packet"); }} style={{ background: C.core, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                &gt; Generate Decision Packet
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const PacketSelector = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 14 }}>
      {PACKETS.map((p) => {
        const isApproved = p.id === 24 ? approved : approved25;
        const Icon = p.icon;
        const active = selPacket === p.id;
        return (
          <Card key={p.id} onClick={() => setSelPacket(p.id)} style={{ padding: 16, borderLeft: `5px solid ${p.accent}`, border: `1px solid ${active ? C.core : C.line}`, boxShadow: active ? `0 0 0 2px ${C.purpBg}` : "0 1px 2px rgba(10,10,15,0.04)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: p.accent + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={19} color={p.accent} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.soft, ...NUM }}>#{p.id}</span>
                  <Pill tone={p.kind === "risk" ? "red" : "green"}>{p.kind === "risk" ? "Risk packet" : "Opportunity packet"}</Pill>
                  {isApproved ? <Pill tone="green">Approved</Pill> : <Pill tone="amber">Pending</Pill>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 8 }}>{p.sub} · {p.tier}</div>
                <div style={{ display: "flex", gap: 18 }}>
                  {p.m.map(([l, v], i) => (
                    <div key={i}>
                      <div style={{ fontSize: 10.5, color: C.soft }}>{l}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, ...NUM }}>{v}</div>
                    </div>
                  ))}
                  <div style={{ marginLeft: "auto", alignSelf: "center" }}><Pill tone={p.kind === "risk" ? "purple" : "green"}>{p.headline}</Pill></div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const Packet24 = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 16 }}>
      <div>
        <Card style={{ padding: 20, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11.5, color: C.soft, fontWeight: 600 }}>DECISION PACKET #24 · ref AUD-24-0093 · 12 min after signal</div>
              <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5, margin: "4px 0 8px" }}>Cocoa Supply Shock — Executive S&OP Action Required</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Pill tone="purple">Approver: Operations Director (&gt; €200k)</Pill>
                <Pill tone={approved ? "green" : "amber"}>{approved ? "Approved" : "Pending approval"}</Pill>
                <Pill tone="green">Audit passed · 4/4</Pill>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: C.soft }}>Confidence</div>
              <button onClick={() => setConfOpen(!confOpen)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: FONT }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: C.deep, ...NUM }}>{K.confidence}%</span>
                <Info size={13} color={C.soft} style={{ marginLeft: 4 }} />
              </button>
              {confOpen && (
                <div style={{ fontSize: 11, color: C.soft, textAlign: "left", background: C.faint, padding: 10, borderRadius: 8, marginTop: 4, width: 210 }}>
                  Data completeness 95% (30%)<br />Historical accuracy 87% (30%)<br />Signal consistency 80% (20%)<br />Model agreement 75% (20%)
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
            {[["Current EVaR", `€${K.evar}M`], ["After portfolio", `€${K.evarAfter}M`], ["Reduction", `−${K.reduction}%`], ["Cost", `€${K.cost}k`], ["Value protected", `€${K.protectedV}M`]].map(([l, v], i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: C.soft }}>{l}</div>
                <div style={{ fontSize: 19, fontWeight: 800, ...NUM, display: "flex", alignItems: "center", gap: 4 }}>
                  {v}{l === "After portfolio" && <button onClick={() => setWhyOpen(true)} title="Why this number?" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><Info size={13} color={C.core} /></button>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 18, marginBottom: 14 }}>
          <SectionLabel>Risk waterfall — current EVaR to residual</SectionLabel>
          <Waterfall />
        </Card>

        <Card style={{ padding: 0, marginBottom: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead><tr style={{ background: C.dark, color: "#fff" }}>
              {["Action", "Volume", "Cost", "Confidence", "Policy clause cited"].map((h) => <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, fontSize: 11.5 }}>{h}</th>)}
            </tr></thead>
            <tbody>{K.actions.map((a, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}><Chev />{a.a}</td>
                <td style={{ padding: "10px 14px", ...NUM }}>{a.vol}</td>
                <td style={{ padding: "10px 14px", ...NUM }}>€{a.cost}k</td>
                <td style={{ padding: "10px 14px", ...NUM }}>{a.conf}%</td>
                <td style={{ padding: "10px 14px" }}><Pill tone="grey">{a.clause}</Pill></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>

        <Card style={{ padding: 18, marginBottom: 14 }}>
          <SectionLabel>Agent rationale — every claim cited</SectionLabel>
          <div style={{ fontSize: 13.5, lineHeight: 1.85, color: C.ink }}>
            Cocoa +18% MoM with ICCO-confirmed supply deficit <Pill tone="purple" style={{ fontSize: 10 }}>signal · ICE/ICCO</Pill> while inventory cover stands at 18 days, below the 30-day policy minimum <Pill tone="grey" style={{ fontSize: 10 }}>policy §3.1</Pill>. The exposure path touches 3 recipes, 11 SKUs, 2 lines and 4 key customers <Pill tone="purple" style={{ fontSize: 10 }}>graph path</Pill>. The last 3 similar signal patterns saw advance purchase outperform waiting by €180k on average <Pill tone="amber" style={{ fontSize: 10 }}>precedent #19 · simulated</Pill>. Recommended portfolio D minimizes EVaR per euro of cost across 24 evaluated combinations <Pill tone="grey" style={{ fontSize: 10 }}>Monte Carlo · deterministic</Pill>.
          </div>
        </Card>

        <Card style={{ padding: 18 }}>
          <SectionLabel>Ask the analyst — figures from engine re-runs, narrative by Claude</SectionLabel>
          <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 10 }}>
            {chat.length === 0 && <div style={{ fontSize: 12.5, color: C.soft }}>No questions yet. The analyst answers in plain language and triggers Monte Carlo re-runs via tool calls — it never generates financial figures itself.</div>}
            {chat.map((m, i) => (
              <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "82%", padding: "9px 13px", borderRadius: 10, fontSize: 13, lineHeight: 1.55, background: m.role === "user" ? C.dark : C.faint, color: m.role === "user" ? "#fff" : C.ink, border: m.role === "user" ? "none" : `1px solid ${C.line}` }}>
                  {m.text}
                  {m.role === "ai" && m.text === m.full && <div style={{ marginTop: 6 }}><Pill tone="grey" style={{ fontSize: 9.5 }}>figures: Monte Carlo re-run · narrative: Claude · temp 0</Pill></div>}
                </div>
              </div>
            ))}
            {chatBusy && chat[chat.length - 1]?.role === "user" && <div style={{ fontSize: 12, color: C.deep, display: "flex", alignItems: "center", gap: 6 }}><Activity size={13} /> Analyst · querying Monte Carlo engine…</div>}
          </div>
          <button onClick={askAnalyst} disabled={chatBusy} style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.line}`, padding: "9px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: C.deep }}>
            <Send size={13} /> "What if we wait two weeks before buying?"
          </button>
        </Card>
      </div>

      <div>
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <SectionLabel>Audit verdict</SectionLabel>
          {[
            ["Groundedness", "Every claim cites a graph path, document clause or precedent. 9/9 citations resolved.", "ai"],
            ["Numerical integrity", "All 14 figures byte-match RQE / Monte Carlo output JSON.", "det"],
            ["Policy compliance", "Forward cover ≤ 4 weeks · tier matches €230k total · volumes within authority.", "det"],
            ["Completeness", "Confidence decomposition, P10/P50/P90 bands and approver tier present.", "det"],
          ].map(([h, s, k], i) => (
            <div key={i} style={{ padding: "9px 0", borderBottom: i < 3 ? `1px solid ${C.line}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700 }}>
                <CheckCircle2 size={14} color={C.green} /> {h} <span style={{ marginLeft: "auto" }}><Tag kind={k} /></span>
              </div>
              <div style={{ fontSize: 11, color: C.soft, marginTop: 3, paddingLeft: 21 }}>{s}</div>
            </div>
          ))}
        </Card>
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <SectionLabel>Timeline — signal to packet</SectionLabel>
          {[["09:12", "Signal detected — cocoa z-score +2.3"], ["09:18", "Agents completed analysis (incl. constraint catch)"], ["09:21", "Simulation completed — 10,000 paths × 4 portfolios"], ["09:23", "Audit passed — 4/4 checks"], ["09:24", "Packet ready — Operations Director notified"]].map(([t, s], i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 38, fontSize: 11.5, fontWeight: 700, color: C.deep, ...NUM }}>{t}</div>
              <div style={{ position: "relative", paddingLeft: 14, fontSize: 12, color: C.ink, flex: 1 }}>
                <span style={{ position: "absolute", left: 0, top: 4, width: 8, height: 8, borderRadius: 99, background: C.core }} />
                {s}
              </div>
            </div>
          ))}
        </Card>
        <Card style={{ padding: 16 }}>
          <SectionLabel>Approval — dual sign-off on conflict</SectionLabel>
          <div style={{ fontSize: 12, color: C.soft, marginBottom: 12, lineHeight: 1.5 }}>Total impact €230k &gt; €200k tier → Operations Director. Conflicting agent recommendations would escalate to dual approval.</div>
          <button onClick={approve} disabled={approved} style={{ width: "100%", background: approved ? C.green : C.core, color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: approved ? "default" : "pointer", fontFamily: FONT, marginBottom: 8 }}>
            {approved ? "✓ Approved & logged" : "> Approve packet"}
          </button>
          <button disabled={approved} style={{ width: "100%", background: C.bg, color: C.red, border: `1px solid ${C.line}`, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Reject</button>
          {approved && <div style={{ fontSize: 11, color: C.green, marginTop: 8, display: "flex", gap: 5, alignItems: "center" }}><Lock size={11} /> Immutable record created · outcome validation T+4 weeks</div>}
        </Card>
      </div>
    </div>
  );

  const Packet25 = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 16 }}>
      <div>
        <Card style={{ padding: 20, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11.5, color: C.soft, fontWeight: 600 }}>DECISION PACKET #25 · ref AUD-25-0094 · opportunity — continuous monitoring</div>
              <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5, margin: "4px 0 8px" }}>Buying Window — Cocoa P50 Below 90-Day Average</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Pill tone="purple">Approver: Operations Lead (€50k–200k)</Pill>
                <Pill tone={approved25 ? "green" : "amber"}>{approved25 ? "Approved" : "Pending approval"}</Pill>
                <Pill tone="green">Audit passed · 4/4</Pill>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: C.soft }}>Confidence</div>
              <span style={{ fontSize: 30, fontWeight: 800, color: C.deep, ...NUM }}>79%</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
            {[["Cocoa P50", "−12% vs 90d avg"], ["Volume", "200 t"], ["Margin secured", "€140k"], ["Cost", "€55k"], ["Net value", "€85k"]].map(([l, v], i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: C.soft }}>{l}</div>
                <div style={{ fontSize: 19, fontWeight: 800, ...NUM, color: i >= 2 ? C.green : C.ink }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 18, marginBottom: 14 }}>
          <SectionLabel>Opportunity build-up — margin secured to net value</SectionLabel>
          <OpportunityChart />
        </Card>

        <Card style={{ padding: 0, marginBottom: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead><tr style={{ background: C.dark, color: "#fff" }}>
              {["Action", "Volume", "Cost", "Confidence", "Policy clause cited"].map((h) => <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, fontSize: 11.5 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              <tr style={{ borderTop: `1px solid ${C.line}` }}>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}><Chev />Advance purchase 200t at favorable P50</td>
                <td style={{ padding: "10px 14px", ...NUM }}>200 t</td>
                <td style={{ padding: "10px 14px", ...NUM }}>€55k</td>
                <td style={{ padding: "10px 14px", ...NUM }}>79%</td>
                <td style={{ padding: "10px 14px" }}><Pill tone="grey">§3.1 — max 4-week forward cover</Pill></td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card style={{ padding: 18 }}>
          <SectionLabel>Agent rationale — every claim cited</SectionLabel>
          <div style={{ fontSize: 13.5, lineHeight: 1.85, color: C.ink }}>
            ICE cocoa P50 is currently 12% below its 90-day average <Pill tone="purple" style={{ fontSize: 10 }}>signal · ICE</Pill>, inside the window the Procurement Agent's Hedging specialist flags as favorable for incremental cover <Pill tone="grey" style={{ fontSize: 10 }}>policy §3.1</Pill>. Advancing 200t at current pricing secures €140k of margin versus the 90-day baseline <Pill tone="purple" style={{ fontSize: 10 }}>graph path · cocoa → recipes → SKUs</Pill>, at an execution cost of €55k, for a net value of €85k <Pill tone="grey" style={{ fontSize: 10 }}>Monte Carlo · deterministic</Pill>. This mirrors the 2026 backtest buying-window episode <Pill tone="amber" style={{ fontSize: 10 }}>backtest · simulated</Pill>.
          </div>
        </Card>
      </div>

      <div>
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <SectionLabel>Audit verdict</SectionLabel>
          {[
            ["Groundedness", "Claim cites ICE price signal and the cocoa → recipes → SKUs graph path.", "ai"],
            ["Numerical integrity", "€140k margin and €55k cost figures byte-match engine output.", "det"],
            ["Policy compliance", "200t within §3.1 forward-cover limit · €55k within Operations Lead tier.", "det"],
            ["Completeness", "Confidence score and approver tier present.", "det"],
          ].map(([h, s, k], i) => (
            <div key={i} style={{ padding: "9px 0", borderBottom: i < 3 ? `1px solid ${C.line}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700 }}>
                <CheckCircle2 size={14} color={C.green} /> {h} <span style={{ marginLeft: "auto" }}><Tag kind={k} /></span>
              </div>
              <div style={{ fontSize: 11, color: C.soft, marginTop: 3, paddingLeft: 21 }}>{s}</div>
            </div>
          ))}
        </Card>
        <Card style={{ padding: 16 }}>
          <SectionLabel>Approval — single sign-off</SectionLabel>
          <div style={{ fontSize: 12, color: C.soft, marginBottom: 12, lineHeight: 1.5 }}>Total impact €55k is within the €50k–200k Operations Lead tier — single approval, no escalation required.</div>
          <button onClick={approve25} disabled={approved25} style={{ width: "100%", background: approved25 ? C.green : C.core, color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: approved25 ? "default" : "pointer", fontFamily: FONT, marginBottom: 8 }}>
            {approved25 ? "✓ Approved & logged" : "> Approve packet"}
          </button>
          <button disabled={approved25} style={{ width: "100%", background: C.bg, color: C.red, border: `1px solid ${C.line}`, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Reject</button>
          {approved25 && <div style={{ fontSize: 11, color: C.green, marginTop: 8, display: "flex", gap: 5, alignItems: "center" }}><Lock size={11} /> Immutable record created · outcome validation T+4 weeks</div>}
        </Card>
      </div>
    </div>
  );

  const Packet = () => (
    <div>
      <PacketSelector />
      {selPacket === 24 ? Packet24() : Packet25()}
    </div>
  );

  const Dept = () => {
    const d = K.domains.find((x) => x.id === deptTab);
    const kpis = {
      procurement: [["Days of cover", "18", "red"], ["Contracted volume", "1,420 t", "grey"], ["Supplier concentration", "48%", "amber"], ["Forward contract", "€3,870/t", "grey"]],
      production: [["OEE", "71%", "amber"], ["Utilization", "87%", "grey"], ["Changeover hrs/wk", "14.2", "grey"], ["Downtime (planning)", "21 h/wk", "red"]],
      logistics: [["Avg lead time", "12.6 d", "amber"], ["Port congestion", "+8 d", "red"], ["Freight deviation", "+11%", "amber"], ["Carrier OTD", "91%", "grey"]],
      commercial: [["Forecast accuracy", "78%", "amber"], ["OTIF", "93%", "green"], ["Forecast deviation", "9.4%", "amber"], ["Top-10 at risk", "1", "amber"]],
    }[deptTab];
    const st = d.id === "procurement" ? procState : d.state;
    const Icon = d.icon;
    const ownerRisks = RISK_REGISTER.filter((r) => r.owner === d.name);
    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
          {K.domains.map((x) => {
            const XIcon = x.icon;
            return (
              <button key={x.id} onClick={() => setDeptTab(x.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${deptTab === x.id ? C.core : C.line}`, background: deptTab === x.id ? C.purpBg : C.bg, color: deptTab === x.id ? C.deep : C.ink }}>
                <XIcon size={14} /> {x.name}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button onClick={() => setReportOpen(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${C.line}`, background: C.bg, color: C.deep }}>
            <FileText size={14} /> Generate report
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 16 }}>
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: C.soft, fontWeight: 600 }}>Domain EVaR</div>
            <div style={{ fontSize: 24, fontWeight: 800, ...NUM }}>€{d.evar.toFixed(2)}M</div>
            <Pill tone={stateTone(st)}>{st}</Pill>
          </Card>
          {kpis.map(([l, v, t], i) => (
            <Card key={i} style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: C.soft, fontWeight: 600 }}>{l}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: t === "red" ? C.red : t === "amber" ? C.amber : t === "green" ? C.green : C.ink, ...NUM }}>{v}</div>
            </Card>
          ))}
        </div>
        {d.id === "commercial" && (
          <Card style={{ padding: 14, marginBottom: 16, borderLeft: `4px solid ${C.amber}` }}>
            <div style={{ fontSize: 12.5, color: C.amber, fontWeight: 700, display: "flex", gap: 7, alignItems: "center" }}><AlertTriangle size={14} /> Pre-Alert — agent confidence 63% (below 65% threshold)</div>
            <div style={{ fontSize: 12, color: C.soft, marginTop: 4 }}>Forecast deviation widening; recommendations from this domain are visibly flagged until confidence recovers. The platform tells you when not to trust it.</div>
          </Card>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
          <Card style={{ padding: 16 }}>
            <SectionLabel>Open actions</SectionLabel>
            {(d.id === "procurement" ? [["Advance purchase 500t — Packet #24", packetReady || approved ? (approved ? "Approved" : "Pending") : "Drafting", approved ? "green" : "amber"], ["Hedge 30% forward exposure — Packet #24", approved ? "Approved" : "Pending", approved ? "green" : "amber"], ["Buying window 200t — Packet #25", approved25 ? "Approved" : "Pending Operations Lead", "green"]] : d.id === "production" ? [["Validate schedule T+2–T+6 (cascade)", "Constraint catch resolved — Line 3", "green"], ["Allergen window review — Line 2", "Scheduled Thu 22:00", "grey"]] : d.id === "logistics" ? [["Reroute 1 vessel from Abidjan — Packet #24", approved ? "Approved" : "Pending", approved ? "green" : "amber"], ["Valencia port capacity check (cascade)", "Confirmed", "green"]] : [["Promotional pre-build confirmation", "Supply secured (cascade)", "green"], ["Top-10 customer OTIF watch — Retailer X", "Monitoring", "amber"]]).map(([a, s, t], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.line}`, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}><Chev />{a}</span><Pill tone={t}>{s}</Pill>
              </div>
            ))}
          </Card>
          <Card style={{ padding: 16 }}>
            <SectionLabel>Data steward</SectionLabel>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{d.steward}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, marginTop: 6, color: d.fresh === "stale" ? C.amber : C.green }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: d.fresh === "stale" ? C.amber : C.green }} />
              {d.fresh === "stale" ? `Last validated ${d.validated}` : `Validated · ${d.validated}`}
            </div>
            <div style={{ fontSize: 11.5, color: C.soft, marginTop: 10, lineHeight: 1.5 }}>
              {d.fresh === "stale" ? "Refresh requested. AI quality depends on input quality — ownership is not outsourced to the algorithm." : "Domain inputs current and validated. Freshness propagates to every figure this domain feeds."}
            </div>
          </Card>
        </div>

        {reportOpen && (
          <div onClick={() => setReportOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,10,15,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, borderRadius: 12, padding: 24, width: 560, maxWidth: "92vw", maxHeight: "85vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.soft, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 7, background: C.purpBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={13} color={C.deep} /></span>
                    DEPARTMENT REPORT
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{d.name} — Week 3 of 4, S&OP cycle</div>
                </div>
                <button onClick={() => setReportOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={17} color={C.soft} /></button>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <Pill tone={stateTone(st)}>{st}</Pill>
                <Pill tone="purple">Domain EVaR €{d.evar.toFixed(2)}M</Pill>
                <Pill tone={d.fresh === "stale" ? "amber" : "green"}>{d.fresh === "stale" ? `Stale · ${d.validated}` : `Validated · ${d.validated}`}</Pill>
              </div>
              <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.7, marginBottom: 14, padding: 12, background: C.faint, borderRadius: 8 }}>
                {d.id === "procurement" && "Procurement carries the highest domain exposure this cycle (€1.45M), driven by the cocoa price shock and a cover position 12 days below policy. Packet #24 (advance purchase + hedge) and Packet #25 (opportunistic buying window) are both in flight."}
                {d.id === "production" && "Production exposure (€0.65M) is moderate. The constraint catch on Line 2's allergen window has been resolved by shifting the proposed run to Line 3 at a €8k changeover cost — feasibility confirmed for the cascaded Packet #24 volume."}
                {d.id === "logistics" && "Logistics exposure (€0.45M) reflects Abidjan port congestion adding 8 days of lead time on 2 inbound vessels. A reroute via Valencia is part of Packet #24's recommended portfolio."}
                {d.id === "commercial" && "Commercial is in Pre-Alert: forecast deviation (9.4%) is approaching the 10% escalation threshold and agent confidence (63%) sits below the 65% trust gate. Recommendations from this domain are visibly flagged until confidence recovers."}
              </div>
              <SectionLabel>KPIs</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                {kpis.map(([l, v, t], i) => (
                  <div key={i} style={{ padding: 10, background: C.faint, borderRadius: 8 }}>
                    <div style={{ fontSize: 10.5, color: C.soft }}>{l}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: t === "red" ? C.red : t === "amber" ? C.amber : t === "green" ? C.green : C.ink, ...NUM }}>{v}</div>
                  </div>
                ))}
              </div>
              <SectionLabel>Risks owned by this department</SectionLabel>
              <div style={{ marginBottom: 14 }}>
                {ownerRisks.length === 0 && <div style={{ fontSize: 12, color: C.soft }}>No risk-register items directly owned by this department.</div>}
                {ownerRisks.map((r) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.line}`, fontSize: 12.5 }}>
                    <span style={{ fontWeight: 600 }}>#{r.id} {r.name}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Pill tone={r.source === "external" ? "amber" : "green"} style={{ textTransform: "capitalize" }}>{r.source}</Pill>
                      <Pill tone="purple">€{r.impact.toFixed(2)}M</Pill>
                    </div>
                  </div>
                ))}
              </div>
              <SectionLabel>Steward sign-off</SectionLabel>
              <div style={{ fontSize: 12.5, color: C.ink, display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: C.faint, borderRadius: 8 }}>
                <div><b>{d.steward}</b><div style={{ color: C.soft, fontSize: 11 }}>Data steward · {d.name}</div></div>
                <Pill tone={d.fresh === "stale" ? "amber" : "green"}>{d.fresh === "stale" ? "Refresh requested" : "Current"}</Pill>
              </div>
              <div style={{ fontSize: 10.5, color: C.soft, marginTop: 12, fontStyle: "italic" }}>One-page report · 4 MVP areas (Procurement, Production, Logistics, Commercial) · figures traced to the deterministic engines, demo mode.</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Audit = () => (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["trail", "Audit trail"], ["gov", "Governance"], ["backtest", "Backtest 2024–26"]].map(([k, l]) => (
          <button key={k} onClick={() => setAuditTab(k)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${auditTab === k ? C.core : C.line}`, background: auditTab === k ? C.purpBg : C.bg, color: auditTab === k ? C.deep : C.ink }}>{l}</button>
        ))}
      </div>

      {auditTab === "trail" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead><tr style={{ background: C.dark, color: "#fff" }}>
              {["Packet", "Decision", "Timestamp", "Approver", "EVaR before → after", "Outcome (T+4)", "Status"].map((h) => <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, fontSize: 11 }}>{h}</th>)}
            </tr></thead>
            <tbody>{trail.map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${C.line}`, background: r.id === 24 || r.id === 25 ? C.purpBg : r.status === "blocked" ? C.redBg : C.bg }}>
                <td style={{ padding: "10px 12px", fontWeight: 700, ...NUM }}>#{r.id}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.title}</td>
                <td style={{ padding: "10px 12px", color: C.soft, ...NUM }}>{r.ts}</td>
                <td style={{ padding: "10px 12px" }}>{r.approver}</td>
                <td style={{ padding: "10px 12px", ...NUM }}>{r.after ? `€${r.before}M → €${r.after}M` : `€${r.before}M → —`}</td>
                <td style={{ padding: "10px 12px", fontSize: 11.5, color: C.soft, maxWidth: 260 }}>{r.outcome}</td>
                <td style={{ padding: "10px 12px" }}>{r.status === "blocked" ? <Pill tone="red">Blocked by audit</Pill> : <Pill tone="green">Passed</Pill>}</td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{ padding: "10px 14px", fontSize: 11, color: C.soft, borderTop: `1px solid ${C.line}` }}>
            All historical records labelled <b>simulated</b> · #24/#25 logged live during this session · #21 demonstrates the audit gate catching a figure mismatch before release.
          </div>
        </Card>
      )}

      {auditTab === "gov" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <Card style={{ padding: 16, marginBottom: 14 }}>
              <SectionLabel>COSO ERM 2017 — five components, applied</SectionLabel>
              {COSO_COMPONENTS.map(([h, s], i) => (
                <div key={i} style={{ display: "flex", gap: 9, padding: "8px 0", borderBottom: i < COSO_COMPONENTS.length - 1 ? `1px solid ${C.line}` : "none", alignItems: "flex-start" }}>
                  <CheckCircle2 size={14} color={C.green} style={{ marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{h}</span>
                    <div style={{ fontSize: 11.5, color: C.soft, marginTop: 2 }}>{s}</div>
                  </div>
                </div>
              ))}
            </Card>
            <Card style={{ padding: 16, marginBottom: 14 }}>
              <SectionLabel>The four audit checks — what they really are</SectionLabel>
              {[["Groundedness", "1 LLM verification call: every claim must cite a graph path, clause or precedent", "ai"], ["Numerical integrity", "Deterministic: regex-extract every figure, byte-match against engine JSON", "det"], ["Policy compliance", "Deterministic rule engine: bounds, tiers, authority limits", "det"], ["Completeness", "Deterministic schema validation: bands, decomposition, tier present", "det"]].map(([h, s, k], i) => (
                <div key={i} style={{ display: "flex", gap: 9, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.line}` : "none", alignItems: "flex-start" }}>
                  <CheckCircle2 size={14} color={C.green} style={{ marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{h}</span> <Tag kind={k} />
                    <div style={{ fontSize: 11.5, color: C.soft, marginTop: 2 }}>{s}</div>
                  </div>
                </div>
              ))}
            </Card>
            <Card style={{ padding: 16 }}>
              <SectionLabel>Model & cost console</SectionLabel>
              <div style={{ display: "flex", gap: 24, ...NUM }}>
                {[["API cost · Packet #24", "€0.04"], ["LLM calls", "11"], ["Temperature", "0"], ["Avg latency", "3.4s"]].map(([l, v], i) => (
                  <div key={i}><div style={{ fontSize: 11, color: C.soft }}>{l}</div><div style={{ fontSize: 20, fontWeight: 800 }}>{v}</div></div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.soft, marginTop: 8 }}>Cost per decision cycle is measured in cents, not euros — consumption tracked per packet.</div>
            </Card>
          </div>
          <div>
            <Card style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ padding: "12px 16px 0" }}><SectionLabel>Closed agent registry — 9 governed components</SectionLabel></div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: C.dark, color: "#fff" }}>
                  {["Component", "Level", "Nature", "Version"].map((h) => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, fontSize: 11 }}>{h}</th>)}
                </tr></thead>
                <tbody>{REGISTRY.map((r, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: "8px 12px", color: C.soft, ...NUM }}>{r[1]}</td>
                    <td style={{ padding: "8px 12px", color: C.soft }}>{r[2]}</td>
                    <td style={{ padding: "8px 12px" }}><Pill tone="purple">{r[3]}</Pill></td>
                  </tr>
                ))}</tbody>
              </table>
              <div style={{ padding: "10px 14px", fontSize: 11, color: C.soft, borderTop: `1px solid ${C.line}` }}>No user-created agents. Any change to a contract (prompt, corpus, tool list) is itself a logged, approved event.</div>
            </Card>
            <Card style={{ padding: 16 }}>
              <SectionLabel>Approval tiers — COSO governance & culture</SectionLabel>
              {[["< €50k", "Shift Supervisor"], ["€50k – €200k", "Operations Lead"], ["> €200k", "Operations Director"], ["Conflicting agents", "Dual approval (CFO + Operations Director)"]].map(([t, a], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.line}` : "none", fontSize: 12.5 }}>
                  <b style={NUM}>{t}</b><span style={{ color: C.soft }}>{a}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {auditTab === "backtest" && (
        <Card style={{ padding: 18 }}>
          <SectionLabel>Pre-go-live backtest — the 2024–2026 cocoa market, replayed</SectionLabel>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={BACKTEST} margin={{ top: 20, right: 30, bottom: 0, left: -8 }}>
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10.5, fill: C.soft }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10.5, fill: C.soft }} axisLine={false} tickLine={false} unit="k" domain={[0, 13]} label={{ value: "USD/t (000s)", angle: -90, position: "insideLeft", fontSize: 11, fill: C.soft }} />
                <Tooltip formatter={(v) => [`$${v}k/t`, "ICE cocoa"]} contentStyle={{ fontSize: 12, fontFamily: FONT, border: `1px solid ${C.line}`, borderRadius: 8 }} />
                <Line dataKey="price" stroke={C.dark} strokeWidth={2.4} dot={false} type="monotone" />
                <ReferenceDot x="Nov 24" y={10.8} r={7} fill={C.red} stroke="#fff" strokeWidth={2} label={{ value: "RISK ALERT — run-up flagged", position: "top", fontSize: 11, fontWeight: 700, fill: C.red }} />
                <ReferenceDot x="Jan 26" y={3.6} r={7} fill={C.green} stroke="#fff" strokeWidth={2} label={{ value: "BUYING WINDOW — opportunity flagged", position: "bottom", fontSize: 11, fontWeight: 700, fill: C.green }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 12, padding: 14, background: C.faint, borderRadius: 8, fontSize: 12.5 }}>
            <div><b>Golden-episode gate (Phase 3):</b> before go-live the agent layer must flag the late-2024 run-up as risk <i>and</i> the early-2026 collapse (−70%) as a buying window. <span style={{ color: C.green, fontWeight: 700 }}>Both episodes passed.</span></div>
          </div>
          <div style={{ fontSize: 11.5, color: C.soft, marginTop: 8 }}>Source series: ICE Futures U.S. cocoa, ICCO Quarterly Bulletins 2024–2026 · peak above $12,000/t (early 2025) → ~−70% (early 2026) → ~+50% rebound → ~$4,200/t (May 2026).</div>
        </Card>
      )}
    </div>
  );

  return (
    <div style={{ fontFamily: FONT, height: "100vh", display: "flex", background: C.faint, color: C.ink, overflow: "hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes slideIn { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:none} }
        @keyframes slideInRight { from{transform:translateX(100%)} to{transform:none} }
        @keyframes popIn { from{opacity:0; transform:scale(.92) translateY(10px)} to{opacity:1; transform:none} }
        input[type=range]{ height: 4px; }
        ::-webkit-scrollbar{ width:8px; height:8px } ::-webkit-scrollbar-thumb{ background:${C.line}; border-radius:99px }
      `}</style>

      <div style={{ width: 226, background: C.bg, borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 18px 14px", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.5 }}>FactoryMind <span style={{ color: C.core }}>&gt;</span></div>
          <div style={{ fontSize: 11.5, color: C.soft, marginTop: 2 }}>CocoaRisk · confectionery</div>
        </div>
        <div style={{ padding: 10, flex: 1 }}>
          {NAV.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setScreen(id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", marginBottom: 2, borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: "none", textAlign: "left", background: screen === id ? C.purpBg : "transparent", color: screen === id ? C.deep : C.ink, borderLeft: `3px solid ${screen === id ? C.core : "transparent"}`, position: "relative" }}>
              <Icon size={16} /> {label}
              {id === "packet" && packetReady && !approved && <span style={{ position: "absolute", right: 10, width: 8, height: 8, borderRadius: 99, background: C.core, animation: "pulse 1.4s infinite" }} />}
            </button>
          ))}
        </div>
        <div style={{ padding: 14, borderTop: `1px solid ${C.line}`, fontSize: 10.5, color: C.soft, lineHeight: 1.5 }}>
          LUISS Business School<br />Accenture Challenge 2026
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ background: C.bg, borderBottom: `1px solid ${C.line}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>European Confectionery Manufacturer <span style={{ color: C.soft, fontWeight: 500 }}>(reference)</span></div>
            <div style={{ fontSize: 11, color: C.soft }}>S&OP Cycle — Week 3 of 4 · Continuous monitoring · {clockStr} plant time</div>
          </div>
          <div style={{ flex: 1 }} />
          <Pill tone="grey" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Clock size={10} /> Signals updated {secs}s ago</Pill>
          <Pill tone="grey" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Database size={10} /> Demo mode · synthetic operating data</Pill>
          <button onClick={() => setFeedOpen(!feedOpen)} style={{ display: "flex", alignItems: "center", gap: 7, background: C.bg, border: `1px solid ${feedOpen ? C.core : C.line}`, color: feedOpen ? C.deep : C.ink, padding: "8px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
            <Radio size={14} color={C.core} /> Agent Feed
          </button>
          <button onClick={runEpisode} disabled={episode === "running"} style={{ display: "flex", alignItems: "center", gap: 7, background: episode === "running" ? C.deep : C.core, color: "#fff", border: "none", padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: episode === "running" ? "default" : "pointer", fontFamily: FONT }}>
            <Play size={13} fill="#fff" /> {episode === "running" ? "Episode running…" : episode === "done" ? "Replay live episode" : "Run live episode"}
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, overflowY: "auto", padding: 20 }}>
            {screen === "control" && ControlCenter()}
            {screen === "map" && <div style={{ height: "calc(100vh - 110px)" }}><RiskMap pathActive={mapHot} /></div>}
            {screen === "scenario" && ScenarioRoom()}
            {screen === "packet" && Packet()}
            {screen === "dept" && Dept()}
            {screen === "audit" && Audit()}
          </div>

          {feedOpen && (
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 332, background: C.bg, borderLeft: `1px solid ${C.line}`, display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 40, boxShadow: "-8px 0 24px rgba(10,10,15,0.10)", animation: "slideInRight .28s ease" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: C.green, animation: "pulse 2s infinite" }} /> Agent Feed — live
                </div>
                <button onClick={() => setFeedOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={15} color={C.soft} /></button>
              </div>
              <div ref={feedRef} style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                {feed.length === 0 && <div style={{ fontSize: 12, color: C.soft, padding: 8 }}>Continuous monitoring active. Ambient signal events appear here; press "Run live episode" to replay the golden episode end-to-end.</div>}
                {feed.map((e) => (
                  <div key={e.key} style={{ marginBottom: 10, padding: "9px 11px", borderRadius: 9, border: `1px solid ${e.hot ? C.core : C.line}`, background: e.hot ? C.purpBg : C.bg, animation: "slideIn .35s ease", fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <b style={{ fontSize: 11.5, color: e.hot ? C.deep : C.ink }}>{e.who}</b>
                      <span style={{ fontSize: 10.5, color: C.soft, ...NUM }}>{e.ts}</span>
                    </div>
                    <div style={{ color: C.ink, lineHeight: 1.45, marginBottom: 5 }}>{e.msg}</div>
                    <Tag kind={e.kind} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.ink, color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, display: "flex", gap: 9, alignItems: "center", boxShadow: "0 8px 30px rgba(10,10,15,.25)", zIndex: 60, animation: "slideIn .3s ease" }}>
          <CheckCircle2 size={16} color={C.core} /> {toast}
        </div>
      )}

      {whyOpen && (
        <div onClick={() => setWhyOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(10,10,15,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 70 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, borderRadius: 12, padding: 24, width: 520, maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Why €1.2M? — full deterministic trace</div>
              <button onClick={() => setWhyOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={17} color={C.soft} /></button>
            </div>
            {[
              ["1 · Signal", "Cocoa z-score +2.3 (ICE +18% MoM, ICCO deficit 180k MT, rainfall anomaly)", "det"],
              ["2 · Graph path", "cocoa → Dark 70% / Premium Mix / Seasonal → 11 SKUs → Lines 2–3 → 4 customers", "det"],
              ["3 · Engine inputs", "Volumes at risk × price sensitivity per edge + downtime cost where path crosses production", "det"],
              ["4 · Monte Carlo", "10,000 paths × portfolio D · residual P50 exposure = €1.2M (P10 €0.74M / P90 €1.74M)", "det"],
            ].map(([h, s, k], i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 99, background: C.purpBg, color: C.deep, fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...NUM }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{h.split("· ")[1]} <Tag kind={k} /></div>
                  <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>{s}</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 11.5, color: C.soft, background: C.faint, padding: 10, borderRadius: 8 }}>
              The financial figure and its causal path are produced together — the LLM is structurally barred from generating either.
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ASSISTANT */}
      {!assistantOpen && (
        <button onClick={() => setAssistantOpen(true)} style={{ position: "fixed", bottom: 22, right: 22, width: 58, height: 58, borderRadius: "50%", background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 8px 24px rgba(10,10,15,.18)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 80 }}>
          <MascotIcon size={34} />
        </button>
      )}
      {assistantOpen && (
        <div style={{ position: "fixed", bottom: 22, right: 22, width: 340, height: 440, background: C.bg, borderRadius: 14, border: `1px solid ${C.line}`, boxShadow: "0 16px 48px rgba(10,10,15,.22)", zIndex: 80, display: "flex", flexDirection: "column", overflow: "hidden", animation: "popIn .22s ease" }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, background: C.purpBg }}>
            <MascotIcon size={26} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>FactoryMind Assistant</div>
              <div style={{ fontSize: 10.5, color: C.soft }}>Always-on, narrative only — figures from the engines</div>
            </div>
            <button onClick={() => setAssistantOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={15} color={C.soft} /></button>
          </div>
          <div ref={assistantRef} style={{ flex: 1, overflowY: "auto", padding: 12 }}>
            {assistantMsgs.map((m, i) => (
              <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "85%", padding: "9px 12px", borderRadius: 10, fontSize: 12.5, lineHeight: 1.5, background: m.role === "user" ? C.dark : C.faint, color: m.role === "user" ? "#fff" : C.ink, border: m.role === "user" ? "none" : `1px solid ${C.line}` }}>
                  {m.text}
                </div>
              </div>
            ))}
            {assistantBusy && <div style={{ fontSize: 11.5, color: C.soft, display: "flex", alignItems: "center", gap: 6 }}><Activity size={12} /> typing…</div>}
          </div>
          <div style={{ padding: 10, borderTop: `1px solid ${C.line}`, display: "flex", gap: 8 }}>
            <input value={assistantInput} onChange={(e) => setAssistantInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendAssistant()} placeholder="Ask about EVaR, packets, scenarios…" style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 999, padding: "8px 12px", fontSize: 12.5, fontFamily: FONT, outline: "none" }} />
            <button onClick={sendAssistant} style={{ width: 36, height: 36, borderRadius: "50%", background: C.core, border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
