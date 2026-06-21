import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from "react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceDot,
} from "recharts";
import {
  Activity, ShieldCheck, GitBranch, FlaskConical, FileCheck2, LayoutGrid, Users,
  Building2, ChevronRight, Radio, Clock, CheckCircle2, AlertTriangle,
  XCircle, Cpu, Zap, X, Info, Play, Lock, Database, Send, Sparkles,
  ShoppingCart, Factory, Truck, Handshake, FileText, Plus, Minus, Maximize2,
  Layers, Search, Eye, Download, MoreVertical, ExternalLink, FileArchive,
  FileSpreadsheet, Presentation, Landmark,
  Cloud, Container, TrendingUp, Radar, Network,
  Satellite, Target, Calendar, ChevronDown, Rocket,
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
const fmtMoneyCompact = (value, digits = 2) => {
  const abs = Math.abs(value);
  const prefix = value < 0 ? "−" : "";
  if (abs < 1) return `${prefix}€${Math.round(abs * 1000).toLocaleString("en-US")}k`;
  return `${prefix}€${abs.toFixed(digits)}M`;
};
const fmtMoneyCompactSigned = (value, digits = 2) => {
  const abs = Math.abs(value);
  const prefix = value < 0 ? "−" : "+";
  if (abs < 1) return `${prefix}€${Math.round(abs * 1000).toLocaleString("en-US")}k`;
  return `${prefix}€${abs.toFixed(digits)}M`;
};

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
    { id: "finance", name: "Finance", icon: Landmark, evar: 0.30, state: "Normal", driver: "USD/EUR exposure unhedged · working capital +€2.1M", steward: "C. Ferrari", validated: "08:10", fresh: "ok", conf: 81 },
  ],
  actions: [
    { a: "Advance purchase cocoa", vol: "500 t", cost: 120, conf: 85, clause: "§3.1 — max 4-week forward cover", drop: 0.6 },
    { a: "Hedge forward exposure", vol: "30%", cost: 60, conf: 81, clause: "§3.4 — hedging within board mandate", drop: 0.4 },
    { a: "Activate secondary supplier (Ecuador)", vol: "120 t", cost: 25, conf: 78, clause: "§2.2 — qualified supplier pool", drop: 0.3 },
    { a: "Reroute shipment from Abidjan", vol: "1 vessel", cost: 25, conf: 75, clause: "§5.1 — approved alternate lanes", drop: 0.3 },
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

/* Ambient milestones — meaningful events only (no polling / log noise) */
const AMBIENT = [
  { agent: "Weather Agent",       agentKey: "weather",     status: "Monitoring",          conf: 76, evar: "+€0.10M", model: "Copernicus · NOAA", summary: () => "Rainfall anomaly detected in West Africa" },
  { agent: "Logistics Agent",     agentKey: "logistics",   status: "Recommendation",      conf: 82, evar: "−€0.18M", model: "RouteOpt v2",      summary: () => "Alternative routing via Valencia proposed" },
  { agent: "Commercial Agent",    agentKey: "commercial",  status: "Monitoring",          conf: 63, evar: "+€0.05M", model: "DemandLLM v1.1",   summary: () => "Forecast deviation widening to 9.4%" },
  { agent: "Finance Agent",       agentKey: "finance",     status: "Simulation Complete", conf: 84, evar: "−€0.12M", model: "MarginSim v2",     summary: () => "Projected margin improves by +€120k" },
  { agent: "Procurement Agent",   agentKey: "procurement", status: "Action Ready",        conf: 85, evar: "−€0.90M", model: "Hedging v1.2",     summary: () => "Advance purchase of 500t recommended" },
  { agent: "Intelligence Engine", agentKey: "external",    status: "Monitoring",          conf: 91, evar: "+€1.45M", model: "Signal mesh",      summary: () => "ICE cocoa z-score holding at +2.3" },
];

const ORCHESTRATION_PIPELINE_SEED = [
  { ts: "09:12", agent: "External Intelligence Agent", agentKey: "external", status: "Monitoring", summary: "ICE Cocoa +18%", bridge: "Graph Updated" },
  { ts: "09:13", agent: "Procurement Agent", agentKey: "procurement", status: "Recommendation", summary: "Coverage 27 days", bridge: "Threshold Breach" },
  { ts: "09:13", agent: "Logistics Agent", agentKey: "logistics", status: "Recommendation", summary: "Port delay +8 days", bridge: "EVaR Recalculated" },
  { ts: "09:14", agent: "Orchestrator", agentKey: "orchestrator", status: "Escalated", summary: "Materiality confirmed", bridge: "Scenario Trigger" },
  { ts: "09:15", agent: "Scenario Engine", agentKey: "orchestrator", status: "Simulation Complete", summary: "10,000 simulations completed", bridge: "Best Portfolio Selected" },
  { ts: "09:15", agent: "Orchestrator", agentKey: "orchestrator", status: "Ready for Review", summary: "Decision Packet #24 created" },
];

/* Executive timeline — agent → icon, status → chip palette */
const AGENT_ICON = { weather: Cloud, logistics: Container, finance: TrendingUp, procurement: ShoppingCart, production: Factory, commercial: Handshake, external: Radar, orchestrator: Network, audit: ShieldCheck };
const STATUS_STYLE = {
  "Monitoring":          { c: C.grey,   bg: "#EFEFF2" },
  "Recommendation":      { c: C.amber,  bg: C.amberBg },
  "Simulation Complete": { c: "#0070C0", bg: "#E8F0FB" },
  "Action Ready":        { c: C.deep,   bg: C.purpBg },
  "Ready for Review":    { c: C.core,   bg: C.purpBg },
  "Escalated":           { c: C.red,    bg: C.redBg },
  "Resolved":            { c: C.green,  bg: C.greenBg },
};
const agentFromWho = (who = "") => {
  const w = who.toLowerCase();
  if (w.includes("weather") || w.includes("rainfall")) return { key: "weather", name: "Weather Agent" };
  if (w.includes("logistic")) return { key: "logistics", name: "Logistics Agent" };
  if (w.includes("finance") || w.includes("treasury")) return { key: "finance", name: "Finance Agent" };
  if (w.includes("production")) return { key: "production", name: "Production Agent" };
  if (w.includes("commercial")) return { key: "commercial", name: "Commercial Agent" };
  if (w.includes("procure") || w.includes("market signal") || w.includes("contract") || w.includes("hedging")) return { key: "procurement", name: "Procurement Agent" };
  if (w.includes("audit")) return { key: "audit", name: "Audit Agent" };
  if (w.includes("external") || w.includes("signal") || w.includes("monte") || w.includes("quantif")) return { key: "external", name: "Intelligence Engine" };
  return { key: "orchestrator", name: "Orchestrator" };
};
const statusFromEvent = (e) => {
  const m = (e.msg || e.summary || "").toLowerCase();
  if (e.status) return e.status;
  if (e.fx === "packet" || m.includes("packet #24 ready") || m.includes("packet #24 generated")) return "Ready for Review";
  if ((e.who || "").toLowerCase().includes("audit") || m.includes("approved")) return "Resolved";
  if (m.includes("high-risk")) return "Escalated";
  if (m.includes("constraint catch")) return "Recommendation";
  if (m.includes("complete") || m.includes("monte carlo") || m.includes("graph traversal") || m.includes("priced determin")) return "Simulation Complete";
  if (e.kind === "ai") return "Recommendation";
  return "Monitoring";
};
const oneLine = (s = "", n = 64) => { const t = s.split(/[.·—]/)[0].trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };

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
  { id: 11, name: "Carrier capacity below reroute requirement", cat: "Operational", source: "internal", likelihood: 3, impact: 0.32, velocity: "Days", response: "Reserve Valencia slot", owner: "Logistics" },
  { id: 12, name: "Inbound visibility gap on two cocoa vessels", cat: "Operational", source: "internal", likelihood: 2, impact: 0.22, velocity: "Days", response: "Escalate carrier telemetry", owner: "Logistics" },
  { id: 13, name: "Safety stock allocation conflict", cat: "Operational", source: "internal", likelihood: 3, impact: 0.28, velocity: "Immediate", response: "Re-prioritize SKU allocation", owner: "Commercial" },
  { id: 14, name: "Promotion commitment exceeds secured supply", cat: "Strategic", source: "internal", likelihood: 2, impact: 0.30, velocity: "Weeks", response: "Adjust account promise", owner: "Commercial" },
  { id: 15, name: "Maintenance window compresses Line 3 capacity", cat: "Operational", source: "internal", likelihood: 2, impact: 0.34, velocity: "Days", response: "Move changeover window", owner: "Production" },
  { id: 16, name: "EUR/USD volatility on cocoa purchase timing", cat: "Financial", source: "external", likelihood: 3, impact: 0.26, velocity: "Weeks", response: "Treasury hedge trigger", owner: "Finance" },
  { id: 17, name: "Freight spot-rate spike on West Africa lane", cat: "Financial", source: "external", likelihood: 3, impact: 0.20, velocity: "Weeks", response: "Lock carrier contract", owner: "Logistics" },
  { id: 18, name: "Customer demand signal drift", cat: "Strategic", source: "external", likelihood: 2, impact: 0.18, velocity: "Weeks", response: "Refresh forecast model", owner: "Commercial" },
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
  { id: 26, source: "monitoring", kind: "risk", title: "Cross-domain Monitoring Escalation — Cocoa + Port + Cover Breach", sub: "Agent-originated escalation package", tier: "Auto-promoted to orchestration", icon: Radio, accent: C.amber, date: "14 JUN",
    m: [["Signals used", "5"], ["Agents aligned", "4"], ["Escalated EVaR", "€2.8M"]], headline: "Escalated to Scenario Room" },
  { id: 24, source: "scenario", kind: "risk", title: "Cocoa Supply Shock — Advance Purchase + Hedge", sub: "Executive S&OP action required", tier: "Operations Director (> €200k)", icon: AlertTriangle, accent: C.red, date: "15 JUN",
    m: [["Current EVaR", "€2.8M"], ["After portfolio", "€1.2M"], ["Cost", "€230k"], ["ROI", "7×"]], headline: "−57% EVaR" },
  { id: 25, source: "planning", kind: "opportunity", title: "Buying Window — Cocoa P50 Below 90-Day Average", sub: "Monthly planning opportunity packet", tier: "Operations Lead (€50k–200k)", icon: Zap, accent: C.green, date: "16 JUN",
    m: [["Margin secured", "€140k"], ["Volume", "200 t"], ["Cost", "€55k"]], headline: "+€85k net value" },
];

const PACKET_ALERTS = [
  { ts: "09:12", agent: "External Intelligence Agent", signal: "ICE cocoa +18% vs prior month", severity: "Escalated", confidence: 88, graph: true },
  { ts: "09:12", agent: "Weather Agent", signal: "West Africa rainfall anomaly confirmed", severity: "Watch", confidence: 81, graph: true },
  { ts: "09:14", agent: "Procurement Agent", signal: "Cover policy breached, 18d < 30d", severity: "Escalated", confidence: 84, graph: true },
  { ts: "09:17", agent: "Logistics Agent", signal: "Abidjan lead time +8d on 2 vessels", severity: "Watch", confidence: 79, graph: true },
  { ts: "09:18", agent: "Finance Agent", signal: "Margin exposure recalculated after cocoa repricing", severity: "Monitor", confidence: 84, graph: true },
];

const PACKET_RECOMMENDATIONS = [
  { agent: "Procurement Agent", title: "Increase cocoa cover", impact: "Protects ~€0.90M of local EVaR", evidence: "ICE +18%, ICCO deficit, cover 18d vs 30d policy", status: "Included in packet" },
  { agent: "Finance Agent", title: "Hedge 30% forward exposure", impact: "Reduces margin volatility by ~€0.35M", evidence: "FX-sensitive contracts, cocoa repricing, hedge mandate available", status: "Included in packet" },
  { agent: "Logistics Agent", title: "Reroute one vessel from Abidjan to Valencia", impact: "Recovers up to 5 days of lead time", evidence: "Port congestion, 2 affected vessels, Valencia slot capacity", status: "Awaiting orchestration" },
  { agent: "Production Agent", title: "Reallocate Line 2 overflow to Line 3", impact: "Removes allergen-window bottleneck at +€8k cost", evidence: "Line 2 changeover conflict, Line 3 spare capacity", status: "Included in packet" },
  { agent: "Commercial Agent", title: "Prioritize Retailer X orders", impact: "Protects penalty-bearing OTIF commitment", evidence: "Customer penalty clause, constrained supply window", status: "Rejected by orchestrator" },
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
const SectionLabel = ({ children, icon: SLIcon = null, style: slStyle = {} }: any) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: C.soft, marginBottom: 10, display: "flex", alignItems: "center", gap: 5, ...slStyle }}>
    {SLIcon && <SLIcon size={11} strokeWidth={2.2} style={{ flexShrink: 0, opacity: 0.7 }} />}
    {children}
  </div>
);
const Chev = () => <span style={{ width: 7, height: 7, borderRadius: 99, background: C.core, display: "inline-block", marginRight: 8, flexShrink: 0 }} />;
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

const DOMAIN_SCOPE_CONFIG = [
  { id: "procurement", label: "Procurement", color: C.core, icon: ShoppingCart, match: (r) => r.owner === "Procurement" },
  { id: "production", label: "Production", color: "#1E7145", icon: Factory, match: (r) => r.owner === "Production" },
  { id: "logistics", label: "Logistics", color: "#0070C0", icon: Truck, match: (r) => r.owner === "Logistics" },
  { id: "commercial", label: "Commercial", color: "#D41876", icon: Handshake, match: (r) => r.owner === "Commercial" },
  { id: "finance", label: "Finance", color: "#B86E00", icon: Landmark, match: (r) => r.owner === "Finance" || r.cat === "Financial" },
  { id: "external", label: "External Intelligence", color: "#008080", icon: Radio, match: (r) => r.source === "external" },
];
const RISK_DOMAIN_COLOR = (r) => {
  if (r.owner === "Procurement") return C.core;
  if (r.owner === "Production")  return "#1E7145";
  if (r.owner === "Logistics")   return "#0070C0";
  if (r.owner === "Commercial")  return "#D41876";
  if (r.owner === "Finance")     return "#B86E00";
  return "#008080";
};

function RiskMap() {
  const [domainScope, setDomainScope] = useState(null);
  const [sourceFilter, setSourceFilter] = useState(() => new Set(["external", "internal"]));
  const [regSel, setRegSel] = useState(null);
  const [hoverRisk, setHoverRisk] = useState(null);

  const toggleSource = (s) => setSourceFilter((prev) => {
    const next = new Set(prev);
    if (next.has(s)) { if (next.size > 1) next.delete(s); } // keep at least one active
    else next.add(s);
    return next;
  });

  const Sidebar = (
    <div style={{ width: 270, flexShrink: 0 }}>
      <SectionLabel icon={Search}>Intelligence Scope</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
        {(() => {
          const active = domainScope === null;
          return (
            <button onClick={() => setDomainScope(null)}
              style={{
                minHeight: 50, width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 10, fontSize: 13.5,
                fontWeight: active ? 800 : 650, fontFamily: FONT, cursor: "pointer",
                border: `1px solid ${active ? C.core : "transparent"}`,
                background: active ? "rgba(161,0,255,0.075)" : "transparent",
                color: active ? C.ink : C.soft,
                boxShadow: active ? `0 0 0 3px ${C.core}12, 0 10px 24px rgba(10,10,15,0.05)` : "none",
                transition: "background .18s ease, border-color .18s ease, box-shadow .18s ease, color .18s ease",
              }}>
              <span style={{
                width: 28, height: 28, display: "inline-grid", placeItems: "center", borderRadius: 8,
                background: active ? "#fff" : C.faint,
                border: `1px solid ${active ? `${C.core}33` : C.line}`, flexShrink: 0,
              }}>
                <LayoutGrid size={15} color={active ? C.core : C.soft} strokeWidth={1.9} />
              </span>
              <span style={{ flex: 1, textAlign: "left", lineHeight: 1.2, letterSpacing: 0 }}>All Domains</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: active ? C.core : C.soft, ...NUM }}>{RISK_REGISTER.length}</span>
            </button>
          );
        })()}
        {DOMAIN_SCOPE_CONFIG.map((d) => {
          const active = domainScope === d.id;
          const Icon = d.icon;
          return (
            <button key={d.id} onClick={() => setDomainScope(d.id)}
              style={{
                minHeight: 50,
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 10,
                fontSize: 13.5,
                fontWeight: active ? 800 : 650,
                fontFamily: FONT,
                cursor: "pointer",
                border: `1px solid ${active ? d.color : "transparent"}`,
                background: active ? "rgba(161,0,255,0.075)" : "transparent",
                color: active ? C.ink : C.soft,
                boxShadow: active ? `0 0 0 3px ${d.color}12, 0 10px 24px rgba(10,10,15,0.05)` : "none",
                transition: "background .18s ease, border-color .18s ease, box-shadow .18s ease, color .18s ease, transform .18s ease",
              }}>
              <span style={{
                width: 28,
                height: 28,
                display: "inline-grid",
                placeItems: "center",
                borderRadius: 8,
                background: active ? "#fff" : C.faint,
                border: `1px solid ${active ? `${d.color}33` : C.line}`,
                flexShrink: 0,
              }}>
                <Icon size={15} color={active ? d.color : C.soft} strokeWidth={1.9} />
              </span>
              <span style={{ flex: 1, textAlign: "left", lineHeight: 1.2, letterSpacing: 0 }}>{d.label}</span>
            </button>
          );
        })}
      </div>
      <SectionLabel icon={AlertTriangle}>Risk source</SectionLabel>
      <div style={{ display: "flex", gap: 8 }}>
        {[
          ["internal", "Internal"],
          ["external", "External"],
        ].map(([s, label]) => {
          const active = sourceFilter.has(s);
          return (
            <button key={s} onClick={() => toggleSource(s)}
              style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 999, fontSize: 12, fontWeight: 750, fontFamily: FONT, cursor: "pointer", border: `1.5px solid ${active ? C.core : C.line}`, background: active ? C.purpBg : C.bg, color: active ? C.deep : C.ink, transition: "all .18s ease" }}>
              <span style={{ width: 13, height: 13, borderRadius: 4, border: `1.5px solid ${active ? C.core : C.line}`, background: active ? C.core : C.bg, display: "inline-grid", placeItems: "center", color: "#fff", fontSize: 9, lineHeight: 1 }}>{active ? "✓" : ""}</span>
              {label}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 12, padding: "10px 11px", background: C.faint, borderRadius: 8, fontSize: 11, color: C.soft, lineHeight: 1.45 }}>
        Filter by business ownership first, then narrow by internal or external source.
      </div>
    </div>
  );

  const domainConf = DOMAIN_SCOPE_CONFIG.find((d) => d.id === domainScope);
  const filtered = RISK_REGISTER.filter((r) => sourceFilter.has(r.source) && (!domainConf || domainConf.match(r)));
  const activeDomainColor = domainConf?.color || C.core;
  const impactMax = 1.6;
  const sevTone = (l, im) => { const s = l + (im / impactMax) * 5; return s >= 7 ? C.red : s >= 4.5 ? C.amber : C.green; };
  const selRisk = filtered.find((r) => r.id === regSel) || filtered[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 12, alignItems: "center" }}>
        <div>
          <SectionLabel icon={Layers}>Risk register map</SectionLabel>
        </div>
        <div style={{ fontSize: 11.5, color: C.soft }}>Likelihood × EVaR impact · filtered by domain and source</div>
      </div>
      <div style={{ display: "flex", gap: 16, flex: 1, minHeight: 0 }}>
        {Sidebar}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
              <SectionLabel icon={Activity}>Severity heat map — likelihood × impact</SectionLabel>
              <div style={{ fontSize: 11, color: C.soft, display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
                <span>Showing:</span>
                <b style={{ color: C.ink }}>• {filtered.length} risk{filtered.length !== 1 ? "s" : ""}</b>
                <b style={{ color: C.core }}>• {filtered.filter((r) => r.source === "external").length} external</b>
                <b style={{ color: C.deep }}>• {filtered.filter((r) => r.source === "internal").length} internal</b>
              </div>
            </div>
            <svg viewBox="0 0 900 420" style={{ width: "100%", height: "min(36vh, 360px)", minHeight: 270 }}>
              {[0, 1, 2, 3, 4].map((cx) => [0, 1, 2, 3, 4].map((cy) => {
                const im = (cx + 0.5) / 5 * impactMax, lk = cy + 1;
                return <rect key={`${cx}-${cy}`} x={70 + cx * 152} y={350 - (cy + 1) * 58} width={148} height={55} fill={sevTone(lk, im)} opacity={0.16} rx={5} />;
              }))}
              {[1, 2, 3, 4, 5].map((l) => <text key={l} x={52} y={350 - l * 58 + 31} textAnchor="end" fontSize="15" fontWeight="700" fill={C.soft} fontFamily={FONT}>{l}</text>)}
              {[0, 1, 2, 3, 4].map((cx) => <text key={cx} x={70 + cx * 152 + 74} y={374} textAnchor="middle" fontSize="13" fill={C.soft} fontFamily={FONT}>€{((cx + 1) / 5 * impactMax).toFixed(1)}M</text>)}
              <text x={450} y={405} textAnchor="middle" fontSize="14" fontWeight="800" fill={C.soft} fontFamily={FONT}>Impact (domain EVaR, €M)</text>
              <text x={20} y={205} textAnchor="middle" fontSize="14" fontWeight="800" fill={C.soft} fontFamily={FONT} transform="rotate(-90 20 205)">Likelihood</text>
              {filtered.map((r) => {
                const x = 70 + Math.min(4, r.impact / impactMax * 5) * 152 + 74;
                const y = 350 - r.likelihood * 58 + 29;
                const on = selRisk?.id === r.id;
                const hovering = hoverRisk === r.id;
                const label = r.name.length > 34 ? `${r.name.slice(0, 31)}...` : r.name;
                const labelW = Math.min(230, Math.max(104, label.length * 6.4 + 22));
                const labelY = Math.max(26, y - 48);
                return (
                  <g key={r.id} onMouseEnter={() => setHoverRisk(r.id)} onMouseLeave={() => setHoverRisk(null)} onClick={() => setRegSel(r.id)} style={{ cursor: "pointer" }}>
                    {(hovering || on) && <circle cx={x} cy={y} r={on ? 22 : 18} fill={C.core} opacity={hovering ? 0.18 : 0.1} style={{ transition: "all .24s ease" }} />}
                    <circle cx={x} cy={y} r={on ? 14 : 10} fill={activeDomainColor} stroke="#fff" strokeWidth={3} opacity={on ? 1 : 0.88} style={{ transition: "cx .28s ease, cy .28s ease, r .2s ease, fill .2s ease, opacity .2s ease" }} />
                    {hovering && (
                      <g pointerEvents="none">
                        <rect x={x - labelW / 2} y={labelY - 18} width={labelW} height={27} rx={8} fill={C.ink} opacity={0.94} />
                        <path d={`M ${x - 6} ${labelY + 9} L ${x + 6} ${labelY + 9} L ${x} ${labelY + 16} Z`} fill={C.ink} opacity={0.94} />
                        <text x={x} y={labelY} textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#fff" fontFamily={FONT}>{label}</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.soft, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
              {DOMAIN_SCOPE_CONFIG.map((d) => (
                <span key={d.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: d.color, flexShrink: 0 }} />
                  {d.label}
                </span>
              ))}
              <span style={{ marginLeft: "auto" }}>Cell shading = severity zone (green → amber → red)</span>
            </div>
          </Card>
          <Card style={{ padding: 0, overflow: "hidden", flex: "0 0 340px", display: "flex", flexDirection: "column", minHeight: 340 }}>
            <div style={{ flex: 1, overflowY: "auto", minHeight: 250 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                <thead><tr style={{ background: C.dark, color: "#fff" }}>
                  {["#", "Risk", "Domain", "Source", "Likelihood", "Impact (EVaR)", "Velocity", "Response", "Owner"].map((h) => <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, fontSize: 11 }}>{h}</th>)}
                </tr></thead>
                <tbody>{filtered.map((r) => {
                  const dc = DOMAIN_SCOPE_CONFIG.find((d) => d.match(r));
                  return (
                  <tr key={r.id} onClick={() => setRegSel(r.id)} style={{ borderTop: `1px solid ${C.line}`, background: selRisk?.id === r.id ? C.purpBg : C.bg, cursor: "pointer" }}>
                    <td style={{ padding: "9px 12px", fontWeight: 700, ...NUM }}>{r.id}</td>
                    <td style={{ padding: "9px 12px", fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: "9px 12px" }}>
                      {dc && <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: dc.color, background: dc.color + "15", borderRadius: 999, padding: "2px 8px" }}>{dc.label}</span>}
                    </td>
                    <td style={{ padding: "9px 12px" }}><Pill tone={r.source === "external" ? "amber" : "green"} style={{ textTransform: "capitalize" }}>{r.source}</Pill></td>
                    <td style={{ padding: "9px 12px" }}>{"●".repeat(r.likelihood)}<span style={{ color: C.line }}>{"●".repeat(5 - r.likelihood)}</span></td>
                    <td style={{ padding: "9px 12px", fontWeight: 700, color: sevTone(r.likelihood, r.impact), ...NUM }}>{fmtMoneyCompact(r.impact)}</td>
                    <td style={{ padding: "9px 12px", color: C.soft }}>{r.velocity}</td>
                    <td style={{ padding: "9px 12px", color: C.soft }}>{r.response}</td>
                    <td style={{ padding: "9px 12px", color: C.soft }}>{r.owner}</td>
                  </tr>
                  );
                })}</tbody>
              </table>
            </div>
            <div style={{ padding: "10px 14px", fontSize: 11, color: C.soft, borderTop: `1px solid ${C.line}` }}>
              {filtered.length} of {RISK_REGISTER.length} risks shown · {filtered.filter((r) => r.source === "external").length} external / {filtered.filter((r) => r.source === "internal").length} internal · EVaR figures sum via the propagation graph, not by simple addition.
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
            <text x={x + bw / 2} y={y(s.top) - 8} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.deep} fontFamily={FONT}>{fmtMoneyCompactSigned(-s.drop)}</text>
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
            <text x={x + bw / 2} y={y(b.top) - 8} textAnchor="middle" fontSize="13" fontWeight="800" fill={b.color} fontFamily={FONT}>{fmtMoneyCompactSigned(b.v)}</text>
            <text x={x + bw / 2} y={186} textAnchor="middle" fontSize="10.5" fill={C.soft} fontFamily={FONT}>{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ============ DATA HEALTH CENTER ============ */

const DHC_SOURCES = [
  { id: "erp", name: "ERP", icon: Building2, owner: "C. Ferrari", lastSync: "08:12", status: "synced", freshness: "ok", completeness: 98, validation: "validated", lag: "4 min ago", impact: "Enterprise EVaR, P&L, cost lines" },
  { id: "procurement", name: "Procurement System", icon: ShoppingCart, owner: "M. Rossi", lastSync: "07:40", status: "synced", freshness: "ok", completeness: 96, validation: "validated", lag: "32 min ago", impact: "Supplier contracts, cover days, forward pricing" },
  { id: "production", name: "Production Planning", icon: Factory, owner: "L. Greco", lastSync: "07:55", status: "synced", freshness: "ok", completeness: 94, validation: "validated", lag: "17 min ago", impact: "OEE, schedule health, line constraints" },
  { id: "logistics", name: "Logistics Tracking", icon: Truck, owner: "M. Bianchi", lastSync: "26h ago", status: "needs_refresh", freshness: "stale", completeness: 71, validation: "under_review", lag: "26h ago", impact: "Lead times, shipment status, port flags" },
  { id: "crm", name: "CRM / Sales Forecast", icon: Handshake, owner: "S. Conti", lastSync: "08:05", status: "synced", freshness: "ok", completeness: 88, validation: "validated", lag: "7 min ago", impact: "Demand forecast, OTIF commitments, promo load" },
  { id: "finance", name: "Finance System", icon: Database, owner: "C. Ferrari", lastSync: "08:10", status: "synced", freshness: "ok", completeness: 97, validation: "validated", lag: "2 min ago", impact: "FX exposure, working capital, budget variance" },
  { id: "contracts", name: "Contracts Repository", icon: FileText, owner: "M. Rossi", lastSync: "Yesterday 16:30", status: "needs_refresh", freshness: "watch", completeness: 83, validation: "under_review", lag: "16h ago", impact: "Policy bounds, supplier terms, clause citations" },
  { id: "masterdata", name: "Master Data", icon: GitBranch, owner: "C. Ferrari", lastSync: "08:00", status: "synced", freshness: "ok", completeness: 99, validation: "validated", lag: "12 min ago", impact: "Graph nodes: recipes, SKUs, lines, customers" },
];

const DHC_GRAPH_CATS = [
  { name: "Suppliers", nodes: 24, validated: 24, color: C.core },
  { name: "Commodities", nodes: 8, validated: 8, color: C.deep },
  { name: "Contracts", nodes: 31, validated: 26, color: C.amber },
  { name: "Recipes", nodes: 47, validated: 47, color: C.green },
  { name: "SKUs", nodes: 183, validated: 183, color: C.dark },
  { name: "Prod. Lines", nodes: 3, validated: 3, color: "#5B5B66" },
  { name: "Shipping Lanes", nodes: 18, validated: 14, color: "#8B6BB8" },
  { name: "Customers", nodes: 62, validated: 62, color: "#3D7EAA" },
  { name: "Policies", nodes: 29, validated: 24, color: C.red },
];

const DHC_FRESHNESS = [
  { check: "Inventory coverage", owner: "M. Rossi", validated: "07:40", status: "ok", impact: "Cover days calculation — core to Procurement EVaR" },
  { check: "Supplier contracts", owner: "M. Rossi", validated: "Yesterday 16:30", status: "watch", impact: "Policy clause citations in Decision Packets" },
  { check: "Production schedule", owner: "L. Greco", validated: "07:55", status: "ok", impact: "Schedule health, constraint veto, cascades" },
  { check: "Customer orders", owner: "S. Conti", validated: "08:05", status: "ok", impact: "OTIF commitments, commercial EVaR" },
  { check: "Freight lead times", owner: "M. Bianchi", validated: "26h ago", status: "stale", impact: "Logistics EVaR, reroute recommendations" },
  { check: "Financial exposure", owner: "C. Ferrari", validated: "08:10", status: "ok", impact: "FX EVaR, margin at risk, cash flow projection" },
  { check: "Policy documents", owner: "Legal / M. Rossi", validated: "Yesterday 16:30", status: "watch", impact: "Agent authorization bounds, approval tiers" },
  { check: "Commodity price signals", owner: "Signal Layer", validated: "08:12", status: "ok", impact: "Market EVaR, Monte Carlo inputs" },
];

const DHC_SCORE_BREAKDOWN = [
  { dim: "Freshness", score: 86, weight: 25, detail: "2 sources stale (Logistics, Contracts)", tone: "amber" },
  { dim: "Completeness", score: 91, weight: 20, detail: "Logistics at 71% — below 85% threshold", tone: "amber" },
  { dim: "Validation", score: 94, weight: 25, detail: "6 of 8 sources fully validated", tone: "green" },
  { dim: "Graph coverage", score: 93, weight: 20, detail: "45 of 405 nodes unvalidated", tone: "green" },
  { dim: "Steward accountability", score: 97, weight: 10, detail: "7 of 8 stewards confirmed this cycle", tone: "green" },
];

const freshTone = (s) => ({ ok: "green", watch: "amber", stale: "red" }[s] || "grey");
const freshLabel = (s) => ({ ok: "Current", watch: "Watch", stale: "Stale" }[s] || s);
const srcStatusTone = (s) => ({ synced: "green", needs_refresh: "red", missing: "amber" }[s] || "grey");
const srcStatusLabel = (s) => ({ synced: "Synced", needs_refresh: "Needs refresh", missing: "Missing fields" }[s] || s);
const valTone = (s) => ({ validated: "green", under_review: "amber", missing: "red" }[s] || "grey");
const valLabel = (s) => ({ validated: "Validated", under_review: "Under review", missing: "Missing" }[s] || s);

function ReadinessGauge({ score }) {
  const tone = score >= 90 ? C.green : score >= 75 ? C.amber : C.red;
  const circ = 2 * Math.PI * 54;
  const offset = circ * (1 - score / 100);
  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
      <circle cx="70" cy="70" r="54" fill="none" stroke={C.line} strokeWidth={10} />
      <circle cx="70" cy="70" r="54" fill="none" stroke={tone} strokeWidth={10}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 70 70)" />
      <text x="70" y="64" fontSize="30" fontWeight="800" fill={tone} textAnchor="middle" fontFamily={FONT} dominantBaseline="central" style={NUM}>{score}</text>
      <text x="70" y="86" fontSize="10" fill={C.soft} textAnchor="middle" fontFamily={FONT}>/ 100</text>
    </svg>
  );
}

function SourceCard({ src, risk }) {
  const Icon = src.icon;
  const tone = src.freshness === "stale" ? C.red : src.freshness === "watch" ? C.amber : C.line;
  const atRisk = src.freshness === "stale" || src.freshness === "watch" || src.completeness < 85 || src.validation === "under_review";
  const riskTone = src.freshness === "stale" || src.completeness < 85 ? C.red : C.amber;
  const glow = risk && atRisk;
  const dim = risk && !atRisk;
  return (
    <Card style={{ padding: 14, borderLeft: `3px solid ${tone}`, boxShadow: glow ? `0 0 0 2px ${riskTone}, 0 0 22px ${riskTone}55` : undefined, opacity: dim ? 0.4 : 1, filter: dim ? "grayscale(0.7)" : "none", transform: glow ? "translateY(-2px)" : "none", transition: "all .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: glow ? riskTone + "1A" : C.purpBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={15} color={glow ? riskTone : C.deep} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{src.name}</div>
          <div style={{ fontSize: 10.5, color: C.soft }}>{src.owner}</div>
        </div>
      </div>

      {/* Status row */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
        {glow && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9.5, fontWeight: 800, color: "#fff", background: riskTone, borderRadius: 999, padding: "2px 8px" }}><AlertTriangle size={9} /> AT RISK</span>}
        <Pill tone={srcStatusTone(src.status)}>{srcStatusLabel(src.status)}</Pill>
        <Pill tone={valTone(src.validation)}>{valLabel(src.validation)}</Pill>
      </div>

      {/* Completeness bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.soft, marginBottom: 3 }}>
          <span>Completeness</span>
          <b style={{ color: src.completeness < 85 ? C.red : src.completeness < 93 ? C.amber : C.green, ...NUM }}>{src.completeness}%</b>
        </div>
        <div style={{ height: 5, background: C.line, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${src.completeness}%`, height: "100%", background: src.completeness < 85 ? C.red : src.completeness < 93 ? C.amber : C.green, borderRadius: 99 }} />
        </div>
      </div>

      {/* Last sync */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: src.freshness === "stale" ? C.red : src.freshness === "watch" ? C.amber : C.soft }}>
        <Clock size={10} />
        <span>{src.lag}</span>
        <Pill tone={freshTone(src.freshness)} style={{ marginLeft: "auto", fontSize: 9.5 }}>{freshLabel(src.freshness)}</Pill>
      </div>
    </Card>
  );
}

/* Live, animated knowledge-graph dot network */
function KnowledgeGraphLive({ risk }) {
  const clusters = [
    { key: "sig",    x: 60,  ys: [50, 108, 166, 222], col: C.amber },
    { key: "risk",   x: 190, ys: [86, 152, 218],      col: C.core },
    { key: "recipe", x: 320, ys: [54, 112, 170, 226], col: C.deep },
    { key: "sku",    x: 450, ys: [62, 124, 186, 240], col: "#0070C0" },
    { key: "line",   x: 565, ys: [98, 172],           col: "#1E7145" },
    { key: "cust",   x: 670, ys: [74, 144, 214],      col: "#D41876" },
  ];
  const broken = new Set(["sku-3", "line-0"]);
  const watch = new Set(["sig-2", "recipe-2"]);
  const nodes = [];
  clusters.forEach((cl) => cl.ys.forEach((y, j) => {
    const id = `${cl.key}-${j}`;
    const status = broken.has(id) ? "broken" : watch.has(id) ? "watch" : "ok";
    nodes.push({ id, x: cl.x, y, base: cl.col, status });
  }));
  const hub = { id: "evar", x: 720, y: 144 };
  const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = [];
  for (let c = 0; c < clusters.length - 1; c++) {
    const a = clusters[c], b = clusters[c + 1];
    a.ys.forEach((_, i) => {
      edges.push([`${a.key}-${i}`, `${b.key}-${i % b.ys.length}`]);
      edges.push([`${a.key}-${i}`, `${b.key}-${(i + 1) % b.ys.length}`]);
    });
  }
  clusters[clusters.length - 1].ys.forEach((_, i) => edges.push([`cust-${i}`, "evar"]));
  const pos = (id) => (id === "evar" ? hub : N[id]);
  const colOf = (n) => n.status === "broken" ? C.red : n.status === "watch" ? C.amber : n.base;
  const hubEdges = edges.filter(([, b]) => b === "evar");
  const drift = (i) => { const a = 2 + (i % 3), b = 2 + (i % 4); return `0 0; ${a} ${-b}; ${-a} ${b}; ${b} ${a}; 0 0`; };
  return (
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px 6px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: C.soft }}>Company Master Knowledge Graph — live</span>
        <span style={{ flex: 1 }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9.5, fontWeight: 800, color: C.green }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: C.green, animation: "pulse 1.6s infinite" }} /> 1,842 edges flowing
        </span>
      </div>
      <svg viewBox="0 0 760 280" style={{ width: "100%", display: "block" }}>
        <defs>
          {hubEdges.map(([a], i) => <path key={i} id={`kg${i}`} d={`M${pos(a).x} ${pos(a).y} L${hub.x} ${hub.y}`} />)}
          <radialGradient id="kgHub" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={C.red} stopOpacity="0.5" /><stop offset="100%" stopColor={C.red} stopOpacity="0" /></radialGradient>
        </defs>
        {edges.map(([a, b], i) => {
          const A = pos(a), B = pos(b);
          const bad = N[a]?.status === "broken" || N[b]?.status === "broken";
          return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={bad ? C.red : C.line} strokeWidth={bad ? 1.4 : 1} strokeDasharray={bad ? "3 4" : "none"} opacity={risk ? (bad ? 0.9 : 0.18) : 0.5} />;
        })}
        {hubEdges.map((_, i) => <circle key={i} r="2.6" fill={C.core}><animateMotion dur={`${2.6 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.5}s`}><mpath href={`#kg${i}`} /></animateMotion></circle>)}
        {nodes.map((n, i) => {
          const c = colOf(n);
          const atRisk = n.status !== "ok";
          const glow = risk && atRisk;
          const dim = risk && !atRisk;
          return (
            <g key={n.id} opacity={dim ? 0.3 : 1} style={{ transition: "opacity .3s" }}>
              <animateTransform attributeName="transform" type="translate" values={drift(i)} dur={`${5 + (i % 5)}s`} repeatCount="indefinite" />
              {(glow || n.id === "evar") && <circle cx={n.x} cy={n.y} r="11" fill={c} opacity="0.18"><animate attributeName="r" values="8;15;8" dur="2.2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.28;0;0.28" dur="2.2s" repeatCount="indefinite" /></circle>}
              <circle cx={n.x} cy={n.y} r={glow ? 6 : 4.6} fill={c}>
                {n.status === "broken" ? <animate attributeName="opacity" values="1;0.25;1" dur="0.9s" repeatCount="indefinite" /> : <animate attributeName="opacity" values="0.65;1;0.65" dur={`${2.4 + (i % 4) * 0.4}s`} repeatCount="indefinite" />}
              </circle>
            </g>
          );
        })}
        <circle cx={hub.x} cy={hub.y} r="22" fill="url(#kgHub)" />
        <circle cx={hub.x} cy={hub.y} r="11" fill={C.red} />
        <text x={hub.x} y={hub.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="800" fill="#fff" fontFamily={FONT}>EVaR</text>
        {[["Signals", 60], ["Risks", 190], ["Recipes", 320], ["SKUs", 450], ["Lines", 565], ["Customers", 670]].map(([l, x]) => (
          <text key={l} x={x} y={272} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.soft} fontFamily={FONT}>{l}</text>
        ))}
      </svg>
      <div style={{ padding: "6px 16px 12px", fontSize: 11, color: C.soft, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        {[["Validated", C.green], ["Under review", C.amber], ["Broken link", C.red]].map(([l, c]) => (
          <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: c }} />{l}</span>
        ))}
        <span style={{ marginLeft: "auto" }}>Nodes drift live · particles flow toward Enterprise EVaR</span>
      </div>
    </Card>
  );
}

function GraphHealthVisual({ risk }) {
  const totalNodes = DHC_GRAPH_CATS.reduce((a, c) => a + c.nodes, 0);
  const totalValidated = DHC_GRAPH_CATS.reduce((a, c) => a + c.validated, 0);
  const maxNodes = Math.max(...DHC_GRAPH_CATS.map((c) => c.nodes));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14 }}>
      {/* KPI strip */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["Total nodes", totalNodes, "grey"],
          ["Total edges", "1,842", "grey"],
          ["Validated nodes", `${Math.round(totalValidated / totalNodes * 100)}%`, "green"],
          ["Validated edges", "97%", "green"],
          ["Broken links", "3", "red"],
          ["High-exposure paths validated", "11 / 11", "green"],
        ].map(([l, v, t], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: C.faint, borderRadius: 7 }}>
            <span style={{ fontSize: 12, color: C.soft }}>{l}</span>
            <b style={{ fontSize: 13, color: t === "red" ? C.red : t === "green" ? C.green : C.ink, ...NUM }}>{v}</b>
          </div>
        ))}
        <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.5, marginTop: 4 }}>
          3 broken links: 2 in Shipping Lanes (stale logistics data), 1 in Contracts (expired clause reference). Not on high-exposure paths — agents continue operating.
        </div>
      </div>

      {/* Category bars */}
      <Card style={{ padding: 14 }}>
        <SectionLabel icon={Network}>GRAPH CATEGORIES — VALIDATED / TOTAL NODES</SectionLabel>
        {DHC_GRAPH_CATS.map((cat, i) => {
          const pct = Math.round(cat.validated / cat.nodes * 100);
          const catRisk = pct < 100;
          const glow = risk && catRisk;
          const dim = risk && !catRisk;
          return (
            <div key={i} style={{ marginBottom: 10, padding: glow ? "6px 8px" : 0, margin: glow ? "0 -8px 10px" : "0 0 10px", borderRadius: 8, background: glow ? C.redBg : "transparent", opacity: dim ? 0.4 : 1, transition: "all .3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
                <span style={{ fontWeight: 600, color: glow ? C.red : C.ink }}>{cat.name}{glow ? " · at risk" : ""}</span>
                <span style={{ color: pct < 90 ? C.amber : C.soft, ...NUM }}>{cat.validated} / {cat.nodes}</span>
              </div>
              <div style={{ position: "relative", height: 14, background: C.line, borderRadius: 99, boxShadow: glow ? `0 0 10px ${C.red}55` : "none" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: cat.color, opacity: 0.78, borderRadius: 99 }} />
                {pct < 100 && (
                  <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 9, color: C.amber, fontWeight: 700 }}>
                    {cat.nodes - cat.validated} unvalidated
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function FreshnessChecklist({ risk }) {
  const staleCount = DHC_FRESHNESS.filter((f) => f.status === "stale").length;
  const watchCount = DHC_FRESHNESS.filter((f) => f.status === "watch").length;
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "13px 16px 10px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 14 }}>
        <SectionLabel icon={Clock} style={{ margin: 0 }}>DATA FRESHNESS CHECKS</SectionLabel>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <Pill tone="green">{DHC_FRESHNESS.length - staleCount - watchCount} current</Pill>
          {watchCount > 0 && <Pill tone="amber">{watchCount} watch</Pill>}
          {staleCount > 0 && <Pill tone="red">{staleCount} stale</Pill>}
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: C.faint }}>
            {["Data check", "Status", "Owner", "Last validated", "Business impact if stale"].map((h) => (
              <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.soft }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DHC_FRESHNESS.map((f, i) => {
            const fRisk = f.status === "stale" || f.status === "watch";
            const glow = risk && fRisk;
            const dim = risk && !fRisk;
            return (
            <tr key={i} style={{ borderTop: `1px solid ${C.line}`, background: f.status === "stale" ? C.redBg : f.status === "watch" ? C.amberBg : C.bg, opacity: dim ? 0.4 : 1, boxShadow: glow ? `inset 3px 0 0 ${f.status === "stale" ? C.red : C.amber}` : "none", transition: "all .3s ease" }}>
              <td style={{ padding: "10px 14px", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                {f.status === "ok"
                  ? <CheckCircle2 size={14} color={C.green} />
                  : f.status === "watch"
                  ? <AlertTriangle size={14} color={C.amber} />
                  : <XCircle size={14} color={C.red} />}
                {f.check}
              </td>
              <td style={{ padding: "10px 14px" }}><Pill tone={freshTone(f.status)}>{freshLabel(f.status)}</Pill></td>
              <td style={{ padding: "10px 14px", color: C.soft }}>{f.owner}</td>
              <td style={{ padding: "10px 14px", color: C.soft, ...NUM, whiteSpace: "nowrap" }}>{f.validated}</td>
              <td style={{ padding: "10px 14px", fontSize: 11.5, color: C.soft, maxWidth: 260 }}>{f.impact}</td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function ReadinessPanel({ risk }) {
  const weighted = DHC_SCORE_BREAKDOWN.reduce((acc, d) => acc + (d.score * d.weight) / 100, 0);
  const totalScore = Math.round(weighted);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start" }}>
      <div style={{ textAlign: "center" }}>
        <ReadinessGauge score={totalScore} />
        <div style={{ fontSize: 12, fontWeight: 700, color: C.soft, marginTop: 4 }}>Data Readiness Score</div>
        <div style={{ marginTop: 8 }}>
          <Pill tone={totalScore >= 90 ? "green" : totalScore >= 75 ? "amber" : "red"}>
            {totalScore >= 90 ? "Governance ready" : totalScore >= 75 ? "Partially ready" : "Action required"}
          </Pill>
        </div>
      </div>
      <div>
        {DHC_SCORE_BREAKDOWN.map((d, i) => {
          const dRisk = d.tone === "red" || d.tone === "amber";
          const glow = risk && dRisk;
          const dim = risk && !dRisk;
          return (
          <div key={i} style={{ marginBottom: 13, padding: glow ? "8px 10px" : 0, margin: glow ? "0 -10px 13px" : "0 0 13px", borderRadius: 8, background: glow ? (d.tone === "red" ? C.redBg : C.amberBg) : "transparent", opacity: dim ? 0.4 : 1, transition: "all .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{d.dim}</span>
                <span style={{ fontSize: 11, color: C.soft, marginLeft: 8 }}>weight {d.weight}%</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <b style={{ fontSize: 14, color: d.tone === "red" ? C.red : d.tone === "amber" ? C.amber : C.green, ...NUM }}>{d.score}</b>
                <Pill tone={d.tone}>{d.tone === "green" ? "Good" : d.tone === "amber" ? "Watch" : "At risk"}</Pill>
              </div>
            </div>
            <div style={{ position: "relative", height: 8, background: C.line, borderRadius: 99, marginBottom: 3 }}>
              <div style={{ width: `${d.score}%`, height: "100%", background: d.tone === "red" ? C.red : d.tone === "amber" ? C.amber : C.green, opacity: 0.75, borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 11, color: C.soft }}>{d.detail}</div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function AITrustGate() {
  const staleSources = DHC_SOURCES.filter((s) => s.freshness === "stale").length;
  const lowComplete = DHC_SOURCES.filter((s) => s.completeness < 85).length;
  const graphValidationPct = 89;
  const criticalStale = staleSources > 0;
  const graphBelowThreshold = graphValidationPct < 85;
  const gateState = criticalStale || graphBelowThreshold ? "pre_alert" : "cleared";

  const gateConfig = {
    cleared: {
      label: "Cleared for recommendations",
      sublabel: "All critical sources validated · graph coverage nominal · agents operating at full authorization",
      tone: "green", bg: C.greenBg, border: C.green, icon: CheckCircle2,
    },
    pre_alert: {
      label: "Pre-alert mode active",
      sublabel: "1 critical source stale (Logistics) and 2 under review (Contracts, Policies). Agents may generate insights and monitoring alerts only — approved Decision Packets require steward re-validation of affected domains before release.",
      tone: "amber", bg: C.amberBg, border: C.amber, icon: AlertTriangle,
    },
    suspended: {
      label: "Recommendations suspended",
      sublabel: "Critical data quality failure. Agents are monitoring only — no Decision Packets will be released until data health is restored.",
      tone: "red", bg: C.redBg, border: C.red, icon: XCircle,
    },
  };

  const cfg = gateConfig[gateState];
  const GIcon = cfg.icon;

  const rules = [
    { rule: "All 8 data sources synced within SLA", met: staleSources === 0, detail: `${staleSources} source${staleSources !== 1 ? "s" : ""} stale` },
    { rule: "Source completeness ≥ 85% across all systems", met: lowComplete === 0, detail: `${lowComplete} source${lowComplete !== 1 ? "s" : ""} below threshold` },
    { rule: "Knowledge graph validation ≥ 85%", met: graphValidationPct >= 85, detail: `Current: ${graphValidationPct}%` },
    { rule: "High-exposure graph paths validated", met: true, detail: "11 / 11 paths clear" },
    { rule: "All domain stewards confirmed this cycle", met: true, detail: "7 / 8 confirmed (Logistics pending)" },
    { rule: "No broken links on active decision paths", met: true, detail: "3 broken links — off critical path" },
  ];

  const metCount = rules.filter((r) => r.met).length;

  return (
    <div>
      {/* Gate status banner */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 20px", borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, marginBottom: 14 }}>
        <GIcon size={22} color={cfg.border} style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{cfg.label}</div>
          <div style={{ fontSize: 12.5, color: C.soft, lineHeight: 1.6 }}>{cfg.sublabel}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: C.soft, marginBottom: 4 }}>Rules passed</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: cfg.border, ...NUM }}>{metCount} / {rules.length}</div>
        </div>
      </div>

      {/* Rule checklist */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {rules.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.faint, borderRadius: 8, border: `1px solid ${r.met ? C.line : C.amber}` }}>
            {r.met
              ? <CheckCircle2 size={15} color={C.green} style={{ flexShrink: 0 }} />
              : <AlertTriangle size={15} color={C.amber} style={{ flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{r.rule}</div>
              <div style={{ fontSize: 11, color: r.met ? C.soft : C.amber }}>{r.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: C.faint, fontSize: 11.5, color: C.soft, lineHeight: 1.6, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Lock size={13} color={C.soft} style={{ marginTop: 1, flexShrink: 0 }} />
        <span>Gate logic: if any critical source (ERP, Procurement, Production, CRM, Finance) is stale OR graph validation falls below 85%, agents are restricted to monitoring mode. Agents in pre-alert mode may still surface observations and flag anomalies — they cannot release approved Decision Packets without steward sign-off on the affected domain.</span>
      </div>
    </div>
  );
}

function DHC() {
  const [dhcTab, setDhcTab] = useState("sources");
  const [riskOn, setRiskOn] = useState(false);
  const staleCount = DHC_SOURCES.filter((s) => s.freshness === "stale").length;
  const watchCount = DHC_SOURCES.filter((s) => s.freshness === "watch").length;
  const allSourcesOk = staleCount === 0 && watchCount === 0;
  const weighted = DHC_SCORE_BREAKDOWN.reduce((acc, d) => acc + (d.score * d.weight) / 100, 0);
  const totalScore = Math.round(weighted);

  const DHC_TABS = [
    { id: "sources", label: "Data Sources", icon: Database },
    { id: "graph", label: "Knowledge Graph", icon: GitBranch },
    { id: "freshness", label: "Freshness Checks", icon: Clock },
    { id: "readiness", label: "Readiness Score", icon: Activity },
    { id: "trust", label: "AI Trust Gate", icon: ShieldCheck },
  ];

  return (
    <div>
      {/* Header strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          ["Data Readiness Score", `${totalScore} / 100`, totalScore >= 90 ? "green" : "amber", Activity],
          ["Sources connected", `${DHC_SOURCES.filter(s => s.status === "synced").length} / ${DHC_SOURCES.length}`, allSourcesOk ? "green" : "amber", Database],
          ["Stale data sources", staleCount, staleCount === 0 ? "green" : "red", Clock],
          ["Graph nodes validated", "89%", "green", Network],
          ["AI Trust Gate", staleCount > 0 ? "Pre-alert" : "Cleared", staleCount > 0 ? "amber" : "green", ShieldCheck],
        ].map(([l, v, t, CardIco]: any, i) => (
          <Card key={i} style={{ padding: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.soft, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.3, display: "flex", alignItems: "center", gap: 4 }}>
              {CardIco && <CardIco size={9} strokeWidth={2.2} style={{ flexShrink: 0, opacity: 0.6 }} />}{l}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: t === "red" ? C.red : t === "amber" ? C.amber : C.green, letterSpacing: -0.5, ...NUM }}>{v}</div>
          </Card>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: `1px solid ${C.line}`, paddingBottom: 12 }}>
        {DHC_TABS.map((tb) => {
          const Icon = tb.icon;
          const hasAlert = (tb.id === "sources" && staleCount > 0) || (tb.id === "freshness" && staleCount > 0) || (tb.id === "trust" && staleCount > 0);
          return (
            <button key={tb.id} onClick={() => setDhcTab(tb.id)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${dhcTab === tb.id ? C.core : C.line}`, background: dhcTab === tb.id ? C.purpBg : C.bg, color: dhcTab === tb.id ? C.deep : C.ink, position: "relative" }}>
              <Icon size={14} color={dhcTab === tb.id ? C.deep : C.soft} />
              {tb.label}
              {hasAlert && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: 99, background: C.amber }} />}
            </button>
          );
        })}
        <span style={{ flex: 1 }} />
        <button onClick={() => setRiskOn((r) => !r)}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer", border: `1px solid ${riskOn ? C.red : C.line}`, background: riskOn ? C.redBg : C.bg, color: riskOn ? C.red : C.ink, boxShadow: riskOn ? `0 0 0 2px ${C.red}22` : "none", transition: "all .2s" }}>
          <AlertTriangle size={14} color={riskOn ? C.red : C.soft} /> {riskOn ? "Risk view: on" : "Highlight risk"}
        </button>
      </div>

      {/* Tab content */}
      {dhcTab === "sources" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: C.soft }}>
              {DHC_SOURCES.filter(s => s.status === "synced").length} of {DHC_SOURCES.length} sources synced · border color = freshness status
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["green", "Current"], ["amber", "Watch"], ["red", "Stale"]].map(([c, l]) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.soft }}>
                  <span style={{ width: 10, height: 10, borderLeft: `3px solid ${c === "green" ? C.green : c === "amber" ? C.amber : C.red}`, display: "inline-block" }} />{l}
                </div>
              ))}
            </div>
          </div>
          {riskOn && (
            <div style={{ marginBottom: 12, padding: "9px 14px", borderRadius: 8, background: C.redBg, border: `1px solid ${C.red}33`, fontSize: 12, color: C.red, fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
              <AlertTriangle size={14} /> Risk view — areas feeding enterprise exposure are lit up; validated sources are dimmed.
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {DHC_SOURCES.map((src) => <SourceCard key={src.id} src={src} risk={riskOn} />)}
          </div>
          {(staleCount > 0 || watchCount > 0) && (
            <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: C.amberBg, border: `1px solid ${C.amber}20`, fontSize: 12, color: C.soft, display: "flex", gap: 8, alignItems: "center" }}>
              <AlertTriangle size={14} color={C.amber} />
              <span><b style={{ color: C.amber }}>{staleCount} stale · {watchCount} under review.</b> Agents have been restricted to pre-alert mode for domains dependent on Logistics and Contracts data until stewards re-validate.</span>
            </div>
          )}
        </div>
      )}

      {dhcTab === "graph" && (
        <div>
          <div style={{ fontSize: 12, color: C.soft, marginBottom: 14, lineHeight: 1.55 }}>
            The Company Master Knowledge Graph is the backbone of FactoryMind — it encodes the causal relationships the Quantification Engine walks when pricing exposure. Every node and edge must be validated before the agent layer can use it in a Decision Packet.
          </div>
          <KnowledgeGraphLive risk={riskOn} />
          <GraphHealthVisual risk={riskOn} />
        </div>
      )}

      {dhcTab === "freshness" && <FreshnessChecklist risk={riskOn} />}

      {dhcTab === "readiness" && (
        <Card style={{ padding: 20 }}>
          <SectionLabel icon={Activity}>DATA READINESS SCORE — WEIGHTED COMPOSITE</SectionLabel>
          <div style={{ fontSize: 12, color: C.soft, marginBottom: 16, lineHeight: 1.55 }}>
            Score is a weighted composite of five governance dimensions. A score below 75 triggers automatic restriction of the AI Trust Gate. Below 60, all Decision Packet generation is suspended.
          </div>
          <ReadinessPanel risk={riskOn} />
          <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, background: C.faint, fontSize: 11.5, color: C.soft, lineHeight: 1.6 }}>
            Score methodology: Freshness (25%) · Completeness (20%) · Validation (25%) · Graph coverage (20%) · Steward accountability (10%). Weights are configurable by the Data Governance team.
          </div>
        </Card>
      )}

      {dhcTab === "trust" && (
        <div>
          <div style={{ fontSize: 12, color: C.soft, marginBottom: 14, lineHeight: 1.55 }}>
            The AI Trust Gate is the final authorization check before agents release Decision Packets to human approvers. It is deterministic — not an AI judgment. All six rules must pass for full clearance.
          </div>
          <AITrustGate />
        </div>
      )}
    </div>
  );
}

/* ============ BUSINESS INTELLIGENCE DATA ============ */
const BI_TABS = [
  { id: "procurement", label: "Procurement", icon: ShoppingCart },
  { id: "production", label: "Production", icon: Factory },
  { id: "logistics", label: "Logistics", icon: Truck },
  { id: "commercial", label: "Commercial", icon: Handshake },
  { id: "finance", label: "Finance", icon: Database },
  { id: "external", label: "External Intelligence", icon: Radio },
];

const AI_INSIGHTS = {
  procurement: [
    "Cocoa cover gap (−12 days vs policy) compounds with the ICCO deficit — advance purchase should be prioritized over hedging alone.",
    "Supplier A concentration at 48% creates single-source risk; Ecuador lot available this week reduces that to 31%.",
    "Forward contract at €3,870/t expires in 6 weeks — renewal pricing likely higher given current z-score +2.3.",
  ],
  production: [
    "Line 2 allergen window Thu 22:00–04:00 conflicts with the proposed 500t run — shift to Line 3 adds €8k but avoids a €210k weekly exposure.",
    "OEE at 71% is 6pts below target; downtime pattern suggests a preventive maintenance gap on Line 2, not a demand issue.",
    "Current schedule health is at risk weeks T+2–T+4 due to cascaded cocoa action; confirm Line 3 capacity before approving Packet #24.",
  ],
  logistics: [
    "Abidjan congestion (+8 days) affects 2 inbound vessels — rerouting to Valencia recovers 5 of those 8 days at €25k cost.",
    "Carrier OTD at 91% is below the 94% SLA threshold; secondary carrier activation recommended for high-priority lanes.",
    "Freight cost index is +11% vs baseline; monitor for a further +6% if port congestion persists beyond 2 weeks.",
  ],
  commercial: [
    "Forecast deviation at 9.4% is approaching the 10% escalation threshold — recommend a mid-cycle reforecast with the top 3 accounts.",
    "Promotional load weeks T+3–T+5 coincides with the cocoa supply constraint; confirm production allocation before committing volumes.",
    "Retailer X OTIF penalty clause activates below 95% — current trajectory at 93.2% requires schedule prioritization.",
  ],
  finance: [
    "Unhedged FX exposure on USD-priced contracts represents €0.12M EVaR; forward cover at current rates locks in favorable EUR/USD.",
    "Working capital is €2.1M above seasonal norm due to cocoa pre-build inventory — monitor for liquidity tightening in week T+3.",
    "EBITDA impact of Packet #24 portfolio is €230k cost against €1.60M value protected — IRR positive at any confidence > 67%.",
  ],
  external: [
    "ICE cocoa z-score +2.3 is the highest in 18 months; ICCO and Copernicus data both confirm supply-side pressure.",
    "West Africa rainfall deficit is now in its 3rd consecutive week — harvest yield risk window is 6–10 weeks out.",
    "No new EUDR requirements in the last 24h, but EU Commission review scheduled for Q3 2026 — documentation gap should be closed proactively.",
  ],
};

const BI_ACTIONS = {
  procurement: [
    { a: "Advance purchase cocoa 500t", status: "Pending approval", tone: "amber", ref: "#24" },
    { a: "Hedge 30% forward exposure", status: "Pending approval", tone: "amber", ref: "#24" },
    { a: "Activate secondary supplier — Ecuador", status: "Recommended", tone: "purple", ref: "#24" },
    { a: "Buying window: advance 200t at P50", status: "Pending approval", tone: "green", ref: "#25" },
  ],
  production: [
    { a: "Shift 500t run to Line 3 (allergen conflict)", status: "Resolved — feasible", tone: "green", ref: "#24" },
    { a: "Schedule T+2–T+6 validation", status: "Completed", tone: "green", ref: "#24" },
    { a: "Preventive maintenance — Line 2", status: "Recommended", tone: "amber", ref: "—" },
  ],
  logistics: [
    { a: "Reroute 1 vessel from Abidjan → Valencia", status: "Pending approval", tone: "amber", ref: "#24" },
    { a: "Secondary carrier activation", status: "Recommended", tone: "purple", ref: "—" },
    { a: "Valencia port capacity confirmation", status: "Confirmed", tone: "green", ref: "#24" },
  ],
  commercial: [
    { a: "Mid-cycle reforecast — top 3 accounts", status: "Recommended", tone: "amber", ref: "—" },
    { a: "Retailer X OTIF schedule prioritization", status: "In progress", tone: "amber", ref: "#24" },
    { a: "Promotional allocation confirmation T+3–T+5", status: "Pending", tone: "amber", ref: "#25" },
  ],
  finance: [
    { a: "FX forward cover — USD contracts", status: "Recommended", tone: "amber", ref: "—" },
    { a: "Working capital monitor — week T+3", status: "Flagged", tone: "red", ref: "—" },
    { a: "Packet #24 cost authorization — €230k", status: "Pending CFO", tone: "amber", ref: "#24" },
  ],
  external: [
    { a: "EUDR documentation gap closure", status: "In progress", tone: "amber", ref: "AUD-17" },
    { a: "West Africa rainfall — harvest watch", status: "Monitoring", tone: "purple", ref: "—" },
    { a: "EU Commission Q3 2026 review prep", status: "Recommended", tone: "grey", ref: "—" },
  ],
};

const BI_KPIS = {
  procurement: [
    { l: "Domain EVaR", v: fmtMoneyCompact(1.45), t: "red", sub: "Dominant driver this cycle" },
    { l: "Days of cover", v: "18 d", t: "red", sub: "Policy minimum: 30 days" },
    { l: "Contracted volume", v: "1,420 t", t: "grey", sub: "All suppliers combined" },
    { l: "Supplier concentration", v: "48%", t: "amber", sub: "Supplier A — single source" },
    { l: "Forward contract avg", v: "€3,870/t", t: "grey", sub: "Expires in 6 weeks" },
    { l: "Critical suppliers", v: "2", t: "amber", sub: "Supplier A + B" },
  ],
  production: [
    { l: "Domain EVaR", v: fmtMoneyCompact(0.65), t: "amber", sub: "Constraint-driven" },
    { l: "Lines operating", v: "2 / 3", t: "grey", sub: "Line 1 in maintenance" },
    { l: "Line utilization", v: "87%", t: "amber", sub: "Line 2 near capacity" },
    { l: "OEE", v: "71%", t: "red", sub: "Target: 77%" },
    { l: "Capacity available", v: "13%", t: "amber", sub: "Line 3 buffer" },
    { l: "Maintenance events", v: "1", t: "grey", sub: "Line 1 — planned" },
  ],
  logistics: [
    { l: "Domain EVaR", v: fmtMoneyCompact(0.45), t: "amber", sub: "Lead-time risk" },
    { l: "Affected shipments", v: "7", t: "grey", sub: "2 affected by Abidjan" },
    { l: "Avg lead time", v: "12.6 d", t: "amber", sub: "+2.6 vs baseline" },
    { l: "Delayed containers", v: "2", t: "red", sub: "Abidjan port congestion" },
    { l: "Freight cost index", v: "+11%", t: "red", sub: "vs baseline" },
    { l: "Port congestion index", v: "High", t: "red", sub: "Abidjan — +8 days" },
  ],
  commercial: [
    { l: "Domain EVaR", v: fmtMoneyCompact(0.25), t: "amber", sub: "Pre-Alert state" },
    { l: "Forecast deviation", v: "9.4%", t: "amber", sub: "Threshold: 10%" },
    { l: "Revenue forecast", v: "€18.4M", t: "grey", sub: "4-week horizon" },
    { l: "Promotion load", v: "T+3–T+5", t: "amber", sub: "Weeks at risk" },
    { l: "Agent confidence", v: "63%", t: "red", sub: "Below 65% trust gate" },
    { l: "OTIF at risk", v: "1 account", t: "amber", sub: "Retailer X — 93.2%" },
  ],
  finance: [
    { l: "Financial EVaR", v: fmtMoneyCompact(0.30), t: "amber", sub: "FX + cost exposure" },
    { l: "Margin at Risk", v: "€1.56M", t: "red", sub: "If no action taken" },
    { l: "Working Capital", v: "+€2.1M", t: "amber", sub: "Above seasonal norm" },
    { l: "Cash Flow at Risk", v: fmtMoneyCompact(0.45), t: "amber", sub: "Week T+3 flag" },
    { l: "FX Exposure", v: fmtMoneyCompact(0.12), t: "amber", sub: "USD contracts, unhedged" },
    { l: "Budget Variance", v: "−2.3%", t: "grey", sub: "YTD — within tolerance" },
  ],
  external: [
    { l: "Active signals", v: "14", t: "grey", sub: "All feeds nominal" },
    { l: "Commodity volatility", v: "High", t: "red", sub: "Cocoa z-score +2.3" },
    { l: "Weather severity", v: "Elevated", t: "amber", sub: "West Africa block 4" },
    { l: "Geopolitical index", v: "Moderate", t: "amber", sub: "Ivory Coast / Ghana" },
    { l: "Regulatory alerts", v: "1", t: "amber", sub: "EUDR gap — in progress" },
    { l: "Freight disruption", v: "High", t: "red", sub: "Abidjan — +8 days" },
  ],
};

const SPARKLINE_DATA = {
  procurement: [1.1, 1.2, 1.3, 1.25, 1.38, 1.42, 1.45],
  production: [0.5, 0.55, 0.6, 0.58, 0.63, 0.64, 0.65],
  logistics: [0.3, 0.32, 0.36, 0.38, 0.41, 0.44, 0.45],
  commercial: [0.15, 0.18, 0.2, 0.22, 0.23, 0.24, 0.25],
  finance: [0.2, 0.22, 0.25, 0.27, 0.28, 0.29, 0.30],
  external: [8, 9, 11, 10, 12, 13, 14],
};

const EXT_SIGNALS = [
  { cat: "Commodity", name: "Cocoa — ICE Futures", sev: "High", trend: "↑", impact: "€1.45M domain EVaR", areas: ["Procurement", "Finance"], detail: "Price €4,200/t · z-score +2.3 · +18% MoM" },
  { cat: "Weather", name: "West Africa rainfall deficit", sev: "Elevated", trend: "↑", impact: "Next-harvest yield risk", areas: ["Procurement", "Logistics"], detail: "Block 4 Copernicus · 3rd consecutive week below seasonal band" },
  { cat: "Ports", name: "Abidjan congestion", sev: "High", trend: "→", impact: "+8d lead time · 2 vessels", areas: ["Logistics"], detail: "Drewry index elevated · no resolution ETA" },
  { cat: "Commodity", name: "Energy — TTF gas", sev: "Moderate", trend: "↑", impact: "€0.18M production cost", areas: ["Production", "Finance"], detail: "+6% w/w · Line 2 / Line 3 cost impact" },
  { cat: "Regulatory", name: "EUDR documentation gap", sev: "Moderate", trend: "→", impact: "Compliance obligation", areas: ["Procurement", "Commercial"], detail: "EU Commission Q3 2026 review · gap closure in progress" },
  { cat: "Currency", name: "EUR/USD FX move", sev: "Low", trend: "→", impact: "€0.12M unhedged", areas: ["Finance", "Procurement"], detail: "USD-priced contracts · forward cover recommended" },
  { cat: "Geopolitics", name: "Ivory Coast political risk", sev: "Moderate", trend: "→", impact: "Supply chain continuity", areas: ["Procurement", "Logistics"], detail: "Monitor — no operational impact confirmed" },
  { cat: "Macroeconomics", name: "EU inflation trajectory", sev: "Low", trend: "↓", impact: "Consumer demand sensitivity", areas: ["Commercial"], detail: "ECB July meeting watch — no immediate action" },
];

const STEWARDS = {
  procurement: { name: "M. Rossi", validated: "07:40", fresh: true },
  production: { name: "L. Greco", validated: "07:55", fresh: true },
  logistics: { name: "M. Bianchi", validated: "26h ago", fresh: false },
  commercial: { name: "S. Conti", validated: "08:05", fresh: true },
  finance: { name: "C. Ferrari", validated: "08:10", fresh: true },
  external: { name: "Signal Layer", validated: "now", fresh: true },
};

const EVAR_CONTRIB = [
  { id: "procurement", label: "Procurement", v: 1.45, pct: 47 },
  { id: "production", label: "Production", v: 0.65, pct: 21 },
  { id: "logistics", label: "Logistics", v: 0.45, pct: 15 },
  { id: "commercial", label: "Commercial", v: 0.25, pct: 8 },
  { id: "finance", label: "Finance", v: 0.30, pct: 10 },
];

function Sparkline({ data, color = C.core }) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EVaRBar({ items, total = 2.8 }) {
  const sum = items.reduce((acc, d) => acc + d.v, 0) || 1;
  const colors = [C.core, C.deep, C.dark, C.soft, C.amber];
  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
        {items.map((d, i) => <div key={i} style={{ width: `${(d.v / sum) * 100}%`, background: colors[i] }} />)}
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {items.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i] }} />
            <span style={{ color: C.soft }}>{d.label}</span>
            <b style={{ ...NUM }}>€{d.v.toFixed(2)}M</b>
            <span style={{ color: C.soft }}>({d.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ BI VISUAL SUB-COMPONENTS ============ */

const RISK_OPP_DATA = {
  procurement: {
    external: [["Cocoa volatility", "High", "ICE +18% MoM"], ["EUDR change", "Watch", "Q3 review"], ["FX move", "Low", "USD contracts"]],
    internal: [["Cover gap", "High", "18d vs 30d"], ["Supplier concentration", "High", "Supplier A 48%"], ["Unhedged exposure", "Watch", "30% open"]],
    opp: [["Ecuador lot", "Ready", "−16pp concentration"], ["Buying window", "Open", "200t at P50"], ["Forward cover", "Ready", "4-week hedge"]],
  },
  production: {
    external: [["Energy price", "Watch", "TTF +6%"], ["Cocoa cascade", "High", "Line 3 pressure"], ["Demand spike", "Watch", "Promo load"]],
    internal: [["Line 1 maintenance", "Planned", "Capacity constrained"], ["Line 2 bottleneck", "High", "87% utilization"], ["OEE gap", "Watch", "71% vs 77%"]],
    opp: [["Line 3 reroute", "Ready", "+18% overflow"], ["Night window", "Open", "Allergen-free run"], ["Preventive action", "Ready", "Recover 6 OEE pts"]],
  },
  logistics: {
    external: [["Abidjan congestion", "High", "+8d lead time"], ["Freight volatility", "Watch", "+11% index"], ["PortWatch alert", "High", "2 vessels affected"]],
    internal: [["Carrier B SLA", "Watch", "91% OTD"], ["Safety stock draw", "High", "Day 14 risk"], ["Lane capacity", "Watch", "Valencia check"]],
    opp: [["Activate reroute", "Ready", "Recover 5 days"], ["Secondary carrier", "Open", "Lift OTD >94%"], ["Valencia pre-book", "Ready", "Secure berth"]],
  },
  commercial: {
    external: [["Demand spike", "Watch", "+13% signal"], ["Retailer X penalty", "High", "OTIF <95%"], ["Promo load", "Watch", "T+3-T+5"]],
    internal: [["Forecast confidence", "High", "63% trust gate"], ["Allocation conflict", "Watch", "Line 3 capacity"], ["Order promise risk", "High", "Top account"]],
    opp: [["Mid-cycle reforecast", "Ready", "Top 3 accounts"], ["Prioritize Retailer X", "Open", "Protect OTIF"], ["Promotion reshaping", "Ready", "Shift demand"]],
  },
  finance: {
    external: [["FX move", "Watch", "USD exposure"], ["Cocoa margin hit", "High", "€1.56M at risk"], ["ECB hold", "Low", "Rates stable"]],
    internal: [["Working capital", "Watch", "+€2.1M"], ["Cash trough", "High", "Week 4"], ["Budget variance", "Low", "−2.3% YTD"]],
    opp: [["FX forward cover", "Ready", "Lock rates"], ["Portfolio D", "Ready", "7.5x ROI"], ["Cash timing", "Open", "Pull W4 trough"]],
  },
  external: {
    external: [["ICE Cocoa", "High", "z +2.3"], ["NOAA rainfall", "Watch", "West Africa deficit"], ["PortWatch", "High", "Abidjan alert"]],
    internal: [["Signal freshness", "OK", "14 feeds nominal"], ["Model confidence", "Watch", "4-factor decomposition"], ["EUDR docs", "Watch", "Gap closure"]],
    opp: [["Buying signal", "Open", "< $4,000/t"], ["Weather hedge", "Watch", "Yield window"], ["Regulatory prep", "Ready", "Q3 review"]],
  },
};

function MainRisksOpportunitiesCard({ domain }) {
  const [tab, setTab] = useState("external");
  const labels = {
    external: { text: "External risks", icon: AlertTriangle },
    internal: { text: "Internal risks", icon: AlertTriangle },
    opp: { text: "Opportunities", icon: Zap },
  };
  const data = RISK_OPP_DATA[domain] || RISK_OPP_DATA.procurement;
  const toneFor = (status) => status === "High" ? "red" : status === "Ready" || status === "Open" || status === "OK" ? "green" : "amber";
  return (
    <Card style={{ padding: 16 }}>
      <SectionLabel icon={AlertTriangle}>Main risks & opportunities</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
        {Object.entries(labels).map(([id, item]) => {
          const Icon = item.icon;
          return (
          <button key={id} onClick={() => setTab(id)} style={{ border: `1px solid ${tab === id ? C.core : C.line}`, background: tab === id ? C.purpBg : C.bg, color: tab === id ? C.deep : C.soft, borderRadius: 999, padding: "8px 10px", fontSize: 10.5, fontWeight: 850, cursor: "pointer", fontFamily: FONT, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Icon size={14} strokeWidth={2.1} />
            {item.text}
          </button>
        )})}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data[tab].map(([name, status, detail], i) => (
          <div key={name} style={{ padding: "10px 11px", border: `1px solid ${C.line}`, borderRadius: 8, background: i === 0 ? C.faint : C.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: toneFor(status) === "red" ? C.red : toneFor(status) === "green" ? C.green : C.amber }} />
              <b style={{ fontSize: 12.5, flex: 1 }}>{name}</b>
              <Pill tone={toneFor(status)}>{status}</Pill>
            </div>
            <div style={{ fontSize: 11, color: C.soft, marginTop: 4, paddingLeft: 15 }}>{detail}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CocoaDigitalTwin() {
  const [tick, setTick] = useState({ price: 4275, momentum: 20, seq: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => {
        const drift = Math.sin((t.seq + 1) * 0.75) * 58 + Math.cos((t.seq + 1) * 0.34) * 22;
        const price = Math.max(3980, Math.min(4635, Math.round(4275 + drift)));
        const momentum = Math.max(11, Math.min(26, Math.round(((price - 3560) / 3560) * 100)));
        return { price, momentum, seq: t.seq + 1 };
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const series = [3960, 3995, 4020, 4045, 4080, 4125, 4108, 4148, 4182, 4210, 4240, 4275];
  const spark = series.map((v, i) => ({ x: 28 + i * 28, y: 126 - ((v - 3920) / (4300 - 3920)) * 62 }));
  const path = spark.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${spark[spark.length - 1].x},140 L${spark[0].x},140 Z`;
  const last = spark[spark.length - 1];
  const events = [
    { label: "ICCO deficit", tone: C.red },
    { label: "West Africa rainfall", tone: C.amber },
    { label: "ICE momentum", tone: C.green },
    { label: "Shipping premium", tone: C.deep },
  ];

  return (
    <Card style={{ padding: 16, position: "relative", overflow: "hidden", background: "linear-gradient(180deg,#FFFFFF 0%,#FBFCFE 100%)" }}>
      <SectionLabel icon={TrendingUp}>Live Commodity Tracker</SectionLabel>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.amber, letterSpacing: -1, ...NUM }}>EUR {tick.price}/t</div>
          <div style={{ fontSize: 11.5, color: C.soft, marginTop: 2 }}>ICE cocoa proxy · last 30 days</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.green, ...NUM }}>+{tick.momentum}%</div>
          <div style={{ fontSize: 11.5, color: C.green, fontWeight: 700 }}>Uptrend</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
        {[
          ["ICCO deficit", "183k MT", C.red],
          ["Rainfall anomaly", "-14%", C.amber],
          ["ICE momentum", "+20%", C.green],
          ["Shipping premium", "+11%", C.deep],
        ].map(([label, value, col]) => (
          <div key={label} style={{ padding: "8px 9px", borderRadius: 10, background: C.faint, border: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 9.5, color: C.soft, fontWeight: 800, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 13.5, fontWeight: 850, color: col, ...NUM }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", height: 196, borderRadius: 12, overflow: "hidden", background: "linear-gradient(180deg,#FEFEFF 0%,#F5F7FB 100%)", border: `1px solid ${C.line}` }}>
        <svg viewBox="0 0 360 196" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="cocoaArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9821B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#C9821B" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="cocoaLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#B86E00" />
              <stop offset="100%" stopColor="#1E7145" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="24" x2="336" y1={44 + i * 32} y2={44 + i * 32} stroke="#E9EBF1" strokeWidth="1" />
          ))}
          <path d={area} fill="url(#cocoaArea)" />
          <path d={path} fill="none" stroke="url(#cocoaLine)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          {spark.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i === spark.length - 1 ? 4.8 : 2.6} fill={i === spark.length - 1 ? C.green : "#D4A15A"} opacity={i === spark.length - 1 ? 1 : 0.55}>
              {i === spark.length - 1 && <animate attributeName="r" values="4.8;6.4;4.8" dur="1.8s" repeatCount="indefinite" />}
            </circle>
          ))}
          <text x="28" y="26" fontSize="11" fontWeight="800" fill={C.soft} fontFamily={FONT}>LIVE COMMODITY TRACKER</text>
          <text x="28" y="174" fontSize="10.5" fill={C.soft} fontFamily={FONT}>last 30 days</text>
          <text x={last.x + 8} y={last.y - 10} fontSize="10.5" fontWeight="800" fill={C.green} fontFamily={FONT}>EUR {tick.price}/t</text>
        </svg>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
        {events.map((e) => (
          <div key={e.label} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 999, background: "#fff", border: `1px solid ${C.line}` }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: e.tone, boxShadow: `0 0 0 4px ${e.tone}15` }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: C.ink }}>{e.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* Procurement: supplier concentration + live commodity twin + risk selector */
function ProcurementVisual() {
  const supplierData = [
    { name: "Supplier A", pct: 48, tone: C.core },
    { name: "Supplier B", pct: 31, tone: C.deep },
    { name: "Ecuador (new)", pct: 12, tone: "#C77DFF" },
    { name: "Other", pct: 9, tone: "#6E5A8A" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
      <Card style={{ padding: 16 }}>
        <SectionLabel icon={Building2}>SUPPLIER CONCENTRATION</SectionLabel>
        <div style={{ position: "relative" }}>
          <svg viewBox="0 0 200 170" style={{ width: "100%" }}>
            {(() => {
              let start = -Math.PI / 2;
              const cx = 100, cy = 90, r = 62, inner = 40;
              return supplierData.map((s, i) => {
                const angle = (s.pct / 100) * 2 * Math.PI;
                const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
                const x2 = cx + r * Math.cos(start + angle), y2 = cy + r * Math.sin(start + angle);
                const xi1 = cx + inner * Math.cos(start), yi1 = cy + inner * Math.sin(start);
                const xi2 = cx + inner * Math.cos(start + angle), yi2 = cy + inner * Math.sin(start + angle);
                const lg = angle > Math.PI ? 1 : 0;
                const path = `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${lg} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${lg} 0 ${xi1} ${yi1} Z`;
                const mid = start + angle / 2;
                const lx = cx + (r + 16) * Math.cos(mid), ly = cy + (r + 16) * Math.sin(mid);
                start += angle;
                return (
                  <g key={i}>
                    <path d={path} fill={s.tone} opacity={0.85} />
                    {s.pct >= 12 && <text x={lx} y={ly} fontSize="10" fill={C.ink} textAnchor="middle" dominantBaseline="central" fontFamily={FONT} fontWeight={700}>{s.pct}%</text>}
                  </g>
                );
              });
            })()}
            <text x="100" y="87" fontSize="13" fontWeight="800" fill={C.core} textAnchor="middle" fontFamily={FONT}>48%</text>
            <text x="100" y="100" fontSize="9" fill={C.soft} textAnchor="middle" fontFamily={FONT}>Supplier A</text>
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {supplierData.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.tone, flexShrink: 0 }} />
              <span style={{ flex: 1, color: C.soft }}>{s.name}</span>
              <b style={{ ...NUM }}>{s.pct}%</b>
            </div>
          ))}
        </div>
      </Card>
      <CocoaDigitalTwin />
      <MainRisksOpportunitiesCard domain="procurement" />
    </div>
  );
}

/* ====== FACTORY FLOOR TWIN — 2.5D live industrial digital twin ====== */
function FactoryFloorTwin() {
  const [hov, setHov] = React.useState(null);
  const [day, setDay] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);

  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setDay((d) => (d >= 16 ? 0 : d + 1)), 900);
    return () => clearInterval(id);
  }, [playing]);

  const bottleneck = day >= 5;
  const l2oee = Math.round(Math.max(62, 87 - (bottleneck ? (day - 5) * 2.5 : 0)));
  const l1oee = Math.round(91 - (bottleneck ? (day - 5) * 0.3 : 0));
  const l1glow = l1oee / 100;
  const l2glow = bottleneck ? 0.38 : l2oee / 100;

  const MACHINES = [
    { id:"l1_r", name:"Roasting",  sub:"Line 1", x:72,  y:38,  line:1, oee:l1oee,    status:"ok" },
    { id:"l1_g", name:"Grinding",  sub:"Line 1", x:144, y:38,  line:1, oee:l1oee-2,  status:"ok" },
    { id:"l1_t", name:"Tempering", sub:"Line 1", x:228, y:38,  line:1, oee:l1oee-1,  status:"ok" },
    { id:"l2_r", name:"Roasting",  sub:"Line 2", x:72,  y:96,  line:2, oee:l2oee+4,  status:"ok" },
    { id:"l2_g", name:"Grinding",  sub:"Line 2", x:144, y:96,  line:2, oee:l2oee+2,  status:"ok" },
    { id:"l2_b", name:"Blending",  sub:"Line 2", x:228, y:96,  line:2, oee:l2oee,    status: bottleneck ? "bottleneck" : "ok" },
    { id:"l3_r", name:"Roasting",  sub:"Line 3", x:72,  y:150, line:3, oee:0,         status:"maintenance" },
    { id:"ds_q", name:"Quality",   sub:"Check",  x:296, y:96,  line:0, oee:96,        status:"ok" },
    { id:"ds_p", name:"Packing",   sub:"",       x:364, y:96,  line:0, oee:88,        status:"ok" },
  ];

  const mcol = (m) => {
    if (m.status === "maintenance") return "#374151";
    if (m.status === "bottleneck")  return "#EF4444";
    if (m.line === 1) return "#10B981";
    if (m.line === 2) return "#F59E0B";
    return "#60A5FA";
  };

  const hovM = MACHINES.find((m) => m.id === hov);

  return (
    <Card style={{ padding: 0, overflow: "hidden", background: "#06090F", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px 7px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ width:6, height:6, borderRadius:99, background: bottleneck ? "#EF4444" : "#10B981", animation:"pulse 1.4s infinite" }} />
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"rgba(255,255,255,0.4)", fontFamily:FONT }}>FACTORY FLOOR · DIGITAL TWIN</span>
        <span style={{ flex:1 }} />
        <span style={{ fontSize:9.5, fontWeight:800, letterSpacing:"0.06em", fontFamily:FONT, color: bottleneck ? "#EF4444" : "#10B981" }}>
          {bottleneck ? "● BOTTLENECK — LINE 2" : "● ALL LINES NOMINAL"}
        </span>
      </div>

      <svg viewBox="0 0 458 196" style={{ width:"100%", display:"block" }}>
        <style>{`@keyframes pft_flow { from { stroke-dashoffset: 28 } to { stroke-dashoffset: 0 } }`}</style>
        <defs>
          <path id="pft_l1"   d="M27,110 L50,110 L50,52 L72,52 L116,52 L144,52 L188,52 L228,52 L272,52 L286,52 L286,110 L296,110 L340,110 L364,110 L408,110" />
          <path id="pft_l2"   d="M27,110 L50,110 L72,110 L116,110 L144,110 L188,110 L228,110 L272,110 L286,110 L296,110 L340,110 L364,110 L408,110" />
          <path id="pft_ovfl" d="M50,164 Q50,110 72,110" />
          <filter id="pft_gg"><feGaussianBlur stdDeviation="2" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
          <filter id="pft_gy"><feGaussianBlur stdDeviation="2.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
          <filter id="pft_gr"><feGaussianBlur stdDeviation="3.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
        </defs>

        <rect width="458" height="196" fill="#06090F" />
        {Array.from({length:16}).map((_,i) => <line key={`fg${i}`} x1={i*30} y1="0" x2={i*30} y2="196" stroke="#fff" strokeWidth="0.3" opacity="0.022" />)}
        {Array.from({length:7}).map((_,i)  => <line key={`fh${i}`} x1="0" y1={i*32} x2="458" y2={i*32} stroke="#fff" strokeWidth="0.3" opacity="0.022" />)}

        {/* Raw hopper */}
        <rect x="8" y="96" width="38" height="28" rx="5" fill="#0E1729" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
        <rect x="8" y="96" width="38" height="4" rx="2" fill="#374151" />
        <path d="M16,108 L30,108 L27,116 L19,116 Z" fill="#1C2A3E" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
        <text x="27" y="131" textAnchor="middle" fontSize="6" fontWeight="800" fill="rgba(255,255,255,0.25)" fontFamily={FONT} letterSpacing="0.04em">RAW</text>

        {/* Trunk + branches */}
        <line x1="46" y1="110" x2="52" y2="110" stroke="rgba(255,255,255,0.1)" strokeWidth="4" strokeLinecap="round" />
        <polyline points="50,110 50,52 72,52" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="50,110 50,52 72,52" fill="none" stroke="#10B981" strokeWidth="1.4" strokeDasharray="6 8" style={{ animation:`pft_flow 1.1s linear infinite` }} opacity={l1glow} />
        <line x1="50" y1="110" x2="72" y2="110" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="50" y1="110" x2="72" y2="110" stroke="#F59E0B" strokeWidth="1.4" strokeDasharray="6 8" style={{ animation:`pft_flow ${bottleneck ? "2s" : "1.3s"} linear infinite` }} opacity={l2glow} />
        <polyline points="50,110 50,164 72,164" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* L1 conveyors */}
        <line x1="116" y1="52" x2="144" y2="52" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <line x1="116" y1="52" x2="144" y2="52" stroke="#10B981" strokeWidth="1.4" strokeDasharray="6 8" style={{ animation:`pft_flow 1s linear infinite` }} opacity={l1glow * 0.9} />
        <line x1="188" y1="52" x2="228" y2="52" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <line x1="188" y1="52" x2="228" y2="52" stroke="#10B981" strokeWidth="1.4" strokeDasharray="6 8" style={{ animation:`pft_flow 1s linear infinite 0.3s` }} opacity={l1glow * 0.85} />
        <polyline points="272,52 286,52 286,110" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="272,52 286,52 286,110" fill="none" stroke="#10B981" strokeWidth="1.2" strokeDasharray="5 7" style={{ animation:`pft_flow 1.2s linear infinite` }} opacity={l1glow * 0.8} />

        {/* L2 conveyors */}
        <line x1="116" y1="110" x2="144" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <line x1="116" y1="110" x2="144" y2="110" stroke="#F59E0B" strokeWidth="1.4" strokeDasharray="6 8" style={{ animation:`pft_flow ${bottleneck ? "1.8s" : "1.2s"} linear infinite` }} opacity={l2glow} />
        <line x1="188" y1="110" x2="228" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <line x1="188" y1="110" x2="228" y2="110" stroke={bottleneck ? "#EF4444" : "#F59E0B"} strokeWidth="1.4" strokeDasharray="6 8" style={{ animation:`pft_flow ${bottleneck ? "2.4s" : "1.2s"} linear infinite` }} opacity={bottleneck ? 0.65 : l2glow * 0.85} />
        <line x1="272" y1="110" x2="286" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <line x1="272" y1="110" x2="286" y2="110" stroke={bottleneck ? "#EF4444" : "#F59E0B"} strokeWidth="1.2" strokeDasharray="5 7" style={{ animation:`pft_flow ${bottleneck ? "2.8s" : "1.2s"} linear infinite` }} opacity={bottleneck ? 0.45 : 0.7} />

        {/* Overflow reroute (L3 → L2) */}
        <path d="M94,164 Q50,164 50,110" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeDasharray="4 5" opacity="0.75" />
        <path d="M94,164 Q50,164 50,110" fill="none" stroke="#F59E0B" strokeWidth="6" opacity="0.07" />
        <text x="18" y="142" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#F59E0B" fontFamily={FONT} opacity="0.65">REROUTE</text>
        <circle r="2.2" fill="#F59E0B" opacity="0.9"><animateMotion dur="1.7s" repeatCount="indefinite" begin="0s"><mpath href="#pft_ovfl" /></animateMotion></circle>
        <circle r="2.2" fill="#F59E0B" opacity="0.9"><animateMotion dur="1.7s" repeatCount="indefinite" begin="0.85s"><mpath href="#pft_ovfl" /></animateMotion></circle>

        {/* Downstream conveyors */}
        <line x1="286" y1="110" x2="296" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
        <line x1="340" y1="110" x2="364" y2="110" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <line x1="340" y1="110" x2="364" y2="110" stroke="#60A5FA" strokeWidth="1.4" strokeDasharray="6 8" style={{ animation:`pft_flow 1.1s linear infinite` }} opacity="0.8" />
        <line x1="408" y1="110" x2="422" y2="110" stroke="#60A5FA" strokeWidth="1.2" opacity="0.5" />

        {/* Machines */}
        {MACHINES.map((m) => {
          const col = mcol(m);
          const isHov = hov === m.id;
          const isMaint = m.status === "maintenance";
          const isBot = m.status === "bottleneck";
          return (
            <g key={m.id} style={{ cursor:"pointer", opacity: isMaint ? 0.22 : 1 }}
              onMouseEnter={() => setHov(m.id)} onMouseLeave={() => setHov(null)}>
              {!isMaint && <rect x={m.x+3} y={m.y+3} width={44} height={28} rx="5" fill={col} opacity="0.08" />}
              {isBot && <rect x={m.x-5} y={m.y-5} width={54} height={38} rx="8" fill="#EF444415">
                <animate attributeName="opacity" values="0.9;0.15;0.9" dur="0.9s" repeatCount="indefinite" />
              </rect>}
              {isHov && <rect x={m.x-3} y={m.y-3} width={50} height={34} rx="7" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.35" />}
              <rect x={m.x} y={m.y} width={44} height={28} rx="5" fill="#0C1422"
                stroke={col} strokeWidth={isBot ? 1.6 : 0.9}
                filter={isBot ? "url(#pft_gr)" : m.line === 1 ? "url(#pft_gg)" : undefined}
              />
              <rect x={m.x} y={m.y} width={44} height={3} rx="2" fill={col} opacity={isMaint ? 0.25 : 0.9} />
              {isMaint && <>
                <line x1={m.x+10} y1={m.y+9} x2={m.x+34} y2={m.y+22} stroke="#EF4444" strokeWidth="1.3" opacity="0.55" />
                <line x1={m.x+34} y1={m.y+9} x2={m.x+10} y2={m.y+22} stroke="#EF4444" strokeWidth="1.3" opacity="0.55" />
              </>}
              {!isMaint && m.oee > 0 && <>
                <rect x={m.x+5} y={m.y+22} width={34} height="3" rx="1.5" fill="rgba(255,255,255,0.06)" />
                <rect x={m.x+5} y={m.y+22} width={34*m.oee/100} height="3" rx="1.5" fill={col} opacity="0.65" />
              </>}
              {!isMaint && <circle cx={m.x+38} cy={m.y+8} r="3" fill={col} opacity="0.9">
                {isBot && <animate attributeName="r" values="3;5;3" dur="0.8s" repeatCount="indefinite" />}
              </circle>}
            </g>
          );
        })}

        {/* L1 particles */}
        {[0,1,2,3].map((i) => (
          <circle key={`pl1_${i}`} r="2.4" fill="#10B981" filter="url(#pft_gg)" opacity="0.9">
            <animateMotion dur="5.8s" repeatCount="indefinite" begin={`${i * 1.44}s`}><mpath href="#pft_l1" /></animateMotion>
          </circle>
        ))}
        {[0,1,2].map((i) => (
          <circle key={`pl2_${i}`} r="2.4" fill={bottleneck ? "#EF4444" : "#F59E0B"} filter={bottleneck ? "url(#pft_gr)" : "url(#pft_gy)"} opacity="0.9">
            <animateMotion dur={bottleneck ? "8.4s" : "5.6s"} repeatCount="indefinite" begin={`${i * 1.86}s`}><mpath href="#pft_l2" /></animateMotion>
          </circle>
        ))}

        {/* Line labels */}
        <text x="64" y="56"  textAnchor="end" fontSize="7" fontWeight="800" fill="#10B981"                           fontFamily={FONT} letterSpacing="0.05em">L1</text>
        <text x="64" y="114" textAnchor="end" fontSize="7" fontWeight="800" fill={bottleneck ? "#EF4444" : "#F59E0B"} fontFamily={FONT} letterSpacing="0.05em">L2</text>
        <text x="64" y="168" textAnchor="end" fontSize="7" fontWeight="700" fill="#374151"                           fontFamily={FONT} letterSpacing="0.05em">L3</text>

        {/* Output node */}
        <rect x="422" y="96" width="26" height="28" rx="4" fill="#111B2E" stroke="rgba(255,255,255,0.14)" strokeWidth="0.8" />
        <text x="435" y="113" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="rgba(255,255,255,0.45)" fontFamily={FONT}>OUT</text>

        {/* Hover tooltip */}
        {hovM && (() => {
          const showLeft = hovM.x + 44 + 8 + 108 > 456;
          const tx = showLeft ? hovM.x - 112 : hovM.x + 52;
          const ty = Math.max(hovM.y - 12, 2);
          const col = mcol(hovM);
          return (
            <g pointerEvents="none">
              <rect x={tx} y={ty} width="106" height="54" rx="6" fill="#0A1120" stroke={col} strokeWidth="0.9" opacity="0.97" />
              <rect x={tx} y={ty} width="3.5" height="54" rx="1.8" fill={col} />
              <text x={tx+11} y={ty+14} fontSize="9" fontWeight="800" fill="#fff" fontFamily={FONT}>{hovM.name}</text>
              <text x={tx+11} y={ty+24} fontSize="7.5" fill="rgba(255,255,255,0.38)" fontFamily={FONT}>{hovM.sub}</text>
              {hovM.status !== "maintenance"
                ? <>
                    <text x={tx+11} y={ty+36} fontSize="7.5" fill={col} fontFamily={FONT} fontWeight="700">OEE {hovM.oee}%</text>
                    <text x={tx+11} y={ty+47} fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily={FONT}>{hovM.status === "bottleneck" ? "⚠ Constraint active" : "● Operating normally"}</text>
                  </>
                : <>
                    <text x={tx+11} y={ty+36} fontSize="7.5" fill="#EF4444" fontFamily={FONT} fontWeight="700">MAINTENANCE</text>
                    <text x={tx+11} y={ty+47} fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily={FONT}>Flow rerouted → L2</text>
                  </>
              }
            </g>
          );
        })()}
      </svg>

      {/* Timeline */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px 10px", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
        <button onClick={() => setPlaying((p) => !p)} style={{ width:24, height:24, borderRadius:99, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
          {playing
            ? <span style={{ display:"flex", gap:2 }}><span style={{ width:2, height:8, background:"rgba(255,255,255,0.55)", borderRadius:1 }} /><span style={{ width:2, height:8, background:"rgba(255,255,255,0.55)", borderRadius:1 }} /></span>
            : <span style={{ width:0, height:0, borderTop:"4px solid transparent", borderBottom:"4px solid transparent", borderLeft:"7px solid rgba(255,255,255,0.55)", marginLeft:2 }} />}
        </button>
        <span style={{ fontSize:9, color:"rgba(255,255,255,0.2)", fontFamily:FONT }}>T+0</span>
        <input type="range" min="0" max="16" value={day} onChange={(e) => { setPlaying(false); setDay(+e.target.value); }} style={{ flex:1, accentColor:"#10B981" }} />
        <span style={{ fontSize:9, color:"rgba(255,255,255,0.2)", fontFamily:FONT }}>T+16d</span>
        <span style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,0.45)", ...NUM, width:40, textAlign:"right", fontFamily:FONT }}>T+{day}d</span>
      </div>
    </Card>
  );
}


/* Production: mini factory layout + schedule health + risk selector */
/* Production: full-width factory twin + risk card */
function ProductionLineStatusCard() {
  const lines = [
    { name: "Line 1", status: "Maintenance", tone: "grey", value: 0, sub: "Planned maintenance", dash: true },
    { name: "Line 2", status: "Running", tone: "amber", value: 87, sub: "Allergen window conflict" },
    { name: "Line 3", status: "Running", tone: "green", value: 71, sub: "Absorbing Line 2 overflow" },
  ];
  const statusBg = { grey: "#F3EFF8", amber: "rgba(161,0,255,0.10)", green: "rgba(117,0,192,0.10)" };
  const statusFg = { grey: "#6E5A8A", amber: C.core, green: C.deep };
  const barFg = {
    grey: "#EFE9F7",
    amber: `linear-gradient(90deg,${C.core},#C77DFF)`,
    green: `linear-gradient(90deg,${C.deep},#B86BFF)`,
  };

  return (
    <Card style={{ padding: 18, minHeight: 356 }}>
      <SectionLabel>Production line status</SectionLabel>
      <div style={{ display: "grid", gap: 18 }}>
        {lines.map((line) => (
          <div key={line.name}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 9 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{line.name}</div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: statusFg[line.tone], background: statusBg[line.tone], padding: "5px 11px", borderRadius: 999 }}>
                {line.status}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 10, marginBottom: 7 }}>
              <div style={{ height: 18, borderRadius: 8, background: "#F5F5F7", overflow: "hidden", border: `1px solid ${C.line}` }}>
                <div style={{ width: `${line.value}%`, height: "100%", background: barFg[line.tone], borderRadius: 8, transition: "width .5s ease" }} />
              </div>
              <div style={{ minWidth: 48, textAlign: "right", fontSize: 12, fontWeight: 900, color: C.ink, ...NUM }}>
                {line.dash ? "—" : `${line.value}%`}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.soft }}>{line.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.line}`, fontSize: 12.5, color: C.soft }}>
        Target utilization: <b style={{ color: C.ink }}>85%</b> · Combined: <b style={{ color: C.ink }}>79% avg</b>
      </div>
    </Card>
  );
}

function ProductionVisual() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1.15fr 0.85fr", gap:14 }}>
      <ProductionLineStatusCard />
      <MainRisksOpportunitiesCard domain="production" />
    </div>
  );
}

/* ====== LOGISTICS COMMAND CENTER — live global supply command ====== */
/* ── Logistics hero: world map with live shipment routes ── */
const MW = 900, MH = 460;
const mX = (lon: number) => (lon + 180) / 360 * MW;
const mY = (lat: number) => (82 - lat) / 140 * MH;
const mPath = (pts: number[][]) =>
  pts.map(([la, lo], i) => `${i ? "L" : "M"}${mX(lo).toFixed(1)},${mY(la).toFixed(1)}`).join(" ") + "Z";

const MAP_LAND = [
  // North America
  mPath([[59,-151],[55,-131],[47,-124],[36,-122],[32,-117],[22,-106],[16,-94],[8,-83],[9,-79],[10,-75],[14,-87],[20,-90],[22,-89],[25,-80],[30,-81],[35,-75],[42,-70],[45,-67],[47,-53],[52,-55],[58,-62],[63,-70],[68,-77],[70,-87],[72,-95],[72,-102],[70,-115],[72,-131],[70,-143],[65,-168],[58,-162],[52,-173],[56,-160],[60,-150],[60,-142],[59,-151]]),
  // Greenland
  mPath([[83,-30],[82,-10],[76,-16],[72,-22],[68,-28],[68,-54],[72,-56],[78,-60],[82,-40],[83,-30]]),
  // South America
  mPath([[12,-72],[11,-63],[6,-62],[4,-52],[4,-44],[0,-50],[-6,-35],[-8,-35],[-16,-38],[-20,-40],[-26,-48],[-34,-53],[-38,-57],[-42,-65],[-50,-68],[-55,-67],[-55,-64],[-52,-70],[-46,-74],[-38,-73],[-32,-72],[-22,-70],[-18,-70],[-4,-80],[0,-77],[8,-77],[12,-72]]),
  // Europe
  mPath([[71,26],[68,18],[65,14],[60,5],[58,5],[52,5],[51,3],[49,0],[46,-2],[44,-2],[43,3],[41,2],[40,-9],[43,-9],[38,-9],[36,-5],[36,-2],[38,1],[38,4],[40,4],[41,9],[44,8],[44,12],[40,18],[42,19],[44,16],[46,14],[48,17],[50,18],[52,14],[54,10],[56,10],[57,12],[58,7],[60,6],[60,11],[64,14],[67,14],[70,20],[71,26]]),
  // UK
  mPath([[51,-5],[53,-3],[56,-3],[58,-3],[58,-5],[56,-6],[55,-5],[51,-5]]),
  mPath([[51,-10],[54,-10],[55,-8],[54,-6],[51,-10]]),
  // Iceland
  mPath([[64,-14],[64,-22],[65,-24],[66,-22],[65,-16],[64,-14]]),
  // Africa
  mPath([[37,10],[37,0],[36,-5],[32,-9],[22,-17],[15,-17],[12,-15],[4,-8],[5,2],[4,8],[0,9],[-6,10],[-6,15],[-6,22],[-10,26],[-14,25],[-18,22],[-26,15],[-30,17],[-34,18],[-35,20],[-34,26],[-30,31],[-24,33],[-22,35],[-18,37],[-14,40],[-8,40],[-4,39],[0,40],[4,42],[8,43],[12,44],[14,43],[18,42],[22,37],[26,37],[28,34],[30,32],[30,26],[32,24],[37,22],[37,15],[37,10]]),
  // Madagascar
  mPath([[-12,49],[-16,50],[-20,48],[-25,44],[-24,48],[-20,50],[-14,50],[-12,49]]),
  // Asia (mainland)
  mPath([[70,140],[65,130],[60,135],[55,135],[50,140],[44,135],[40,130],[34,130],[25,119],[22,113],[20,110],[15,108],[10,104],[5,103],[1,103],[8,98],[12,98],[10,92],[8,77],[8,73],[12,68],[22,68],[25,57],[22,60],[25,50],[28,48],[30,40],[32,36],[35,36],[34,34],[28,34],[24,32],[30,30],[25,28],[22,39],[15,44],[8,44],[4,42],[4,46],[8,48],[15,50],[20,58],[25,57],[30,48],[35,43],[40,44],[45,50],[50,55],[52,55],[55,60],[55,65],[60,68],[60,72],[64,80],[65,88],[64,90],[60,100],[60,102],[64,100],[65,102],[68,100],[68,95],[70,90],[72,80],[72,100],[70,100],[70,105],[72,110],[72,120],[72,132],[70,140]]),
  // Japan (Honshu)
  mPath([[31,130],[34,131],[35,137],[37,136],[37,140],[39,141],[38,140],[36,135],[34,132],[31,130]]),
  // Australia
  mPath([[-12,131],[-14,136],[-16,136],[-18,139],[-20,138],[-24,134],[-26,133],[-28,128],[-32,126],[-34,122],[-35,117],[-32,116],[-29,115],[-24,114],[-22,114],[-18,122],[-14,127],[-12,131]]),
  // New Zealand
  mPath([[-36,175],[-38,176],[-40,177],[-39,175],[-36,175]]),
  mPath([[-44,168],[-46,168],[-46,171],[-44,170],[-44,168]]),
  // Philippines (Luzon)
  mPath([[14,121],[17,122],[18,121],[16,120],[14,121]]),
  // Borneo
  mPath([[7,117],[5,115],[1,110],[2,113],[5,118],[7,117]]),
  // Sumatra
  mPath([[5,96],[1,98],[-5,105],[-2,104],[2,100],[5,96]]),
];

const MAP_SHIPS = [
  { id:"rtm", name:"Rotterdam",   lat:51.9,  lon:4.5,   status:"In transit", tone:"#A78BFA" },
  { id:"ham", name:"Hamburg",     lat:53.5,  lon:10.0,  status:"At risk",    tone:"#F5A524" },
  { id:"lax", name:"Los Angeles", lat:34.0,  lon:-118.2,status:"On time",    tone:"#2DD4A7" },
  { id:"sgp", name:"Singapore",   lat:1.3,   lon:103.8, status:"On time",    tone:"#2DD4A7" },
  { id:"dur", name:"Durban",      lat:-29.9, lon:31.0,  status:"In transit", tone:"#A78BFA" },
];

const MAP_ROUTES = [
  { from:"lax", to:"rtm", tone:"#2DD4A7", dur:"2.4s", start:"0s"   },
  { from:"rtm", to:"sgp", tone:"#A78BFA", dur:"2.9s", start:"0.4s" },
  { from:"ham", to:"dur", tone:"#F5A524", dur:"2.6s", start:"0.8s" },
  { from:"dur", to:"sgp", tone:"#2DD4A7", dur:"2.7s", start:"1.2s" },
];

/* ── Raw landmass coordinates [lat, lon] for the interactive globe ── */
const MAP_LAND_COORDS: number[][][] = [
  // North America
  [[59,-151],[55,-131],[47,-124],[36,-122],[32,-117],[22,-106],[16,-94],[8,-83],[9,-79],[10,-75],[14,-87],[20,-90],[22,-89],[25,-80],[30,-81],[35,-75],[42,-70],[45,-67],[47,-53],[52,-55],[58,-62],[63,-70],[68,-77],[70,-87],[72,-95],[72,-102],[70,-115],[72,-131],[70,-143],[65,-168],[58,-162],[52,-173],[56,-160],[60,-150],[60,-142],[59,-151]],
  // Greenland
  [[83,-30],[82,-10],[76,-16],[72,-22],[68,-28],[68,-54],[72,-56],[78,-60],[82,-40],[83,-30]],
  // South America
  [[12,-72],[11,-63],[6,-62],[4,-52],[4,-44],[0,-50],[-6,-35],[-8,-35],[-16,-38],[-20,-40],[-26,-48],[-34,-53],[-38,-57],[-42,-65],[-50,-68],[-55,-67],[-55,-64],[-52,-70],[-46,-74],[-38,-73],[-32,-72],[-22,-70],[-18,-70],[-4,-80],[0,-77],[8,-77],[12,-72]],
  // Europe
  [[71,26],[68,18],[65,14],[60,5],[58,5],[52,5],[51,3],[49,0],[46,-2],[44,-2],[43,3],[41,2],[40,-9],[43,-9],[38,-9],[36,-5],[36,-2],[38,1],[38,4],[40,4],[41,9],[44,8],[44,12],[40,18],[42,19],[44,16],[46,14],[48,17],[50,18],[52,14],[54,10],[56,10],[57,12],[58,7],[60,6],[60,11],[64,14],[67,14],[70,20],[71,26]],
  // UK
  [[51,-5],[53,-3],[56,-3],[58,-3],[58,-5],[56,-6],[55,-5],[51,-5]],
  [[51,-10],[54,-10],[55,-8],[54,-6],[51,-10]],
  // Iceland
  [[64,-14],[64,-22],[65,-24],[66,-22],[65,-16],[64,-14]],
  // Africa
  [[37,10],[37,0],[36,-5],[32,-9],[22,-17],[15,-17],[12,-15],[4,-8],[5,2],[4,8],[0,9],[-6,10],[-6,15],[-6,22],[-10,26],[-14,25],[-18,22],[-26,15],[-30,17],[-34,18],[-35,20],[-34,26],[-30,31],[-24,33],[-22,35],[-18,37],[-14,40],[-8,40],[-4,39],[0,40],[4,42],[8,43],[12,44],[14,43],[18,42],[22,37],[26,37],[28,34],[30,32],[30,26],[32,24],[37,22],[37,15],[37,10]],
  // Madagascar
  [[-12,49],[-16,50],[-20,48],[-25,44],[-24,48],[-20,50],[-14,50],[-12,49]],
  // Asia (mainland)
  [[70,140],[65,130],[60,135],[55,135],[50,140],[44,135],[40,130],[34,130],[25,119],[22,113],[20,110],[15,108],[10,104],[5,103],[1,103],[8,98],[12,98],[10,92],[8,77],[8,73],[12,68],[22,68],[25,57],[22,60],[25,50],[28,48],[30,40],[32,36],[35,36],[34,34],[28,34],[24,32],[30,30],[25,28],[22,39],[15,44],[8,44],[4,42],[4,46],[8,48],[15,50],[20,58],[25,57],[30,48],[35,43],[40,44],[45,50],[50,55],[52,55],[55,60],[55,65],[60,68],[60,72],[64,80],[65,88],[64,90],[60,100],[60,102],[64,100],[65,102],[68,100],[68,95],[70,90],[72,80],[72,100],[70,100],[70,105],[72,110],[72,120],[72,132],[70,140]],
  // Japan (Honshu)
  [[31,130],[34,131],[35,137],[37,136],[37,140],[39,141],[38,140],[36,135],[34,132],[31,130]],
  // Australia
  [[-12,131],[-14,136],[-16,136],[-18,139],[-20,138],[-24,134],[-26,133],[-28,128],[-32,126],[-34,122],[-35,117],[-32,116],[-29,115],[-24,114],[-22,114],[-18,122],[-14,127],[-12,131]],
  // New Zealand
  [[-36,175],[-38,176],[-40,177],[-39,175],[-36,175]],
  [[-44,168],[-46,168],[-46,171],[-44,170],[-44,168]],
  // Philippines (Luzon)
  [[14,121],[17,122],[18,121],[16,120],[14,121]],
  // Borneo
  [[7,117],[5,115],[1,110],[2,113],[5,118],[7,117]],
  // Sumatra
  [[5,96],[1,98],[-5,105],[-2,104],[2,100],[5,96]],
];

/* ── Orthographic globe projection ──
   Projects a [lat, lon] onto a sphere of radius GLOBE_R centered at (cx, cy),
   rotated to look-at center (rotLon, rotLat). Returns screen coords + visibility. */
const GLOBE_R = 175;
function orthoProject(lat: number, lon: number, rotLon: number, rotLat: number, cx: number, cy: number) {
  const D = Math.PI / 180;
  const phi = lat * D, lam = lon * D, lam0 = rotLon * D, phi0 = rotLat * D;
  const dl = lam - lam0;
  const cosc = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(dl);
  const x = GLOBE_R * Math.cos(phi) * Math.sin(dl);
  const y = GLOBE_R * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(dl));
  return { x: cx + x, y: cy - y, visible: cosc >= 0 };
}

/* Build an SVG path for a polygon on the globe; back-facing vertices are
   clamped to the horizon rim so continents straddling the edge stay clean. */
function globeLandPath(coords: number[][], rotLon: number, rotLat: number, cx: number, cy: number) {
  let anyVisible = false;
  const pts = coords.map(([la, lo]) => {
    const p = orthoProject(la, lo, rotLon, rotLat, cx, cy);
    if (p.visible) anyVisible = true;
    return p;
  });
  if (!anyVisible) return null;
  let d = "";
  pts.forEach((p, i) => {
    let px = p.x, py = p.y;
    if (!p.visible) {
      const dx = px - cx, dy = py - cy;
      const m = Math.hypot(dx, dy) || 1;
      px = cx + (dx / m) * GLOBE_R;
      py = cy + (dy / m) * GLOBE_R;
    }
    d += `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`;
  });
  return d + "Z";
}

/* Great-circle arc between two [lat,lon] points, sampled and projected. */
function globeArcSegments(a: number[], b: number[], rotLon: number, rotLat: number, cx: number, cy: number, steps = 48) {
  const D = Math.PI / 180;
  const [la1, lo1] = [a[0] * D, a[1] * D];
  const [la2, lo2] = [b[0] * D, b[1] * D];
  const d = Math.acos(Math.min(1, Math.max(-1,
    Math.sin(la1) * Math.sin(la2) + Math.cos(la1) * Math.cos(la2) * Math.cos(lo2 - lo1))));
  const segs: { x: number; y: number; visible: boolean }[] = [];
  if (d === 0) return segs;
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2);
    const y = A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2);
    const z = A * Math.sin(la1) + B * Math.sin(la2);
    const lat = Math.atan2(z, Math.hypot(x, y)) / D;
    const lon = Math.atan2(y, x) / D;
    segs.push(orthoProject(lat, lon, rotLon, rotLat, cx, cy));
  }
  return segs;
}

function LogisticsGlobe({ hovCity, setHovCity }: { hovCity: string | null; setHovCity: (v: string | null) => void }) {
  const VB = 460;           // viewBox size (square)
  const CX = VB / 2, CY = VB / 2;
  const rotRef = useRef({ lon: -10, lat: 8 });
  const draggingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [, force] = useState(0);

  // animation loop: auto-rotate when idle + drive route pulses
  const tRef = useRef(0);
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = now - last; last = now;
      tRef.current = now / 1000;
      if (!draggingRef.current) rotRef.current.lon += dt * 0.0045;
      force((c) => (c + 1) % 1000000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toLocal = (clientX: number, clientY: number) => {
    const svg = svgRef.current; if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * VB, y: ((clientY - r.top) / r.height) * VB };
  };
  const onDown = (e: React.PointerEvent) => {
    draggingRef.current = true; movedRef.current = false;
    lastRef.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !lastRef.current) return;
    const dx = e.clientX - lastRef.current.x, dy = e.clientY - lastRef.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) movedRef.current = true;
    rotRef.current.lon += dx * 0.35;
    rotRef.current.lat = Math.max(-78, Math.min(78, rotRef.current.lat + dy * 0.35));
    lastRef.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: React.PointerEvent) => {
    draggingRef.current = false; lastRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const { lon: rLon, lat: rLat } = rotRef.current;

  return (
    <div style={{ position: "relative", padding: "0 0 4px" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB} ${VB}`}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        style={{ width: "100%", maxWidth: 340, display: "block", margin: "0 auto", cursor: draggingRef.current ? "grabbing" : "grab", touchAction: "none", userSelect: "none" }}
      >
        <defs>
          <radialGradient id="gOcean" cx="38%" cy="34%" r="78%">
            <stop offset="0%" stopColor="#1A1455" />
            <stop offset="48%" stopColor="#120A38" />
            <stop offset="100%" stopColor="#070418" />
          </radialGradient>
          <radialGradient id="gAtmos" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="rgba(161,0,255,0)" />
            <stop offset="96%" stopColor="rgba(161,0,255,0.34)" />
            <stop offset="100%" stopColor="rgba(161,0,255,0)" />
          </radialGradient>
          <radialGradient id="gShine" cx="34%" cy="28%" r="42%">
            <stop offset="0%" stopColor="rgba(180,140,255,0.30)" />
            <stop offset="100%" stopColor="rgba(180,140,255,0)" />
          </radialGradient>
          <clipPath id="globeClip"><circle cx={CX} cy={CY} r={GLOBE_R} /></clipPath>
          <filter id="gGlow"><feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="gGlowL"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {/* atmosphere halo */}
        <circle cx={CX} cy={CY} r={GLOBE_R + 14} fill="url(#gAtmos)" />
        {/* ocean sphere */}
        <circle cx={CX} cy={CY} r={GLOBE_R} fill="url(#gOcean)" stroke="rgba(161,0,255,0.45)" strokeWidth="1.2" />

        <g clipPath="url(#globeClip)">
          {/* graticule — meridians */}
          {Array.from({ length: 12 }).map((_, k) => {
            const lon = -180 + k * 30;
            const pts: string[] = [];
            for (let la = -80; la <= 80; la += 8) {
              const p = orthoProject(la, lon, rLon, rLat, CX, CY);
              if (p.visible) pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
              else if (pts.length) { pts.push("BREAK"); }
            }
            return pts.join(" ").split("BREAK").filter(Boolean).map((seg, si) => (
              <polyline key={`me${k}-${si}`} points={seg.trim()} fill="none" stroke="rgba(120,90,200,0.16)" strokeWidth="0.6" />
            ));
          })}
          {/* graticule — parallels */}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const pts: string[] = [];
            for (let lo = -180; lo <= 180; lo += 6) {
              const p = orthoProject(lat, lo, rLon, rLat, CX, CY);
              if (p.visible) pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
              else if (pts.length) pts.push("BREAK");
            }
            return pts.join(" ").split("BREAK").filter(Boolean).map((seg, si) => (
              <polyline key={`pa${lat}-${si}`} points={seg.trim()} fill="none"
                stroke={lat === 0 ? "rgba(120,90,200,0.30)" : "rgba(120,90,200,0.14)"} strokeWidth={lat === 0 ? 0.8 : 0.6} />
            ));
          })}

          {/* landmasses */}
          {MAP_LAND_COORDS.map((coords, i) => {
            const d = globeLandPath(coords, rLon, rLat, CX, CY);
            if (!d) return null;
            return (
              <g key={i}>
                <path d={d} fill="rgba(124,58,237,0.32)" stroke="rgba(190,150,255,0.65)" strokeWidth="0.8" filter="url(#gGlow)" />
                <path d={d} fill="none" stroke="rgba(216,180,255,0.5)" strokeWidth="0.5" />
              </g>
            );
          })}

          {/* route arcs (great circles) */}
          {MAP_ROUTES.map((rt, i) => {
            const fs = MAP_SHIPS.find((s) => s.id === rt.from);
            const ts = MAP_SHIPS.find((s) => s.id === rt.to);
            if (!fs || !ts) return null;
            const segs = globeArcSegments([fs.lat, fs.lon], [ts.lat, ts.lon], rLon, rLat, CX, CY);
            // visible polyline pieces
            const pieces: string[] = []; let cur: string[] = [];
            segs.forEach((p) => {
              if (p.visible) cur.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
              else if (cur.length) { pieces.push(cur.join(" ")); cur = []; }
            });
            if (cur.length) pieces.push(cur.join(" "));
            // moving pulse position
            const dur = parseFloat(rt.dur);
            const f = ((tRef.current + i * 0.6) % dur) / dur;
            const idx = Math.min(segs.length - 1, Math.floor(f * (segs.length - 1)));
            const pulse = segs[idx];
            return (
              <g key={i}>
                {pieces.map((pts, pi) => (
                  <g key={pi}>
                    <polyline points={pts} fill="none" stroke={rt.tone} strokeWidth="3.4" opacity="0.18" filter="url(#gGlowL)" />
                    <polyline points={pts} fill="none" stroke={rt.tone} strokeWidth="0.7" opacity="0.4" strokeDasharray="2 6" />
                    <polyline points={pts} fill="none" stroke={rt.tone} strokeWidth="1.6" opacity="0.9" strokeLinecap="round" />
                  </g>
                ))}
                {pulse && pulse.visible && (
                  <circle cx={pulse.x} cy={pulse.y} r="3.2" fill="#fff" filter="url(#gGlow)">
                    <animate attributeName="r" values="2.4;3.6;2.4" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* city markers */}
          {MAP_SHIPS.map((c) => {
            const p = orthoProject(c.lat, c.lon, rLon, rLat, CX, CY);
            if (!p.visible) return null;
            const hov = hovCity === c.id;
            return (
              <g key={c.id} onPointerEnter={() => setHovCity(c.id)} onPointerLeave={() => setHovCity(null)} style={{ cursor: "pointer" }}>
                <circle cx={p.x} cy={p.y} r="13" fill={c.tone} opacity="0.10">
                  <animate attributeName="r" values="8;16;8" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.16;0.03;0.16" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={p.x} cy={p.y} r="5" fill="none" stroke={c.tone} strokeWidth="1" opacity="0.5" />
                <circle cx={p.x} cy={p.y} r={hov ? 4.6 : 3.6} fill={c.tone} filter="url(#gGlow)" />
                <circle cx={p.x} cy={p.y} r="1.6" fill="#fff" />
              </g>
            );
          })}
        </g>

        {/* shine + rim on top */}
        <circle cx={CX} cy={CY} r={GLOBE_R} fill="url(#gShine)" style={{ pointerEvents: "none" }} />
        <circle cx={CX} cy={CY} r={GLOBE_R} fill="none" stroke="rgba(216,180,255,0.28)" strokeWidth="0.8" style={{ pointerEvents: "none" }} />
      </svg>

      {/* hover tooltip (HTML overlay positioned over the marker) */}
      {(() => {
        const c = MAP_SHIPS.find((s) => s.id === hovCity);
        if (!c) return null;
        const p = orthoProject(c.lat, c.lon, rLon, rLat, CX, CY);
        if (!p.visible) return null;
        const leftPct = (p.x / VB) * 100, topPct = (p.y / VB) * 100;
        return (
          <div style={{ position: "absolute", left: `calc(${leftPct}% )`, top: `calc(${topPct}% - 30px)`, transform: "translateX(-50%)", pointerEvents: "none", zIndex: 5 }}>
            <div style={{ background: "rgba(5,7,26,0.95)", border: `1px solid ${c.tone}66`, borderRadius: 7, padding: "4px 9px", fontFamily: FONT, display: "inline-flex", alignItems: "center", gap: 5, boxShadow: "0 6px 20px rgba(0,0,0,0.6)", whiteSpace: "nowrap" }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: c.tone, flexShrink: 0 }} />
              <span style={{ fontSize: 10.5, fontWeight: 750, color: "#fff" }}>{c.name}</span>
              <span style={{ fontSize: 9, color: c.tone, fontWeight: 700 }}>{c.status}</span>
            </div>
          </div>
        );
      })()}

      {/* drag hint */}
      <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.32)", fontFamily: FONT, textTransform: "uppercase", pointerEvents: "none" }}>
        Drag to rotate · auto-spinning
      </div>
    </div>
  );
}

function MiniSpark({ pts, color }: { pts: number[]; color: string }) {
  const w = 56, h = 18;
  const max = Math.max(...pts), min = Math.min(...pts);
  const d = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - min) / (max - min || 1)) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

function LogisticsCommandCenter() {
  const [hovCity, setHovCity] = useState<string | null>(null);

  return (
    <Card style={{ padding: 0, overflow: "hidden", background: "#05071A", border: "1px solid rgba(161,0,255,0.22)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px 8px" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#A100FF,#7500C0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(161,0,255,0.4)" }}>
          <Truck size={18} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 850, color: "#fff", fontFamily: FONT, letterSpacing: -0.2 }}>Logistics Flow</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, color: "#2DD4A7", fontFamily: FONT }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2DD4A7", animation: "pulse 1.4s infinite" }} /> Live tracking
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", fontFamily: FONT, marginTop: 1 }}>Global visibility of shipments and routes</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: "#C9A8FF", border: "1px solid rgba(161,0,255,0.35)", borderRadius: 8, padding: "6px 11px", fontFamily: FONT, cursor: "pointer" }}>
          View details <ExternalLink size={11} />
        </span>
      </div>

      {/* Interactive globe */}
      <LogisticsGlobe hovCity={hovCity} setHovCity={setHovCity} />

      {/* KPI footer */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "6px 16px 12px", gap: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", fontFamily: FONT, textTransform: "uppercase" }}>On-Time In-Full (OTIF)</div>
          <div style={{ fontSize: 27, fontWeight: 850, color: "#A100FF", fontFamily: FONT, lineHeight: 1.05, ...NUM, textShadow: "0 0 18px rgba(161,0,255,0.5)" }}>93.8%</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
            <MiniSpark pts={[88, 90, 89, 91, 92, 91, 93.8]} color="#A100FF" />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#2DD4A7", fontFamily: FONT }}>↑ 2.4pp vs 7d ago</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", fontFamily: FONT, textTransform: "uppercase" }}>Active Shipments</div>
          <div style={{ fontSize: 27, fontWeight: 850, color: "#A100FF", fontFamily: FONT, lineHeight: 1.05, ...NUM, textShadow: "0 0 18px rgba(161,0,255,0.5)" }}>128</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, justifyContent: "flex-end" }}>
            <MiniSpark pts={[112, 118, 115, 120, 122, 125, 128]} color="#A100FF" />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#2DD4A7", fontFamily: FONT }}>↑ 8 vs 7d ago</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* Logistics: command center + risk selector */
function LogisticsVisual() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1.7fr 1fr", gap:14 }}>
      <LogisticsCommandCenter />
      <MainRisksOpportunitiesCard domain="logistics" />
    </div>
  );
}

function LivingDemandFlow() {
  const [hov, setHov] = useState<number | null>(null);
  const stages = [
    { label: "Demand",      y: 42,  w: 110, col: C.core,     units: "1,000", eur: "€8.2M", conf: 95, gate: false, kpi: "Signal-driven baseline · revenue potential €8.2M" },
    { label: "Forecast AI", y: 100, w: 78,  col: C.amber,    units: "780",   eur: "€6.4M", conf: 63, gate: true,  kpi: "Trust gate · confidence 63% (below 65%) · gap −€1.8M" },
    { label: "Production",  y: 158, w: 70,  col: C.deep,     units: "720",   eur: "€5.9M", conf: 88, gate: false, kpi: "Line 2 capacity constraint · impact −€0.5M" },
    { label: "Orders",      y: 210, w: 62,  col: "#1E7145",  units: "660",   eur: "€5.4M", conf: 90, gate: false, kpi: "Confirmed commitments · uncommitted demand −€0.5M" },
    { label: "OTIF",        y: 256, w: 58,  col: C.green,    units: "620",   eur: "€5.1M", conf: 93, gate: false, kpi: "On-time in-full · 93.8% OTIF vs 95% SLA target" },
  ];
  const left  = stages.map((s) => `${150 - s.w / 2},${s.y}`);
  const right = [...stages].reverse().map((s) => `${150 + s.w / 2},${s.y}`);
  const ribbon = [...left, ...right].join(" ");
  return (
    <Card style={{ padding: 16 }}>
      <SectionLabel icon={Activity}>Living demand flow</SectionLabel>

      {/* CFO + Ops KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
        {([
          { l: "Revenue Forecast", v: "€8.2M",  t: "green", I: TrendingUp   },
          { l: "Revenue at Risk",  v: "€3.1M",  t: "red",   I: AlertTriangle },
          { l: "Forecast Accuracy",v: "78%",    t: "amber", I: Activity      },
          { l: "Avg OTIF",         v: "93.8%",  t: "amber", I: CheckCircle2  },
        ] as const).map((k, i) => (
          <div key={i} style={{ padding: "7px 9px", borderRadius: 8, background: k.t === "red" ? C.redBg : k.t === "amber" ? C.amberBg : C.greenBg }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: C.soft, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2, display: "flex", alignItems: "center", gap: 3 }}>
              <k.I size={8} strokeWidth={2.2} style={{ opacity: 0.65 }} />{k.l}
            </div>
            <div style={{ fontSize: 15, fontWeight: 850, color: k.t === "red" ? C.red : k.t === "amber" ? C.amber : C.green, ...NUM }}>{k.v}</div>
          </div>
        ))}
      </div>

      <svg viewBox="0 0 300 290" style={{ width: "100%" }}>
        <defs>
          <linearGradient id="demandRibbon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={C.core}  stopOpacity="0.30" />
            <stop offset="34%"  stopColor={C.amber} stopOpacity="0.26" />
            <stop offset="100%" stopColor={C.green} stopOpacity="0.30" />
          </linearGradient>
          <path id="demandPath" d="M150 42 L150 256" />
        </defs>
        <polygon points={ribbon} fill="url(#demandRibbon)" stroke={C.line} strokeWidth="0.5" />
        {[0,1,2,3,4,5,6,7].map((i) => (
          <circle key={i} r={i % 3 === 0 ? 3.4 : 2.4} fill={i > 2 ? C.amber : C.core} opacity="0.85">
            <animateMotion dur={`${2.6 + i * 0.16}s`} repeatCount="indefinite" begin={`${i * 0.26}s`}><mpath href="#demandPath" /></animateMotion>
          </circle>
        ))}
        {stages.map((s, i) => {
          const on = hov === i;
          return (
            <g key={s.label} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: "pointer" }}>
              <rect x={150 - s.w / 2} y={s.y - 17} width={s.w} height="34" rx="8" fill={s.col} opacity={s.gate ? 0.72 : 0.92} stroke={on ? C.ink : "none"} strokeWidth="1.2" />
              <text x="150" y={s.y - 4}  fill="#fff" fontSize="10.5" fontWeight="850" textAnchor="middle" fontFamily={FONT}>{s.label}</text>
              <text x="150" y={s.y + 6}  fill="#fff" fontSize="7.5"  fontWeight="700" textAnchor="middle" fontFamily={FONT} opacity="0.85">{s.units} u</text>
              <text x="150" y={s.y + 14} fill="#fff" fontSize="7"    fontWeight="600" textAnchor="middle" fontFamily={FONT} opacity="0.70">{s.eur}</text>
              {s.gate && (
                <circle cx={150 + s.w / 2 + 10} cy={s.y} r="4.5" fill={C.amber}>
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.1s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
        {hov != null && (
          <g pointerEvents="none">
            <rect x="1" y={stages[hov].y - 28} width="140" height="54" rx="8" fill={C.ink} opacity="0.96" />
            <text x="10" y={stages[hov].y - 13} fontSize="9"   fontWeight="800" fill="#fff"     fontFamily={FONT}>Conf. {stages[hov].conf}% · {stages[hov].eur}</text>
            <text x="10" y={stages[hov].y - 2}  fontSize="8"   fontWeight="600" fill="#C9C7D6"  fontFamily={FONT}>{stages[hov].units} units</text>
            <foreignObject x="9" y={stages[hov].y + 4} width="128" height="22">
              <div style={{ fontSize: 7.5, color: "#C9C7D6", lineHeight: 1.3, fontFamily: FONT }}>{stages[hov].kpi}</div>
            </foreignObject>
          </g>
        )}
      </svg>

      {/* Value leakage row */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", borderRadius: 8, background: C.redBg, border: `1px solid ${C.red}22`, marginTop: -4 }}>
        <AlertTriangle size={11} color={C.red} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 10.5, fontWeight: 800, color: C.red }}>€3.1M value leakage</span>
        <span style={{ fontSize: 9.5, color: C.soft }}>· 38% of signal · primary: forecast trust gate</span>
      </div>

      <div style={{ fontSize: 10, color: C.soft, marginTop: 8 }}>Width = volume · amber gate = AI forecast confidence below 65% · hover for detail</div>
    </Card>
  );
}

/* Commercial: forecast accuracy trend + compact service KPIs + risk selector */
function CommercialVisual() {
  const forecastTrend = [
    { m: "Jan", acc: 84 },
    { m: "Feb", acc: 81 },
    { m: "Mar", acc: 86 },
    { m: "Apr", acc: 79 },
    { m: "May", acc: 77 },
    { m: "Jun", acc: 78 },
  ];
  const serviceKpis = [
    { label: "Production plan", value: "87%", sub: "schedule confirmed", tone: C.core },
    { label: "Confirmed orders", value: "92%", sub: "customer demand locked", tone: C.deep },
    { label: "OTIF delivered", value: "94%", sub: "weighted service level", tone: "#C77DFF" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 14 }}>
      <Card style={{ padding: 16, background: "linear-gradient(180deg,rgba(161,0,255,0.055),#fff 28%)", boxShadow: "0 16px 42px rgba(70,0,115,0.08)" }}>
        <SectionLabel icon={TrendingUp}>FORECAST ACCURACY — 6-MONTH TREND</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: C.core, ...NUM, letterSpacing: -0.8, textShadow: "0 8px 24px rgba(161,0,255,0.18)" }}>78%</span>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: C.deep, background: "rgba(161,0,255,0.10)", padding: "4px 10px", borderRadius: 999, ...NUM }}>9.4% deviation</span>
        </div>
        <div style={{ height: 208, marginBottom: 12 }}>
          <ResponsiveContainer>
            <LineChart data={forecastTrend} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="forecastPurpleLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={C.deep} />
                  <stop offset="55%" stopColor={C.core} />
                  <stop offset="100%" stopColor="#C77DFF" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={C.line} strokeDasharray="0" />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: C.soft }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[70, 95]}
                ticks={[70, 77, 84, 95]}
                tick={{ fontSize: 10, fill: C.soft }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, fontFamily: FONT, border: `1px solid ${C.line}`, borderRadius: 8 }}
                formatter={(v) => [`${v}%`, "Forecast accuracy"]}
              />
              <Area dataKey="acc" type="monotone" stroke="none" fill={C.core} fillOpacity={0.08} />
              <Line
                type="monotone"
                dataKey="acc"
                stroke="url(#forecastPurpleLine)"
                strokeWidth={3.5}
                dot={{ r: 5.5, fill: C.core, stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 7, fill: C.core, stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: 10.5, color: C.soft, marginBottom: 12 }}>Threshold for escalation: 10% deviation · agent confidence: 63%</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }}>
          {serviceKpis.map((k) => (
            <div key={k.label} style={{ padding: "12px 12px 11px", borderRadius: 12, background: "linear-gradient(180deg,rgba(161,0,255,0.075),#F8F9FD)", border: `1px solid rgba(161,0,255,0.16)` }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: C.soft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: k.tone, lineHeight: 1, ...NUM }}>{k.value}</div>
              <div style={{ fontSize: 10.5, color: C.soft, marginTop: 5 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </Card>
      <MainRisksOpportunitiesCard domain="commercial" />
    </div>
  );
}

function CashFxStack({ cashData, fxExposures }) {
  return (
    <Card style={{ padding: 16 }}>
      <SectionLabel icon={Zap}>Cashflow & FX control stack</SectionLabel>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 850, color: C.amber, ...NUM }}>€2.1M</span>
          <span style={{ fontSize: 11, color: C.soft }}>working capital above norm</span>
        </div>
        <div style={{ height: 72 }}>
          <ResponsiveContainer>
            <AreaChart data={cashData} margin={{ top: 3, right: 4, bottom: 0, left: -24 }}>
              <XAxis dataKey="w" tick={{ fontSize: 9, fill: C.soft }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[1, 5]} />
              <Tooltip contentStyle={{ fontSize: 11, fontFamily: FONT, border: `1px solid ${C.line}`, borderRadius: 8 }} formatter={(v) => [`€${v}M`, "Cash"]} />
              <Area dataKey="cash" stroke={C.amber} strokeWidth={2} fill={C.amber} fillOpacity={0.12} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
        {fxExposures.map((f) => (
          <div key={f.ccy} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <b style={{ fontSize: 12 }}>{f.ccy}</b><Pill tone={f.t}>{f.t === "red" ? "Unhedged" : "Hedged"}</Pill>
            </div>
            <div style={{ height: 8, background: C.faint, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${(f.hedged / (f.exp || 0.01)) * 100}%`, height: "100%", background: C.green }} />
            </div>
            <div style={{ fontSize: 10.5, color: C.soft, marginTop: 2, ...NUM }}>Exposure €{f.exp.toFixed(2)}M · Hedged €{f.hedged.toFixed(2)}M</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* Finance: animated waterfall + cash/FX stack + risk selector */
function FinanceVisual() {
  const waterfallData = [
    { name: "Revenue", v: 18.4, total: 18.4, type: "base" },
    { name: "Cocoa cost", v: -1.45, total: 16.95, type: "neg" },
    { name: "Logistics", v: -0.45, total: 16.5, type: "neg" },
    { name: "Production", v: -0.65, total: 15.85, type: "neg" },
    { name: "Margin (protected)", v: 15.85, total: 15.85, type: "result" },
  ];
  const cashData = [
    { w: "W1", cash: 4.2 }, { w: "W2", cash: 3.9 }, { w: "W3", cash: 3.1 },
    { w: "W4", cash: 2.1 }, { w: "W5", cash: 2.8 }, { w: "W6", cash: 3.4 },
  ];
  const fxExposures = [
    { ccy: "USD/EUR", exp: 0.12, hedged: 0.0, t: "red" },
    { ccy: "GBP/EUR", exp: 0.04, hedged: 0.04, t: "green" },
    { ccy: "CHF/EUR", exp: 0.02, hedged: 0.02, t: "green" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr 1fr", gap: 14 }}>
      {/* P&L impact waterfall */}
      <Card style={{ padding: 16 }}>
        <SectionLabel icon={Activity}>P&amp;L IMPACT — 4-WEEK HORIZON (€M)</SectionLabel>
        <svg viewBox="0 0 280 200" style={{ width: "100%" }}>
          <defs>
            <marker id="arr-fin" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          {(() => {
            const max = 20, h = 160, bw = 34, gap = 16;
            const y = (v) => 20 + h - (v / max) * h;
            const cols = { base: C.dark, neg: C.red, result: C.green };
            let floating = [18.4, 16.95, 16.5, 15.85, 0];
            return waterfallData.map((d, i) => {
              const barH = Math.abs(d.type === "result" ? d.total : d.v) / max * h;
              const barY = d.type === "neg" ? y(floating[i]) : y(d.type === "result" ? d.total : d.v);
              const x = 20 + i * (bw + gap);
              return (
                <g key={i}>
                  <rect x={x} y={barY} width={bw} height={barH} rx={3} fill={cols[d.type]} opacity={0.82}>
                    <animate attributeName="height" from="0" to={barH} dur={`${0.65 + i * 0.12}s`} fill="freeze" />
                    <animate attributeName="y" from={barY + barH} to={barY} dur={`${0.65 + i * 0.12}s`} fill="freeze" />
                  </rect>
                  <text x={x + bw / 2} y={barY - 5} fontSize="8.5" fontWeight="700" fill={cols[d.type]} textAnchor="middle" fontFamily={FONT}>{d.type === "neg" ? `−${Math.abs(d.v)}` : d.v.toFixed(1)}</text>
                  <text x={x + bw / 2} y={182} fontSize="8" fill={C.soft} textAnchor="middle" fontFamily={FONT}>{d.name.split(" ")[0]}</text>
                </g>
              );
            });
          })()}
          {[0, 5, 10, 15, 20].map((g) => (
            <g key={g}>
              <line x1="18" x2="272" y1={20 + 160 - (g / 20) * 160} y2={20 + 160 - (g / 20) * 160} stroke={C.line} strokeWidth={0.5} />
              <text x="14" y={22 + 160 - (g / 20) * 160} fontSize="8" fill={C.soft} textAnchor="end" fontFamily={FONT}>{g}</text>
            </g>
          ))}
        </svg>
        <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>Cocoa cost is the largest single EVaR driver — Packet #24 protects €1.60M of this margin.</div>
      </Card>

      <CashFxStack cashData={cashData} fxExposures={fxExposures} />
      <MainRisksOpportunitiesCard domain="finance" />
    </div>
  );
}

function BloombergSignalFeed() {
  const ticker = [
    ["ICE Cocoa", "▲ 2.1%", C.red],
    ["NOAA Rainfall", "▼ 8%", C.amber],
    ["PortWatch Alert", "Abidjan +8d", C.red],
    ["ECB Rate Hold", "0 bps", C.green],
    ["EUDR Update", "Q3 review", C.amber],
    ["TTF Gas", "▲ 0.6%", C.amber],
  ];
  return (
    <Card style={{ padding: 16, overflow: "hidden" }}>
      <SectionLabel icon={Radio}>Live signal feed</SectionLabel>
      <div style={{ border: `1px solid ${C.line}`, borderRadius: 9, overflow: "hidden", background: C.dark, marginBottom: 14 }}>
        <div style={{ display: "flex", width: "max-content", animation: "ticker 18s linear infinite" }}>
          {[...ticker, ...ticker].map(([name, val, col], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", color: "#fff", borderRight: "1px solid rgba(255,255,255,0.12)", whiteSpace: "nowrap" }}>
              <b style={{ fontSize: 12 }}>{name}</b>
              <span style={{ color: col, fontSize: 12, fontWeight: 850 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
      {[
        ["Commodity pressure", "ICE cocoa z-score +2.3 remains the strongest EVaR driver.", "red"],
        ["Weather watch", "West Africa rainfall deficit continues into week 3.", "amber"],
        ["Regulatory readiness", "EUDR documentation gap closure remains in progress.", "purple"],
      ].map(([h, s, tone]) => (
        <div key={h} style={{ padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Pill tone={tone}>{h}</Pill></div>
          <div style={{ fontSize: 11.5, color: C.soft, marginTop: 5 }}>{s}</div>
        </div>
      ))}
    </Card>
  );
}

/* External Intelligence: live ticker + commodity chart + risk selector */
function ExternalVisual() {
  const cocoaBT = BACKTEST.slice(-8);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.85fr", gap: 14 }}>
      <BloombergSignalFeed />

      {/* Commodity trend */}
      <Card style={{ padding: 16 }}>
        <SectionLabel icon={TrendingUp}>COCOA PRICE — 8-WEEK ROLLING</SectionLabel>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: C.red, ...NUM }}>$4.2k/t</span>
          <Pill tone="red">z-score +2.3</Pill>
        </div>
        <div style={{ height: 120 }}>
          <ResponsiveContainer>
            <AreaChart data={cocoaBT.map((d) => ({ m: d.m, price: d.price }))} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <CartesianGrid stroke={C.line} vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: C.soft }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: C.soft }} axisLine={false} tickLine={false} unit="k" />
              <Tooltip contentStyle={{ fontSize: 11, fontFamily: FONT, border: `1px solid ${C.line}`, borderRadius: 8 }} formatter={(v) => [`${v}k/t`, "Cocoa"]} />
              <Area dataKey="price" stroke={C.red} strokeWidth={2} fill={C.red} fillOpacity={0.07} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: 11, color: C.soft, marginTop: 12 }}>External signal layer feeds Procurement, Logistics and Finance twins in real time.</div>
      </Card>
      <MainRisksOpportunitiesCard domain="external" />
    </div>
  );
}

function BI({ biTab, setBiTab, onGenerateReport }: any) {
  const kpis = BI_KPIS[biTab];
  const actions = BI_ACTIONS[biTab];
  const insights = AI_INSIGHTS[biTab];
  const steward = STEWARDS[biTab];

  const toneColor = (t) => ({ red: C.red, amber: C.amber, green: C.green, grey: C.grey, purple: C.deep }[t] || C.grey);

  const VisualByTab = {
    procurement: ProcurementVisual,
    production: ProductionVisual,
    logistics: LogisticsVisual,
    commercial: CommercialVisual,
    finance: FinanceVisual,
    external: ExternalVisual,
  };
  const Visual = VisualByTab[biTab];

  const biTabColors = { procurement: C.core, production: "#1E7145", logistics: "#0070C0", commercial: "#D41876", finance: "#B86E00", external: "#5B5B72" };
  const biAccent = biTabColors[biTab] || C.core;
  const KPI_ICON_MAP: Record<string, any> = {
    "Domain EVaR": AlertTriangle, "Financial EVaR": AlertTriangle, "Margin at Risk": AlertTriangle,
    "Days of cover": Clock, "Avg lead time": Clock, "Maintenance events": Clock, "Promotion load": Clock,
    "Contracted volume": ShoppingCart, "Supplier concentration": Building2, "Critical suppliers": Building2,
    "Forward contract avg": TrendingUp, "Freight cost index": TrendingUp, "Revenue forecast": TrendingUp,
    "Commodity volatility": TrendingUp, "FX Exposure": TrendingUp,
    "Lines operating": Factory, "Active shipments": Truck, "Freight disruption": Truck,
    "Delayed containers": AlertTriangle, "Port congestion index": AlertTriangle,
    "Line utilization": Activity, "Forecast deviation": Activity, "Budget Variance": Activity,
    "OEE": Zap, "Cash Flow at Risk": Zap, "Working Capital": Database,
    "Capacity available": Layers, "Active signals": Radio,
    "Agent confidence": Sparkles, "OTIF at risk": CheckCircle2,
    "Weather severity": Cloud, "Geopolitical index": Network, "Regulatory alerts": ShieldCheck,
  };

  return (
    <div>
      {/* BI action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "9px 14px", borderRadius: 10, background: C.faint, border: `1px solid ${C.line}` }}>
        <Sparkles size={13} color={C.core} />
        <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>AI-generated intelligence</span>
        <span style={{ fontSize: 11, color: C.soft, flex: 1 }}>· live data as of today · {biTab} domain</span>
        <button onClick={() => onGenerateReport && onGenerateReport()} style={{ display: "flex", alignItems: "center", gap: 6, background: C.core, color: "#fff", border: "none", padding: "7px 14px", borderRadius: 7, fontWeight: 700, fontFamily: FONT, fontSize: 12, cursor: "pointer" }}>
          <FileText size={12} /> Generate BI Report
        </button>
      </div>
      {/* Decorative icon strip + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {BI_TABS.map((tb) => {
            const isActive = tb.id === biTab;
            const Icon = tb.icon;
            return (
              <div key={tb.id} onClick={() => setBiTab(tb.id)}
                style={{ width: 30, height: 30, borderRadius: 9, cursor: "pointer",
                  background: isActive ? biAccent + "18" : C.faint,
                  border: `1px solid ${isActive ? biAccent + "50" : "transparent"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .15s" }}>
                <Icon size={16} color={isActive ? biAccent : C.soft} />
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, height: 1, background: C.line }} />
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: C.soft, textTransform: "uppercase" }}>Business Intelligence</div>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 14 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${C.line}`, background: C.bg }}>
            <div style={{ height: 2.5, background: toneColor(k.t), opacity: 0.7 }} />
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: C.soft, marginBottom: 3, letterSpacing: 0.3, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
              {(() => { const KI = KPI_ICON_MAP[k.l]; return KI ? <KI size={9} strokeWidth={2.2} style={{ flexShrink: 0, opacity: 0.65 }} /> : null; })()}
              {k.l}
            </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: toneColor(k.t), letterSpacing: -0.5, ...NUM }}>{k.v}</div>
              <div style={{ fontSize: 10.5, color: C.soft, marginTop: 2 }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main visual — with accent bar */}
      <div style={{ marginBottom: 14, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.line}`, position: "relative" }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${biAccent}, ${biAccent}44)` }} />
        {/* Decorative corner icons */}
        <div style={{ position: "absolute", top: 10, right: 12, display: "flex", gap: 6, opacity: 0.18, pointerEvents: "none" }}>
          {[ShoppingCart, Factory, Truck, Handshake, Landmark].map((Ic, i) => (
            <Ic key={i} size={14} color={biAccent} />
          ))}
        </div>
        <Visual />
      </div>

      {/* Bottom row: steward first, then actions + insights */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr", gap: 14 }}>
        {/* Steward + EVaR contribution */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ padding: 14, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: C.faint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={11} color={C.soft} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: C.soft }}>DATA STEWARD</span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{steward.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, marginTop: 6, color: steward.fresh ? C.green : C.amber }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: steward.fresh ? C.green : C.amber }} />
              {steward.fresh ? `Validated · ${steward.validated}` : `Stale · ${steward.validated}`}
            </div>
            {!steward.fresh && <div style={{ marginTop: 8 }}><Pill tone="amber">Refresh requested</Pill></div>}
          </Card>
          <Card style={{ padding: 14, flex: 1 }}>
            <SectionLabel icon={Activity}>EVAR SHARE</SectionLabel>
            <div style={{ fontSize: 11, color: C.soft, marginBottom: 6 }}>path-weighted domain contribution</div>
            <EVaRBar items={EVAR_CONTRIB} />
          </Card>
        </div>

        {/* Open actions */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "11px 14px 8px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: biAccent + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={12} color={biAccent} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: C.soft }}>OPEN ACTIONS</span>
            </div>
            <span style={{ fontSize: 11, color: C.soft }}>{actions.length} items</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <tbody>{actions.map((a, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td style={{ padding: "9px 14px", fontWeight: 600 }}><Chev />{a.a}</td>
                <td style={{ padding: "9px 14px", textAlign: "right" }}><Pill tone={a.tone}>{a.status}</Pill></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>

        {/* AI Insights */}
        <Card style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: C.purpBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={11} color={C.core} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: C.soft }}>AI INSIGHTS</span>
            <Tag kind="ai" />
          </div>
          {insights.map((ins, i) => (
            <div key={i} style={{ display: "flex", gap: 9, padding: "8px 0", borderBottom: i < insights.length - 1 ? `1px solid ${C.line}` : "none", alignItems: "flex-start" }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: C.purpBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <Sparkles size={10} color={C.core} />
              </div>
              <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.6 }}>{ins}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ============ REPORTS ============ */
const REPORT_TEMPLATES = [
  ["Executive Risk Report", "Enterprise risk overview and key highlights", "risk", ["Executive Summary", "Risk Score and EVaR", "Top Critical Risks", "Key Recommendations"]],
  ["External Exposure Report", "External intelligence and environmental risks", "external", ["Climate Intelligence", "Commodity Markets", "Geopolitical Risks", "Regulatory Changes", "Reputation Insights"]],
  ["Operations Intelligence Report", "Operational performance and risk insights", "ops", ["Manufacturing Operations", "Supply Chain & Logistics", "Quality & Safety", "Procurement Intelligence"]],
  ["Financial & Strategic Report", "Financial impact and strategic outlook", "finance", ["Financial Performance", "Currency Exposure", "Margin Impact Analysis", "Scenario Forecasts"]],
  ["Sustainability & ESG Report", "ESG performance and sustainability risks", "esg", ["ESG Performance", "Sustainability Risks", "Compliance Overview", "Stakeholder Impact"]],
];

function ReportVisual({ kind }) {
  if (kind === "risk") return (
    <svg viewBox="0 0 240 115" style={{ width: "100%", height: 110 }}>
      <defs><radialGradient id="globeG" cx="50%" cy="58%" r="60%"><stop offset="0%" stopColor="#F5E9FF" /><stop offset="100%" stopColor="#A100FF" stopOpacity="0.28" /></radialGradient></defs>
      <path d="M32 92 C72 18 174 18 214 92" fill="url(#globeG)" opacity="0.9" />
      {[0,1,2,3,4].map((i) => <path key={i} d={`M${42+i*38} 92 C${70+i*14} 32 ${170-i*14} 32 ${202-i*28} 92`} stroke="#A100FF" strokeWidth="0.9" opacity="0.35" fill="none" />)}
      {[0,1,2].map((i) => <path key={`h${i}`} d={`M42 ${88-i*18} C92 ${74-i*10} 154 ${74-i*10} 202 ${88-i*18}`} stroke="#A100FF" strokeWidth="0.9" opacity="0.32" fill="none" />)}
      {Array.from({ length: 52 }).map((_, i) => <circle key={i} cx={35 + (i * 37) % 178} cy={40 + (i * 19) % 54} r="1.3" fill="#A100FF" opacity="0.42" />)}
    </svg>
  );
  if (kind === "external") return (
    <svg viewBox="0 0 240 115" style={{ width: "100%", height: 110 }}>
      <rect x="0" y="0" width="240" height="115" fill="#F8FBFF" rx="8" />
      {[[40,34,24],[92,42,35],[145,38,29],[186,57,30],[62,75,22],[128,77,27],[207,34,16]].map(([x,y,r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#9BC6F3" opacity="0.55" />)}
      {[[50,46],[84,61],[131,48],[174,71],[205,48],[107,83]].map(([x,y], i) => <circle key={i} cx={x} cy={y} r="3.4" fill="#F5A524" />)}
      <path d="M50 46 L84 61 L131 48 L174 71 L205 48" stroke="#9BB9D8" strokeWidth="1.4" fill="none" strokeDasharray="3 5" />
    </svg>
  );
  if (kind === "ops") return (
    <svg viewBox="0 0 240 115" style={{ width: "100%", height: 110 }}>
      <polygon points="36,82 114,38 202,80 122,105" fill="#BEE4B7" />
      {[0,1,2,3].map((i) => <rect key={i} x={66+i*28} y={54-i*7} width="25" height={32+i*7} fill={i%2 ? "#7DBC71" : "#91CE82"} stroke="#4E9B4E" />)}
      <rect x="46" y="72" width="72" height="22" fill="#86C779" stroke="#4E9B4E" />
      <path d="M37 83 L122 105 L203 80" stroke="#4E9B4E" fill="none" />
      <path d="M78 36 h48 M78 44 h35 M78 52 h24" stroke="#80C47A" strokeWidth="2" />
    </svg>
  );
  if (kind === "finance") return (
    <svg viewBox="0 0 240 115" style={{ width: "100%", height: 110 }}>
      {[24,50,76].map((y) => <line key={y} x1="16" y1={y} x2="220" y2={y} stroke="#ECEAF2" />)}
      <path d="M24 82 C48 76 54 54 76 60 S112 82 134 58 S166 34 184 50 S206 70 222 42" stroke="#FF9900" strokeWidth="2.4" fill="none" />
      <path d="M24 92 C60 85 82 76 112 80 S154 72 181 62 S208 56 222 52 L222 104 L24 104 Z" fill="#FF9900" opacity="0.12" />
      <circle cx="184" cy="82" r="22" fill="none" stroke="#E4E1EA" strokeWidth="8" />
      <path d="M184 60 A22 22 0 0 1 206 82" stroke="#FF9900" strokeWidth="8" fill="none" />
    </svg>
  );
  return (
    <svg viewBox="0 0 240 115" style={{ width: "100%", height: 110 }}>
      {[54,72,90].map((r, i) => <circle key={i} cx="120" cy="58" r={r/2} fill="none" stroke="#DDEADC" />)}
      {[0,1,2,3,4].map((i) => <path key={i} d={`M120 58 L${120 + Math.cos(i*1.25)*68} ${58 + Math.sin(i*1.25)*45}`} stroke="#DDEADC" />)}
      <circle cx="120" cy="58" r="39" fill="#D8F0D7" stroke="#79B879" strokeWidth="12" opacity="0.9" />
      <path d="M111 58 l9 9 l19 -25" stroke="#4FA85A" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Reports() {
  const [activeTemplate, setActiveTemplate] = useState(0);
  const BASE_SECTIONS = ["Executive Summary", "Enterprise Risk Overview", "Procurement Intelligence", "Manufacturing Intelligence", "Supply Chain Intelligence", "External Exposure", "Financial Impact", "Decision Outcomes"];
  const [customSections, setCustomSections] = useState<string[]>([]);
  const [sections, setSections] = useState(() => new Set(BASE_SECTIONS));
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string|null>(null);
  const [selectedExport, setSelectedExport] = useState(0);
  const SECTION_LIST = [...BASE_SECTIONS, ...customSections];
  const TEMPLATE_ACCENT = [C.core, "#0070C0", C.green, "#B86E00", "#008080"];

  const handleAddSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    setCustomSections(prev => [...prev, name]);
    setSections(prev => { const n = new Set(prev); n.add(name); return n; });
    setNewSectionName("");
    setAddingSection(false);
  };
  const handleGenerate = () => {
    if (generating) return;
    setGenerating(true);
    setGenerated(null);
    setTimeout(() => {
      setGenerating(false);
      const fmts = ["PDF", "PowerPoint", "Excel", "ZIP"];
      setGenerated(`${REPORT_TEMPLATES[activeTemplate][0]} — ${fmts[selectedExport]} · ${sections.size} sections · generated in 2.4s`);
    }, 2400);
  };
  const EXPORT_OPTS = [
    [FileText, "PDF Report", "Optimized for print and sharing", C.red],
    [Presentation, "PowerPoint", "Executive presentation", C.amber],
    [FileSpreadsheet, "Excel Workbook", "Detailed data and analysis", C.green],
    [FileArchive, "Board Pack (ZIP)", "All formats in one package", C.core],
  ];
  const recent = [
    ["Board Risk Pack - Q2 2026", "Board Report", "A. Manager", "Jun 12, 2026", "PDF"],
    ["Commodity Markets Outlook", "External Exposure", "S. Patel", "Jun 11, 2026", "PPTX"],
    ["Sustainability & ESG Review", "ESG Report", "J. Williams", "Jun 10, 2026", "PDF"],
    ["Regulatory Intelligence Update", "Regulatory Report", "F. Corbier", "Jun 09, 2026", "PDF"],
    ["Procurement Intelligence Summary", "Operations Report", "A. Manager", "Jun 09, 2026", "XLSX"],
  ];
  const toggleSection = (s) => setSections((prev) => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── HERO BANNER ── */}
      <div style={{ borderRadius: 12, overflow: "hidden", background: "linear-gradient(120deg,#1A1538 0%,#3A1A66 55%,#5A1E8C 100%)", color: "#fff", padding: "18px 22px", display: "flex", alignItems: "center", gap: 22, position: "relative" }}>
        <svg viewBox="0 0 600 90" preserveAspectRatio="none" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: 380, opacity: 0.16 }}>
          <path d="M0 70 L80 54 L160 60 L240 30 L320 42 L400 18 L480 28 L560 8 L600 14" stroke="#fff" strokeWidth="2" fill="none" />
          {[[0,70],[80,54],[160,60],[240,30],[320,42],[400,18],[480,28],[560,8]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3" fill="#fff" />)}
        </svg>
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", opacity: 0.6 }}>FactoryMind · Reporting</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginTop: 3 }}>Intelligence Reports</div>
          <div style={{ fontSize: 12, opacity: 0.72, marginTop: 3, maxWidth: 340 }}>Board-ready packs generated from live risk, market and decision data.</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 10, position: "relative", flexWrap: "wrap" }}>
          {[["48", "Reports / quarter"], ["2.4s", "Avg generation"], ["5", "Templates"], ["100%", "Audit-traced"]].map(([v, l]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, padding: "10px 14px", minWidth: 96 }}>
              <div style={{ fontSize: 20, fontWeight: 900, ...NUM }}>{v}</div>
              <div style={{ fontSize: 9.5, opacity: 0.7, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── REPORT TEMPLATES ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <SectionLabel icon={LayoutGrid}>Report Templates</SectionLabel>
          <div style={{ flex: 1 }} />
          <button style={{ background: "transparent", border: "none", color: C.core, fontFamily: FONT, fontWeight: 700, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>View all templates <ChevronRight size={13} style={{ verticalAlign: -2 }} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          {REPORT_TEMPLATES.map(([title, sub, kind, includes], i) => {
            const accent = TEMPLATE_ACCENT[i];
            const selected = activeTemplate === i;
            return (
              <div key={title} onClick={() => setActiveTemplate(i)}
                style={{ background: C.bg, border: `1px solid ${selected ? accent : C.line}`, borderRadius: 10, overflow: "hidden", cursor: "pointer", boxShadow: selected ? `0 0 0 2px ${accent}22, 0 4px 16px ${accent}18` : "0 1px 3px rgba(10,10,15,.06)", transition: "all .18s", display: "flex", flexDirection: "column" }}>
                <div style={{ height: 4, background: selected ? accent : C.line, transition: "background .18s" }} />
                <div style={{ padding: "14px 14px 0" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: selected ? accent : C.dark, textTransform: "uppercase", letterSpacing: 0.8, lineHeight: 1.25, marginBottom: 5 }}>{title}</div>
                  <div style={{ fontSize: 11, color: C.soft, lineHeight: 1.45, minHeight: 32, marginBottom: 8 }}>{sub}</div>
                </div>
                <ReportVisual kind={kind} />
                <div style={{ padding: "10px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: C.soft, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 7 }}>Includes</div>
                  {includes.slice(0, 4).map((x) => (
                    <div key={x} style={{ fontSize: 11, color: C.ink, marginBottom: 4, display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <CheckCircle2 size={11} color={accent} style={{ flexShrink: 0, marginTop: 1 }} />{x}
                    </div>
                  ))}
                  <button onClick={(e) => { e.stopPropagation(); setActiveTemplate(i); handleGenerate(); }} style={{ width: "100%", marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${accent}`, background: selected ? accent : C.bg, color: selected ? "#fff" : accent, padding: "9px 10px", borderRadius: 7, fontWeight: 700, fontFamily: FONT, cursor: "pointer", fontSize: 12, transition: "all .18s" }}>
                    <Play size={12} fill={selected ? "#fff" : accent} /> Generate Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── REPORT BUILDER + EXPORT ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 248px", gap: 12 }}>
        <Card style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "196px 1fr", gap: 18 }}>
            {/* Section selector */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
                <SectionLabel icon={FileText}>Report Builder</SectionLabel>
                <Info size={12} color={C.soft} style={{ verticalAlign: -1 }} />
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", color: C.soft, letterSpacing: 0.9, marginBottom: 8 }}>Select sections</div>
              {SECTION_LIST.map((s) => (
                <label key={s} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 600, marginBottom: 7, cursor: "pointer", color: sections.has(s) ? C.ink : C.soft }}>
                  <input type="checkbox" checked={sections.has(s)} onChange={() => toggleSection(s)} style={{ accentColor: C.core, width: 13, height: 13 }} />{s}
                </label>
              ))}
              {addingSection ? (
                <div style={{ marginTop: 10 }}>
                  <input
                    autoFocus
                    value={newSectionName}
                    onChange={e => setNewSectionName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAddSection(); if (e.key === "Escape") { setAddingSection(false); setNewSectionName(""); } }}
                    placeholder="Section name…"
                    style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.core}`, borderRadius: 6, padding: "6px 9px", fontFamily: FONT, fontSize: 12, color: C.ink, outline: "none", marginBottom: 5 }}
                  />
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={handleAddSection} style={{ flex: 1, background: C.core, color: "#fff", border: "none", borderRadius: 6, padding: "6px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Add</button>
                    <button onClick={() => { setAddingSection(false); setNewSectionName(""); }} style={{ flex: 1, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT, color: C.soft }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingSection(true)} style={{ marginTop: 10, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: C.bg, border: `1px dashed ${C.core}60`, borderRadius: 7, padding: "8px", fontFamily: FONT, fontWeight: 600, cursor: "pointer", fontSize: 12, color: C.core }}>
                  <Plus size={13} /> Add Custom Section
                </button>
              )}
            </div>
            {/* Preview */}
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", color: C.soft, letterSpacing: 0.9, marginBottom: 10 }}>Preview</div>
              <div style={{ display: "grid", gridTemplateColumns: "132px repeat(4,1fr)", gap: 8 }}>
                <div style={{ borderRadius: 8, padding: "16px 13px", color: "#fff", background: "linear-gradient(150deg,#1A1538 0%,#252052 100%)", minHeight: 186, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", opacity: 0.5, marginBottom: 12 }}>Confidential</div>
                    <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.1, marginBottom: 6 }}>BOARD<br />RISK<br />PACK</div>
                    <div style={{ fontSize: 9.5, opacity: 0.65 }}>Q2 2026</div>
                  </div>
                  <div style={{ fontSize: 9, color: "#A100FF", fontWeight: 800, letterSpacing: 0.4 }}>CocoaRisk</div>
                </div>
                {[
                  { t: "Executive Summary",       a: "Risk Score", b: "70 /100",  sub: "Live EES",        col: C.green },
                  { t: "Enterprise Risk Overview", a: "EVaR",       b: "€2.8M",   sub: "↑ 21% vs 7d",     col: C.core },
                  { t: "Top Critical Risks",       a: "Commodity",  b: "85",       sub: "Supplier Conc. 72", col: C.red },
                  { t: "Recommendations",          a: "12 Total",   b: "High 5",   sub: "Med 4 · Low 3",   col: C.green },
                ].map((slide) => (
                  <div key={slide.t} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 10px", minHeight: 186, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 7.5, textTransform: "uppercase", fontWeight: 800, color: C.dark, letterSpacing: 0.9, marginBottom: 8, lineHeight: 1.25 }}>{slide.t}</div>
                    <div style={{ fontSize: 9.5, color: C.soft, marginBottom: 1 }}>{slide.a}</div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: slide.col, margin: "2px 0 6px", ...NUM }}>{slide.b}</div>
                    <div style={{ flex: 1, background: C.faint, borderRadius: 4, marginBottom: 6, overflow: "hidden" }}>
                      <svg viewBox="0 0 80 34" style={{ width: "100%", height: "100%", display: "block" }}>
                        <path d="M4 26 L18 20 L32 24 L46 12 L60 16 L74 6" stroke={slide.col} strokeWidth="1.8" fill="none" opacity="0.75" />
                        <path d="M4 30 L18 26 L32 28 L46 20 L60 22 L74 14 L74 34 L4 34 Z" fill={slide.col} opacity="0.1" />
                      </svg>
                    </div>
                    <div style={{ fontSize: 9, color: C.soft, lineHeight: 1.4 }}>{slide.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                {Array.from({ length: Math.max(1, Math.min(sections.size, 8)) }).map((_, i) => (
                  <span key={i} style={{ width: 18, height: 3, borderRadius: 99, background: i === 0 ? C.core : C.line }} />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Export Options */}
        <Card style={{ padding: 16, display: "flex", flexDirection: "column" }}>
          <SectionLabel icon={Download}>Export Options</SectionLabel>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {EXPORT_OPTS.map(([Icon, title, sub, color], ei) => {
              const isSel = selectedExport === ei;
              return (
                <button key={title} onClick={() => setSelectedExport(ei)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", border: `1.5px solid ${isSel ? (color as string) : C.line}`, borderRadius: 9, background: isSel ? (color as string) + "0D" : C.bg, cursor: "pointer", fontFamily: FONT, textAlign: "left", width: "100%", transition: "all .15s", boxShadow: isSel ? `0 0 0 3px ${color as string}18` : "none" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 9, background: (color as string) + (isSel ? "25" : "18"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={17} color={color as string} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: isSel ? (color as string) : C.ink }}>{title}</div>
                    <div style={{ fontSize: 10.5, color: C.soft, marginTop: 1 }}>{sub}</div>
                  </div>
                  {isSel && <CheckCircle2 size={14} color={color as string} />}
                </button>
              );
            })}
          </div>
          {generated && (
            <div style={{ marginTop: 10, padding: "8px 11px", borderRadius: 8, background: C.greenBg, border: `1px solid ${C.green}40`, fontSize: 10.5, color: C.green, fontWeight: 700, lineHeight: 1.4 }}>
              <CheckCircle2 size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
              {generated}
            </div>
          )}
          <button onClick={handleGenerate} disabled={generating} style={{ width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: generating ? C.deep : C.core, color: "#fff", padding: "12px", borderRadius: 8, fontWeight: 800, fontFamily: FONT, cursor: generating ? "default" : "pointer", fontSize: 13, opacity: generating ? 0.85 : 1, transition: "all .2s" }}>
            {generating ? <><Activity size={14} style={{ animation: "spin 1s linear infinite" }} /> Generating…</> : <><Play size={14} fill="#fff" /> Generate Report</>}
          </button>
        </Card>
      </div>

      {/* ── RECENT REPORTS ── */}
      <Card style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <SectionLabel icon={Clock}>Recent Reports</SectionLabel>
          <div style={{ flex: 1 }} />
          <button style={{ border: "none", background: "transparent", color: C.core, fontFamily: FONT, fontWeight: 700, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>View all <ChevronRight size={13} style={{ verticalAlign: -2 }} /></button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <thead>
            <tr style={{ color: C.soft, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {["Report Name", "Type", "Owner", "Date Generated", "Format", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "6px 10px", borderBottom: `1px solid ${C.line}`, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((r, i) => {
              const iconColors = [C.core, "#0070C0", C.green, C.red, C.amber];
              const iconBgs   = [C.purpBg, "#E8F0FB", C.greenBg, C.redBg, C.amberBg];
              return (
                <tr key={r[0]} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td style={{ padding: "9px 10px", fontWeight: 700 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 7, background: iconBgs[i], display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileText size={13} color={iconColors[i]} />
                      </span>
                      {r[0]}
                    </span>
                  </td>
                  <td style={{ padding: "9px 10px", color: C.soft }}>{r[1]}</td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 99, background: C.purpBg, color: C.deep, fontSize: 9.5, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{r[2][0]}</span>
                      {r[2]}
                    </span>
                  </td>
                  <td style={{ padding: "9px 10px", color: C.soft }}>{r[3]}</td>
                  <td style={{ padding: "9px 10px" }}><Pill tone={r[4] === "XLSX" ? "green" : r[4] === "PPTX" ? "amber" : "red"} style={{}}>{r[4]}</Pill></td>
                  <td style={{ padding: "9px 10px" }}><Pill tone="green" style={{}}>Generated</Pill></td>
                  <td style={{ padding: "9px 10px" }}>
                    <span style={{ display: "flex", gap: 12, color: C.soft }}>
                      <Eye size={14} style={{ cursor: "pointer" }} /><Download size={14} style={{ cursor: "pointer" }} /><ExternalLink size={14} style={{ cursor: "pointer" }} /><MoreVertical size={14} style={{ cursor: "pointer" }} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ============ SCENARIO PROPAGATION MAP ============ */
/* Living dependency graph — each scenario generates its own causal chain, topology, and propagation front */

const _PNC = (type) => ({
  root_commodity: "#E8760A", root_logistics: "#0070C0", root_weather: "#047857",
  root_commercial: "#D41876", root_financial: "#B86E00",
  procurement: C.core, supply_chain: C.core, operations: "#374FBB",
  logistics: "#0070C0", logistics_ops: "#1560A8", financial: "#B86E00",
  commercial: "#D41876", weather_chain: "#047857", impact: C.red,
})[type] || C.core;

const SCENARIO_GRAPHS = {
  "Cocoa Price Shock": {
    intensityVar: "cocoa",
    rootIds: ["s_ice"],
    order: ["s_ice","s_proc","s_inv","s_rec","s_lines","s_margin","s_contr","s_evar"],
    nodes: [
      { id:"s_ice",   label:"ICE Cocoa",         abbr:"IC", sub:"+18% · z+2.3",      type:"root_commodity", x:60,  y:210, r:20,
        detail:{ exposure:"€1.45M", confidence:88, owner:"Market Signal Agent",
          causes:["West Africa rainfall −38% anomaly","ICCO global supply deficit 180k MT"],
          consequences:["Cocoa procurement repriced immediately","Cover gap below 30-day policy activates"],
          kpis:["Commodity EVaR","ICE z-score vs 5yr mean","Procurement window"],
          actions:["Advance purchase 500t cocoa","Hedge forward exposure 30%"] }},
      { id:"s_proc",  label:"Cocoa Procurement",  abbr:"PR", sub:"Cover 18d / 30d",   type:"procurement",    x:183, y:210, r:16,
        detail:{ exposure:"€1.45M", confidence:84, owner:"Procurement Agent",
          causes:["ICE price spike +18% MoM","Supplier concentration 48% single-source"],
          consequences:["Inventory falls below 30-day policy","Forward cover window narrowing daily"],
          kpis:["Days of cover","Supplier concentration %","Forward cover ratio"],
          actions:["Advance purchase 500t (§3.1)","Activate secondary supplier Ecuador"] }},
      { id:"s_inv",   label:"Inventory",           abbr:"IN", sub:"−12d cover gap",   type:"operations",     x:306, y:210, r:16,
        detail:{ exposure:"€0.87M", confidence:83, owner:"Procurement Agent",
          causes:["Procurement unable to build stock at economic cost"],
          consequences:["Recipes underserved","Production buffer depletes within T+6"],
          kpis:["Days of cover vs policy","Buffer stock level","Reorder trigger"],
          actions:["Replenish inventory to 30-day cover (§3.2)"] }},
      { id:"s_rec",   label:"Recipes",             abbr:"RC", sub:"3 affected",        type:"operations",     x:429, y:210, r:16,
        detail:{ exposure:"€0.62M", confidence:80, owner:"Production Agent",
          causes:["Cocoa cost increase cascades through all 3 recipe families"],
          consequences:["Unit cost rises","SKU margin compressed across portfolio"],
          kpis:["Recipe cost index","Unit contribution margin","Cost-per-kg"],
          actions:["Review recipe substitution options","Confirm cost pass-through with Commercial"] }},
      { id:"s_lines", label:"Production Lines",    abbr:"LN", sub:"Line 2 constrained",type:"operations",     x:552, y:210, r:16,
        detail:{ exposure:"€0.30M", confidence:82, owner:"Production Agent",
          causes:["Line 2 allergen changeover conflicts with proposed cocoa run T+2–T+6"],
          consequences:["Customer OTIF at risk","Margin impact if unaddressed"],
          kpis:["Line utilization %","Changeover schedule","OEE"],
          actions:["Reallocate run to Line 3 (+€8k changeover — §1.3)"] }},
      { id:"s_margin",label:"Margin",              abbr:"MG", sub:"−€0.14/unit",       type:"financial",      x:660, y:135, r:16,
        detail:{ exposure:"€0.14M", confidence:79, owner:"Finance Agent",
          causes:["Input cost increase not yet passed through to selling price"],
          consequences:["Enterprise EVaR compounds","Board reporting threshold approaching"],
          kpis:["Gross margin %","Unit contribution","Cost-price gap"],
          actions:["Approve forward cover to lock cost basis"] }},
      { id:"s_contr", label:"Contracts",           abbr:"CT", sub:"OTIF 95% at risk",  type:"commercial",     x:660, y:285, r:16,
        detail:{ exposure:"€0.28M", confidence:75, owner:"Commercial Agent",
          causes:["Production shortfall risk from Line 2 constraint"],
          consequences:["Penalty clauses may activate on Retailer X","Customer relationship stress"],
          kpis:["OTIF %","Contract penalty exposure","Retailer X SLA"],
          actions:["Protect Retailer X priority allocation in schedule"] }},
      { id:"s_evar",  label:"Enterprise EVaR",     abbr:"EV", sub:"€2.8M",             type:"impact",         x:790, y:210, r:22,
        detail:{ exposure:"€2.8M total", confidence:84, owner:"Orchestrator",
          causes:["Full cocoa price shock cascades from signal through value chain"],
          consequences:["Board-level action required","Decision Packet #24 generated and awaiting approval"],
          kpis:["Enterprise EVaR","EES score","Response cost vs exposure"],
          actions:["Approve Decision Packet #24 — advance purchase + hedge (−57% EVaR)"] }},
    ],
    edges:[
      { from:"s_ice",   to:"s_proc",  w:4,   label:"price signal" },
      { from:"s_proc",  to:"s_inv",   w:3.5, label:"cover gap" },
      { from:"s_inv",   to:"s_rec",   w:3,   label:"supply risk" },
      { from:"s_rec",   to:"s_lines", w:2.8, label:"cost cascade" },
      { from:"s_lines", to:"s_margin",w:2.5, label:"unit cost ↑" },
      { from:"s_lines", to:"s_contr", w:2.5, label:"OTIF risk" },
      { from:"s_margin",to:"s_evar",  w:3,   label:"exposure" },
      { from:"s_contr", to:"s_evar",  w:2.5, label:"exposure" },
    ],
  },
  "Port Disruption": {
    intensityVar: "lead",
    rootIds: ["p_port"],
    order: ["p_port","p_eta","p_log","p_wh","p_prod","p_otif","p_rev"],
    nodes: [
      { id:"p_port", label:"Port Congestion",   abbr:"PO", sub:"+8d lead time",    type:"root_logistics", x:60,  y:210, r:20,
        detail:{ exposure:"€0.65M", confidence:79, owner:"Logistics Agent",
          causes:["Abidjan port congestion index +8 days","2 inbound cocoa vessels delayed"],
          consequences:["Container ETA shifts downstream","Inbound logistics lane disrupted"],
          kpis:["Port congestion index","Lead time days","Vessel ETA variance"],
          actions:["Reroute shipment from Abidjan (§5.1 — approved alternate lanes)"] }},
      { id:"p_eta",  label:"Container ETA",     abbr:"ET", sub:"Delayed T+8d",      type:"logistics",      x:183, y:210, r:16,
        detail:{ exposure:"€0.55M", confidence:77, owner:"Logistics Agent",
          causes:["Port congestion propagates to vessel departure schedule"],
          consequences:["Inbound logistics window compressed","Warehouse intake window narrows"],
          kpis:["ETA variance days","Vessel schedule adherence %"],
          actions:["Notify warehouse of revised delivery window","Pre-position alternative stock"] }},
      { id:"p_log",  label:"Inbound Log.",       abbr:"IL", sub:"2 vessels at risk", type:"logistics_ops",  x:306, y:210, r:16,
        detail:{ exposure:"€0.50M", confidence:76, owner:"Logistics Agent",
          causes:["ETA delay propagates through inbound freight lane"],
          consequences:["Warehouse intake delayed by up to 8 days","Safety buffer depletes"],
          kpis:["Inbound volume on time %","Lane utilization"],
          actions:["Activate alternative freight forwarder","Expedite customs clearance"] }},
      { id:"p_wh",   label:"Warehouse",          abbr:"WH", sub:"−5d buffer",        type:"operations",     x:429, y:210, r:16,
        detail:{ exposure:"€0.40M", confidence:75, owner:"Production Agent",
          causes:["Inbound delay reduces available warehouse buffer stock"],
          consequences:["Production scheduling window narrows","Emergency sourcing required"],
          kpis:["Days of stock on hand","Intake schedule adherence"],
          actions:["Replenish safety stock from secondary lane","Notify production of intake delay"] }},
      { id:"p_prod", label:"Production",         abbr:"PD", sub:"Line 2 at risk",    type:"operations",     x:552, y:210, r:16,
        detail:{ exposure:"€0.30M", confidence:74, owner:"Production Agent",
          causes:["Warehouse buffer shortfall constrains production scheduling"],
          consequences:["Customer OTIF commitment at risk","Penalty exposure activates"],
          kpis:["Production schedule adherence","Line utilization %"],
          actions:["Reallocate to Line 3 for scheduling flexibility"] }},
      { id:"p_otif", label:"Customer OTIF",      abbr:"OT", sub:"95% → 88%",         type:"commercial",     x:675, y:210, r:16,
        detail:{ exposure:"€0.20M", confidence:73, owner:"Commercial Agent",
          causes:["Production shortfall propagates to delivery miss"],
          consequences:["Revenue at risk","Retailer X penalty clause may trigger"],
          kpis:["OTIF %","Customer satisfaction score","Penalty clause threshold"],
          actions:["Communicate proactively to Retailer X","Protect priority allocation"] }},
      { id:"p_rev",  label:"Revenue",            abbr:"RV", sub:"−€0.65M at risk",   type:"impact",         x:795, y:210, r:22,
        detail:{ exposure:"€0.65M", confidence:72, owner:"Finance Agent",
          causes:["OTIF miss triggers contractual penalty clauses on Retailer X"],
          consequences:["Quarterly revenue target missed","EVaR breaches board threshold"],
          kpis:["Revenue at risk","Penalty clause exposure","Quarterly commercial target"],
          actions:["Approve rerouting (€25k) to protect €650k revenue — ROI 26×"] }},
    ],
    edges:[
      { from:"p_port",to:"p_eta",  w:4,   label:"+8d" },
      { from:"p_eta", to:"p_log",  w:3.5, label:"ETA slip" },
      { from:"p_log", to:"p_wh",   w:3,   label:"delayed intake" },
      { from:"p_wh",  to:"p_prod", w:3,   label:"buffer −5d" },
      { from:"p_prod",to:"p_otif", w:2.5, label:"shortfall" },
      { from:"p_otif",to:"p_rev",  w:3,   label:"penalty risk" },
    ],
  },
  "El Niño Drought": {
    intensityVar: "cocoa",
    rootIds: ["w_nino"],
    weatherRoot: true,
    order: ["w_nino","w_yield","w_supply","w_fut","w_proc","w_invpol","w_prod"],
    nodes: [
      { id:"w_nino",   label:"El Niño / Weather",   abbr:"WX", sub:"Rainfall −38%",    type:"root_weather",   x:60,  y:210, r:22,
        detail:{ exposure:"€2.1M systemic", confidence:76, owner:"Weather Agent",
          causes:["Copernicus anomaly West Africa block 4","NOAA El Niño Pacific forecast confirmed"],
          consequences:["Crop yield below seasonal band","Multi-season supply shock incoming"],
          kpis:["Rainfall anomaly %","Seasonal band deviation","NOAA confidence"],
          actions:["Activate drought response protocol","Begin forward cover before market reacts"] }},
      { id:"w_yield",  label:"Crop Yield",           abbr:"CY", sub:"−22% forecast",   type:"weather_chain",  x:183, y:210, r:16,
        detail:{ exposure:"€1.8M projected", confidence:75, owner:"Weather Agent",
          causes:["Rainfall deficit in Côte d'Ivoire + Ghana — 60% of global cocoa supply"],
          consequences:["Global commodity supply reduces materially","ICE futures begin repricing"],
          kpis:["Harvest yield index","Seasonal supply forecast","Growing region coverage"],
          actions:["Monitor ICCO yield report cadence — escalate if below −15%"] }},
      { id:"w_supply", label:"Commodity Supply",     abbr:"CS", sub:"Deficit 180k MT", type:"weather_chain",  x:306, y:210, r:16,
        detail:{ exposure:"€1.56M", confidence:74, owner:"Market Signal Agent",
          causes:["Crop yield deficit feeds global supply imbalance","No alternative origin absorbs volume"],
          consequences:["ICE futures spike","Procurement window narrows to weeks not months"],
          kpis:["ICCO quarterly supply balance","Global stock-to-use ratio"],
          actions:["Forward-cover window opens — act before the market peak"] }},
      { id:"w_fut",    label:"ICE Futures",          abbr:"IC", sub:"+18% MoM",         type:"root_commodity", x:429, y:210, r:16,
        detail:{ exposure:"€1.45M", confidence:88, owner:"Market Signal Agent",
          causes:["Supply deficit fully priced into front-month contract at €4,200/t"],
          consequences:["Procurement repriced immediately","z-score +2.3 breaches alert threshold"],
          kpis:["ICE front-month price","z-score vs 5-yr mean"],
          actions:["Advance purchase before further run-up","Review hedge mandate with treasury"] }},
      { id:"w_proc",   label:"Procurement",          abbr:"PR", sub:"Cover 18d / 30d",  type:"procurement",    x:552, y:210, r:16,
        detail:{ exposure:"€1.45M", confidence:84, owner:"Procurement Agent",
          causes:["ICE spike increases procurement cost immediately","Secondary supplier lead time 6 weeks"],
          consequences:["Inventory policy breach","Production exposure activates within 10 days"],
          kpis:["Days of cover","Forward cover %","Supplier qualification status"],
          actions:["Advance purchase 500t before market peak (§3.1)"] }},
      { id:"w_invpol", label:"Inv. Policy",          abbr:"IP", sub:"Policy breach",    type:"operations",     x:675, y:210, r:16,
        detail:{ exposure:"€0.87M", confidence:83, owner:"Procurement Agent",
          causes:["Procurement cannot build stock to 30-day policy at economic cost"],
          consequences:["Production buffer depletes within T+8","OTIF risk activates"],
          kpis:["Days of cover vs 30-day policy","Safety stock level"],
          actions:["Replenish urgently to 30-day cover (§3.2)"] }},
      { id:"w_prod",   label:"Production",           abbr:"PD", sub:"Line 2 at risk",   type:"impact",         x:795, y:210, r:22,
        detail:{ exposure:"€0.30M near-term", confidence:80, owner:"Production Agent",
          causes:["Inventory policy breach constrains production scheduling","Line 2 changeover conflict"],
          consequences:["Customer OTIF at risk","Enterprise EVaR compounds weekly without action"],
          kpis:["Production schedule adherence","Buffer cover vs demand","OTIF %"],
          actions:["Reallocate to Line 3","Confirm seasonal pre-build schedule","Approve Packet #24"] }},
    ],
    edges:[
      { from:"w_nino",  to:"w_yield",  w:4,   label:"drought" },
      { from:"w_yield", to:"w_supply", w:3.5, label:"−22% yield" },
      { from:"w_supply",to:"w_fut",    w:3,   label:"deficit 180k MT" },
      { from:"w_fut",   to:"w_proc",   w:4,   label:"+18% price" },
      { from:"w_proc",  to:"w_invpol", w:3,   label:"cover gap" },
      { from:"w_invpol",to:"w_prod",   w:3,   label:"buffer risk" },
    ],
  },
  "Demand Spike": {
    intensityVar: "demand",
    rootIds: ["d_promo"],
    order: ["d_promo","d_fore","d_cap","d_wh","d_dist","d_otif","d_rev"],
    nodes: [
      { id:"d_promo", label:"Promotion",         abbr:"PM", sub:"+18% volume",       type:"root_commercial", x:60,  y:210, r:20,
        detail:{ exposure:"€0.45M", confidence:82, owner:"Commercial Agent",
          causes:["Retail promotion weeks T+3–T+5 confirmed by Retailer Y","Forecast deviation 9.4% → exceeds escalation threshold"],
          consequences:["Forecast revision required immediately","Production capacity pressure activates"],
          kpis:["Demand signal confidence","Forecast deviation %","Escalation threshold"],
          actions:["Trigger S&OE revision process per §1.5 variance rules"] }},
      { id:"d_fore",  label:"Forecast",          abbr:"FC", sub:"+18% deviation",    type:"commercial",     x:183, y:210, r:16,
        detail:{ exposure:"€0.40M", confidence:80, owner:"Commercial Agent",
          causes:["Promotional volume confirmation above 10% variance trigger"],
          consequences:["Production capacity plan needs immediate revision","Warehouse pre-build window closes"],
          kpis:["Forecast accuracy (MAPE)","Weekly volume vs plan"],
          actions:["Escalate per §1.5 S&OE variance rules","Trigger Commercial Pre-Alert"] }},
      { id:"d_cap",   label:"Prod. Capacity",    abbr:"CP", sub:"Line 2: 87% used",  type:"operations",     x:306, y:210, r:16,
        detail:{ exposure:"€0.35M", confidence:78, owner:"Production Agent",
          causes:["Promotional demand exceeds Line 2 scheduled capacity"],
          consequences:["Warehouse pre-build cannot complete on time","Distribution lead time extends"],
          kpis:["Line utilization %","Available production hours","Changeover schedule"],
          actions:["Reallocate demand to Line 3 available capacity"] }},
      { id:"d_wh",    label:"Warehouse",         abbr:"WH", sub:"Pre-build delayed",  type:"operations",     x:429, y:210, r:16,
        detail:{ exposure:"€0.28M", confidence:77, owner:"Production Agent",
          causes:["Capacity constraint prevents timely promotional pre-build"],
          consequences:["Distribution window narrows to minimum","Retail OTIF commitment at risk"],
          kpis:["Pre-build stock level","Warehouse throughput","Build completion date"],
          actions:["Expedite pre-build on Line 3","Confirm completion date with distribution"] }},
      { id:"d_dist",  label:"Distribution",      abbr:"DS", sub:"ETA at limit",       type:"logistics",      x:552, y:210, r:16,
        detail:{ exposure:"€0.20M", confidence:76, owner:"Logistics Agent",
          causes:["Late pre-build compresses available distribution window"],
          consequences:["Retail OTIF commitment at risk for promotion period"],
          kpis:["Distribution lead time days","Fleet utilization %","ETA to store"],
          actions:["Pre-book additional transport capacity","Compress lead time to 3 days"] }},
      { id:"d_otif",  label:"Retail OTIF",       abbr:"OT", sub:"94% → 87% risk",    type:"commercial",     x:675, y:210, r:16,
        detail:{ exposure:"€0.18M", confidence:75, owner:"Commercial Agent",
          causes:["Distribution delay threatens promotional delivery window for Retailer Y"],
          consequences:["Promotional revenue miss","Penalty clause exposure","Retailer relationship risk"],
          kpis:["OTIF %","Promotional window adherence","Retailer Y SLA"],
          actions:["Protect Retailer Y allocation from Line 3 reallocation","Communicate ETA proactively"] }},
      { id:"d_rev",   label:"Revenue",           abbr:"RV", sub:"−€0.45M at risk",   type:"impact",         x:795, y:210, r:22,
        detail:{ exposure:"€0.45M", confidence:74, owner:"Finance Agent",
          causes:["Promotional revenue at risk if OTIF delivery miss occurs"],
          consequences:["Quarterly commercial target affected","Promotional ROI degraded"],
          kpis:["Revenue at risk","Promo ROI","Quarterly commercial target"],
          actions:["Approve allocation adjustment per §1.5 S&OE — reallocate Line 3 (€15k, conf 79%)"] }},
    ],
    edges:[
      { from:"d_promo",to:"d_fore",  w:4,   label:"+18%" },
      { from:"d_fore", to:"d_cap",   w:3.5, label:"revision" },
      { from:"d_cap",  to:"d_wh",    w:3,   label:"constraint" },
      { from:"d_wh",   to:"d_dist",  w:2.8, label:"late pre-build" },
      { from:"d_dist", to:"d_otif",  w:2.5, label:"ETA risk" },
      { from:"d_otif", to:"d_rev",   w:3,   label:"miss risk" },
    ],
  },
  "FX & Energy Squeeze": {
    intensityVar: "fx",
    rootIds: ["f_eur","f_ttf"],
    order: ["f_eur","f_ttf","f_fin","f_eng","f_mfg","f_mar","f_cash"],
    nodes: [
      { id:"f_eur",  label:"EUR/USD FX",   abbr:"FX", sub:"−10% rate move",   type:"root_financial", x:60, y:120, r:18,
        detail:{ exposure:"€0.42M", confidence:88, owner:"Finance Agent",
          causes:["EUR/USD rate move on unhedged USD-priced cocoa contracts"],
          consequences:["Finance EVaR activates","Working capital deteriorates immediately"],
          kpis:["EUR/USD rate","Unhedged USD exposure €","Hedge ratio %"],
          actions:["FX forward cover — §3.6 treasury policy (€12k, conf 88%)"] }},
      { id:"f_ttf",  label:"TTF Gas",      abbr:"GS", sub:"+15% energy",      type:"root_financial", x:60, y:300, r:18,
        detail:{ exposure:"€0.28M", confidence:80, owner:"Finance Agent",
          causes:["TTF natural gas spot price spike +15% week-on-week"],
          consequences:["Manufacturing energy cost rises","Production margin under immediate pressure"],
          kpis:["TTF gas price €/MWh","Energy cost per production unit","Budget variance"],
          actions:["Lock energy forward / shift schedule — §4.2 (€18k, conf 80%)"] }},
      { id:"f_fin",  label:"Finance",      abbr:"FN", sub:"Dual shock −€0.7M",  type:"financial",     x:220, y:210, r:18,
        detail:{ exposure:"€0.70M combined", confidence:83, owner:"Finance Agent",
          causes:["FX and energy shocks converge simultaneously on unhedged positions"],
          consequences:["Manufacturing cost rising on two dimensions","Working capital squeeze begins"],
          kpis:["Financial EVaR","Working capital days","Dual exposure correlation"],
          actions:["Hedge both FX and energy in same reporting cycle for portfolio benefit"] }},
      { id:"f_eng",  label:"Energy Cost",  abbr:"EN", sub:"€0.38/unit +15%",  type:"financial",      x:385, y:210, r:16,
        detail:{ exposure:"€0.28M", confidence:80, owner:"Production Agent",
          causes:["TTF spike flows directly to manufacturing conversion cost"],
          consequences:["Manufacturing cost rises","Margin squeeze accelerates"],
          kpis:["Energy cost per unit","Conversion cost index","Budget vs actual"],
          actions:["Shift high-energy production runs to off-peak slots"] }},
      { id:"f_mfg",  label:"Mfg. Cost",    abbr:"MF", sub:"+8% unit cost",    type:"operations",     x:530, y:210, r:16,
        detail:{ exposure:"€0.50M combined", confidence:79, owner:"Production Agent",
          causes:["Energy + FX both increase manufacturing cost simultaneously"],
          consequences:["Margin compression unless passed through to customers","Budget overrun imminent"],
          kpis:["Unit manufacturing cost","Cost variance vs budget","Conversion efficiency"],
          actions:["Review cost pass-through pricing with Commercial","Approve schedule shift"] }},
      { id:"f_mar",  label:"Margin",       abbr:"MG", sub:"−2.1pp squeeze",   type:"financial",      x:665, y:210, r:16,
        detail:{ exposure:"€0.62M", confidence:78, owner:"Finance Agent",
          causes:["Manufacturing cost above budget, not yet reflected in customer pricing"],
          consequences:["Cash flow pressure builds","Board reporting threshold breached"],
          kpis:["Gross margin %","EBITDA variance vs budget","Cash flow projection"],
          actions:["Trigger cost pass-through review with Commercial immediately"] }},
      { id:"f_cash", label:"Cash Flow",    abbr:"CF", sub:"−€0.7M working cap",type:"impact",         x:800, y:210, r:22,
        detail:{ exposure:"€0.70M", confidence:76, owner:"Finance Agent",
          causes:["Margin squeeze reduces operating cash flow","Dual hedge gap compounds"],
          consequences:["Working capital constraint activates","Board escalation required"],
          kpis:["Operating cash flow","Working capital days","Board threshold €0.5M"],
          actions:["Hedge both FX and energy simultaneously (§3.6 + §4.2) — combined €30k, 85% conf"] }},
    ],
    edges:[
      { from:"f_eur", to:"f_fin",  w:3.5, label:"FX hit" },
      { from:"f_ttf", to:"f_fin",  w:3,   label:"energy hit" },
      { from:"f_fin", to:"f_eng",  w:3.5, label:"cost cascade" },
      { from:"f_eng", to:"f_mfg",  w:3,   label:"unit cost ↑" },
      { from:"f_mfg", to:"f_mar",  w:3,   label:"squeeze" },
      { from:"f_mar", to:"f_cash", w:3.5, label:"cash impact" },
    ],
  },
};

const _SG_LABELS = {
  "Cocoa Price Shock": "Cocoa Shock",
  "Port Disruption": "Port Disruption",
  "El Niño Drought": "El Niño",
  "Demand Spike": "Demand Spike",
  "FX & Energy Squeeze": "FX / Energy",
};

function PropagationMap({ varVals, activeVars, sEvar }) {
  const NAMES = Object.keys(SCENARIO_GRAPHS);
  const [sceneName, setSceneName] = useState("Cocoa Price Shock");
  const graph = SCENARIO_GRAPHS[sceneName];
  const nMap = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

  const [step, setStep] = useState(0);
  const pTimers = useRef([]);

  const runPropagation = (g) => {
    pTimers.current.forEach(clearTimeout);
    pTimers.current = [];
    setStep(0);
    g.order.forEach((_, i) => {
      if (i === 0) return;
      const t = setTimeout(() => setStep(i), i * 200);
      pTimers.current.push(t);
    });
  };

  useEffect(() => {
    runPropagation(graph);
    setSel(graph.rootIds[0]);
    return () => { pTimers.current.forEach(clearTimeout); };
  }, [sceneName]); // eslint-disable-line

  const activeNodes = new Set(graph.order.slice(0, step + 1));
  const propFront = graph.order[step] || null;
  const anyActive = activeNodes.size > 0;

  const iVar = graph.intensityVar;
  const iVal = (activeVars[iVar] ? (varVals[iVar] || 0) : 0);
  const iMax = (VARMAP[iVar] || {}).max || 40;
  const intensity = Math.min(1, iVal / iMax);

  const [sel, setSel] = useState(graph.rootIds[0]);
  const selNode = nMap[sel] || graph.nodes[0];

  const detailSections = [
    ["CAUSES", selNode.detail.causes, C.amber],
    ["CONSEQUENCES", selNode.detail.consequences, C.red],
    ["AFFECTED KPIs", selNode.detail.kpis, C.deep],
    ["RESPONSE ACTIONS", selNode.detail.actions, C.green],
  ];

  return (
    <div>
      {/* Scenario chain selector */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        {NAMES.map((name) => {
          const active = sceneName === name;
          return (
            <button key={name} onClick={() => setSceneName(name)}
              style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                fontFamily: FONT, cursor: "pointer",
                border: `1.5px solid ${active ? _PNC(SCENARIO_GRAPHS[name].nodes[0].type) : C.line}`,
                background: active ? (_PNC(SCENARIO_GRAPHS[name].nodes[0].type) + "18") : C.bg,
                color: active ? _PNC(SCENARIO_GRAPHS[name].nodes[0].type) : C.soft,
                transition: "all .15s" }}>
              {_SG_LABELS[name]}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button onClick={() => runPropagation(graph)}
          style={{ padding: "5px 11px", borderRadius: 999, fontSize: 10.5, fontWeight: 700,
            fontFamily: FONT, cursor: "pointer", border: `1.5px solid ${C.line}`,
            background: C.bg, color: C.soft, display: "flex", alignItems: "center", gap: 4 }}>
          <Play size={9} /> Replay
        </button>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {/* SVG Graph */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <svg viewBox="0 0 860 420" style={{ width: "100%", height: "auto" }}>
            <style>{`
              @keyframes pgFlow { to { stroke-dashoffset: -22; } }
              @keyframes pgPulse { 0%,100%{opacity:.14} 50%{opacity:.44} }
              @keyframes pgHalo  { to { stroke-dashoffset: -20; } }
            `}</style>

            {/* Edges */}
            {graph.edges.map((edge) => {
              const A = nMap[edge.from], B = nMap[edge.to];
              if (!A || !B) return null;
              const isActive = activeNodes.has(edge.from) && activeNodes.has(edge.to);
              const col = _PNC(A.type);
              const sw = isActive ? Math.max(1.5, edge.w * 1.1) : 0.8;
              const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 - 7;
              return (
                <g key={`${edge.from}-${edge.to}`}
                  opacity={anyActive && !isActive ? 0.08 : 1}
                  style={{ transition: "opacity 0.55s" }}>
                  <line x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                    stroke={isActive ? col : C.line} strokeWidth={sw}
                    style={{ transition: "stroke 0.4s, stroke-width 0.4s" }} />
                  {isActive && (
                    <>
                      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                        stroke={col} strokeWidth={sw} strokeDasharray="5 15" opacity={0.6}
                        style={{ animation: "pgFlow 1s linear infinite" }} />
                      <circle r={3.5} fill={col} opacity={0.85}>
                        <animateMotion dur="1.3s" repeatCount="indefinite"
                          path={`M ${A.x} ${A.y} L ${B.x} ${B.y}`} />
                      </circle>
                      <text x={mx} y={my} textAnchor="middle" fontSize={8.5}
                        fill={col} fontFamily={FONT} fontWeight={600} opacity={0.75}>
                        {edge.label}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {graph.nodes.map((n) => {
              const isActive = activeNodes.has(n.id);
              const isFront = n.id === propFront;
              const dim = anyActive && !isActive;
              const isRoot = graph.rootIds.includes(n.id);
              const col = _PNC(n.type);
              const r = n.r || 16;
              const glowR = r + 10 + (isActive ? intensity * 24 : 0);
              const isSel = sel === n.id;

              return (
                <g key={n.id}
                  opacity={dim ? 0.15 : 1}
                  style={{ cursor: "pointer", transition: "opacity 0.55s" }}
                  onClick={() => setSel(n.id)}>

                  {/* Outer glow */}
                  {isActive && (
                    <circle cx={n.x} cy={n.y} r={glowR}
                      fill={col}
                      opacity={0.11 + intensity * 0.22}
                      style={{
                        animation: isFront ? "pgPulse 1.6s ease-in-out infinite" : "none",
                        transition: "r 0.45s, opacity 0.45s",
                      }} />
                  )}

                  {/* El Niño weather halos */}
                  {isRoot && graph.weatherRoot && isActive && (
                    <>
                      <circle cx={n.x} cy={n.y} r={r + 18} fill="none"
                        stroke="#047857" strokeWidth={1.5} strokeDasharray="3 5" opacity={0.5}
                        style={{ animation: "pgHalo 4s linear infinite" }} />
                      <circle cx={n.x} cy={n.y} r={r + 30} fill="none"
                        stroke="#047857" strokeWidth={0.8} strokeDasharray="2 7" opacity={0.25}
                        style={{ animation: "pgHalo 8s linear infinite reverse" }} />
                    </>
                  )}

                  {/* Selection ring */}
                  {isSel && (
                    <circle cx={n.x} cy={n.y} r={r + 7} fill="none"
                      stroke={col} strokeWidth={2} opacity={0.40} />
                  )}

                  {/* Main circle */}
                  <circle cx={n.x} cy={n.y} r={r}
                    fill={isActive ? col : "#DCDCE8"}
                    stroke={isSel ? col : "#fff"}
                    strokeWidth={isSel ? 2.5 : 1.5}
                    style={{ transition: "fill 0.4s" }} />

                  {/* Abbreviation */}
                  <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
                    fontSize={n.type === "impact" ? 9 : 8} fontWeight={800}
                    fill={isActive ? "#fff" : "#AAA"}
                    fontFamily={FONT} style={{ userSelect: "none", pointerEvents: "none" }}>
                    {n.abbr}
                  </text>

                  {/* Label */}
                  <text x={n.x} y={n.y + r + 14} textAnchor="middle"
                    fontSize={9.5} fontWeight={isActive ? 700 : 500}
                    fill={isActive ? C.ink : C.soft}
                    fontFamily={FONT} style={{ pointerEvents: "none" }}>
                    {n.label}
                  </text>

                  {/* Sub-label (metric) */}
                  {isActive && (
                    <text x={n.x} y={n.y + r + 25} textAnchor="middle"
                      fontSize={8.5} fontWeight={700}
                      fill={col} fontFamily={FONT} opacity={0.9}
                      style={{ pointerEvents: "none" }}>
                      {n.sub}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Status bar */}
            <text x={8} y={413} fontSize={9} fill={C.soft} fontFamily={FONT} fontStyle="italic">
              {`${sceneName} · ${activeNodes.size}/${graph.nodes.length} nodes activated · EVaR €${sEvar.toFixed(2)}M · click any node for detail`}
            </text>
          </svg>
        </div>

        {/* Node detail panel */}
        <div style={{ width: 222, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0 }}>
          <Card style={{ padding: 14, overflowY: "auto", maxHeight: 400 }}>
            <SectionLabel icon={Network}>NODE DETAIL</SectionLabel>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: _PNC(selNode.type), flexShrink: 0, marginTop: 3.5 }} />
              <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{selNode.label}</div>
            </div>

            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
              <Pill tone="purple" style={{ fontSize: 10 }}>{selNode.detail.owner}</Pill>
              <Pill tone={activeNodes.has(selNode.id) ? "red" : "grey"} style={{ fontSize: 10 }}>
                {activeNodes.has(selNode.id) ? "Active" : "Inactive"}
              </Pill>
            </div>

            <div style={{ padding: "8px 10px", background: C.faint, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.soft, letterSpacing: 1, marginBottom: 3 }}>EXPOSURE</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: _PNC(selNode.type), ...NUM }}>{selNode.detail.exposure}</div>
              <div style={{ fontSize: 10, color: C.soft, marginTop: 1 }}>Confidence: {selNode.detail.confidence}%</div>
            </div>

            {detailSections.map(([label, items, dotCol]) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: C.soft, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                {(items).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 3 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: dotCol, flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 10.5, color: C.ink, lineHeight: 1.45 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============ DOMAIN 3-D ANIMATED ICONS ============ */
const DomainIcon3D = ({ id, color }) => {
  if (id === "procurement") return (
    <svg width={38} height={38} viewBox="0 0 38 38">
      <ellipse cx="19" cy="35" rx="10" ry="2" fill={color} opacity="0.15" />
      <ellipse cx="19" cy="18" rx="12" ry="12" fill={color}>
        <animate attributeName="rx" values="12;2;12" dur="3s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.5 0 0.5 1;0.5 0 0.5 1" />
      </ellipse>
      <text x="19" y="23.5" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff" fontFamily="system-ui,sans-serif">
        €<animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
      </text>
      <circle cx="19" cy="18" r="7.5" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0">
        <animate attributeName="opacity" values="0;0.4;0" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle r="2.2" fill={color} opacity="0.75">
        <animateMotion dur="2.2s" repeatCount="indefinite"
          path="M 19 5 A 13 13 0 1 1 18.99 5" />
      </circle>
    </svg>
  );
  if (id === "production") return (
    <svg width={38} height={38} viewBox="0 0 38 38">
      <circle cx="19" cy="19" r="16" fill="none" stroke={color} strokeWidth="1" opacity="0.18" strokeDasharray="4 4">
        <animateTransform attributeName="transform" type="rotate" from="0 19 19" to="-360 19 19" dur="12s" repeatCount="indefinite" />
      </circle>
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 19 19" to="360 19 19" dur="5s" repeatCount="indefinite" />
        <polygon points="19,9 28,14 28,24 19,29 10,24 10,14" fill={color} />
        <circle cx="19" cy="19" r="4.5" fill="#fff" opacity="0.45" />
        <circle cx="19" cy="19" r="1.8" fill={color} opacity="0.55" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 19 19" to="-360 19 19" dur="4s" repeatCount="indefinite" />
        <circle cx="19" cy="3" r="1.8" fill={color} opacity="0.4" />
        <circle cx="32.8" cy="26" r="1.8" fill={color} opacity="0.4" />
        <circle cx="5.2" cy="26" r="1.8" fill={color} opacity="0.4" />
      </g>
    </svg>
  );
  if (id === "logistics") return (
    <svg width={38} height={38} viewBox="0 0 38 38">
      <circle cx="19" cy="19" r="15" fill={color} opacity="0.09" stroke={color} strokeWidth="1.5" />
      <ellipse cx="19" cy="14.5" rx="10" ry="2.8" fill="none" stroke={color} strokeWidth="0.9" opacity="0.38" />
      <ellipse cx="19" cy="23.5" rx="10" ry="2.8" fill="none" stroke={color} strokeWidth="0.9" opacity="0.38" />
      <line x1="19" y1="4" x2="19" y2="34" stroke={color} strokeWidth="0.9" opacity="0.38" />
      <ellipse cx="19" cy="19" rx="15" ry="3.5" fill="none" stroke={color} strokeWidth="0.8" opacity="0.25" />
      <circle r="6" fill={color} opacity="0.1">
        <animateMotion dur="3.8s" repeatCount="indefinite"
          path="M 6 19 C 8 8, 30 8, 32 19 C 30 30, 8 30, 6 19" />
      </circle>
      <circle r="2.8" fill={color}>
        <animateMotion dur="3.8s" repeatCount="indefinite"
          path="M 6 19 C 8 8, 30 8, 32 19 C 30 30, 8 30, 6 19" />
      </circle>
    </svg>
  );
  if (id === "commercial") return (
    <svg width={38} height={38} viewBox="0 0 38 38">
      <line x1="5" y1="32" x2="33" y2="32" stroke={color} strokeWidth="1.5" opacity="0.28" />
      <line x1="5" y1="6" x2="5" y2="32" stroke={color} strokeWidth="1" opacity="0.2" />
      <rect x="7" y="23" width="7" height="9" rx="2" fill={color} opacity="0.65">
        <animate attributeName="height" values="9;15;9" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="y" values="23;17;23" dur="2.2s" repeatCount="indefinite" />
      </rect>
      <rect x="16" y="13" width="7" height="19" rx="2" fill={color}>
        <animate attributeName="height" values="19;24;15;19" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="y" values="13;8;17;13" dur="2.8s" repeatCount="indefinite" />
      </rect>
      <rect x="25" y="19" width="7" height="13" rx="2" fill={color} opacity="0.8">
        <animate attributeName="height" values="13;8;16;13" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y" values="19;24;16;19" dur="2s" repeatCount="indefinite" />
      </rect>
      <polyline points="10,22 19,11 28,16" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="26,13 32,15 26,19" fill={color} opacity="0.4" />
    </svg>
  );
  if (id === "finance") return (
    <svg width={38} height={38} viewBox="0 0 38 38">
      <rect x="14" y="33" width="10" height="2.5" rx="1.25" fill={color} opacity="0.38" />
      <line x1="19" y1="11" x2="19" y2="33" stroke={color} strokeWidth="1.5" opacity="0.38" />
      <circle cx="19" cy="11" r="2.2" fill={color} />
      <g>
        <animateTransform attributeName="transform" type="rotate"
          values="-11 19 11;11 19 11;-11 19 11" dur="3.4s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1" />
        <line x1="6" y1="11" x2="32" y2="11" stroke={color} strokeWidth="2.2" />
        <line x1="8" y1="11" x2="8" y2="18" stroke={color} strokeWidth="1.2" opacity="0.65" />
        <ellipse cx="8" cy="19" rx="5.5" ry="2" fill={color} opacity="0.45" />
        <line x1="30" y1="11" x2="30" y2="16" stroke={color} strokeWidth="1.2" opacity="0.65" />
        <ellipse cx="30" cy="17" rx="5.5" ry="2" fill={color} opacity="0.45" />
      </g>
    </svg>
  );
  if (id === "external") return (
    <svg width={38} height={38} viewBox="0 0 38 38">
      <circle cx="19" cy="19" r="12" fill={color} opacity="0.08" stroke={color} strokeWidth="1.1" />
      <circle cx="19" cy="19" r="3.6" fill={color} />
      <path d="M12 19a7 7 0 0 1 14 0" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
      <path d="M9 19a10 10 0 0 1 20 0" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
      <path d="M15 19a4 4 0 0 1 8 0" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
  return null;
};

/* ============ PORTFOLIO OPTIMIZER ============ */
const _r2 = (x) => Math.round(x * 100) / 100;
const _r1 = (x) => Math.round(x * 10) / 10;
const _clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

/* Each action carries multidimensional impact (d) and the twin nodes it touches */
const OPT_ACTIONS = [
  { id: "advance", label: "Advance purchase cocoa 500t", cost: 120, conf: 85, clause: "§3.1 — max 4-week forward cover",
    nodes: ["commodity", "procurement", "finance", "evar"], d: { evar: 0.90, cover: 12, margin: 0.14, wc: 2.1, fc: 3 } },
  { id: "hedgeFwd", label: "Hedge forward exposure 30%", cost: 60, conf: 81, clause: "§3.4 — hedging within board mandate",
    nodes: ["commodity", "finance", "evar"], d: { evar: 0.35, margin: 0.09, fc: 2 } },
  { id: "secSupplier", label: "Activate secondary supplier (Ecuador)", cost: 25, conf: 78, clause: "§2.2 — qualified supplier pool",
    nodes: ["supplier", "procurement", "production", "evar"], d: { evar: 0.20, conc: 16, cover: 4, fc: 4 } },
  { id: "reroute", label: "Reroute shipment from Abidjan", cost: 25, conf: 75, clause: "§5.1 — approved alternate lanes",
    nodes: ["logistics", "finance", "evar"], d: { evar: 0.15, lead: 5, fc: 1 } },
  { id: "safetyStock", label: "Replenish inventory to 30-day cover", cost: 40, conf: 83, clause: "§3.2 — inventory policy",
    nodes: ["procurement", "production", "evar"], d: { evar: 0.25, cover: 13, wc: 1.4 } },
  { id: "energyLock", label: "Lock energy forward / shift schedule", cost: 18, conf: 80, clause: "§4.2 — energy procurement policy",
    nodes: ["energy", "production"], d: { evar: 0.10, oee: 2 } },
  { id: "fxHedge", label: "FX forward cover (USD contracts)", cost: 12, conf: 88, clause: "§3.6 — treasury policy",
    nodes: ["finance"], d: { evar: 0.08, fx: 0.12, fc: 1 } },
  { id: "reallocate", label: "Reallocate run to Line 3", cost: 8, conf: 90, clause: "§1.3 — production constraint table",
    nodes: ["production", "logistics", "commercial"], d: { evar: 0.10, oee: 6, fc: 2 } },
  { id: "demandAlloc", label: "Adjust allocation to demand", cost: 15, conf: 79, clause: "§1.5 — S&OE variance rules",
    nodes: ["production", "commercial", "evar"], d: { evar: 0.18, fc: 5 } },
];
const OPT_MAP = Object.fromEntries(OPT_ACTIONS.map((a) => [a.id, a]));

const SCENARIO_INTELLIGENCE: Record<string, {
  evaluated: number; confidence: number;
  optimalIds: Set<string>;
  why: string; context: string; reason: string;
  actions: Record<string, { tag: string; rec: boolean; note: string }>;
}> = {
  "Cocoa Price Shock": {
    evaluated: 14832, confidence: 89,
    optimalIds: new Set(["advance", "hedgeFwd", "secSupplier"]),
    why: "Highest EVaR/€ ROI (8.0×) · residual below €1.3M board threshold · all structures policy-compliant",
    context: "Cocoa +28% · ICE z-score +2.3 · West Africa rainfall −40% · cover gap 12d vs 30d policy",
    reason: "Selected because cocoa is the dominant enterprise exposure this cycle: market price, rainfall deficit and low cover all point to the same procurement risk path.",
    actions: {
      advance:     { tag: "Core hedge",        rec: true,  note: "Locks 500t at current price before further run-up. Primary exposure reducer." },
      hedgeFwd:    { tag: "Risk transfer",     rec: true,  note: "Forward contract reduces unhedged FX/price exposure on existing contracts by 30%." },
      secSupplier: { tag: "Diversification",   rec: true,  note: "Ecuador lot active · Supplier A concentration 48% → 32%." },
      reroute:     { tag: "Logistics",         rec: false, note: "Activate if Abidjan delay exceeds 10 days. +€0.15M EVaR reduction." },
      safetyStock: { tag: "Inventory buffer",  rec: false, note: "Overlap with advance purchase (−€0.12M synergy). Add if cover gap > 8d." },
      energyLock:  { tag: "Energy shield",     rec: false, note: "Low priority in price-shock scenario. Activate on FX & Energy combo." },
      fxHedge:     { tag: "FX shield",         rec: false, note: "Marginal benefit here — hedgeFwd covers most FX exposure already." },
      reallocate:  { tag: "Scheduling",        rec: false, note: "Optional capacity unlock. Minimal EVaR impact in price-shock scenario." },
      demandAlloc: { tag: "Planning align",    rec: false, note: "Useful if demand spike compounds the supply shock. Secondary action." },
    },
  },
  "Port Disruption": {
    evaluated: 8244, confidence: 83,
    optimalIds: new Set(["reroute", "safetyStock", "reallocate"]),
    why: "Fastest operational recovery · minimises stockout risk · highest OTIF protection score across 8k simulations",
    context: "Abidjan congestion +10d · 2 vessels in transit · production runway 8 days · 1 key account OTIF at risk",
    reason: "Selected because logistics delay is now the shortest path to customer service risk: two inbound vessels affect cover, schedule stability and OTIF.",
    actions: {
      reroute:     { tag: "Primary fix",       rec: true,  note: "Reroutes 2 vessels via Valencia. Recovers 6 of 10 delay days immediately." },
      safetyStock: { tag: "Inventory bridge",  rec: true,  note: "30-day cover buffer prevents production stoppage while rerouting resolves." },
      reallocate:  { tag: "Scheduling",        rec: true,  note: "Decouples Line 3 run from delayed inbound. Immediate capacity unlock." },
      advance:     { tag: "Forward cover",     rec: false, note: "Optional: pre-positions next order to avoid recurrence risk." },
      hedgeFwd:    { tag: "Price shield",      rec: false, note: "Optional: hedges price exposure during extended disruption window." },
      secSupplier: { tag: "Diversification",   rec: false, note: "Activate if reroute is unsuccessful after 72h." },
      energyLock:  { tag: "Energy shield",     rec: false, note: "Low priority in logistics disruption scenario." },
      fxHedge:     { tag: "FX shield",         rec: false, note: "Marginal relevance in port disruption context." },
      demandAlloc: { tag: "Planning align",    rec: false, note: "Useful to rebalance allocation if stockout risk materialises." },
    },
  },
  "El Niño Drought": {
    evaluated: 22156, confidence: 76,
    optimalIds: new Set(["advance", "secSupplier", "hedgeFwd"]),
    why: "Maximum geographic diversification · weather correlation minimised · structural multi-season protection over 22k paths",
    context: "ENSO alert active · West Africa drought risk horizon 18 months · Ghana buffer lot available · 3 origins at risk",
    reason: "Selected because weather exposure is moving from signal to structural risk: crop yield, supplier availability and commodity prices are correlated over a longer horizon.",
    actions: {
      advance:     { tag: "Origin hedge",      rec: true,  note: "Ghana lot sourced outside ENSO drought corridor. Non-correlated origin." },
      secSupplier: { tag: "Diversification",   rec: true,  note: "Brazil Bahia activation reduces West Africa origin exposure below 60%." },
      hedgeFwd:    { tag: "Weather hedge",     rec: true,  note: "Parametric structure on correlated price+supply. Payout at ENSO threshold." },
      safetyStock: { tag: "Strategic reserve", rec: false, note: "12-week buffer extends runway through drought season. High cost, high value." },
      energyLock:  { tag: "Energy shield",     rec: false, note: "El Niño elevates energy price volatility — recommend as supplemental action." },
      reroute:     { tag: "Logistics",         rec: false, note: "Useful if drought triggers port backlogs in Abidjan/Tema." },
      fxHedge:     { tag: "FX shield",         rec: false, note: "Long-horizon drought exposure may require FX re-hedging in Q3." },
      reallocate:  { tag: "Scheduling",        rec: false, note: "Production scheduling flexibility lowers cost of supply gaps." },
      demandAlloc: { tag: "Planning align",    rec: false, note: "Demand allocation review recommended if supply drops >15%." },
    },
  },
  "Demand Spike": {
    evaluated: 6618, confidence: 91,
    optimalIds: new Set(["reallocate", "demandAlloc", "safetyStock"]),
    why: "Maximum revenue capture · fastest production response · minimum margin sacrifice across 6.6k demand scenarios",
    context: "Demand forecast +18% · Line 3 buffer available · 1 top-10 account OTIF at risk · 2-week window",
    reason: "Selected because demand can be captured only if production and allocation move quickly; otherwise the upside turns into missed service and margin leakage.",
    actions: {
      reallocate:  { tag: "Capacity unlock",   rec: true,  note: "100t immediate from Line 3 buffer. T+3 delivery. No sourcing risk." },
      demandAlloc: { tag: "Planning align",    rec: true,  note: "Realigns weekly plan to demand signal without new procurement cost." },
      safetyStock: { tag: "Supply bridge",     rec: true,  note: "Pre-positions material for sustained uplift beyond T+2 weeks." },
      advance:     { tag: "Forward sourcing",  rec: false, note: "Optional: advance Q3 procurement if spike proves persistent (>3 weeks)." },
      hedgeFwd:    { tag: "Margin lock",       rec: false, note: "Optional: lock promotional margins if commodity price responds to demand." },
      secSupplier: { tag: "Diversification",   rec: false, note: "Activate if reallocate is insufficient for sustained demand increase." },
      reroute:     { tag: "Logistics",         rec: false, note: "Useful if demand spike requires expedited inbound to meet OTIF." },
      energyLock:  { tag: "Energy shield",     rec: false, note: "Secondary: lock energy before production ramp-up drives cost increase." },
      fxHedge:     { tag: "FX shield",         rec: false, note: "Low priority in demand spike scenario. No FX exposure driver." },
    },
  },
  "FX & Energy Squeeze": {
    evaluated: 9340, confidence: 88,
    optimalIds: new Set(["fxHedge", "energyLock", "hedgeFwd"]),
    why: "Minimum cost · maximum treasury efficiency · board-pre-approved financial structures only · 9.3k financial paths",
    context: "EUR/USD −10% · TTF gas +15% · unhedged contracts 30% · working capital +€2.1M",
    reason: "Selected because cost pressure is financial rather than operational: FX, energy and USD-priced cocoa contracts compound into margin-at-risk.",
    actions: {
      fxHedge:     { tag: "FX shield",         rec: true,  note: "3-month forward eliminates 40% FX tail risk at current rate. §3.6." },
      energyLock:  { tag: "Energy hedge",      rec: true,  note: "6-month utility swap removes energy price uncertainty from H2 COGS." },
      hedgeFwd:    { tag: "Commodity FX",      rec: true,  note: "Closes FX gap on USD-priced cocoa contracts. Board mandate §3.4." },
      advance:     { tag: "Price lock",        rec: false, note: "Optional: advance purchase to lock commodity before energy-driven inflation." },
      reallocate:  { tag: "Efficiency",        rec: false, note: "Optional: shift schedule to off-peak energy hours, −3% energy COGS." },
      safetyStock: { tag: "Inventory buffer",  rec: false, note: "Consider pre-buying inventory before FX-driven cost increase." },
      secSupplier: { tag: "Diversification",   rec: false, note: "Low priority unless FX squeeze impacts primary supplier margins." },
      reroute:     { tag: "Logistics",         rec: false, note: "Not relevant in FX & energy scenario." },
      demandAlloc: { tag: "Planning align",    rec: false, note: "Review demand allocation if FX squeeze reduces export competitiveness." },
    },
  },
};

const SCENARIO_GRAPH_CONFIG = {
  "Cocoa Price Shock": {
    header: "Cocoa shock propagation",
    sub: "Market signal cascades from raw material to enterprise margin.",
    nodes: {
      scenario: { label: "Price shock", sub: "ICE +18% / rainfall" },
      commodity: { label: "Cocoa market", sub: "price + deficit" },
      supplier: { label: "Supplier base", sub: "concentration" },
      procurement: { label: "Cover policy", sub: "18d vs 30d" },
      production: { label: "Production plan", sub: "line capacity" },
      logistics: { label: "Inbound lane", sub: "lead-time" },
      commercial: { label: "Service risk", sub: "OTIF" },
      finance: { label: "Margin at risk", sub: "working capital" },
    },
    edges: [
      ["scenario", "commodity", 1],
      ["commodity", "supplier", 0.94],
      ["supplier", "procurement", 0.86],
      ["procurement", "production", 0.74],
      ["production", "commercial", 0.48],
      ["production", "logistics", 0.52],
      ["logistics", "finance", 0.46],
      ["commercial", "evar", 0.34],
      ["finance", "evar", 0.7],
    ],
  },
  "Port Disruption": {
    header: "Port disruption propagation",
    sub: "Inbound delay becomes cover erosion, schedule stress and customer risk.",
    nodes: {
      scenario: { label: "Port disruption", sub: "Abidjan +10d" },
      commodity: { label: "Inbound vessel", sub: "2 in transit" },
      supplier: { label: "Cover runway", sub: "8 days left" },
      procurement: { label: "Buffer policy", sub: "stockout risk" },
      production: { label: "Schedule stability", sub: "Line 3 relief" },
      logistics: { label: "Port bottleneck", sub: "lane disruption" },
      commercial: { label: "OTIF pressure", sub: "1 key account" },
      finance: { label: "Expedite cost", sub: "margin leak" },
    },
    edges: [
      ["scenario", "logistics", 1],
      ["logistics", "commodity", 0.9],
      ["commodity", "supplier", 0.82],
      ["supplier", "procurement", 0.78],
      ["procurement", "production", 0.7],
      ["production", "commercial", 0.58],
      ["logistics", "finance", 0.64],
      ["commercial", "evar", 0.36],
      ["finance", "evar", 0.66],
    ],
  },
  "El Niño Drought": {
    header: "Weather-to-supply propagation",
    sub: "Climate signal becomes structural sourcing and margin exposure.",
    nodes: {
      scenario: { label: "Drought signal", sub: "ENSO alert" },
      commodity: { label: "Crop yield", sub: "origin stress" },
      supplier: { label: "Origin mix", sub: "3 origins at risk" },
      procurement: { label: "Strategic cover", sub: "multi-season" },
      production: { label: "Material runway", sub: "recipe exposure" },
      logistics: { label: "Origin logistics", sub: "port backlog risk" },
      commercial: { label: "Allocation risk", sub: "demand prioritization" },
      finance: { label: "Long-horizon margin", sub: "structural EVaR" },
    },
    edges: [
      ["scenario", "commodity", 1],
      ["commodity", "supplier", 0.96],
      ["supplier", "procurement", 0.88],
      ["procurement", "production", 0.68],
      ["supplier", "logistics", 0.48],
      ["production", "commercial", 0.4],
      ["logistics", "finance", 0.38],
      ["commercial", "evar", 0.3],
      ["finance", "evar", 0.74],
    ],
  },
  "Demand Spike": {
    header: "Demand spike propagation",
    sub: "Demand moves first, then capacity, allocation and service reliability.",
    nodes: {
      scenario: { label: "Demand spike", sub: "+18% signal" },
      commodity: { label: "Material call-off", sub: "supply bridge" },
      supplier: { label: "Order confirmation", sub: "customer lock" },
      procurement: { label: "Inventory bridge", sub: "runway cover" },
      production: { label: "Capacity unlock", sub: "Line 3 buffer" },
      logistics: { label: "Distribution load", sub: "expedite need" },
      commercial: { label: "Allocation plan", sub: "top accounts" },
      finance: { label: "Revenue at risk", sub: "missed upside" },
    },
    edges: [
      ["scenario", "commercial", 1],
      ["commercial", "production", 0.92],
      ["production", "logistics", 0.68],
      ["production", "procurement", 0.58],
      ["procurement", "commodity", 0.45],
      ["commercial", "supplier", 0.42],
      ["logistics", "finance", 0.44],
      ["commercial", "evar", 0.38],
      ["finance", "evar", 0.62],
    ],
  },
  "FX & Energy Squeeze": {
    header: "Financial squeeze propagation",
    sub: "Treasury and energy signals flow directly into enterprise margin.",
    nodes: {
      scenario: { label: "FX & energy", sub: "EUR/USD + TTF" },
      commodity: { label: "USD cocoa basis", sub: "import price" },
      supplier: { label: "Contract exposure", sub: "unhedged clauses" },
      procurement: { label: "Purchase timing", sub: "cost lock" },
      production: { label: "Energy intensity", sub: "peak-hour cost" },
      logistics: { label: "Freight surcharge", sub: "fuel pass-through" },
      commercial: { label: "Price pass-through", sub: "account margin" },
      finance: { label: "Treasury pressure", sub: "FX + working capital" },
    },
    edges: [
      ["scenario", "finance", 1],
      ["scenario", "commodity", 0.82],
      ["commodity", "supplier", 0.7],
      ["supplier", "procurement", 0.62],
      ["scenario", "production", 0.74],
      ["production", "logistics", 0.48],
      ["finance", "commercial", 0.44],
      ["commercial", "evar", 0.34],
      ["finance", "evar", 0.78],
    ],
  },
};

const feedBridgeLabel = (e = {}) => {
  const text = `${e.agent || e.who || ""} ${e.summary || e.msg || ""}`.toLowerCase();
  if (text.includes("ice") || text.includes("rainfall") || text.includes("signal")) return "Graph Updated";
  if (text.includes("cover") || text.includes("policy") || text.includes("breach")) return "Threshold Breach";
  if (text.includes("delay") || text.includes("lead time") || text.includes("priced") || text.includes("margin")) return "EVaR Recalculated";
  if (text.includes("orchestrator") || text.includes("materiality")) return "Scenario Trigger";
  if (text.includes("monte carlo") || text.includes("simulation") || text.includes("complete")) return "Best Portfolio Selected";
  if (text.includes("packet")) return "Decision Packet Created";
  if (text.includes("audit")) return "Audit Released";
  return "Knowledge Graph Synced";
};

function actionBadges(a) {
  const d = a.d, out = [];
  if (d.evar) out.push(`EVaR ${fmtMoneyCompactSigned(-d.evar)}`);
  if (d.cover) out.push(`Days of cover +${d.cover}`);
  if (d.conc) out.push(`Supplier conc. −${d.conc}%`);
  if (d.margin) out.push(`Margin at risk −€${Math.round(d.margin * 1000)}k`);
  if (d.lead) out.push(`Lead time −${d.lead}d`);
  if (d.fx) out.push(`FX ${fmtMoneyCompactSigned(-d.fx)}`);
  if (d.oee) out.push(`OEE +${d.oee}%`);
  if (d.fc) out.push(`Confidence +${d.fc}%`);
  return out;
}

function computePortfolio(ids, sEvar) {
  const list = OPT_ACTIONS.filter((a) => ids.has(a.id));
  let evarDrop = 0, cost = 0, coverAdd = 0, concDrop = 0, wc = 0, fcAdd = 0, confSum = 0;
  list.forEach((a) => {
    evarDrop += a.d.evar || 0; cost += a.cost; coverAdd += a.d.cover || 0;
    concDrop += a.d.conc || 0; wc += a.d.wc || 0; fcAdd += a.d.fc || 0; confSum += a.conf;
  });
  // Overlap: advance purchase + replenish-cover both build cover & reduce procurement exposure
  const overlap = ids.has("advance") && ids.has("safetyStock");
  if (overlap) { evarDrop -= 0.12; coverAdd -= 8; }
  // Synergy: price-protection pair or supply-security pair reinforce each other
  const synergy = (ids.has("advance") && ids.has("hedgeFwd")) || (ids.has("secSupplier") && ids.has("reroute"));
  evarDrop = Math.max(0, evarDrop);
  const baseEvar = sEvar;
  const residual = Math.max(0.3, _r2(baseEvar - evarDrop));
  const valueProtected = _r2(baseEvar - residual);
  const roi = cost > 0 ? _r1((valueProtected * 1000) / cost) : 0;
  const payback = cost > 0 && valueProtected > 0 ? Math.max(1, Math.round((cost * 252) / (valueProtected * 1000))) : 0;
  const conf = list.length ? Math.round(confSum / list.length + (synergy ? 2 : 0)) : K.confidence;
  const ees = (e) => Math.round(_clamp(45 + (e - 1.2) * 15.6, 0, 100));
  const procDrop = list.reduce((s, a) => s + (a.nodes.includes("procurement") ? a.d.evar : 0), 0);
  const cur = { evar: baseEvar, ees: ees(baseEvar), margin: 1.6, proc: 1.45, conc: 48, cover: 18, wc: 0, cash: 0, fc: 63 };
  const proj = {
    evar: residual,
    ees: ees(residual),
    margin: _r2(Math.max(0, 1.6 - evarDrop)),
    proc: _r2(Math.max(0.2, 1.45 - procDrop)),
    conc: Math.max(20, 48 - concDrop),
    cover: Math.min(45, 18 + coverAdd),
    wc: _r1(wc),
    cash: cost,
    fc: Math.min(95, 63 + fcAdd),
  };
  return { list, cost, residual, valueProtected, roi, payback, conf, overlap, synergy, cur, proj, addressed: new Set(list.flatMap((a) => a.nodes)) };
}

function useTween(target, dur = 600) {
  const [v, setV] = useState(target);
  const ref = useRef(target);
  useEffect(() => {
    const from = ref.current, to = target, start = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const cur = from + (to - from) * (0.5 - 0.5 * Math.cos(p * Math.PI));
      setV(cur); ref.current = cur;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}
function TweenNum({ value, fmt, style }) {
  const v = useTween(value);
  return <span style={style}>{fmt(v)}</span>;
}

/* ── Enterprise Digital Twin ── */
const TWIN_NODES = [
  { id: "weather", label: "Weather", x: 240, y: 40, base: 0.5 },
  { id: "commodity", label: "Commodity", x: 240, y: 112, base: 0.92 },
  { id: "supplier", label: "Supplier", x: 240, y: 184, base: 0.75 },
  { id: "procurement", label: "Procurement", x: 148, y: 264, base: 0.85 },
  { id: "energy", label: "Energy", x: 332, y: 264, base: 0.38 },
  { id: "production", label: "Production", x: 240, y: 344, base: 0.5 },
  { id: "logistics", label: "Logistics", x: 148, y: 424, base: 0.45 },
  { id: "commercial", label: "Commercial", x: 332, y: 424, base: 0.32 },
  { id: "finance", label: "Finance", x: 240, y: 504, base: 0.68 },
  { id: "evar", label: "Enterprise EVaR", x: 240, y: 578, base: 0.88, big: true },
];
const TWIN_EDGES = [
  ["weather", "commodity"], ["commodity", "supplier"],
  ["supplier", "procurement"], ["supplier", "energy"],
  ["procurement", "production"], ["energy", "production"],
  ["production", "logistics"], ["production", "commercial"],
  ["logistics", "finance"], ["commercial", "finance"], ["finance", "evar"],
];
const TWIN_MAP = Object.fromEntries(TWIN_NODES.map((n) => [n.id, n]));
const stressColor = (s) => (s > 0.6 ? C.red : s > 0.4 ? C.amber : C.green);

function DigitalTwin({ portfolio, hoverNodes }) {
  const addressed = portfolio.addressed;
  const stressOf = (n) => {
    if (n.id === "evar") return _clamp(portfolio.residual / 3.2, 0.13, 1);
    return addressed.has(n.id) ? Math.max(0.16, n.base * 0.4) : n.base;
  };
  const hv = hoverNodes || new Set();
  return (
    <svg viewBox="0 0 480 620" style={{ width: "100%", maxHeight: 540 }}>
      <style>{`
        @keyframes twinHi { 0%,100%{opacity:.16} 50%{opacity:.34} }
        @keyframes twinHov { 0%,100%{opacity:.4} 50%{opacity:.85} }
        @keyframes twinFlow { to { stroke-dashoffset:-22 } }
        .tw-node circle { transition: fill .7s cubic-bezier(.4,0,.2,1); }
        .tw-glow { transition: r .7s, opacity .7s; }
      `}</style>
      {TWIN_EDGES.map(([a, b]) => {
        const A = TWIN_MAP[a], B = TWIN_MAP[b];
        const live = addressed.has(a) && addressed.has(b);
        const hov = hv.has(a) && hv.has(b);
        return (
          <g key={`${a}-${b}`}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={hov ? C.green : live ? C.core : C.line} strokeWidth={hov || live ? 2.4 : 1.3} style={{ transition: "stroke .5s" }} />
            {(live || hov) && <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={hov ? C.green : C.core} strokeWidth={2.4} strokeDasharray="4 16" style={{ animation: "twinFlow 1.1s linear infinite" }} />}
          </g>
        );
      })}
      {TWIN_NODES.map((n) => {
        const s = stressOf(n);
        const col = stressColor(s);
        const r = n.big ? 17 : 12;
        const glowR = r + 7 + s * 15;
        const hov = hv.has(n.id);
        return (
          <g key={n.id} className="tw-node">
            <circle className="tw-glow" cx={n.x} cy={n.y} r={glowR} fill={col} opacity={0.1 + s * 0.2} style={{ animation: s > 0.6 ? "twinHi 1.8s ease-in-out infinite" : "none" }} />
            {hov && <circle cx={n.x} cy={n.y} r={glowR + 4} fill="none" stroke={C.green} strokeWidth={2} strokeDasharray="3 4" style={{ animation: "twinHov 1.2s ease-in-out infinite" }} />}
            <circle cx={n.x} cy={n.y} r={r} fill={col} stroke="#fff" strokeWidth={2.5} />
            <text x={n.x} y={n.y + (n.big ? 33 : 27)} textAnchor="middle" fontSize={n.big ? 12 : 10.5} fontWeight={n.big ? 700 : 600} fill={C.ink} fontFamily={FONT}>{n.label}</text>
          </g>
        );
      })}
      {/* EVaR value chip */}
      <text x={240} y={582} textAnchor="middle" fontSize="9.5" fontWeight={800} fill="#fff" fontFamily={FONT} dominantBaseline="central">€{portfolio.residual.toFixed(1)}M</text>
    </svg>
  );
}

function LivingCausalGraph({ sEvar, portfolio, selectedActions, hoverAction, setHoverAction, toggleAction, mcBusy, scenarioIntel, activeScenarioName }) {
  const [selectedNodeId, setSelectedNodeId] = useState("evar");
  useEffect(() => { setSelectedNodeId("evar"); }, [activeScenarioName]);
  const previewIds = hoverAction && !selectedActions.has(hoverAction) ? new Set([...selectedActions, hoverAction]) : selectedActions;
  const previewPortfolio = hoverAction && !selectedActions.has(hoverAction) ? computePortfolio(previewIds, sEvar) : portfolio;
  const graphCfg = activeScenarioName && SCENARIO_GRAPH_CONFIG[activeScenarioName] ? SCENARIO_GRAPH_CONFIG[activeScenarioName] : SCENARIO_GRAPH_CONFIG["Cocoa Price Shock"];
  const actionOrder = scenarioIntel ? Object.keys(scenarioIntel.actions).sort((a, b) => {
    const A = scenarioIntel.actions[a], B = scenarioIntel.actions[b];
    if (A.rec !== B.rec) return A.rec ? -1 : 1;
    return (OPT_MAP[a]?.cost || 0) - (OPT_MAP[b]?.cost || 0);
  }) : OPT_ACTIONS.map((a) => a.id);
  const visibleActionIds = actionOrder.slice(0, scenarioIntel ? 6 : OPT_ACTIONS.length);
  const visibleActions = visibleActionIds.map((id) => OPT_MAP[id]).filter(Boolean);
  const activeActionList = visibleActions.filter((a) => previewIds.has(a.id));
  const activeNodes = new Set(activeActionList.flatMap((a) => a.nodes));
  const residualRatio = _clamp(previewPortfolio.residual / Math.max(sEvar, 0.1), 0.12, 1);
  const evarTween = useTween(previewPortfolio.residual, 850);
  const nodeDefs = [
    { id: "scenario", label: "Selected scenario", x: 54, y: 220, stress: 0.92, sub: "root cause" },
    { id: "commodity", label: "Cocoa market", x: 172, y: 120, stress: 0.95, sub: "price + deficit" },
    { id: "supplier", label: "Supplier base", x: 292, y: 168, stress: 0.76, sub: "concentration" },
    { id: "procurement", label: "Cover policy", x: 420, y: 118, stress: 0.82, sub: "18d vs 30d" },
    { id: "production", label: "Production plan", x: 532, y: 220, stress: 0.62, sub: "line capacity" },
    { id: "logistics", label: "Inbound lane", x: 420, y: 324, stress: 0.58, sub: "lead-time" },
    { id: "commercial", label: "Service risk", x: 648, y: 150, stress: 0.44, sub: "OTIF" },
    { id: "finance", label: "Margin at risk", x: 648, y: 292, stress: 0.68, sub: "working capital" },
    { id: "evar", label: "Enterprise EVaR", x: 770, y: 220, stress: residualRatio, sub: `€${evarTween.toFixed(2)}M`, big: true },
  ].map((n) => ({ ...n, ...(graphCfg.nodes?.[n.id] || {}) }));
  const actionMitigation = (nodeId) => activeActionList.reduce((sum, a) => sum + (a.nodes.includes(nodeId) ? (a.d.evar || 0.06) : 0), 0);
  const stressOf = (n) => {
    if (n.id === "scenario") return n.stress;
    if (n.id === "evar") return residualRatio;
    return _clamp(n.stress - actionMitigation(n.id) * 0.85, 0.12, 0.96);
  };
  const colorOf = (s) => s > 0.62 ? C.red : s > 0.34 ? C.amber : C.green;
  const nodes = Object.fromEntries(nodeDefs.map((n) => [n.id, n]));
  const nodeMeta = {
    scenario: { owner: "S&OP Control", cause: "Selected scenario assumptions trigger the causal propagation path.", exposure: `€${sEvar.toFixed(2)}M scenario EVaR`, response: "Select response actions to weaken downstream paths." },
    commodity: { owner: "Procurement", cause: "ICE cocoa movement and ICCO deficit pressure raw-material costs.", exposure: "Dominant external driver", response: "Advance purchase or hedge forward exposure." },
    supplier: { owner: "Procurement", cause: "Supplier concentration amplifies commodity shocks into cover risk.", exposure: "Single-source pressure", response: "Activate secondary supplier." },
    procurement: { owner: "Procurement", cause: "Cover policy gap converts price and supply risk into operational exposure.", exposure: "18 days cover vs 30-day policy", response: "Advance purchase or replenish safety stock." },
    production: { owner: "Operations", cause: "Material constraints cascade into line scheduling and capacity buffers.", exposure: "Line capacity and OEE sensitivity", response: "Reallocate run to Line 3." },
    logistics: { owner: "Logistics", cause: "Inbound lane disruption extends lead time and draws down inventory buffer.", exposure: "Lead-time delay path", response: "Reroute shipment from Abidjan." },
    commercial: { owner: "Commercial", cause: "Supply and schedule constraints reduce service reliability for key accounts.", exposure: "OTIF and allocation risk", response: "Adjust allocation to demand." },
    finance: { owner: "Finance", cause: "Margin at risk consolidates commodity, working-capital and logistics exposure.", exposure: "Margin and cash pressure", response: "Hedge FX / margin exposure." },
    evar: { owner: "Executive S&OP", cause: "Enterprise EVaR aggregates residual exposure after mitigation.", exposure: `Residual €${previewPortfolio.residual.toFixed(2)}M`, response: "Generate Decision Packet when portfolio is selected." },
    secondary: { owner: "Procurement", cause: "Diversification branch added by secondary supplier action.", exposure: "Supplier concentration reduced", response: "Keep supplier qualification active." },
    valencia: { owner: "Logistics", cause: "Alternate lane branch added by reroute action.", exposure: "Lead-time pressure reduced", response: "Confirm port capacity and carrier slot." },
  };
  const mainEdges = graphCfg.edges;
  const branchEdges = [
    selectedActions.has("secSupplier") || hoverAction === "secSupplier" ? ["supplier", "secondary", 0.28, C.green] : null,
    selectedActions.has("secSupplier") || hoverAction === "secSupplier" ? ["secondary", "production", 0.22, C.green] : null,
    selectedActions.has("reroute") || hoverAction === "reroute" ? ["logistics", "valencia", 0.24, C.green] : null,
    selectedActions.has("reroute") || hoverAction === "reroute" ? ["valencia", "finance", 0.18, C.green] : null,
  ].filter(Boolean);
  const branchNodes = [
    selectedActions.has("secSupplier") || hoverAction === "secSupplier" ? { id: "secondary", label: "Secondary supplier", x: 292, y: 292, stress: 0.18, sub: "Ecuador pool" } : null,
    selectedActions.has("reroute") || hoverAction === "reroute" ? { id: "valencia", label: "Valencia reroute", x: 540, y: 382, stress: 0.16, sub: "new lane" } : null,
  ].filter(Boolean);
  branchNodes.forEach((n) => { nodes[n.id] = n; });
  const selectedNode = nodes[selectedNodeId] || nodes.evar;
  const selectedStress = stressOf(selectedNode);
  const selectedMeta = nodeMeta[selectedNode.id] || nodeMeta.evar;
  const selectedActionsForNode = activeActionList.filter((a) => a.nodes.includes(selectedNode.id));
  const recommendedActionsForNode = visibleActions.filter((a) => a.nodes.includes(selectedNode.id)).slice(0, 3);
  const nodeSymbol = {
    scenario: "!",
    commodity: "$",
    supplier: "S",
    procurement: "C",
    production: "P",
    logistics: "L",
    commercial: "O",
    finance: "M",
    evar: "€",
    secondary: "+S",
    valencia: "V",
  };
  const impactBadges = activeActionList.flatMap((a) => {
    const firstNode = a.nodes[0] || "evar";
    const n = nodes[firstNode] || nodes.evar;
    return actionBadges(a).slice(0, 2).map((label, i) => ({ label, x: n.x + 16, y: n.y - 42 + i * 24, action: a.id }));
  });
  const edgeStyle = (edge) => {
    const [a, b, weight, override] = edge;
    const sourceStress = stressOf(nodes[a]);
    const targetStress = stressOf(nodes[b]);
    const weakened = activeNodes.has(a) || activeNodes.has(b);
    const exposure = _clamp(((sourceStress + targetStress) / 2) * weight * (weakened ? 0.48 : 1), 0.08, 1);
    return { color: override || (weakened ? C.green : colorOf(exposure)), width: 1.5 + exposure * 7, opacity: weakened ? 0.6 : 0.72, dash: weakened ? "8 9" : "0" };
  };
  return (
    <Card style={{ padding: 0, overflow: "hidden", opacity: mcBusy ? 0.48 : 1, transition: "opacity .3s" }}>
      <div style={{ padding: "16px 18px 10px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <SectionLabel icon={GitBranch} style={{ marginBottom: 5 }}>{graphCfg.header}</SectionLabel>
          <div style={{ fontSize: 11.5, color: C.soft, lineHeight: 1.45 }}>
            {graphCfg.sub} Click any node for detail; selected actions weaken paths, create new branches and pull Enterprise EVaR down in place.
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: C.soft, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6 }}>Twin state</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: previewPortfolio.residual < sEvar ? C.green : C.red, ...NUM }}>
            {previewPortfolio.list.length ? `${previewPortfolio.list.length} action${previewPortfolio.list.length === 1 ? "" : "s"}` : "Unmitigated"}
          </div>
          <div style={{ fontSize: 11, color: C.soft }}>residual €{evarTween.toFixed(2)}M · path strength {Math.round(residualRatio * 100)}%</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 294px", gap: 0, background: "linear-gradient(180deg,#FFFFFF 0%,#FAFAFA 100%)" }}>
        <svg viewBox="0 0 830 470" style={{ width: "100%", height: "min(52vh, 500px)", minHeight: 410, display: "block" }}>
          <style>{`
            @keyframes causalFlow { to { stroke-dashoffset: -34; } }
            @keyframes causalPulse { 0%,100% { opacity:.16; transform:scale(.92); } 50% { opacity:.34; transform:scale(1.08); } }
            @keyframes causalBadge { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
          `}</style>
          <defs>
            <linearGradient id="causalBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="48%" stopColor="#FAFAFF" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <radialGradient id="causalAura" cx="50%" cy="44%" r="66%">
              <stop offset="0%" stopColor="#A100FF" stopOpacity="0.045" />
              <stop offset="42%" stopColor="#5BC4FF" stopOpacity="0.028" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            <filter id="causalGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect x="0" y="0" width="830" height="470" fill="url(#causalBg)" />
          <rect x="0" y="0" width="830" height="470" fill="url(#causalAura)" />
          {[80, 210, 340, 470, 600, 730].map((x, i) => (
            <path key={i} d={`M${x} 58 C${x + 80} 142 ${x - 60} 286 ${x + 95} 398`} fill="none" stroke={i % 2 ? "#A100FF" : "#5BC4FF"} strokeWidth="0.7" opacity="0.045" strokeDasharray="9 16" />
          ))}
          {[...mainEdges, ...branchEdges].map((e, i) => {
            const [a, b] = e;
            const A = nodes[a], B = nodes[b];
            const st = edgeStyle(e);
            return (
              <g key={`${a}-${b}`}>
                <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={st.color} strokeWidth={st.width + 7} opacity={0.08} strokeLinecap="round" />
                <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={st.color} strokeWidth={st.width} opacity={st.opacity} strokeLinecap="round" strokeDasharray={st.dash} style={{ transition: "stroke .6s, stroke-width .7s, opacity .6s" }} />
                <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={st.color} strokeWidth={Math.max(1.4, st.width * 0.34)} opacity={0.58} strokeLinecap="round" strokeDasharray="2 20" style={{ animation: "causalFlow 1.2s linear infinite" }} />
                {activeNodes.has(a) || activeNodes.has(b) ? (
                  <circle cx={(A.x + B.x) / 2} cy={(A.y + B.y) / 2} r="6" fill={C.green} opacity="0.9">
                    <animate attributeName="r" values="5;11;5" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values=".9;.25;.9" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                ) : null}
              </g>
            );
          })}
          {[...nodeDefs, ...branchNodes].map((n) => {
            const s = stressOf(n);
            const col = colorOf(s);
            const touched = activeNodes.has(n.id) || n.id === "evar";
            const selected = selectedNodeId === n.id;
            const r = n.big ? 28 : 19;
            return (
              <g key={n.id} onClick={() => setSelectedNodeId(n.id)} style={{ transition: "transform .5s", cursor: "pointer" }}>
                <circle cx={n.x} cy={n.y} r={r + 13} fill={col} opacity={touched ? 0.14 : 0.07} filter="url(#causalGlow)" style={{ transformOrigin: `${n.x}px ${n.y}px`, animation: touched ? "causalPulse 2.2s ease-in-out infinite" : "none" }} />
                {selected && <circle cx={n.x} cy={n.y} r={r + 10} fill="none" stroke={C.core} strokeWidth="2.4" opacity="0.88" />}
                <circle cx={n.x} cy={n.y} r={r} fill={col} stroke="#fff" strokeWidth="3" filter="url(#causalGlow)" style={{ transition: "fill .7s" }} />
                {touched && <circle cx={n.x} cy={n.y} r={r + 6} fill="none" stroke={C.green} strokeWidth="2" strokeDasharray="5 6" opacity="0.7" />}
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={n.big ? 16 : 12} fontWeight="950" fill="#fff" fontFamily={FONT}>{nodeSymbol[n.id] || "•"}</text>
                <text x={n.x} y={n.y + r + 22} textAnchor="middle" fontSize="12" fontWeight="850" fill={C.ink} fontFamily={FONT}>{n.label}</text>
                <text x={n.x} y={n.y + r + 38} textAnchor="middle" fontSize="10.5" fontWeight="650" fill={C.soft} fontFamily={FONT}>{n.sub}</text>
              </g>
            );
          })}
          {impactBadges.map((b, i) => (
            <g key={`${b.action}-${i}`} style={{ animation: "causalBadge 2.4s ease-in-out infinite" }}>
              <rect x={b.x} y={b.y} width={Math.max(104, b.label.length * 7.2 + 20)} height="22" rx="11" fill={b.label.includes("EVaR") ? C.greenBg : C.purpBg} stroke={b.label.includes("EVaR") ? C.green : C.core} opacity="0.96" />
              <text x={b.x + 10} y={b.y + 15} fontSize="10.5" fontWeight="900" fill={b.label.includes("EVaR") ? C.green : C.deep} fontFamily={FONT}>{b.label}</text>
            </g>
          ))}
        </svg>
        <div style={{ borderLeft: `1px solid ${C.line}`, padding: 14, background: "rgba(255,255,255,0.78)" }}>
        {selectedNode && (
          <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 12px 32px rgba(100,0,200,0.18)", border: "1px solid rgba(161,0,255,0.22)" }}>
            {/* Purple gradient header */}
            <div style={{ background: "linear-gradient(135deg,#1A0640 0%,#2D0A55 55%,#4A0E86 100%)", padding: "13px 14px 12px", position: "relative" }}>
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="ngrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#fff" strokeWidth="0.4"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#ngrid)"/>
              </svg>
              <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: selectedStress > 0.62 ? C.red : selectedStress > 0.34 ? C.amber : C.green, flexShrink: 0 }} />
                    Node view
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.15, letterSpacing: -0.3 }}>{selectedNode.label}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 7 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: selectedStress > 0.62 ? "rgba(255,80,80,0.22)" : selectedStress > 0.34 ? "rgba(255,170,0,0.22)" : "rgba(0,200,100,0.22)", color: selectedStress > 0.62 ? "#FF7070" : selectedStress > 0.34 ? "#FFB800" : "#3DE38A", border: `1px solid ${selectedStress > 0.62 ? "rgba(255,80,80,0.35)" : selectedStress > 0.34 ? "rgba(255,170,0,0.35)" : "rgba(0,200,100,0.35)"}` }}>
                      {selectedStress > 0.62 ? "High exposure" : selectedStress > 0.34 ? "Elevated" : "Controlled"}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.16)" }}>
                      {selectedMeta.owner}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedNodeId("evar")} title="Reset node view" style={{ border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", borderRadius: 7, width: 24, height: 24, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Info rows */}
            <div style={{ background: "#fff", padding: "10px 14px", display: "grid", gap: 0 }}>
              {[
                { key: "Cause", val: selectedMeta.cause, icon: "⚡" },
                { key: "Exposure", val: selectedMeta.exposure, icon: "⚠" },
                { key: "Response logic", val: selectedMeta.response, icon: "→" },
              ].map(({ key, val, icon }, i, arr) => (
                <div key={key} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
                  <span style={{ fontSize: 11, flexShrink: 0, marginTop: 1, opacity: 0.5 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: C.soft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{key}</div>
                    <div style={{ fontSize: 11.5, color: C.ink, lineHeight: 1.4 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ background: "#FAFAFE", borderTop: `1px solid rgba(161,0,255,0.12)`, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: C.deep, letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                <Zap size={9} color={C.core} /> Applicable actions
              </div>
              <div style={{ display: "grid", gap: 5 }}>
                {(selectedActionsForNode.length ? selectedActionsForNode : recommendedActionsForNode).map((a) => {
                  const active = selectedActions.has(a.id);
                  return (
                    <button key={a.id} onClick={() => toggleAction(a.id)} style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "left", padding: "7px 9px", borderRadius: 8, border: `1.5px solid ${active ? C.core : "rgba(161,0,255,0.15)"}`, background: active ? C.purpBg : "#fff", cursor: "pointer", fontFamily: FONT, transition: "all .14s" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: active ? C.core : C.line, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: active ? C.deep : C.ink, lineHeight: 1.3 }}>{a.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: active ? C.core : C.soft, ...NUM, flexShrink: 0 }}>−€{((a.d?.evar || 0)).toFixed(2)}M</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      <div style={{ padding: 14, borderTop: `1px solid ${C.line}`, background: C.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <SectionLabel icon={Sparkles} style={{ margin: 0 }}>{scenarioIntel ? "AI Recommended Portfolio" : "Response actions"}</SectionLabel>
          {scenarioIntel && (
            <>
              <Pill tone="purple" style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
                <Sparkles size={9} /> {(scenarioIntel.evaluated).toLocaleString()} portfolios evaluated
              </Pill>
              <Pill tone="grey">{[...scenarioIntel.optimalIds].length} pre-selected</Pill>
            </>
          )}
          {!scenarioIntel && portfolio.synergy && <Pill tone="purple" style={{ display:"inline-flex", alignItems:"center", gap:4 }}><Zap size={10} /> Actions reinforce each other</Pill>}
          {!scenarioIntel && portfolio.overlap && <Pill tone="amber">Adjusted for overlap</Pill>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 9 }}>
          {visibleActions.map((a) => {
            const checked = selectedActions.has(a.id);
            const hovered = hoverAction === a.id;
            const intel = scenarioIntel?.actions?.[a.id];
            const isAiRec = intel?.rec === true;
            const isAiOpt = intel && intel.rec === false;
            const borderCol = checked ? C.core : isAiRec && !checked ? "#E8A000" : hovered ? C.deep : C.line;
            const bgCol = checked ? C.purpBg : isAiRec && !checked ? "#FFFBF0" : hovered ? C.faint : C.bg;
            return (
              <button key={a.id}
                onMouseEnter={() => setHoverAction(a.id)}
                onMouseLeave={() => setHoverAction(null)}
                onClick={() => toggleAction(a.id)}
                style={{ textAlign: "left", padding: "9px 11px", borderRadius: 9, border: `1.5px solid ${borderCol}`, background: bgCol, cursor: "pointer", fontFamily: FONT, transition: "all .16s ease", boxShadow: checked ? "0 0 0 2px rgba(161,0,255,0.10)" : isAiRec && !checked ? "0 0 0 2px rgba(184,110,0,0.10)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ width: 13, height: 13, borderRadius: 4, border: `1.5px solid ${checked ? C.core : C.line}`, background: checked ? C.core : C.bg, color: "#fff", display: "inline-grid", placeItems: "center", fontSize: 9, flexShrink: 0 }}>{checked ? "✓" : ""}</span>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    {intel?.tag && (
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.4, padding: "1px 6px", borderRadius: 99, background: checked ? "rgba(161,0,255,0.15)" : isAiRec ? "rgba(184,110,0,0.12)" : C.faint, color: checked ? C.core : isAiRec ? "#B86E00" : C.soft }}>
                        {intel.tag}
                      </span>
                    )}
                    {isAiRec && !checked && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 99, background: "rgba(184,110,0,0.12)", color: "#B86E00", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <Sparkles size={8} /> AI
                      </span>
                    )}
                    {checked && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 99, background: "rgba(161,0,255,0.12)", color: C.core }}>Active</span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 750, color: checked ? C.deep : C.ink, lineHeight: 1.25, marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontSize: 10, color: C.soft, ...NUM }}>€{a.cost}k · {a.conf}% conf</div>
                <div style={{ fontSize: 10, color: C.green, fontWeight: 800, marginTop: 3 }}>{actionBadges(a)[0]}</div>
                {intel?.note && (
                  <div style={{ fontSize: 9.5, color: checked ? C.deep : C.soft, marginTop: 5, paddingTop: 5, borderTop: `1px solid ${C.line}`, lineHeight: 1.4 }}>{intel.note}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/* ── Decision impact panel ── */
function DecisionImpactPanel({ portfolio }) {
  const { cur, proj } = portfolio;
  const economics = [
    ["Actions selected", portfolio.list.length, C.ink],
    ["Implementation cost", `€${portfolio.cost}k`, C.ink],
    ["Value protected", fmtMoneyCompact(portfolio.valueProtected), C.green],
    ["Portfolio ROI", portfolio.roi ? `${portfolio.roi}×` : "—", C.green],
    ["Confidence", `${portfolio.conf}%`, C.ink],
    ["Payback", portfolio.payback ? `${portfolio.payback} days` : "—", C.ink],
  ];
  const kpis = [
    { k: "evar", label: "Enterprise EVaR", fmt: (v) => fmtMoneyCompact(v), max: 3.2, dir: "down" },
    { k: "ees", label: "Exposure Score", fmt: (v) => `${Math.round(v)}`, max: 100, dir: "down" },
    { k: "margin", label: "Margin at Risk", fmt: (v) => fmtMoneyCompact(v), max: 1.6, dir: "down" },
    { k: "cover", label: "Days of Cover", fmt: (v) => `${Math.round(v)}`, max: 45, dir: "up" },
    { k: "conc", label: "Supplier Conc.", fmt: (v) => `${Math.round(v)}%`, max: 48, dir: "down" },
  ];
  return (
    <Card style={{ padding: 16, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <SectionLabel icon={Activity} style={{ marginBottom: 5 }}>Decision Impact Panel</SectionLabel>
          <div style={{ fontSize: 11.5, color: C.soft }}>Projected impact based on selected response actions and current scenario assumptions.</div>
        </div>
        <Pill tone="grey">Driven by Enterprise Digital Twin</Pill>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.35fr", gap: 16, alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.soft, letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 8 }}>Portfolio economics</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {economics.map(([l, v, col]) => (
              <div key={l} style={{ padding: "8px 9px", background: C.faint, borderRadius: 8, minHeight: 54 }}>
                <div style={{ fontSize: 10, color: C.soft, fontWeight: 700, lineHeight: 1.2 }}>{l}</div>
                <div style={{ fontSize: 17, fontWeight: 850, color: col, marginTop: 4, ...NUM }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.soft, letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 8 }}>KPI impact</div>
          {kpis.map((r) => {
            const c = cur[r.k], p = proj[r.k];
            const delta = p - c;
            const noChange = Math.abs(delta) < 0.001;
            const improved = !noChange && (r.dir === "down" ? p < c : p > c);
            const tone = noChange ? C.soft : improved ? C.green : C.amber;
            const currentWidth = _clamp((c / r.max) * 100, 0, 100);
            const projectedWidth = _clamp((p / r.max) * 100, 0, 100);
            return (
              <div key={r.k} style={{ marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr auto", gap: 10, alignItems: "center", fontSize: 11.5, marginBottom: 4 }}>
                  <span style={{ fontWeight: 750 }}>{r.label}</span>
                  <span style={{ ...NUM, color: C.soft }}>
                    {r.fmt(c)} <span style={{ margin: "0 4px" }}>→</span>
                    <TweenNum value={p} fmt={r.fmt} style={{ color: tone, fontWeight: 850 }} />
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: tone }}>{noChange ? "No change" : improved ? "Improves" : "Worsens"}</span>
                </div>
                <div style={{ position: "relative", height: 7, background: C.line, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ position: "absolute", height: "100%", width: `${currentWidth}%`, background: C.soft, opacity: 0.22, borderRadius: 99 }} />
                  <div style={{ position: "absolute", height: "100%", width: `${projectedWidth}%`, background: tone, opacity: noChange ? 0.55 : 1, borderRadius: 99, transition: "width .7s cubic-bezier(.4,0,.2,1), background .3s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/* ============ ENTERPRISE KNOWLEDGE GRAPH ============ */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const EG_ORDER = ["external", "supplier", "contract", "recipe", "sku", "plant", "inventory", "logistics", "customer", "commercial", "finance", "evar", "decision"];
const EG_CATS = {
  external: { label: "External Signal", color: "#E0992B", steward: "Signal Layer" },
  supplier: { label: "Supplier", color: "#A100FF", steward: "Procurement" },
  contract: { label: "Contract", color: "#7500C0", steward: "Legal" },
  recipe: { label: "Recipe", color: "#D4537E", steward: "Operations" },
  sku: { label: "SKU", color: "#378ADD", steward: "Operations" },
  plant: { label: "Plant / Line", color: "#5B5B66", steward: "Operations" },
  inventory: { label: "Inventory", color: "#1D9E75", steward: "Procurement" },
  logistics: { label: "Logistics", color: "#D85A30", steward: "Logistics" },
  customer: { label: "Customer", color: "#639922", steward: "Commercial" },
  commercial: { label: "Commercial", color: "#9F77DD", steward: "Commercial" },
  finance: { label: "Finance", color: "#BA7517", steward: "Finance" },
  evar: { label: "Enterprise EVaR", color: "#A100FF", steward: "Finance" },
  decision: { label: "Decision Packet", color: "#C026D3", steward: "Operations Director" },
};
const EG_COUNTS = { external: 18, supplier: 26, contract: 32, recipe: 22, sku: 58, plant: 8, inventory: 16, logistics: 20, customer: 40, commercial: 14, finance: 12, evar: 1, decision: 5 };
const EG_NODE_COUNT = Object.values(EG_COUNTS).reduce((sum, n) => sum + n, 0);
const EG_STEWARD_COLORS = { "Signal Layer": "#E0992B", "Procurement": "#A100FF", "Legal": "#7500C0", "Operations": "#378ADD", "Logistics": "#D85A30", "Commercial": "#639922", "Finance": "#BA7517", "Operations Director": "#C026D3" };
const EG_HERO = {
  external: ["Bloomberg Cocoa", "ICCO Deficit", "Copernicus Weather", "TTF Energy", "Abidjan Port", "ICE Futures", "EUR/USD FX"],
  supplier: ["Supplier A", "Supplier B", "Ecuador Lot"],
  contract: ["Forward Contract Q3", "EUDR Clause", "Master Supply Agr."],
  recipe: ["Dark 70%", "Premium Mix", "Seasonal Assort.", "Recipe 14"],
  sku: ["SKU 52", "SKU 18", "SKU 09"],
  plant: ["Line 2", "Line 3", "Plant — Italy"],
  inventory: ["Cocoa Stock", "Safety Stock"],
  logistics: ["Valencia Lane", "Abidjan Lane", "Carrier B"],
  customer: ["Retailer X", "Retailer Y", "FMCG Z", "Distributor W"],
  commercial: ["Demand Forecast", "Promo Plan"],
  finance: ["FX Exposure", "Working Capital", "Margin at Risk"],
  evar: ["Enterprise EVaR"],
  decision: ["Packet #24", "Packet #25", "Packet #26", "Report #7", "Scenario #3"],
};
/* Structure lens: EVaR at the center, a Decision Layer band at the bottom, domains arranged around the top */
const EG_STRUCT_CENTERS = {
  "External Intelligence": [250, 205],
  Procurement: [445, 140],
  Production: [615, 140],
  Logistics: [805, 235],
  Finance: [225, 395],
  Commercial: [820, 410],
};
const EG_STRUCT_EVAR = [520, 365];
const EG_STRUCT_DECISION = [520, 675];
/* Which signals originate each decision node (connected when the node is selected) */
const EG_DECISION_LINKS = {
  "Packet #24": ["Bloomberg Cocoa", "ICCO Deficit", "ICE Futures", "Abidjan Port", "Supplier A", "Forward Contract Q3", "FX Exposure", "Margin at Risk"],
  "Packet #25": ["Bloomberg Cocoa", "ICE Futures", "ICCO Deficit", "Cocoa Stock", "Margin at Risk"],
  "Packet #26": ["Bloomberg Cocoa", "ICCO Deficit", "Abidjan Port", "Copernicus Weather", "Margin at Risk"],
  "Report #7": ["Margin at Risk", "Working Capital", "FX Exposure", "Demand Forecast"],
  "Scenario #3": ["Bloomberg Cocoa", "ICCO Deficit", "Copernicus Weather", "EUR/USD FX", "Margin at Risk"],
};
function egBfs(start, adj, maxDepth = 99) {
  const dist = { [start]: 0 }; const q = [start];
  while (q.length) {
    const u = q.shift(); if (dist[u] >= maxDepth) continue;
    (adj[u] || []).forEach((v) => { if (dist[v] === undefined) { dist[v] = dist[u] + 1; q.push(v); } });
  }
  return dist;
}
function egPath(start, targetTest, adj, byId) {
  const prev = { [start]: null }; const q = [start]; let target = null;
  while (q.length) {
    const u = q.shift();
    if (targetTest(byId[u])) { target = u; break; }
    (adj[u] || []).forEach((v) => { if (prev[v] === undefined) { prev[v] = u; q.push(v); } });
  }
  if (target === null) return null;
  const out = []; let cur = target;
  while (cur !== null) { out.unshift(cur); cur = prev[cur]; }
  return out;
}

const EG_DOMAIN_COLORS = {
  Procurement: "#A100FF",
  Logistics: "#0070C0",
  Production: "#1E7145",
  Commercial: "#D41876",
  Finance: "#B86E00",
  "External Intelligence": "#008080",
};
const EG_DOMAIN_BY_CAT = {
  external: "External Intelligence",
  supplier: "Procurement",
  contract: "Procurement",
  recipe: "Production",
  sku: "Production",
  plant: "Production",
  inventory: "Procurement",
  logistics: "Logistics",
  customer: "Commercial",
  commercial: "Commercial",
  finance: "Finance",
  evar: "Finance",
  decision: "Commercial",
};
const EG_DOMAIN_CENTERS = {
  Procurement: [285, 255],
  Logistics: [720, 265],
  Production: [500, 405],
  Commercial: [730, 545],
  Finance: [500, 615],
  "External Intelligence": [285, 545],
};
const EG_OWNER_CENTERS = {
  "Signal Layer": [235, 270],
  Procurement: [485, 235],
  Legal: [735, 285],
  Operations: [320, 520],
  Logistics: [545, 575],
  Commercial: [760, 520],
  Finance: [540, 385],
  "Operations Director": [870, 405],
};
const EG_FRESHNESS_META = {
  ok: "Updated 7m ago",
  watch: "Last updated 18h",
  stale: "Last updated 6d",
};

function egClusterPoint(center, idx, total, rnd, radius = 82) {
  const ring = Math.floor(Math.sqrt(idx));
  const angle = idx * 2.3999632297 + rnd() * 0.18;
  const rr = Math.min(radius, 22 + ring * 17 + rnd() * 14);
  return [center[0] + Math.cos(angle) * rr, center[1] + Math.sin(angle) * rr];
}

function buildEnterpriseGraph() {
  const rnd = mulberry32(20260615);
  const nodes = []; let id = 0; const byCat = {};
  EG_ORDER.forEach((c) => (byCat[c] = []));
  const W = 1040, H = 760, cx = W / 2, cy = H / 2;
  EG_ORDER.forEach((cat, li) => {
    const meta = EG_CATS[cat];
    const ang = (li / EG_ORDER.length) * Math.PI * 2 - Math.PI / 2;
    const R = cat === "evar" ? 34 : cat === "decision" ? 170 : 235;
    const ccx = cat === "evar" ? cx : cx + Math.cos(ang) * R;
    const ccy = cat === "evar" ? cy : cy + Math.sin(ang) * R;
    const n = EG_COUNTS[cat]; const heroes = EG_HERO[cat] || [];
    for (let k = 0; k < n; k++) {
      const isHero = k < heroes.length;
      const domain = EG_DOMAIN_BY_CAT[cat] || "External Intelligence";
      let fresh = "ok";
      if (cat === "logistics") fresh = k < 3 ? "stale" : "watch";
      else if (cat === "contract") fresh = k < 4 ? "watch" : "ok";
      else if (rnd() < 0.04) fresh = "watch";
      const completeness = cat === "logistics" ? Math.round(68 + rnd() * 12) : cat === "plant" && k > 4 ? Math.round(70 + rnd() * 12) : Math.round(85 + rnd() * 14);
      const validation = fresh === "stale" ? "under_review" : rnd() < 0.92 ? "validated" : "under_review";
      const nd = {
        id: id++, cat, layer: li, isHero,
        label: isHero ? heroes[k] : `${meta.label} ${k + 1}`,
        domain, steward: meta.steward, completeness, fresh, validation,
        lastUpdated: EG_FRESHNESS_META[fresh],
        missingData: completeness < 82 ? (cat === "logistics" ? "capacity data" : cat === "contract" ? "ESG clause" : "relationship evidence") : null,
        x: ccx + (rnd() - 0.5) * 84, y: ccy + (rnd() - 0.5) * 84,
        vx: 0, vy: 0, phase: rnd() * Math.PI * 2,
        r: cat === "evar" ? 17 : cat === "decision" ? 9 : isHero ? 7 : 4.6,
        _px: 0, _py: 0,
      };
      nodes.push(nd); byCat[cat].push(nd);
    }
  });
  const edges = [];
  for (let li = 0; li < EG_ORDER.length - 1; li++) {
    const a = byCat[EG_ORDER[li]], b = byCat[EG_ORDER[li + 1]];
    if (!b.length) continue;
    a.forEach((na) => {
      const m = EG_ORDER[li] === "finance" ? b.length : 1 + Math.floor(rnd() * 3);
      for (let j = 0; j < m; j++) {
        const nb = b[Math.floor(rnd() * b.length)];
        edges.push([na.id, nb.id, { missing: na.missingData || nb.missingData ? rnd() < 0.45 : rnd() < 0.04, reason: na.missingData || nb.missingData || "ESG data" }]);
      }
    });
  }
  for (let i = 0; i < 110; i++) {
    const li = Math.floor(rnd() * (EG_ORDER.length - 2));
    const a = byCat[EG_ORDER[li]], b = byCat[EG_ORDER[li + 2]] || byCat[EG_ORDER[li + 1]];
    if (a.length && b.length) {
      const na = a[Math.floor(rnd() * a.length)], nb = b[Math.floor(rnd() * b.length)];
      edges.push([na.id, nb.id, { missing: na.missingData || nb.missingData ? rnd() < 0.38 : rnd() < 0.08, reason: na.missingData || nb.missingData || "capacity data" }]);
    }
  }
  Object.values(EG_DOMAIN_CENTERS).forEach(() => {});
  const byDomain = {};
  nodes.forEach((nd) => { (byDomain[nd.domain] ||= []).push(nd); });
  Object.values(byDomain).forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < Math.min(group.length, i + 5); j++) {
        if (rnd() < 0.52) edges.push([group[i].id, group[j].id, { intra: true, missing: false }]);
      }
    }
  });
  // Decision layer: connect each packet/report/scenario to its originating signals and to Enterprise EVaR
  const egHeroByLabel = {};
  nodes.forEach((nd) => { if (nd.isHero) egHeroByLabel[nd.label] = nd; });
  const egEvarNode = nodes.find((nd) => nd.cat === "evar");
  nodes.filter((nd) => nd.cat === "decision").forEach((dn) => {
    (EG_DECISION_LINKS[dn.label] || []).forEach((lbl) => {
      const src = egHeroByLabel[lbl];
      if (src) edges.push([src.id, dn.id, { decision: true, missing: false }]);
    });
    if (egEvarNode) edges.push([egEvarNode.id, dn.id, { decision: true, missing: false }]);
  });
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  // force layout
  for (let it = 0; it < 110; it++) {
    for (let i = 0; i < nodes.length; i++) {
      const ni = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const nj = nodes[j];
        const dx = ni.x - nj.x, dy = ni.y - nj.y, d2 = dx * dx + dy * dy + 0.01;
        if (d2 < 17000) {
          const d = Math.sqrt(d2), f = Math.min(420, 820 / d2), ux = dx / d, uy = dy / d;
          ni.vx += ux * f; ni.vy += uy * f; nj.vx -= ux * f; nj.vy -= uy * f;
        }
      }
    }
    edges.forEach(([a, b]) => {
      const na = byId[a], nb = byId[b];
      const dx = nb.x - na.x, dy = nb.y - na.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const f = (d - 48) * 0.012, ux = dx / d, uy = dy / d;
      na.vx += ux * f; na.vy += uy * f; nb.vx -= ux * f; nb.vy -= uy * f;
    });
    nodes.forEach((nd) => { nd.vx += (cx - nd.x) * 0.0034; nd.vy += (cy - nd.y) * 0.0034; nd.x += nd.vx * 0.72; nd.y += nd.vy * 0.72; nd.vx *= 0.76; nd.vy *= 0.76; });
  }
  const adjOut = {}, adjIn = {};
  nodes.forEach((nd) => { adjOut[nd.id] = []; adjIn[nd.id] = []; });
  edges.forEach(([a, b]) => { adjOut[a].push(b); adjIn[b].push(a); });
  const edgeRefs = edges.map(([a, b, meta]) => [byId[a], byId[b], meta || {}]);
  const downStale = {};
  nodes.filter((n) => n.fresh === "stale").forEach((s) => {
    const d = egBfs(s.id, adjOut);
    Object.keys(d).forEach((k) => { if (+k !== s.id) downStale[k] = true; });
  });
  nodes.forEach((n) => { n.trust = n.fresh === "stale" ? "blocked" : downStale[n.id] ? "monitor" : "trusted"; });

  const layouts = { default: {}, structure: {}, freshness: {}, completeness: {}, governance: {}, aitrust: {} };
  const pushLayout = (modeKey, nd, x, y) => { layouts[modeKey][nd.id] = { x, y }; };
  nodes.forEach((nd) => pushLayout("default", nd, nd.x, nd.y));
  const structIndex = {};
  const structDomainTotals = {};
  let structDecIdx = 0;
  nodes.forEach((nd) => { if (nd.cat !== "evar" && nd.cat !== "decision") structDomainTotals[nd.domain] = (structDomainTotals[nd.domain] || 0) + 1; });
  nodes.forEach((nd) => {
    let x, y;
    if (nd.cat === "evar") {
      [x, y] = EG_STRUCT_EVAR;
    } else if (nd.cat === "decision") {
      [x, y] = egClusterPoint(EG_STRUCT_DECISION, structDecIdx++, EG_COUNTS.decision, rnd, 92);
    } else {
      const c = EG_STRUCT_CENTERS[nd.domain] || [cx, 200];
      const idx = structIndex[nd.domain] || 0; structIndex[nd.domain] = idx + 1;
      [x, y] = egClusterPoint(c, idx, structDomainTotals[nd.domain] || 1, rnd, 100);
    }
    pushLayout("structure", nd, x, y);
  });

  const freshCenters = { stale: [260, 395], watch: [515, 395], ok: [770, 395] };
  const freshIndex = {};
  nodes.forEach((nd) => {
    const idx = freshIndex[nd.fresh] || 0; freshIndex[nd.fresh] = idx + 1;
    const [x, y] = egClusterPoint(freshCenters[nd.fresh], idx, nodes.filter((n) => n.fresh === nd.fresh).length, rnd, 138);
    pushLayout("freshness", nd, x, y);
  });

  const completenessBucket = (n) => (n.completeness >= 92 ? "complete" : n.completeness >= 82 ? "partial" : "missing");
  const compCenters = { missing: [275, 398], partial: [515, 398], complete: [760, 398] };
  const compIndex = {};
  nodes.forEach((nd) => {
    const bucket = completenessBucket(nd);
    const idx = compIndex[bucket] || 0; compIndex[bucket] = idx + 1;
    const [x, y] = egClusterPoint(compCenters[bucket], idx, nodes.filter((n) => completenessBucket(n) === bucket).length, rnd, 132);
    pushLayout("completeness", nd, x, y);
  });

  const ownerIndex = {};
  nodes.forEach((nd) => {
    const center = EG_OWNER_CENTERS[nd.steward] || [cx, cy];
    const idx = ownerIndex[nd.steward] || 0; ownerIndex[nd.steward] = idx + 1;
    const [x, y] = egClusterPoint(center, idx, nodes.filter((n) => n.steward === nd.steward).length, rnd, 92);
    pushLayout("governance", nd, x, y);
  });

  const trustCenters = { trusted: [250, 385], monitor: [520, 385], blocked: [760, 385] };
  const trustIndex = {};
  nodes.forEach((nd) => {
    const trust = nd.trust || "trusted";
    const idx = trustIndex[trust] || 0; trustIndex[trust] = idx + 1;
    const decisionPull = nd.cat === "decision" ? [880, 390] : trustCenters[trust];
    const [x, y] = egClusterPoint(decisionPull, idx, nodes.filter((n) => (n.trust || "trusted") === trust).length, rnd, nd.cat === "decision" ? 54 : 128);
    pushLayout("aitrust", nd, x, y);
  });

  const boundsByMode = {};
  Object.entries(layouts).forEach(([key, map]) => {
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    nodes.forEach((n) => {
      const p = map[n.id];
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    });
    boundsByMode[key] = { minX: minX - 80, maxX: maxX + 80, minY: minY - 80, maxY: maxY + 80 };
  });

  return { nodes, edges, byId, adjOut, adjIn, edgeRefs, downStale, layouts, boundsByMode };
}

const EG_MODES = [
  { id: "structure", label: "Structure", icon: GitBranch },
  { id: "freshness", label: "Freshness", icon: Activity },
  { id: "completeness", label: "Completeness", icon: Database },
  { id: "aitrust", label: "AI Trust", icon: Cpu },
];

function EnterpriseGraph({ onOpenPacket }: { onOpenPacket?: (label: string) => void }) {
  const gRef = useRef(null);
  if (!gRef.current) gRef.current = buildEnterpriseGraph();
  const G = gRef.current;

  const [mode, setMode] = useState("structure");
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const [simNode, setSimNode] = useState(null);
  const [trace, setTrace] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clusterView, setClusterView] = useState(false);

  useEffect(() => {
    if (!EG_MODES.some((md) => md.id === mode)) setMode("structure");
  }, [mode]);

  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const tfRef = useRef({ scale: 1, tx: 0, ty: 0 });
  const dragRef = useRef(null);
  const sizeRef = useRef({ w: 800, h: 580, dpr: 1 });
  const modeRef = useRef(mode), clusterRef = useRef(clusterView), simRef = useRef(simNode), traceRef = useRef(trace), hlRef = useRef(new Set()), simDownRef = useRef({});
  modeRef.current = mode; clusterRef.current = clusterView; simRef.current = simNode; traceRef.current = trace;

  const trustOf = useCallback((nd) => (nd.fresh === "stale" ? "blocked" : G.downStale[nd.id] ? "monitor" : "trusted"), [G]);

  // highlight set on select/hover
  useEffect(() => {
    const set = new Set();
    const focus = selected != null ? selected : hover;
    if (focus != null && simNode == null) {
      set.add(focus);
      Object.keys(egBfs(focus, G.adjOut)).forEach((k) => set.add(+k));
      (G.adjIn[focus] || []).forEach((u) => set.add(u));
    }
    hlRef.current = set;
  }, [selected, hover, simNode, G]);

  // sim downstream
  useEffect(() => {
    if (simNode == null) { simDownRef.current = {}; return; }
    const d = egBfs(simNode, G.adjOut); const m = {};
    Object.keys(d).forEach((k) => { if (+k !== simNode) m[k] = d[k]; });
    simDownRef.current = m;
  }, [simNode, G]);

  const fitView = useCallback(() => {
    const { w, h } = sizeRef.current;
    const layoutKey = clusterRef.current ? modeRef.current : "default";
    const b = G.boundsByMode[layoutKey] || G.boundsByMode.default || G.boundsByMode.structure;
    const gw = b.maxX - b.minX, gh = b.maxY - b.minY;
    const scale = Math.min(w / gw, h / gh) * 0.98;
    tfRef.current = { scale, tx: w / 2 - ((b.minX + b.maxX) / 2) * scale, ty: h / 2 - ((b.minY + b.maxY) / 2) * scale };
  }, [G]);

  useEffect(() => {
    fitView();
  }, [mode, clusterView, fitView]);

  const zoomGraph = useCallback((factor) => {
    const { w, h } = sizeRef.current;
    const tf = tfRef.current;
    const mx = w / 2, my = h / 2;
    const ns = Math.max(0.4, Math.min(3.2, tf.scale * factor));
    tf.tx = mx - ((mx - tf.tx) / tf.scale) * ns;
    tf.ty = my - ((my - tf.ty) / tf.scale) * ns;
    tf.scale = ns;
  }, []);

  // resize
  useEffect(() => {
    const resize = () => {
      const el = wrapRef.current; if (!el) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = el.clientWidth, h = 580;
      sizeRef.current = { w, h, dpr };
      const cv = canvasRef.current;
      if (cv) { cv.width = w * dpr; cv.height = h * dpr; cv.style.width = w + "px"; cv.style.height = h + "px"; }
      fitView();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [fitView]);

  // wheel zoom (non-passive)
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const tf = tfRef.current;
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      const ns = Math.max(0.4, Math.min(3.2, tf.scale * factor));
      tf.tx = mx - ((mx - tf.tx) / tf.scale) * ns;
      tf.ty = my - ((my - tf.ty) / tf.scale) * ns;
      tf.scale = ns;
    };
    cv.addEventListener("wheel", onWheel, { passive: false });
    return () => cv.removeEventListener("wheel", onWheel);
  }, []);

  const hitTest = (mx, my) => {
    const tf = tfRef.current;
    const wx = (mx - tf.tx) / tf.scale, wy = (my - tf.ty) / tf.scale;
    let best = null, bd = 1e9;
    for (const nd of G.nodes) {
      const dx = nd._px - wx, dy = nd._py - wy, d = dx * dx + dy * dy;
      const rr = (nd.r + 6) * (nd.r + 6);
      if (d < rr && d < bd) { bd = d; best = nd.id; }
    }
    return best;
  };

  const onDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    dragRef.current = { x: e.clientX, y: e.clientY, sx: e.clientX - rect.left, sy: e.clientY - rect.top, tx: tfRef.current.tx, ty: tfRef.current.ty, moved: false };
  };
  const onMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const dr = dragRef.current;
    if (dr) {
      const dx = e.clientX - dr.x, dy = e.clientY - dr.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) dr.moved = true;
      if (dr.moved) { tfRef.current.tx = dr.tx + dx; tfRef.current.ty = dr.ty + dy; }
    } else {
      const h = hitTest(mx, my);
      setHover((prev) => (prev === h ? prev : h));
    }
  };
  const onUp = (e) => {
    const dr = dragRef.current; dragRef.current = null;
    if (dr && !dr.moved) {
      const id = hitTest(dr.sx, dr.sy);
      setSelected(id); setTrace(null);
    }
  };

  // draw loop
  useEffect(() => {
    let raf;
    const draw = () => {
      const cv = canvasRef.current; if (!cv) { raf = requestAnimationFrame(draw); return; }
      const ctx = cv.getContext("2d");
      const { w, h, dpr } = sizeRef.current; const tf = tfRef.current;
      const t = performance.now();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      const bg = ctx.createLinearGradient(0, 0, cv.width, cv.height);
      bg.addColorStop(0, "#181123");
      bg.addColorStop(0.44, "#08070D");
      bg.addColorStop(1, "#120A1F");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, cv.width, cv.height);
      const aura = ctx.createRadialGradient(cv.width * 0.5, cv.height * 0.38, 0, cv.width * 0.5, cv.height * 0.38, cv.width * 0.62);
      aura.addColorStop(0, "rgba(161,0,255,0.18)");
      aura.addColorStop(0.42, "rgba(117,0,192,0.08)");
      aura.addColorStop(1, "rgba(10,10,15,0)");
      ctx.fillStyle = aura; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 42) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 42) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();
      ctx.translate(tf.tx, tf.ty); ctx.scale(tf.scale, tf.scale);

      const m = modeRef.current, clustered = clusterRef.current, sim = simRef.current, tr = traceRef.current, hl = hlRef.current, simDown = simDownRef.current;
      const focusActive = hl.size > 0;
      const traceSet = tr ? new Set(tr.path) : null;
      const traceEdges = tr ? new Set(tr.path.slice(0, -1).map((n, i) => `${n}-${tr.path[i + 1]}`)) : null;
      const traceProg = tr ? (t - tr.start) / 280 : 0;

      // drift positions
      const layout = clustered ? (G.layouts[m] || G.layouts.structure) : G.layouts.default;
      for (const nd of G.nodes) {
        const p = layout[nd.id] || { x: nd.x, y: nd.y };
        nd.x += (p.x - nd.x) * 0.08;
        nd.y += (p.y - nd.y) * 0.08;
        nd._px = nd.x + Math.sin(t * 0.0004 + nd.phase) * (m === "freshness" && nd.fresh === "stale" ? 1.1 : 2.2);
        nd._py = nd.y + Math.cos(t * 0.00045 + nd.phase) * (m === "freshness" && nd.fresh === "stale" ? 1.1 : 2.2);
      }

      const drawLensCluster = (label, cx0, cy0, r, color, sub) => {
        ctx.save();
        const g = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, r);
        g.addColorStop(0, `${color}22`);
        g.addColorStop(1, `${color}03`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx0, cy0, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `${color}3B`; ctx.lineWidth = 1.2; ctx.setLineDash([7, 8]);
        ctx.beginPath(); ctx.arc(cx0, cy0, r, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "800 13px Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.fillText(label, cx0, cy0 - r - 14);
        if (sub) {
          ctx.font = "600 10.5px Inter, sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.56)";
          ctx.fillText(sub, cx0, cy0 - r + 2);
        }
        ctx.restore();
      };
      if (clustered && m === "structure") {
        Object.entries(EG_STRUCT_CENTERS).forEach(([label, [cx0, cy0]]) => drawLensCluster(label, cx0, cy0, 100, EG_DOMAIN_COLORS[label], "signal community"));
        drawLensCluster("Decision Layer", EG_STRUCT_DECISION[0], EG_STRUCT_DECISION[1], 118, "#C026D3", "packets · report · scenario");
      } else if (clustered && m === "governance") {
        Object.entries(EG_OWNER_CENTERS).forEach(([label, [cx0, cy0]]) => drawLensCluster(label, cx0, cy0, label === "Operations" ? 118 : 96, EG_STEWARD_COLORS[label] || C.soft, "owner accountability"));
      } else if (clustered && m === "freshness") {
        [["Stale", 260, C.red, "Last updated 6d"], ["Watch", 515, C.amber, "Refresh window"], ["Current", 770, C.green, "Updated recently"]].forEach(([label, cx0, color, sub]) => drawLensCluster(label, cx0, 395, 145, color, sub));
      } else if (clustered && m === "completeness") {
        [["Missing", 275, C.red, "dashed relationships"], ["Partial", 515, C.amber, "needs evidence"], ["Complete", 760, C.green, "ready for AI use"]].forEach(([label, cx0, color, sub]) => drawLensCluster(label, cx0, 398, 142, color, sub));
      } else if (clustered && m === "aitrust") {
        [["Trusted", 250, C.green, "green propagation"], ["Monitoring", 520, C.soft, "neutral review"], ["Blocked", 760, C.red, "trust stops here"], ["Decision Packets", 880, C.core, "release gate"]].forEach(([label, cx0, color, sub]) => drawLensCluster(label, cx0, 385, label === "Decision Packets" ? 78 : 138, color, sub));
      }

      const colorFor = (nd) => {
        if (sim != null) { if (nd.id === sim) return C.red; if (simDown[nd.id]) return "#D85A30"; return "#33333d"; }
        if (m === "freshness") return nd.fresh === "stale" ? C.red : nd.fresh === "watch" || G.downStale[nd.id] ? C.amber : C.green;
        if (m === "completeness") return nd.completeness < 80 ? C.red : nd.completeness < 92 ? C.amber : C.green;
        if (m === "governance") return EG_STEWARD_COLORS[nd.steward] || C.soft;
        if (m === "aitrust") { const tt = trustOf(nd); return tt === "blocked" ? C.red : tt === "monitor" ? C.amber : C.green; }
        return EG_CATS[nd.cat].color;
      };

      const shouldShowEdges = selected != null || !!tr || sim != null;
      for (const [a, b, meta] of G.edgeRefs) {
        if (!shouldShowEdges) continue;
        const key = `${a.id}-${b.id}`, key2 = `${b.id}-${a.id}`;
        let col = "rgba(198,174,255,0.065)", lw = 0.65;
        const inHl = focusActive && hl.has(a.id) && hl.has(b.id);
        const inTrace = traceEdges && (traceEdges.has(key) || traceEdges.has(key2));
        const inSim = sim != null && (simDown[a.id] || a.id === sim) && (simDown[b.id] || b.id === sim);
        if (sim != null && !inSim) continue;
        if (tr && !inTrace) continue;
        if (selected != null && !tr && sim == null && !inHl) continue;
        const isMissing = m === "completeness" && meta?.missing;
        const isIntra = m === "structure" && a.domain === b.domain;
        if (m === "aitrust") {
          const wa = trustOf(a), wb = trustOf(b);
          const worst = [wa, wb].includes("blocked") ? "blocked" : [wa, wb].includes("monitor") ? "monitor" : "trusted";
          col = worst === "blocked" ? "rgba(196,49,75,0.5)" : worst === "monitor" ? "rgba(184,110,0,0.4)" : "rgba(30,113,69,0.4)"; lw = 0.8;
          if (wa === "blocked") { col = "rgba(196,49,75,0.16)"; lw = 0.45; }
        }
        if (isIntra) { col = `${EG_DOMAIN_COLORS[a.domain]}55`; lw = 1.25; }
        if (clustered && isMissing) {
          col = "rgba(255,255,255,0.34)";
          lw = 1.05;
        }
        if (inSim) { col = "rgba(216,90,48,0.6)"; lw = 1.4; }
        if (inHl) { col = "rgba(177,116,255,0.65)"; lw = 1.45; }
        if (inTrace) { col = "rgba(216,188,255,0.92)"; lw = 2.1; }
        ctx.strokeStyle = col; ctx.lineWidth = lw;
        ctx.setLineDash(isMissing ? [6, 6] : []);
        ctx.beginPath(); ctx.moveTo(a._px, a._py); ctx.lineTo(b._px, b._py); ctx.stroke();
        ctx.setLineDash([]);
      }
      // trace moving pulse
      if (tr) {
        for (let i = 0; i < tr.path.length - 1; i++) {
          if (traceProg < i) break;
          const a = G.byId[tr.path[i]], b = G.byId[tr.path[i + 1]];
          const p = Math.min(1, ((t - tr.start) / 1000 + (1 - i * 0.12)) % 1);
          const px = a._px + (b._px - a._px) * p, py = a._py + (b._py - a._py) * p;
          ctx.beginPath(); ctx.arc(px, py, 3.2, 0, 7); ctx.fillStyle = "#fff"; ctx.fill();
        }
      }
      // nodes
      for (const nd of G.nodes) {
        const col = colorFor(nd);
        let r = nd.r;
        if (m === "freshness") r = nd.fresh === "stale" ? nd.r * 0.78 : nd.fresh === "watch" ? nd.r * 0.94 : nd.r * 1.05;
        if (m === "completeness") r = (nd.cat === "evar" ? 18 : nd.cat === "decision" ? 10 : 5.2) * (0.42 + nd.completeness / 100);
        if (m === "aitrust" && trustOf(nd) === "trusted") r = nd.r * 1.08;
        if (m === "aitrust" && trustOf(nd) === "blocked") r = nd.r * 0.95;
        const dim = (focusActive && !hl.has(nd.id)) || (traceSet && !traceSet.has(nd.id) && tr) ? 0.22 : 1;
        // glow
        const high = (focusActive && hl.has(nd.id)) || (traceSet && traceSet.has(nd.id)) || nd.id === sim || simDown[nd.id] || nd.isHero || nd.cat === "evar" || nd.cat === "decision";
        const trustState = m === "aitrust" ? trustOf(nd) : null;
        if (high || (m === "freshness" && nd.fresh === "stale") || trustState === "trusted" || trustState === "blocked") {
          const pulse = nd.id === sim || simDown[nd.id] ? 0.25 + 0.15 * Math.sin(t * 0.005)
            : m === "freshness" && nd.fresh === "stale" ? 0.2 + 0.13 * Math.sin(t * 0.0016 + nd.phase)
              : trustState === "blocked" ? 0.24 + 0.18 * Math.sin(t * 0.004 + nd.phase)
                : trustState === "trusted" ? 0.18 + 0.08 * Math.sin(t * 0.002 + nd.phase)
                  : nd.cat === "evar" ? 0.28 + 0.11 * Math.sin(t * 0.003) : 0.2;
          ctx.globalAlpha = pulse * dim;
          ctx.beginPath(); ctx.arc(nd._px, nd._py, r + 9 + (nd.cat === "evar" ? 11 : 4), 0, 7); ctx.fillStyle = col; ctx.fill();
        }
        ctx.globalAlpha = dim;
        ctx.beginPath(); ctx.arc(nd._px, nd._py, r, 0, 7);
        ctx.fillStyle = col; ctx.fill();
        ctx.lineWidth = trustState === "blocked" ? 2.3 + Math.max(0, Math.sin(t * 0.005 + nd.phase)) * 1.2 : nd.id === selected ? 2.4 : 1;
        ctx.strokeStyle = trustState === "blocked" ? C.red : nd.id === selected ? "#F5ECFF" : trustState === "monitor" ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.58)";
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // labels (hero + selected + hover) when zoomed enough
      ctx.globalAlpha = 1;
      for (const nd of G.nodes) {
        const showLabel = nd.cat === "evar" || nd.cat === "decision" || nd.id === selected || nd.id === hover || (nd.isHero && tf.scale > 0.7) || (m === "freshness" && nd.fresh === "stale" && tf.scale > 0.58);
        if (!showLabel) continue;
        const dim = (focusActive && !hl.has(nd.id)) ? 0.3 : 1;
        ctx.globalAlpha = dim;
        ctx.font = `${nd.cat === "evar" ? 600 : 500} ${nd.cat === "evar" ? 12 : 10.5}px Inter, sans-serif`;
        ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.textAlign = "center";
        ctx.fillText(nd.label, nd._px, nd._py + nd.r + 12);
        if (m === "freshness" && nd.fresh === "stale") {
          ctx.font = "700 9.5px Inter, sans-serif";
          ctx.fillStyle = "rgba(255,160,172,0.94)";
          ctx.fillText(nd.lastUpdated, nd._px, nd._py + nd.r + 24);
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [G, selected, hover, trustOf]);

  // KPI degrade under simulation
  const baseStale = 1;
  const simCritical = simNode != null && ["external", "supplier", "contract", "logistics", "finance", "inventory"].includes(G.byId[simNode]?.cat);
  const readiness = simNode == null ? 92 : simCritical ? 61 : 84;
  const staleCount = simNode == null ? baseStale : baseStale + 1;
  const graphVal = simNode == null ? 89 : simCritical ? 71 : 84;
  const trustStatus = simNode == null ? "Pre-alert" : simCritical ? "Suspended" : "Pre-alert";
  const trustTone = trustStatus === "Suspended" ? "red" : "amber";

  const selNode = selected != null ? G.byId[selected] : null;
  const selDown = selNode ? egBfs(selNode.id, G.adjOut) : {};
  const selDownCount = Object.keys(selDown).length - 1;
  const selDecisions = selNode ? Object.keys(selDown).map((k) => G.byId[+k]).filter((n) => n.cat === "decision") : [];
  const selUp = selNode ? (G.adjIn[selNode.id] || []).map((u) => G.byId[u]) : [];
  const evarContribOf = (n) => {
    if (!n) return "—";
    const base = { external: 1.45, supplier: 0.95, contract: 0.4, recipe: 0.35, sku: 0.18, plant: 0.21, inventory: 0.4, logistics: 0.45, customer: 0.16, commercial: 0.25, finance: 0.3, evar: 2.8, decision: 1.6 }[n.cat] || 0.1;
    return `€${(base * (n.isHero ? 1 : 0.4)).toFixed(2)}M`;
  };

  const doTrace = (kind) => {
    if (!selNode) return;
    let path;
    if (kind === "forward") path = egPath(selNode.id, (n) => n.cat === "decision", G.adjOut, G.byId);
    else path = egPath(selNode.id, (n) => n.cat === "external", G.adjIn, G.byId);
    let blockedAt = null;
    if (path && mode === "aitrust") {
      const idx = path.findIndex((id, i) => i > 0 && trustOf(G.byId[id]) === "blocked");
      if (idx > -1) { blockedAt = path[idx]; path = path.slice(0, idx + 1); }
    }
    if (path && path.length > 1) setTrace({ path, kind, blockedAt, start: performance.now() });
  };

  const runSearch = () => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return;
    const hit = G.nodes.find((n) => n.label.toLowerCase().includes(q));
    if (!hit) return;
    setSelected(hit.id);
    setTrace(null);
    const { w, h } = sizeRef.current;
    const targetScale = Math.max(tfRef.current.scale, 1.45);
    tfRef.current = {
      scale: targetScale,
      tx: w / 2 - hit.x * targetScale,
      ty: h / 2 - hit.y * targetScale,
    };
  };

  const legend = {
    structure: Object.entries(EG_DOMAIN_COLORS),
    freshness: [["Current", C.green], ["Watch", C.amber], ["Stale", C.red]],
    completeness: [["Complete (large)", C.green], ["Partial", C.amber], ["Missing (small)", C.red]],
    aitrust: [["Trusted — packets allowed", C.green], ["Monitoring only", C.amber], ["Blocked", C.red]],
  }[mode];

  return (
    <div>
      {/* KPI bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 12 }}>
        {[
          ["Data Readiness Score", `${readiness} / 100`, readiness >= 90 ? "green" : readiness >= 75 ? "amber" : "red"],
          ["Sources connected", `${8 - (simNode != null && simCritical ? 1 : 0)} / 8`, simCritical ? "amber" : "green"],
          ["Stale sources", staleCount, staleCount <= 1 ? "amber" : "red"],
          ["Graph validation", `${graphVal}%`, graphVal >= 85 ? "green" : "amber"],
          ["AI Trust status", trustStatus, trustTone],
        ].map(([l, v, t], i) => (
          <Card key={i} style={{ padding: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.soft, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.3 }}>{l}</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: t === "red" ? C.red : t === "amber" ? C.amber : C.green, letterSpacing: -0.5, ...NUM }}>{v}</div>
          </Card>
        ))}
      </div>

      {/* Mode switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        {EG_MODES.map((md) => {
          const Icon = md.icon;
          return (
            <button key={md.id} onClick={() => { setMode(md.id); }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 15px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${mode === md.id ? C.core : C.line}`, background: mode === md.id ? C.purpBg : C.bg, color: mode === md.id ? C.deep : C.ink }}>
              <Icon size={14} color={mode === md.id ? C.deep : C.soft} /> {md.label}
            </button>
          );
        })}
        <button onClick={() => setClusterView((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 15px", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: FONT, cursor: "pointer", border: `1px solid ${clusterView ? C.core : C.amber}`, background: clusterView ? C.purpBg : "#FFF8EE", color: clusterView ? C.deep : C.amber, boxShadow: clusterView ? "0 0 0 2px rgba(161,0,255,0.10)" : "0 0 0 2px rgba(184,110,0,0.08)" }}>
          <Layers size={14} color={clusterView ? C.deep : C.amber} /> {clusterView ? "Cluster View On" : "Cluster View"}
        </button>
        <div style={{ flex: 1 }} />
        {simNode != null && (
          <button onClick={() => setSimNode(null)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, fontFamily: FONT, cursor: "pointer", border: `1px solid ${C.red}`, background: C.redBg, color: C.red }}>
            <X size={13} /> Exit simulation
          </button>
        )}
        <button onClick={() => { setSelected(null); setTrace(null); fitView(); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: `1px solid ${C.line}`, background: C.bg, color: C.soft }}>
          <GitBranch size={13} /> Reset view
        </button>
      </div>

      {/* Graph canvas + panel */}
      <div ref={wrapRef} style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(161,0,255,0.22)", boxShadow: "0 22px 60px rgba(70,0,115,0.18), inset 0 1px 0 rgba(255,255,255,0.10)" }}>
        <canvas ref={canvasRef} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={() => { dragRef.current = null; setHover(null); }} style={{ display: "block", cursor: dragRef.current ? "grabbing" : hover != null ? "pointer" : "grab" }} />

        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8, alignItems: "center", zIndex: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(17,11,26,0.78)", border: "1px solid rgba(216,188,255,0.16)", borderRadius: 9, padding: "7px 9px", backdropFilter: "blur(10px)", boxShadow: "0 10px 28px rgba(0,0,0,0.22)" }}>
            <Search size={14} color="rgba(255,255,255,0.72)" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search node"
              style={{ width: 180, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 12.5, fontFamily: FONT }}
            />
            <button onClick={runSearch} style={{ background: C.core, color: "#fff", border: "none", borderRadius: 7, padding: "6px 10px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
              Search
            </button>
          </div>
        </div>

        <div style={{ position: "absolute", top: 64, left: 12, zIndex: 4, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 9, border: "1px solid rgba(216,188,255,0.16)", background: "rgba(17,11,26,0.78)", boxShadow: "0 10px 28px rgba(0,0,0,0.26)", backdropFilter: "blur(10px)" }}>
          {[
            [Plus, () => zoomGraph(1.18), "Zoom in"],
            [Minus, () => zoomGraph(0.84), "Zoom out"],
            [Maximize2, () => fitView(), "Fit view"],
            [Layers, () => setMode((m) => (m === "structure" ? "freshness" : m === "freshness" ? "completeness" : m === "completeness" ? "aitrust" : "structure")), "Cycle layer"],
          ].map(([Icon, action, label], i) => (
            <button key={label} title={label} onClick={action} style={{ width: 40, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "#fff", border: "none", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.10)" : "none", cursor: "pointer" }}>
              <Icon size={17} />
            </button>
          ))}
        </div>

        {/* simulation banner */}
        {simNode != null && (
          <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, background: "rgba(196,49,75,0.92)", color: "#fff", fontSize: 12.5 }}>
            <AlertTriangle size={16} />
            <span><b>Simulating failure: {G.byId[simNode].label}.</b> {Object.keys(simDownRef.current).length} downstream nodes affected · Enterprise EVaR and decision availability degraded · AI Trust → {trustStatus}.</span>
          </div>
        )}

        {/* legend */}
        <div style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(17,11,26,0.76)", border: "1px solid rgba(216,188,255,0.14)", borderRadius: 8, padding: "9px 12px", backdropFilter: "blur(10px)", boxShadow: "0 10px 24px rgba(0,0,0,0.22)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{EG_MODES.find((m) => m.id === mode).label}</div>
          {legend.map(([l, c], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 3 }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: c }} /> {l}
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 12, right: 12, fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>
          {G.nodes.length} nodes · {G.edges.length} edges · scroll to zoom · drag to pan
        </div>

        {/* node panel */}
        {selNode && (
          <div style={{ position: "absolute", top: simNode != null ? 60 : 12, right: 12, width: 280, maxHeight: 500, overflowY: "auto", background: "rgba(255,255,255,0.94)", borderRadius: 11, border: "1px solid rgba(161,0,255,0.20)", boxShadow: "0 18px 44px rgba(0,0,0,0.30)", padding: 16, backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{selNode.label}</div>
                <div style={{ fontSize: 11, color: C.soft }}>{EG_CATS[selNode.cat].label}</div>
              </div>
              <button onClick={() => { setSelected(null); setTrace(null); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} color={C.soft} /></button>
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
              <Pill tone={selNode.fresh === "stale" ? "red" : selNode.fresh === "watch" ? "amber" : "green"}>{selNode.fresh === "ok" ? "Current" : selNode.fresh === "watch" ? "Watch" : "Stale"}</Pill>
              <Pill tone={selNode.validation === "validated" ? "green" : "amber"}>{selNode.validation === "validated" ? "Validated" : "Under review"}</Pill>
            </div>
            <div style={{ padding: 11, background: C.faint, borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
              {[
                ["Domain", selNode.domain],
                ["Owner / steward", selNode.steward],
                ["Last update", selNode.lastUpdated],
                ["Completeness", `${selNode.completeness}%`],
                ["AI Trust", trustOf(selNode) === "blocked" ? "Blocked" : trustOf(selNode) === "monitor" ? "Monitoring" : "Trusted"],
                ["Missing evidence", selNode.missingData || "None"],
                ["Downstream dependencies", selDownCount],
                ["Decision packets using", selDecisions.length],
                ["EVaR contribution", evarContribOf(selNode)],
              ].map(([k, v], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, paddingBottom: i < 8 ? 7 : 0, marginBottom: i < 8 ? 7 : 0, borderBottom: i < 8 ? `1px solid ${C.line}` : "none" }}>
                  <span style={{ color: C.soft }}>{k}</span><b style={{ ...NUM, textAlign: "right" }}>{v}</b>
                </div>
              ))}
            </div>
            {selUp.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.soft, textTransform: "uppercase", marginBottom: 6 }}>Connected upstream</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {selUp.slice(0, 5).map((u, i) => <Pill key={i} tone="grey">{u.label}</Pill>)}
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {selNode.cat === "decision" && onOpenPacket && (
                <button onClick={() => onOpenPacket(selNode.label)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: C.core, color: "#fff", border: "none", padding: "9px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                  <ExternalLink size={13} /> Open in Decision Center
                </button>
              )}
              {selNode.cat !== "decision" && selNode.cat !== "evar" && (
                <button onClick={() => doTrace("forward")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: C.deep, color: "#fff", border: "none", padding: "9px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                  <Zap size={13} /> Trace to Decision
                </button>
              )}
              {selNode.cat === "decision" && (
                <button onClick={() => doTrace("back")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: C.deep, color: "#fff", border: "none", padding: "9px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
                  <GitBranch size={13} /> Trace back to source
                </button>
              )}
              {selNode.cat !== "decision" && selNode.cat !== "evar" && (
                <button onClick={() => { setSimNode(simNode === selNode.id ? null : selNode.id); setTrace(null); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: simNode === selNode.id ? C.redBg : C.bg, color: simNode === selNode.id ? C.red : C.ink, border: `1px solid ${simNode === selNode.id ? C.red : C.line}`, padding: "9px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
                  <AlertTriangle size={13} /> {simNode === selNode.id ? "Stop simulation" : "What if this node fails?"}
                </button>
              )}
            </div>
            {trace && trace.path[0] === selNode.id && (
              <div style={{ marginTop: 10, padding: 10, background: C.purpBg, borderRadius: 8, fontSize: 11, color: C.deep, lineHeight: 1.6 }}>
                <b>{trace.kind === "forward" ? "Traced to decision:" : "Traced to source:"}</b><br />
                {(trace.kind === "back" ? trace.path.slice().reverse() : trace.path).map((id) => G.byId[id].label).join("  →  ")}
                {trace.blockedAt != null && (
                  <div style={{ marginTop: 7, color: C.red, fontWeight: 800 }}>
                    Trust propagation stopped at {G.byId[trace.blockedAt].label}.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* idle hint */}
        {!selNode && (
          <div style={{ position: "absolute", top: simNode != null ? 60 : 12, right: 12, width: 230, background: "rgba(17,11,26,0.76)", border: "1px solid rgba(216,188,255,0.14)", borderRadius: 9, padding: "12px 14px", backdropFilter: "blur(10px)", boxShadow: "0 10px 28px rgba(0,0,0,0.24)" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff", marginBottom: 5 }}>Enterprise Knowledge Graph</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>The living map of every signal, asset and decision. Click any node to inspect it, trace its path to a Decision Packet, or simulate its failure.</div>
          </div>
        )}
      </div>
      <div style={{ fontSize: 11.5, color: C.soft, marginTop: 10, lineHeight: 1.55 }}>
        One living graph, five operational lenses. Default view keeps the natural knowledge map; turn on Cluster View to reorganize nodes into domain communities, freshness lanes, completeness gaps, governance ownership, or AI trust propagation paths.
      </div>
    </div>
  );
}

function GovernanceDashboard({ sEvar, sEes, portfolio, activeScenarioName, activeSignalCount, selectedActions }) {
  const [radarReady, setRadarReady] = useState(false);
  const [baseSummaryOpen, setBaseSummaryOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRadarReady(true), 300); return () => clearTimeout(t); }, []);

  /* ── Radar chart data ── */
  const N = 6;
  const CX = 260, CY = 180, R = 126;
  const angle = (i) => (i * 2 * Math.PI / N) - Math.PI / 2;
  const pt = (i, r) => [CX + r * Math.cos(angle(i)), CY + r * Math.sin(angle(i))];
  const poly = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  /* before/after performance scores (0–100) per axis */
  const axes = [
    { label: "EVaR Control",      before: 22, after: 78, color: C.green,  sub: "−57%" },
    { label: "Decision Speed",    before: 10, after: 95, color: C.green,  sub: "~−95%" },
    { label: "S&OP Efficiency",   before: 38, after: 82, color: C.deep,   sub: "−69%" },
    { label: "Cost Management",   before: 42, after: 80, color: C.amber,  sub: "−60%" },
    { label: "Governance",        before: 0,  after: 100, color: C.core,  sub: "100%" },
    { label: "AI Coverage",       before: 0,  after: 82, color: C.deep,   sub: "82%" },
  ];
  const beforePts = axes.map((a, i) => pt(i, (a.before / 100) * R));
  const afterPts  = axes.map((a, i) => pt(i, (a.after  / 100) * R));

  /* ── Compact KPI rows ── */
  const metrics = [
    { label: "Decision Cycle Time", icon: Clock, before: "4–7 days", after: "<4 hours", delta: "~−95%", bar: 95 },
    { label: "Planning Effort", icon: Users, before: "130 h / cycle", after: "40 h / cycle", delta: "−69%", bar: 69 },
    { label: "Scenario Analysis Capability", icon: LayoutGrid, before: "0–1 scenarios", after: "10,000+ simulations", delta: "10,000x+", bar: 100 },
    { label: "Emergency Procurement", icon: ShoppingCart, before: "Baseline (100%)", after: "−60% frequency", delta: "−60%", bar: 60 },
    { label: "Enterprise EVaR", icon: ShieldCheck, before: "€2.80M", after: "€1.20M", delta: "−57%", bar: 57 },
    { label: "Decision Documentation", icon: FileCheck2, before: "Manual / fragmented", after: "100% audit trail", delta: "100%", bar: 100 },
  ];

  const economicScenarios = [
    {
      title: "Conservative Scenario", subtitle: "Lower realization of benefits", badge: "40% realization",
      annual: "€1.0M", payback: "~14 months", npv: "€2.7M", residual: "€1.68M",
      tone: C.core, bg: "linear-gradient(180deg,rgba(161,0,255,0.08),#fff 32%)", icon: ShieldCheck,
      evar: "18,82 86,94 154,115 222,136 290,143 358,146",
      value: "18,154 86,149 154,132 222,102 290,75 358,57",
      valueArea: "18,154 86,149 154,132 222,102 290,75 358,57 358,154 18,154",
    },
    {
      title: "Base Case", subtitle: "Expected realization of benefits", badge: "50% realization",
      annual: "€1.71M", payback: "8–9 months", npv: "€5.1M", residual: "€1.20M",
      tone: C.green, bg: "linear-gradient(180deg,rgba(30,113,69,0.08),#fff 32%)", icon: Target,
      evar: "18,82 86,94 154,126 222,145 290,154 358,158",
      value: "18,154 86,145 154,112 222,80 290,58 358,46",
      valueArea: "18,154 86,145 154,112 222,80 290,58 358,46 358,154 18,154",
    },
    {
      title: "Optimistic Scenario", subtitle: "Higher realization of benefits", badge: "60% realization",
      annual: "€2.50M", payback: "< 6 months", npv: "€8M+", residual: "€0.95M",
      tone: "#E8890C", bg: "linear-gradient(180deg,rgba(232,137,12,0.09),#fff 32%)", icon: Rocket,
      evar: "18,82 86,96 154,132 222,148 290,157 358,162",
      value: "18,154 86,141 154,101 222,61 290,39 358,31",
      valueArea: "18,154 86,141 154,101 222,61 290,39 358,31 358,154 18,154",
    },
  ];

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(330px,0.96fr)", gap: 12, alignItems: "stretch" }}>

        {/* Radar diagram */}
        <div style={{ borderRadius: 16, background: "linear-gradient(135deg,#0E061F 0%,#180840 55%,#230A50 100%)", border: "1px solid rgba(161,0,255,0.28)", boxShadow: "0 18px 50px rgba(70,0,115,0.28)", padding: "12px 12px 8px", display: "flex", flexDirection: "column", minHeight: 500 }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: 1.4, textTransform: "uppercase" }}>System Performance Diagram</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 0 }}>Before → After FactoryMind</div>
          <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
          <svg viewBox="0 0 520 330" style={{ width: "100%", display: "block" }}>
            {/* Grid rings at 25 / 50 / 75 / 100 % */}
            {[25, 50, 75, 100].map((p) => (
              <polygon key={p} points={poly(axes.map((_, i) => pt(i, (p / 100) * R)))}
                fill={p === 100 ? "rgba(161,0,255,0.04)" : "none"}
                stroke={p === 100 ? "rgba(161,0,255,0.30)" : "rgba(255,255,255,0.07)"}
                strokeWidth={p === 100 ? 1.4 : 0.9}
                strokeDasharray={p === 100 ? "none" : "3 5"}
              />
            ))}
            {/* % ring labels on top axis */}
            {[25, 50, 75].map((p) => {
              const [x, y] = pt(0, (p / 100) * R);
              return <text key={p} x={x + 4} y={y + 1} fontSize="7" fill="rgba(255,255,255,0.28)" fontFamily={FONT} fontWeight="700">{p}%</text>;
            })}
            {/* Axis spokes */}
            {axes.map((_, i) => {
              const [ex, ey] = pt(i, R);
              return <line key={i} x1={CX} y1={CY} x2={ex} y2={ey} stroke="rgba(255,255,255,0.10)" strokeWidth="1" />;
            })}
            {/* Before polygon */}
            <polygon points={poly(beforePts)}
              fill="rgba(255,255,255,0.04)"
              stroke="rgba(255,255,255,0.30)"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              style={{ transition: "opacity .6s" }}
            />
            {/* After polygon — animates in */}
            <polygon points={poly(afterPts)}
              fill="rgba(161,0,255,0.16)"
              stroke={C.core}
              strokeWidth="2.2"
              style={{ opacity: radarReady ? 1 : 0, transition: "opacity 0.9s ease 0.1s" }}
            />
            {/* After: colored vertex dots */}
            {afterPts.map(([x, y], i) => (
              <g key={i} style={{ opacity: radarReady ? 1 : 0, transition: `opacity 0.4s ease ${0.15 + i * 0.07}s` }}>
                <circle cx={x} cy={y} r="7" fill={axes[i].color} opacity="0.22" />
                <circle cx={x} cy={y} r="4" fill={axes[i].color} />
              </g>
            ))}
            {/* Before: small grey vertex dots */}
            {beforePts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(255,255,255,0.45)" />
            ))}
            {/* Axis labels */}
            {axes.map((a, i) => {
              const [x, y] = pt(i, R + 38);
              const anchor = i === 0 || i === 3 ? "middle" : x < CX ? "end" : "start";
              const dy = i === 0 ? -8 : i === 3 ? 10 : 2;
              return (
                <g key={i}>
                    <text x={x} y={y + dy} textAnchor={anchor} fontSize="7.5" fontWeight="800" fill="rgba(255,255,255,0.78)" fontFamily={FONT}>{a.label}</text>
                    <text x={x} y={y + dy + 9} textAnchor={anchor} fontSize="6.8" fontWeight="700" fill={a.color} fontFamily={FONT}>{a.sub}</text>
                  </g>
                );
              })}
            {/* Center badge */}
            <circle cx={CX} cy={CY} r="18" fill="rgba(161,0,255,0.28)" stroke={C.core} strokeWidth="1.5" />
            <text x={CX} y={CY - 2} textAnchor="middle" fontSize="7.8" fontWeight="900" fill="#fff" fontFamily={FONT}>FM</text>
            <text x={CX} y={CY + 7} textAnchor="middle" fontSize="6.8" fontWeight="700" fill="rgba(255,255,255,0.55)" fontFamily={FONT}>IMPACT</text>
          </svg>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 0 }}>
            {[["rgba(255,255,255,0.35)", "5 5", "Baseline"], [C.core, "none", "With FactoryMind"]].map(([stroke, dash, lbl]) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>
                <svg width="22" height="8" viewBox="0 0 22 8">
                  <line x1="0" y1="4" x2="22" y2="4" stroke={stroke} strokeWidth="2" strokeDasharray={dash} />
                </svg>
                {lbl}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateRows: "0.84fr 1.06fr", minHeight: 500 }}>
          <div style={{ padding: "12px 14px", borderRadius: 16, background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 8px 24px rgba(10,10,15,0.04)", height: "100%" }}>
            <SectionLabel icon={Cpu} style={{ marginBottom: 8 }}>AI Operations</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {[
                { label: "AI Decision Coverage", value: "82%", sub: "risk domains covered", tone: C.core },
                { label: "Active Agents", value: "6", sub: "specialist agents", tone: C.deep },
                { label: "Avg Confidence", value: "91%", sub: "recommendation score", tone: C.green },
                { label: "Live Signals", value: "24", sub: "data streams monitored", tone: C.amber },
              ].map(({ label, value, sub, tone }) => (
                <div key={label} style={{ padding: "9px 10px", borderRadius: 12, background: "#F7F9FF", border: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: C.soft, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 5 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: tone, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 9.5, color: C.soft, marginTop: 3 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "12px 14px", borderRadius: 16, background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 8px 24px rgba(10,10,15,0.04)", height: "100%" }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: C.soft, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 2 }}>KPI Uplift</div>
            <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.85fr 1.05fr 1fr", gap: 10, alignItems: "center", padding: "7px 0 9px", borderBottom: `1px solid ${C.line}`, fontSize: 9.5, fontWeight: 900, color: C.ink }}>
              <div>KPI</div>
              <div>AS-IS (Baseline)</div>
              <div>TO-BE (With FactoryMind)</div>
              <div>Improvement</div>
            </div>
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} style={{ display: "grid", gridTemplateColumns: "1.35fr 0.85fr 1.05fr 1fr", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <Icon size={14} color={C.core} style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: 10.8, fontWeight: 800, color: C.ink, overflow: "hidden", textOverflow: "ellipsis" }}>{m.label}</div>
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 750, color: C.soft, ...NUM }}>{m.before}</div>
                  <div style={{ fontSize: 10.8, fontWeight: 900, color: C.core, ...NUM }}>{m.after}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "48px 1fr", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 900, color: C.green, ...NUM }}>{m.delta}</div>
                    <div style={{ height: 6, borderRadius: 999, background: "#EEEFF4", overflow: "hidden" }}>
                      <div style={{ width: `${m.bar}%`, height: "100%", background: `linear-gradient(90deg,${C.green}BB,${C.green})`, borderRadius: 999, transition: "width 1s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== INTELLIGENCE ROI ===== */}
      <div style={{ marginTop: 14, borderRadius: 18, background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 10px 32px rgba(10,10,15,0.05)", padding: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(161,0,255,0.10)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <TrendingUp size={22} color={C.core} />
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 900, color: C.ink, letterSpacing: 0.4, textTransform: "uppercase" }}>Intelligence ROI</div>
              <div style={{ fontSize: 13, color: C.soft, marginTop: 1 }}>From signals to business impact</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.line}`, color: C.ink, fontSize: 12.5, fontWeight: 700 }}>
            <Calendar size={14} color={C.soft} /> Last 30 days <ChevronDown size={14} color={C.soft} />
          </div>
        </div>

        {/* KPI flow row */}
        <div style={{ position: "relative" }}>
          {/* connector line + arrows (aligned on one axis) */}
          <div style={{ position: "absolute", top: 156, left: "9%", right: "9%", borderTop: `2px dashed ${C.line}`, zIndex: 0 }} />
          <div style={{ position: "absolute", top: 156, left: 0, right: 0, transform: "translateY(-50%)", display: "flex", alignItems: "center", zIndex: 3, pointerEvents: "none" }}>
            {[0, 1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <span style={{ flex: 1 }} />
                <span style={{ width: 30, height: 30, borderRadius: 99, background: "#fff", border: `1px solid ${C.line}`, display: "grid", placeItems: "center", boxShadow: "0 2px 7px rgba(10,10,15,0.10)" }}>
                  <ChevronRight size={15} color={C.core} />
                </span>
              </React.Fragment>
            ))}
            <span style={{ flex: 1 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, position: "relative", zIndex: 2 }}>
            {/* SIGNALS */}
            <div style={{ borderRadius: 14, border: `1px solid ${C.line}`, background: "linear-gradient(180deg,#FBF7FF,#fff)", padding: 16, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 99, background: "rgba(161,0,255,0.10)", display: "grid", placeItems: "center", marginBottom: 10 }}><Satellite size={20} color={C.core} /></div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, letterSpacing: 0.8 }}>SIGNALS</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.core, ...NUM, lineHeight: 1.1, marginTop: 4 }}>8M</div>
              <div style={{ fontSize: 12, color: C.soft, marginBottom: 12 }}>Events processed</div>
              <svg viewBox="0 0 100 34" style={{ width: "100%", height: 40, marginBottom: 12 }} preserveAspectRatio="none">
                <polyline points="0,30 12,22 24,26 36,16 48,20 60,11 72,15 84,7 100,3" fill="none" stroke={C.core} strokeWidth="2" />
              </svg>
              <div style={{ width: "100%", background: "#F7F5FB", borderRadius: 9, padding: "9px 11px", display: "grid", gap: 6 }}>
                {[["8", "Data sources"], ["24", "Data streams"], ["98%", "Data quality"]].map(([n, l]) => (
                  <div key={l} style={{ display: "flex", gap: 9, alignItems: "baseline" }}><span style={{ fontSize: 12, fontWeight: 900, color: C.deep, ...NUM, minWidth: 30, textAlign: "left" }}>{n}</span><span style={{ fontSize: 11, color: C.soft }}>{l}</span></div>
                ))}
              </div>
            </div>

            {/* SCENARIO ANALYSIS */}
            <div style={{ borderRadius: 14, border: `1px solid ${C.line}`, background: "linear-gradient(180deg,#F5F8FF,#fff)", padding: 16, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 99, background: "rgba(47,107,255,0.10)", display: "grid", placeItems: "center", marginBottom: 10 }}><TrendingUp size={20} color="#2F6BFF" /></div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, letterSpacing: 0.8 }}>SCENARIO ANALYSIS</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#2F6BFF", ...NUM, lineHeight: 1.1, marginTop: 4 }}>10,000</div>
              <div style={{ fontSize: 12, color: C.soft, marginBottom: 12 }}>Simulations executed</div>
              <div style={{ width: "100%", background: "#EEF3FF", borderRadius: 9, padding: "9px 11px", marginBottom: 11, display: "flex", alignItems: "center", gap: 9 }}>
                <Clock size={16} color="#2F6BFF" style={{ flexShrink: 0 }} />
                <div style={{ textAlign: "left" }}><div style={{ fontSize: 13, fontWeight: 900, color: C.ink }}>≈20x faster</div><div style={{ fontSize: 10.5, color: C.soft }}>vs. manual process</div></div>
              </div>
              <svg viewBox="0 0 100 34" style={{ width: "100%", height: 38, marginBottom: 8 }} preserveAspectRatio="none">
                {[10, 13, 15, 19, 22, 27, 33].map((h, i) => (<rect key={i} x={i * 14 + 2} y={34 - h} width="9" height={h} rx="2" fill="#2F6BFF" opacity={0.55 + i * 0.06} />))}
              </svg>
              <div style={{ fontSize: 11, color: C.soft }}>Simulations per day</div>
            </div>

            {/* DECISION QUALITY */}
            <div style={{ borderRadius: 14, border: `1px solid ${C.line}`, background: `linear-gradient(180deg,${C.green}0D,#fff)`, padding: 16, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 99, background: `${C.green}1A`, display: "grid", placeItems: "center", marginBottom: 10 }}><Target size={20} color={C.green} /></div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, letterSpacing: 0.8 }}>DECISION QUALITY</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.green, ...NUM, lineHeight: 1.1, marginTop: 4 }}>91%</div>
              <div style={{ fontSize: 12, color: C.soft, marginBottom: 8 }}>Avg. confidence score</div>
              <div style={{ position: "relative", marginBottom: 10 }}>
                <svg viewBox="0 0 100 44" style={{ width: 96, height: 44 }}>
                  <path d="M10,40 A40,40 0 0 1 90,40" fill="none" stroke={`${C.green}26`} strokeWidth="9" strokeLinecap="round" />
                  <path d="M10,40 A40,40 0 0 1 88.4,28.8" fill="none" stroke={C.green} strokeWidth="9" strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, fontSize: 16, fontWeight: 900, color: C.green, ...NUM }}>91%</div>
              </div>
              <div style={{ width: "100%", background: `${C.green}0D`, borderRadius: 9, padding: "9px 11px", display: "grid", gap: 6 }}>
                {[["12", "Decision packets"], ["8", "Approved actions"], ["100%", "Audit trail coverage"]].map(([n, l]) => (
                  <div key={l} style={{ display: "flex", gap: 9, alignItems: "baseline" }}><span style={{ fontSize: 12, fontWeight: 900, color: C.green, ...NUM, minWidth: 30, textAlign: "left" }}>{n}</span><span style={{ fontSize: 11, color: C.soft }}>{l}</span></div>
                ))}
              </div>
            </div>

            {/* INVESTMENT REQUIRED */}
            <div style={{ borderRadius: 14, border: `1px solid ${C.core}33`, background: "linear-gradient(180deg,#FBF7FF,#fff)", padding: 16, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 10px 28px rgba(161,0,255,0.06)" }}>
              <div style={{ width: 46, height: 46, borderRadius: 99, background: "rgba(161,0,255,0.10)", display: "grid", placeItems: "center", marginBottom: 10 }}><Lock size={20} color={C.core} /></div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, letterSpacing: 0.8 }}>INVESTMENT REQUIRED</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.core, ...NUM, lineHeight: 1.1, marginTop: 4 }}>€310k</div>
              <div style={{ fontSize: 12, color: C.soft, marginBottom: 10 }}>Year-1 investment</div>
              <div style={{ width: "100%", background: "#F7F5FB", borderRadius: 9, padding: "9px 11px", display: "grid", gap: 6 }}>
                {[["€80k", "Data + Knowledge Graph"], ["€60k", "Risk + Monte Carlo"], ["€120k", "Agents + UI"], ["€50k", "Change management"]].map(([n, l]) => (
                  <div key={l} style={{ display: "flex", gap: 9, alignItems: "baseline", justifyContent: "space-between", textAlign: "left" }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: C.deep, ...NUM, whiteSpace: "nowrap" }}>{n}</span>
                    <span style={{ fontSize: 10.2, color: C.soft, textAlign: "right" }}>{l}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto", paddingTop: 10, fontSize: 10.5, color: C.soft, lineHeight: 1.35 }}>
                <b style={{ color: C.deep, ...NUM }}>€100k/year ongoing</b><br />
                incl. ~€6k LLM API
              </div>
            </div>

            {/* BUSINESS IMPACT */}
            <div style={{ borderRadius: 14, border: "1px solid rgba(232,137,12,0.30)", background: "linear-gradient(180deg,#FFF7EC,#fff)", padding: 16, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 99, background: "rgba(232,137,12,0.14)", display: "grid", placeItems: "center", marginBottom: 10 }}><ShieldCheck size={20} color="#E8890C" /></div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, letterSpacing: 0.8, marginBottom: 8 }}>BUSINESS IMPACT</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#E8890C", ...NUM, lineHeight: 1.05 }}>€960k</div>
              <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 8 }}>Risk Avoided</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#E8890C", ...NUM, lineHeight: 1.05 }}>€750k</div>
              <div style={{ fontSize: 11.5, color: C.soft, marginBottom: 10 }}>Cost Savings</div>
              <div style={{ width: "100%", borderTop: "1px dashed rgba(232,137,12,0.35)", paddingTop: 11 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.green, ...NUM, lineHeight: 1.05 }}>€1.71M</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11.5, color: C.soft, marginTop: 2 }}><TrendingUp size={13} color={C.green} /> Annual Benefit (base case, full run-rate)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise EVaR improvement */}
        <div style={{ marginTop: 20, borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.soft, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Enterprise EVaR improvement</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: C.soft, marginBottom: 2 }}>Before FactoryMind</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, ...NUM, letterSpacing: -1 }}>€2.80M</div>
              <div style={{ fontSize: 11.5, color: C.soft }}>Enterprise EVaR</div>
            </div>
            <div style={{ flex: 1, position: "relative", height: 64 }}>
              <div style={{ position: "absolute", top: -2, left: 0, right: 0, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.green, ...NUM }}>−57%</div>
                <div style={{ fontSize: 11, color: C.soft }}>Reduction</div>
              </div>
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: 40 }}>
                <defs><linearGradient id="evarRibbon" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={C.core} /><stop offset="52%" stopColor="#8B5CF6" /><stop offset="100%" stopColor={C.green} /></linearGradient></defs>
                <path d="M0,4 L100,24 L100,34 L0,16 Z" fill="url(#evarRibbon)" opacity="0.85" />
                <line x1="52" y1="0" x2="52" y2="40" stroke={C.soft} strokeWidth="0.7" strokeDasharray="3 3" />
              </svg>
            </div>
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <div style={{ fontSize: 12, color: C.soft, marginBottom: 2 }}>After FactoryMind</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.green, ...NUM, letterSpacing: -1 }}>€1.2M</div>
              <div style={{ fontSize: 11.5, color: C.soft }}>Enterprise EVaR</div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 16, borderRadius: 12, background: "rgba(161,0,255,0.05)", border: "1px solid rgba(161,0,255,0.12)", padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 99, background: "rgba(161,0,255,0.12)", display: "grid", placeItems: "center", flexShrink: 0 }}><Sparkles size={15} color={C.core} /></div>
          <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.45 }}>FactoryMind converts millions of signals into <b style={{ color: C.core }}>measurable business value</b> through AI-powered intelligence and human-in-the-loop decisioning.</div>
        </div>
      </div>

      {/* ===== SCENARIO ECONOMICS ===== */}
      <div style={{ marginTop: 14, borderRadius: 18, background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 10px 32px rgba(10,10,15,0.05)", padding: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.ink, letterSpacing: 0.2, textTransform: "uppercase" }}>Scenario Analysis & Economic Outcomes</div>
          <div style={{ fontSize: 13.5, color: C.soft, marginTop: 3 }}>Impact on Enterprise EVaR, Benefits and Financial Returns (5-year view, 10% discount rate)</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
          {economicScenarios.map((sc) => {
            const Icon = sc.icon;
            const chartId = `econValue-${sc.title.replace(/\W+/g, "")}`;
            const isBaseCase = sc.title === "Base Case";
            if (isBaseCase && baseSummaryOpen) {
              return (
                <div key="base-summary" onClick={() => setBaseSummaryOpen(false)} style={{ borderRadius: 18, border: "1px solid rgba(161,0,255,0.22)", background: "linear-gradient(180deg,rgba(161,0,255,0.08),#fff 24%)", overflow: "hidden", boxShadow: "0 12px 30px rgba(70,0,115,0.10)", padding: 22, cursor: "pointer" }}>
                  <div style={{ fontSize: 22, fontWeight: 950, color: C.ink, textTransform: "uppercase", letterSpacing: -0.4, lineHeight: 1.08, marginBottom: 18 }}>Economic Summary (Base Case)</div>
                  <div style={{ display: "grid", gap: 0, borderTop: `1px solid ${C.line}` }}>
                    {[
                      [Lock, "Year-1 Investment", "€310k"],
                      [Sparkles, "Annual Benefit (Full Run-Rate)", "€1.71M"],
                      [ShieldCheck, "Year-1 Realization", "50%"],
                      [Clock, "Payback Period", "8–9 months"],
                      [TrendingUp, "5-Yr NPV (10% discount rate)", "€5.1M"],
                      [Target, "5-Yr ROI", "> 8x"],
                    ].map(([RowIcon, label, value]) => (
                      <div key={label} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${C.line}` }}>
                        <RowIcon size={18} color={C.core} />
                        <div style={{ fontSize: 14, fontWeight: 850, color: C.ink, lineHeight: 1.2 }}>{label}</div>
                        <div style={{ fontSize: 18, fontWeight: 950, color: C.core, ...NUM, whiteSpace: "nowrap" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 20, borderRadius: 14, background: "rgba(161,0,255,0.10)", border: "1px solid rgba(161,0,255,0.20)", padding: "18px 18px", display: "grid", gridTemplateColumns: "34px 1fr", gap: 14, alignItems: "center" }}>
                    <Sparkles size={28} color={C.core} />
                    <div style={{ fontSize: 15, lineHeight: 1.45, fontWeight: 900, color: C.core }}>
                      One avoided emergency cocoa purchase (500-ton lot) is worth €300k–€600k, enough to cover the entire MVP investment.
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={sc.title} onClick={() => isBaseCase && setBaseSummaryOpen(true)} style={{ position: "relative", borderRadius: 14, border: isBaseCase ? `1px solid ${C.core}66` : `1px solid ${sc.tone}28`, background: isBaseCase ? "radial-gradient(circle at 82% 12%,rgba(161,0,255,0.18),transparent 28%), linear-gradient(180deg,rgba(161,0,255,0.09),#fff 34%)" : sc.bg, overflow: "hidden", boxShadow: isBaseCase ? "0 0 0 3px rgba(161,0,255,0.06), 0 18px 42px rgba(161,0,255,0.18)" : `0 8px 22px ${sc.tone}10`, cursor: isBaseCase ? "pointer" : "default", transform: isBaseCase ? "translateY(-2px)" : "none" }}>
                {isBaseCase && (
                  <div style={{ position: "absolute", top: 12, right: 12, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: 999, background: "rgba(161,0,255,0.12)", border: "1px solid rgba(161,0,255,0.22)", color: C.core, fontSize: 10.5, fontWeight: 900, zIndex: 2 }}>
                    <Sparkles size={12} /> Click to view summary <ChevronRight size={12} />
                  </div>
                )}
                <div style={{ padding: "15px 18px 10px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: `${sc.tone}12`, display: "grid", placeItems: "center" }}><Icon size={22} color={sc.tone} /></div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: sc.tone }}>{sc.title}</div>
                      <div style={{ fontSize: 11.5, color: C.ink, marginTop: 2 }}>{sc.subtitle}</div>
                    </div>
                  </div>
                  <div style={{ padding: "5px 10px", borderRadius: 999, background: `${sc.tone}12`, color: sc.tone, fontSize: 10.5, fontWeight: 900 }}>{sc.badge}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
                  {[
                    ["Annual Benefit", sc.annual],
                    ["Payback", sc.payback],
                    ["5-Yr NPV (10%)", sc.npv],
                  ].map(([label, value], idx) => (
                    <div key={label} style={{ padding: "12px 14px", borderLeft: idx ? `1px solid ${C.line}` : "none" }}>
                      <div style={{ fontSize: 10.5, color: C.soft, fontWeight: 800 }}>{label}</div>
                      <div style={{ fontSize: 19, color: sc.tone, fontWeight: 900, marginTop: 5, ...NUM }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 4, fontSize: 10.5, color: C.soft, fontWeight: 700 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, height: 3, borderRadius: 9, background: C.core }} /> EVaR</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, height: 3, borderRadius: 9, background: C.green }} /> Cumulative Value Protected</span>
                  </div>
                  <svg viewBox="0 0 390 190" style={{ width: "100%", height: 170, display: "block" }}>
                    <defs>
                      <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.green} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={C.green} stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {[0, 1, 2, 3].map((i) => <line key={i} x1="38" x2="358" y1={34 + i * 40} y2={34 + i * 40} stroke={C.line} strokeWidth="1" />)}
                    {["€3.0M", "€2.0M", "€1.0M", "€0"].map((label, i) => <text key={label} x="10" y={38 + i * 40} fontSize="10" fill={C.soft} fontWeight="700">{label}</text>)}
                    {["€9M", "€6M", "€3M", "€0"].map((label, i) => <text key={label} x="364" y={38 + i * 40} fontSize="10" fill={C.soft} fontWeight="700">{label}</text>)}
                    <polygon points={sc.valueArea} fill={`url(#${chartId})`} />
                    <polyline points={sc.evar} fill="none" stroke={C.core} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={sc.value} fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {["0", "12M", "24M", "36M", "48M", "60M"].map((label, i) => <text key={label} x={38 + i * 64} y="176" fontSize="10" fill={C.soft} fontWeight="700" textAnchor="middle">{label}</text>)}
                  </svg>
                  <div style={{ borderRadius: 10, background: `${sc.tone}12`, color: sc.tone, textAlign: "center", padding: "9px 10px", fontSize: 13, fontWeight: 900 }}>
                    Residual EVaR (Year 1): {sc.residual}
                  </div>
                  {isBaseCase && (
                    <div style={{ marginTop: 9, borderRadius: 10, background: "linear-gradient(90deg,rgba(161,0,255,0.14),rgba(199,125,255,0.10))", color: C.core, padding: "9px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 12, fontWeight: 900 }}>
                      <span>Open economic summary</span>
                      <ChevronRight size={15} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============ LANDING PAGE ============ */
function useReveal(threshold = 0.22) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el); return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function Reveal({ children, delay = 0, y = 24, style }) {
  const [ref, seen] = useReveal();
  return (
    <div ref={ref} style={{ opacity: seen ? 1 : 0, transform: seen ? "none" : `translateY(${y}px)`, transition: `opacity .8s cubic-bezier(.2,.7,.2,1) ${delay}s, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}s`, ...style }}>{children}</div>
  );
}

function CountUp({ from = 0, to, dur = 1400, decimals = 0, prefix = "", suffix = "", start }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!start) return;
    let raf, t0;
    const tick = (t) => { if (!t0) t0 = t; const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3); setV(from + (to - from) * e); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [start, to, from, dur]);
  return <span style={NUM}>{prefix}{v.toFixed(decimals)}{suffix}</span>;
}

function LPSection({ index, eyebrow, title, sub, children }) {
  return (
    <section style={{ padding: "110px 6vw", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: C.core }}>{index} — {eyebrow}</div>
        <div style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 850, letterSpacing: "-0.025em", lineHeight: 1.08, margin: "10px 0 0", maxWidth: 760 }}>{title}</div>
        {sub && <div style={{ fontSize: 16, color: C.soft, marginTop: 14, maxWidth: 560, lineHeight: 1.6 }}>{sub}</div>}
      </Reveal>
      <Reveal delay={0.12} style={{ marginTop: 40 }}>{children}</Reveal>
    </section>
  );
}

const LP_PANEL = { background: C.bg, border: `1px solid ${C.line}`, borderRadius: 20, overflow: "hidden" };

/* S1 — signals converging into the engine */
function SignalDemo() {
  const c = [280, 160];
  const sources = [
    { l: "Weather", x: 70, y: 58 }, { l: "Commodity", x: 280, y: 42 }, { l: "Ports", x: 490, y: 58 },
    { l: "FX", x: 70, y: 262 }, { l: "Demand", x: 280, y: 278 }, { l: "Regulation", x: 490, y: 262 },
  ];
  return (
    <div style={{ ...LP_PANEL, padding: 8 }}>
      <svg viewBox="0 0 560 320" style={{ width: "100%", display: "block" }}>
        <defs>{sources.map((s, i) => <path key={i} id={`sig${i}`} d={`M${s.x} ${s.y} L${c[0]} ${c[1]}`} />)}</defs>
        {sources.map((s, i) => <line key={i} x1={s.x} y1={s.y} x2={c[0]} y2={c[1]} stroke={C.line} strokeWidth="1" opacity="0.7" />)}
        {sources.map((s, i) => [0, 1].map((k) => (
          <circle key={`${i}-${k}`} r="2.6" fill={C.core} opacity="0.9"><animateMotion dur={`${2.2 + i * 0.18}s`} repeatCount="indefinite" begin={`${k * 1.1 + i * 0.2}s`}><mpath href={`#sig${i}`} /></animateMotion></circle>
        )))}
        {sources.map((s, i) => (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r="5" fill="#fff" stroke={C.deep} strokeWidth="1.6" />
            <text x={s.x} y={s.y < 100 ? s.y - 12 : s.y + 18} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.ink} fontFamily={FONT}>{s.l}</text>
          </g>
        ))}
        {/* engine */}
        <circle cx={c[0]} cy={c[1]} r="26" fill={C.core} opacity="0.12"><animate attributeName="r" values="22;34;22" dur="3s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.18;0;0.18" dur="3s" repeatCount="indefinite" /></circle>
        <circle cx={c[0]} cy={c[1]} r="22" fill={C.core} />
        <circle cx={c[0]} cy={c[1]} r="22" fill="#fff" opacity="0.08" />
        <rect x={c[0] - 8} y={c[1] - 8} width="16" height="16" rx="3" fill="none" stroke="#fff" strokeWidth="1.6" />
        <path d={`M${c[0] - 8} ${c[1] - 3} h-4 M${c[0] + 8} ${c[1] - 3} h4 M${c[0] - 8} ${c[1] + 3} h-4 M${c[0] + 8} ${c[1] + 3} h4 M${c[0] - 3} ${c[1] - 8} v-4 M${c[0] + 3} ${c[1] - 8} v-4 M${c[0] - 3} ${c[1] + 8} v4 M${c[0] + 3} ${c[1] + 8} v4`} stroke="#fff" strokeWidth="1.4" />
        <text x={c[0]} y={c[1] + 46} textAnchor="middle" fontSize="11.5" fontWeight="850" fill={C.deep} fontFamily={FONT}>Intelligence Engine</text>
      </svg>
    </div>
  );
}

/* S2 — exposure graph builds itself */
function GraphDemo() {
  const [ref, seen] = useReveal(0.35);
  const nodes = [
    { id: "s1", x: 60, y: 70, c: C.amber, r: 6 }, { id: "s2", x: 60, y: 160, c: C.amber, r: 6 }, { id: "s3", x: 60, y: 250, c: C.amber, r: 6 },
    { id: "r1", x: 210, y: 90, c: C.core, r: 8 }, { id: "r2", x: 210, y: 210, c: C.core, r: 8 },
    { id: "k1", x: 360, y: 60, c: C.deep, r: 6 }, { id: "k2", x: 360, y: 160, c: C.deep, r: 6 }, { id: "k3", x: 360, y: 250, c: C.deep, r: 6 },
    { id: "e", x: 500, y: 160, c: C.red, r: 13 },
  ];
  const N = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = [["s1", "r1"], ["s2", "r1"], ["s2", "r2"], ["s3", "r2"], ["r1", "k1"], ["r1", "k2"], ["r2", "k2"], ["r2", "k3"], ["k1", "e"], ["k2", "e"], ["k3", "e"]];
  return (
    <div ref={ref} style={{ ...LP_PANEL, padding: 8 }}>
      <svg viewBox="0 0 560 320" style={{ width: "100%", display: "block" }}>
        <defs>{edges.map(([a, b], i) => <path key={i} id={`eg${i}`} d={`M${N[a].x} ${N[a].y} L${N[b].x} ${N[b].y}`} />)}</defs>
        {edges.map(([a, b], i) => {
          const len = Math.hypot(N[b].x - N[a].x, N[b].y - N[a].y);
          return <line key={i} x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y} stroke={C.deep} strokeWidth="1.3" opacity="0.4" strokeDasharray={len} strokeDashoffset={seen ? 0 : len} style={{ transition: `stroke-dashoffset .8s ease ${0.2 + i * 0.06}s` }} />;
        })}
        {seen && edges.slice(8).map((_, i) => <circle key={i} r="2.6" fill={C.red}><animateMotion dur="1.6s" repeatCount="indefinite" begin={`${1 + i * 0.2}s`}><mpath href={`#eg${8 + i}`} /></animateMotion></circle>)}
        {nodes.map((n, i) => (
          <g key={n.id} style={{ opacity: seen ? 1 : 0, transform: seen ? "scale(1)" : "scale(.4)", transformOrigin: `${n.x}px ${n.y}px`, transition: `opacity .5s ease ${i * 0.07}s, transform .5s cubic-bezier(.2,1.4,.4,1) ${i * 0.07}s` }}>
            {n.id === "e" && <circle cx={n.x} cy={n.y} r="20" fill={C.red} opacity="0.12"><animate attributeName="r" values="16;24;16" dur="2.4s" repeatCount="indefinite" /></circle>}
            <circle cx={n.x} cy={n.y} r={n.r} fill={n.c} />
          </g>
        ))}
        <text x="500" y="195" textAnchor="middle" fontSize="11" fontWeight="850" fill={C.red} fontFamily={FONT} style={{ opacity: seen ? 1 : 0, transition: "opacity .5s ease 1s" }}>Enterprise EVaR</text>
        <text x="60" y="285" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.soft} fontFamily={FONT}>signals</text>
        <text x="210" y="285" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.soft} fontFamily={FONT}>risks</text>
        <text x="360" y="300" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.soft} fontFamily={FONT}>SKUs · customers</text>
      </svg>
    </div>
  );
}

/* S3 — digital twin chain with traveling pulse + live KPIs */
function TwinDemo() {
  const [ref, seen] = useReveal(0.4);
  const chain = [
    { name: "Procurement", c: C.core, to: 1.45 }, { name: "Production", c: "#1E7145", to: 0.65 },
    { name: "Logistics", c: "#0070C0", to: 0.45 }, { name: "Commercial", c: "#D41876", to: 0.25 }, { name: "Finance", c: "#B86E00", to: 0.30 },
  ];
  return (
    <div ref={ref} style={{ ...LP_PANEL, padding: "26px 22px" }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        {chain.map((d, i) => (
          <React.Fragment key={d.name}>
            <div style={{ flex: 1, textAlign: "center", opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(14px)", transition: `all .6s ease ${i * 0.12}s` }}>
              <div style={{ height: 4, background: d.c, borderRadius: 99, margin: "0 auto 12px", width: "72%" }} />
              <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{d.name}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: d.c, marginTop: 4 }}>€<CountUp to={d.to} decimals={2} start={seen} dur={1200 + i * 200} />M</div>
              <div style={{ fontSize: 10, color: C.soft, marginTop: 2, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>domain EVaR</div>
            </div>
            {i < chain.length - 1 && <div style={{ alignSelf: "center", color: C.line, fontSize: 18, padding: "0 2px" }}>→</div>}
          </React.Fragment>
        ))}
      </div>
      <svg viewBox="0 0 1000 24" preserveAspectRatio="none" style={{ width: "100%", height: 24, marginTop: 18 }}>
        <defs><path id="twinPath" d="M30 12 L970 12" /></defs>
        <line x1="30" y1="12" x2="970" y2="12" stroke={C.line} strokeWidth="2" />
        <line x1="30" y1="12" x2="970" y2="12" stroke={C.core} strokeWidth="2" strokeDasharray="6 10" opacity="0.5"><animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite" /></line>
        {[0, 1, 2].map((i) => <circle key={i} r="4" fill={C.core}><animateMotion dur="3.4s" repeatCount="indefinite" begin={`${i * 1.1}s`}><mpath href="#twinPath" /></animateMotion></circle>)}
      </svg>
    </div>
  );
}

/* S4 — strategies shrink exposure (interactive) */
function StrategyDemo() {
  const [ref, seen] = useReveal(0.4);
  const [rerouted, setRerouted] = useState(false);
  const drivers = [["Cocoa price", 0.90, C.red], ["Supply deficit", 0.55, C.amber], ["Port congestion", 0.45, C.amber], ["FX exposure", 0.12, C.deep]];
  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ ...LP_PANEL, padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.soft, textTransform: "uppercase", letterSpacing: 1 }}>Enterprise EVaR</div>
        <div style={{ fontSize: 50, fontWeight: 900, letterSpacing: -2, color: seen ? C.green : C.ink, transition: "color 1.6s ease" }}>€<CountUp from={2.8} to={1.2} decimals={1} start={seen} dur={1800} />M</div>
        <div style={{ fontSize: 12.5, color: C.green, fontWeight: 700, marginBottom: 18 }}>▼ −57% as the portfolio applies</div>
        {drivers.map(([l, v, col], i) => (
          <div key={l} style={{ marginBottom: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}><span style={{ color: C.soft }}>{l}</span><b style={NUM}>{fmtMoneyCompact(v)}</b></div>
            <div style={{ height: 7, background: C.faint, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: seen ? `${(v / 0.9) * (rerouted ? 0.5 : 1) * 100}%` : "0%", height: "100%", background: col, borderRadius: 99, transition: `width 1s ease ${0.3 + i * 0.1}s` }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...LP_PANEL, padding: 24, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.soft, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Live reroute</div>
        <svg viewBox="0 0 300 150" style={{ width: "100%" }}>
          <circle cx="40" cy="110" r="7" fill={C.red} /><text x="40" y="132" textAnchor="middle" fontSize="10" fontWeight="800" fill={C.ink} fontFamily={FONT}>Abidjan</text>
          <circle cx="150" cy="40" r="7" fill={C.green} /><text x="150" y="28" textAnchor="middle" fontSize="10" fontWeight="800" fill={C.ink} fontFamily={FONT}>Valencia</text>
          <circle cx="262" cy="110" r="9" fill={C.dark} /><text x="262" y="132" textAnchor="middle" fontSize="10" fontWeight="800" fill={C.ink} fontFamily={FONT}>Factory</text>
          <defs><path id="lpDirect" d="M40 110 L262 110" /><path id="lpHub" d="M40 110 L150 40 L262 110" /></defs>
          <use href="#lpDirect" stroke={rerouted ? C.line : C.red} strokeWidth={rerouted ? 1.2 : 3} strokeDasharray={rerouted ? "4 6" : "none"} opacity={rerouted ? 0.5 : 0.85} fill="none" />
          <use href="#lpHub" stroke={rerouted ? C.green : "#33406B"} strokeWidth={rerouted ? 3 : 1.2} strokeDasharray={rerouted ? "none" : "4 6"} opacity={rerouted ? 0.9 : 0.4} fill="none" />
          {[0, 1].map((i) => <circle key={i} r="3" fill={rerouted ? C.green : C.red}><animateMotion dur="2.6s" repeatCount="indefinite" begin={`${i * 1.3}s`}><mpath href={rerouted ? "#lpHub" : "#lpDirect"} /></animateMotion></circle>)}
        </svg>
        <div style={{ flex: 1 }} />
        <button onClick={() => setRerouted((r) => !r)} style={{ marginTop: 12, alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7, border: `1px solid ${rerouted ? C.green : C.core}`, background: rerouted ? C.greenBg : C.purpBg, color: rerouted ? C.green : C.deep, padding: "9px 16px", borderRadius: 8, fontWeight: 700, fontFamily: FONT, cursor: "pointer", fontSize: 13 }}>
          {rerouted ? "Reroute active — buffer restored" : "Simulate reroute"}
        </button>
      </div>
    </div>
  );
}

/* Compact severity heat map — reused in the Decision Center executive summary */
function MiniHeatMap() {
  const impactMax = 1.6;
  const sev = (l, im) => { const s = l + (im / impactMax) * 5; return s >= 7 ? C.red : s >= 4.5 ? C.amber : C.green; };
  const risks = RISK_REGISTER.slice(0, 14);
  return (
    <svg viewBox="0 0 380 224" style={{ width: "100%", height: 220, display: "block" }}>
      {[0, 1, 2, 3, 4].map((cx) => [0, 1, 2, 3, 4].map((cy) => {
        const im = (cx + 0.5) / 5 * impactMax, lk = cy + 1;
        return <rect key={`${cx}-${cy}`} x={34 + cx * 66} y={196 - (cy + 1) * 34} width={64} height={32} rx={4} fill={sev(lk, im)} opacity={0.15} />;
      }))}
      {[1, 2, 3, 4, 5].map((l) => <text key={l} x={28} y={196 - (l - 0.5) * 34 + 4} textAnchor="end" fontSize="10" fontWeight="700" fill={C.soft} fontFamily={FONT}>{l}</text>)}
      {[0, 1, 2, 3, 4].map((cx) => <text key={cx} x={34 + cx * 66 + 32} y={210} textAnchor="middle" fontSize="9" fill={C.soft} fontFamily={FONT}>€{((cx + 1) / 5 * impactMax).toFixed(1)}M</text>)}
      <text x={14} y={110} textAnchor="middle" fontSize="9.5" fontWeight="800" fill={C.soft} fontFamily={FONT} transform="rotate(-90 14 110)">Likelihood</text>
      {risks.map((r) => {
        const x = 34 + Math.min(4, r.impact / impactMax * 5) * 66 + 32;
        const y = 196 - r.likelihood * 34 + 17;
        return <circle key={r.id} cx={x} cy={y} r={6} fill={r.source === "external" ? C.core : C.deep} stroke="#fff" strokeWidth={2} opacity={0.88} />;
      })}
    </svg>
  );
}

/* S5 — decision packet assembles itself */
function PacketDemo() {
  const [ref, seen] = useReveal(0.4);
  const [step, setStep] = useState(0);
  const checks = ["Groundedness — every claim cites a graph path", "Numerical integrity — figures match engine output", "Policy compliance — within board mandate", "Completeness — packet released"];
  useEffect(() => {
    if (!seen) return;
    const id = setInterval(() => setStep((s) => (s >= checks.length ? s : s + 1)), 700);
    return () => clearInterval(id);
  }, [seen]);
  const done = step >= checks.length;
  const conf = Math.min(0.92, step / checks.length * 0.92);
  const circ = 2 * Math.PI * 46;
  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
      <div style={{ ...LP_PANEL, padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.soft, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Audit validation</div>
        {checks.map((c, i) => {
          const ok = step > i;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: i < checks.length - 1 ? `1px solid ${C.line}` : "none", opacity: ok ? 1 : 0.4, transition: "opacity .4s ease" }}>
              <span style={{ width: 22, height: 22, borderRadius: 99, background: ok ? C.greenBg : C.faint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .4s" }}>
                {ok ? <CheckCircle2 size={14} color={C.green} /> : <span style={{ width: 6, height: 6, borderRadius: 99, background: C.line }} />}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: ok ? C.ink : C.soft }}>{c}</span>
            </div>
          );
        })}
      </div>
      <div style={{ ...LP_PANEL, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 120 120" style={{ width: 130, height: 130 }}>
          <circle cx="60" cy="60" r="46" fill="none" stroke={C.faint} strokeWidth="10" />
          <circle cx="60" cy="60" r="46" fill="none" stroke={C.green} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - conf)} transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset .6s ease" }} />
          <text x="60" y="58" textAnchor="middle" fontSize="26" fontWeight="900" fill={C.ink} fontFamily={FONT}>{Math.round(conf * 100)}</text>
          <text x="60" y="76" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.soft} fontFamily={FONT}>CONFIDENCE</text>
        </svg>
        <button disabled={!done} style={{ marginTop: 18, width: "100%", border: "none", background: done ? C.core : C.line, color: "#fff", padding: "12px", borderRadius: 9, fontWeight: 800, fontFamily: FONT, fontSize: 13.5, cursor: done ? "pointer" : "default", boxShadow: done ? `0 8px 24px ${C.core}44` : "none", transition: "all .4s" }}>
          {done ? "Executive approval available" : "Assembling packet…"}
        </button>
      </div>
    </div>
  );
}

function LandingPage({ onEnter }) {
  const HERO_DOTS = Array.from({ length: 26 }, (_, i) => ({ x: (i * 37 + 7) % 100, y: (i * 53 + 11) % 100, d: (i % 6) * 0.5, s: 2 + (i % 3), dur: 6 + (i % 5) }));
  return (
    <div style={{ fontFamily: FONT, background: C.bg, color: C.ink, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes lpFloat { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-16px) } }
        @keyframes lpBounce { 0%,100%{ transform:translateY(0); opacity:.5 } 50%{ transform:translateY(7px); opacity:1 } }
        @keyframes lpPulse { 0%,100%{ opacity:1 } 50%{ opacity:.4 } }
        @keyframes lpLine { to { stroke-dashoffset:-30 } }
      `}</style>

      {/* top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", padding: "16px 6vw", background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ fontSize: 16, fontWeight: 850, letterSpacing: -0.5 }}>FactoryMind</div>
        <span style={{ flex: 1 }} />
        <button onClick={onEnter} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.line}`, color: C.ink, padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontFamily: FONT, fontSize: 13, cursor: "pointer" }}>
          Open the platform <ChevronRight size={14} />
        </button>
      </div>

      {/* HERO */}
      <div style={{ position: "relative", minHeight: "88vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 6vw", overflow: "hidden" }}>
        {/* ambient radial */}
        <div style={{ position: "absolute", top: "-10%", left: "30%", width: 700, height: 700, background: `radial-gradient(circle, ${C.core}14, transparent 62%)`, pointerEvents: "none" }} />
        {/* grid */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
          <defs><pattern id="lpgrid" width="46" height="46" patternUnits="userSpaceOnUse"><path d="M46 0 H0 V46" fill="none" stroke={C.line} strokeWidth="0.6" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#lpgrid)" />
        </svg>
        {/* network lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }} preserveAspectRatio="none" viewBox="0 0 1000 600">
          <path d="M120 120 L380 260 L300 460 M380 260 L640 180 L820 360 M640 180 L880 120" fill="none" stroke={C.core} strokeWidth="1" strokeDasharray="4 8" style={{ animation: "lpLine 3s linear infinite" }} />
          {["M120 120 L380 260 L640 180 L880 120", "M300 460 L380 260 L640 180 L820 360"].map((d, i) => (
            <g key={i}><path id={`hero${i}`} d={d} fill="none" /><circle r="3" fill={C.core}><animateMotion dur={`${5 + i}s`} repeatCount="indefinite"><mpath href={`#hero${i}`} /></animateMotion></circle></g>
          ))}
        </svg>
        {/* floating particles */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {HERO_DOTS.map((p, i) => <span key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, borderRadius: 99, background: C.core, opacity: 0.3, animation: `lpFloat ${p.dur}s ease-in-out ${p.d}s infinite` }} />)}
        </div>

        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 26 }}>
            <Pill tone="purple">Live demo · synthetic operating data</Pill>
            <Pill tone="grey">LUISS · Accenture Challenge 2026</Pill>
          </div>
          <div style={{ fontSize: "clamp(44px, 7vw, 88px)", fontWeight: 850, letterSpacing: "-0.035em", lineHeight: 1.0 }}>
            Enterprise exposure<br />is invisible.<br /><span style={{ color: C.core }}>We make it a decision.</span>
          </div>
          <div style={{ fontSize: 17, color: C.soft, marginTop: 28, maxWidth: 520, lineHeight: 1.6 }}>
            FactoryMind continuously transforms uncertainty into governed decisions — priced in euros, simulated, and audit-ready.
          </div>
          <div style={{ marginTop: 34, display: "flex", gap: 18, alignItems: "center" }}>
            <button onClick={onEnter} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "none", color: C.deep, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: FONT, padding: 0 }}>
              Open the platform <ChevronRight size={17} />
            </button>
            <span style={{ fontSize: 13, color: C.soft }}>CocoaRisk — first FactoryMind implementation</span>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 26, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: C.soft }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Scroll</span>
          <ChevronRight size={16} style={{ transform: "rotate(90deg)", animation: "lpBounce 1.6s ease-in-out infinite" }} />
        </div>
      </div>

      <LPSection index="01" eyebrow="Signal ingestion" title="Every signal a manufacturer cannot see — in one engine." sub="Weather, commodities, ports, FX, demand and regulation stream continuously toward a single intelligence engine.">
        <SignalDemo />
      </LPSection>

      <LPSection index="02" eyebrow="Exposure graph" title="It builds the graph that prices the risk." sub="Signals connect to risks, recipes, SKUs and customers. Every euro of Enterprise EVaR traces back to the signal that caused it.">
        <GraphDemo />
      </LPSection>

      <LPSection index="03" eyebrow="Digital twin" title="Risk travels through the whole enterprise." sub="A live twin propagates exposure across procurement, production, logistics, commercial and finance — KPIs update as it runs.">
        <TwinDemo />
      </LPSection>

      <LPSection index="04" eyebrow="Decision simulation" title="Watch exposure shrink in real time." sub="Strategies compete. As the portfolio applies, EVaR falls, routes reroute and inventory restores — live.">
        <StrategyDemo />
      </LPSection>

      <LPSection index="05" eyebrow="Governed decision" title="The decision packet assembles itself." sub="Audit validates one item at a time, confidence climbs, and executive approval becomes available.">
        <PacketDemo />
      </LPSection>

      {/* FINAL CTA */}
      <section style={{ padding: "120px 6vw 90px", textAlign: "center", maxWidth: 820, margin: "0 auto" }}>
        <Reveal>
          <div style={{ fontSize: "clamp(30px,4.4vw,52px)", fontWeight: 850, letterSpacing: "-0.03em", lineHeight: 1.08 }}>
            Uncertainty in.<br /><span style={{ color: C.core }}>Governed decisions out.</span>
          </div>
          <button onClick={onEnter} style={{ marginTop: 34, display: "inline-flex", alignItems: "center", gap: 9, background: C.core, color: "#fff", border: "none", padding: "15px 30px", borderRadius: 10, fontSize: 15.5, fontWeight: 800, cursor: "pointer", fontFamily: FONT, boxShadow: `0 12px 34px ${C.core}3A` }}>
            Open the platform <ChevronRight size={18} />
          </button>
        </Reveal>
      </section>

      <div style={{ padding: "20px 6vw", borderTop: `1px solid ${C.line}`, fontSize: 12, color: C.soft, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span>Academic project — LUISS Business School · strategy report for Accenture</span>
        <span>FactoryMind / CocoaRisk</span>
      </div>
    </div>
  );
}

/* ============ MAIN APP ============ */
export default function FactoryMindDemo() {
  const [landing, setLanding] = useState(true);
  const [screen, setScreen] = useState("dhc");
  const [biTab, setBiTab] = useState("procurement");
  const [deptTab, setDeptTab] = useState("procurement");
  const [auditTab, setAuditTab] = useState("trail");
  const [feedOpen, setFeedOpen] = useState(false);
  const [scenHoverPop, setScenHoverPop] = useState<string|null>(null);
  const [feed, setFeed] = useState([]);
  const [hoverFeed, setHoverFeed] = useState(null);
  const [episode, setEpisode] = useState("idle");
  const [packetReady, setPacketReady] = useState(false);
  const [approved, setApproved] = useState(false);
  const [approved25, setApproved25] = useState(false);
  const [monitoringDecision, setMonitoringDecision] = useState("pending");
  const [selPacket, setSelPacket] = useState(24);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [packetStage, setPacketStage] = useState("packets");
  const [packetSourceFilter, setPacketSourceFilter] = useState("scenario");
  const [packetTimelineView, setPacketTimelineView] = useState("timeline");
  const [controlOpsView, setControlOpsView] = useState("signals");
  const [evar, setEvar] = useState(K.evar);
  const [ees, setEes] = useState(K.ees);
  const [procState, setProcState] = useState("High-Risk");
  const [mapHot, setMapHot] = useState(false);
  const [toast, setToast] = useState(null);
  const [secs, setSecs] = useState(14);
  const [whyOpen, setWhyOpen] = useState(false);
  const [confOpen, setConfOpen] = useState(false);
  const [trail, setTrail] = useState(AUDIT_SEED);
  const [mcBusy, setMcBusy] = useState(false);
  const [chartAnimated, setChartAnimated] = useState(false);
  const [topTab, setTopTab] = useState("external");
  const [reportOpen, setReportOpen] = useState(false);
  const [hoverAction, setHoverAction] = useState(null);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMsgs, setAssistantMsgs] = useState([{ role: "ai", text: "Hi, I'm the FactoryMind assistant. Ask me about Enterprise EVaR, the Risk Map, or pending Decision Packets." }]);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantBusy, setAssistantBusy] = useState(false);

  const [activeVars, setActiveVars] = useState(() => Object.fromEntries(VARIABLES.map((v) => [v.id, DEFAULT_ACTIVE.includes(v.id)])));
  const [varVals, setVarVals] = useState(() => Object.fromEntries(VARIABLES.map((v) => [v.id, v.id === "cocoa" ? 28 : 0])));
  const [selectedActions, setSelectedActions] = useState(() => new Set());
  const [customScenarioName, setCustomScenarioName] = useState("Custom scenario");
  const [customScenarioGroup, setCustomScenarioGroup] = useState("external");
  const [customScenarioDraft, setCustomScenarioDraft] = useState(() => Object.fromEntries(VARIABLES.map((v) => [v.id, DEFAULT_ACTIVE.includes(v.id) ? (v.id === "cocoa" ? 12 : v.id === "demand" ? 8 : v.id === "lead" ? 3 : v.id === "energy" ? 5 : 0) : 0])));
  const [customScenarios, setCustomScenarios] = useState([]);
  const [selectedScenarios, setSelectedScenarios] = useState(() => new Set(["preset:Cocoa Price Shock"]));

  const timers = useRef([]);
  const feedRef = useRef(null);
  const assistantRef = useRef(null);

  const pushFeed = useCallback((e) => {
    setFeed((f) => [...f.slice(-40), { ...e, key: Date.now() + Math.random(), at: Date.now() }]);
  }, []);

  useEffect(() => {
    const hb = setInterval(() => {
      const a = AMBIENT[Math.floor(Math.random() * AMBIENT.length)];
      const now = new Date();
      pushFeed({ agent: a.agent, agentKey: a.agentKey, status: a.status, conf: a.conf, evar: a.evar, model: a.model, ts: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, summary: a.summary() });
      setSecs(0);
    }, 11000);
    const tick = setInterval(() => setSecs((s) => s + 1), 1000);
    const drift = setInterval(() => setEvar((v) => (approved ? v : Math.round((K.evar + (Math.random() - 0.5) * 0.04) * 100) / 100)), 6000);
    return () => { clearInterval(hb); clearInterval(tick); clearInterval(drift); };
  }, [pushFeed, approved]);

  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = 0; }, [feed]);
  useEffect(() => { if (assistantRef.current) assistantRef.current.scrollTop = assistantRef.current.scrollHeight; }, [assistantMsgs, assistantOpen]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const showToast = (msg) => { setToast(msg); timers.current.push(setTimeout(() => setToast(null), 4200)); };

  const openPacketView = useCallback((id, source = "scenario", toastMsg: string | null = null) => {
    setPacketReady(true);
    setPacketStage("packets");
    setPacketSourceFilter(source);
    setPacketTimelineView("timeline");
    setSelPacket(id);
    setScreen("packet");
    if (toastMsg) showToast(toastMsg);
  }, []);


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

  const approve26 = () => {
    if (monitoringDecision === "approved") return;
    setMonitoringDecision("approved");
    showToast("Monitoring escalation approved · promoted into Scenario Room");
  };

  const reject26 = () => {
    if (monitoringDecision === "rejected") return;
    setMonitoringDecision("rejected");
    showToast("Monitoring escalation rejected");
  };

  const runMC = () => { setMcBusy(true); timers.current.push(setTimeout(() => setMcBusy(false), 1400)); };

  const assistantReply = (text) => {
    const t = text.toLowerCase();
    if (t.includes("evar") || t.includes("exposure") || t.includes("ees"))
      return `Enterprise EVaR is currently €${evar.toFixed(1)}M (EES ${ees}/100). Open the Risk Map to see which signals are driving it.`;
    if (t.includes("packet") || t.includes("approv"))
      return `3 package types this cycle: monitoring escalation #26, scenario packet #24 (${approved ? "approved" : "pending Operations Director"}) and planning packet #25 (${approved25 ? "approved" : "pending Operations Lead"}). Open Decision Packets to review.`;
    if (t.includes("cocoa"))
      return "Cocoa is +18% MoM (z-score +2.3), with cover at 18 days vs. a 30-day policy minimum — the dominant driver of this cycle's exposure.";
    if (t.includes("report"))
      return "Each of the 4 MVP domains — Procurement, Production, Logistics, Commercial — is reflected in the risk register, the data health center, and the decision packet flow.";
    if (t.includes("scenario") || t.includes("what if"))
      return "The Scenario Room lets you toggle external factors (cocoa, demand, lead-time, energy, FX) and internal factors (cover, supplier concentration, hedge ratio, OEE) and see EVaR, EES and the response portfolio update live.";
    return "I can help with Enterprise EVaR, Data Health, Business Intelligence, the Risk Map, Decision Packets, or the Scenario Room — what would you like to check?";
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
      if (!next[id]) setVarVals((vv) => ({ ...vv, [id]: 0 }));
      return next;
    });
  };
  const setVar = (id, val) => setVarVals((vv) => ({ ...vv, [id]: val }));
  const toggleAction = (id) => setSelectedActions((sa) => { const ns = new Set(sa); ns.has(id) ? ns.delete(id) : ns.add(id); return ns; });
  const scenarioByKey = (key, customList = customScenarios) => {
    if (key.startsWith("preset:")) {
      const name = key.slice(7);
      return PRESETS[name] ? { name, ...PRESETS[name] } : null;
    }
    if (key.startsWith("custom:")) {
      const name = key.slice(7);
      return customList.find((s) => s.name === name) || null;
    }
    return null;
  };

  const applyScenarioSet = (keys, customList = customScenarios) => {
    const scenarios = [...keys].map((key) => scenarioByKey(key, customList)).filter(Boolean);
    const mergedVals = Object.fromEntries(VARIABLES.map((v) => [v.id, 0]));
    scenarios.forEach((scenario) => {
      scenario.active.forEach((id) => {
        mergedVals[id] = Math.max(mergedVals[id] || 0, scenario.vals[id] ?? 0);
      });
    });
    setActiveVars(() => Object.fromEntries(VARIABLES.map((v) => [v.id, mergedVals[v.id] > 0])));
    setVarVals(() => mergedVals);
    const _applyScenName = [...keys].map((k) => k.startsWith("preset:") ? k.slice(7) : null).filter(Boolean)[0] ?? null;
    const _applyIntel = _applyScenName ? SCENARIO_INTELLIGENCE[_applyScenName] : null;
    setSelectedActions(_applyIntel ? new Set(_applyIntel.optimalIds) : new Set());
    runMC();
  };

  const applyScenarioConfig = (config) => {
    setActiveVars((a) => {
      const next = { ...a };
      VARIABLES.forEach((v) => { next[v.id] = config.active.includes(v.id); });
      return next;
    });
    setVarVals((vv) => {
      const next = { ...vv };
      VARIABLES.forEach((v) => { next[v.id] = config.active.includes(v.id) ? (config.vals[v.id] ?? 0) : 0; });
      return next;
    });
    setSelectedActions(new Set());
    runMC();
  };

  const toggleScenario = (key) => {
    setSelectedScenarios((cur) => {
      const next = new Set(cur);
      if (next.has(key)) {
        if (next.size <= 1) return cur; // keep at least one scenario active
        next.delete(key);
      } else {
        next.add(key);
      }
      applyScenarioSet(next);
      return next;
    });
  };

  const addCustomScenario = () => {
    const name = customScenarioName.trim() || `Custom scenario ${customScenarios.length + 1}`;
    const vals = Object.fromEntries(Object.entries(customScenarioDraft).map(([k, v]) => [k, Number(v) || 0]));
    const active = Object.entries(vals).filter(([, v]) => v > 0).map(([k]) => k);
    const scenario = { name, active: active.length ? active : ["cocoa"], vals };
    const nextCustom = [scenario, ...customScenarios.filter((item) => item.name !== name)].slice(0, 5);
    setCustomScenarios(nextCustom);
    setSelectedScenarios((cur) => {
      const next = new Set(cur);
      next.add(`custom:${name}`);
      applyScenarioSet(next, nextCustom);
      return next;
    });
    showToast(`Scenario "${name}" added`);
  };

  const deleteCustomScenario = (name) => {
    const key = `custom:${name}`;
    const nextCustom = customScenarios.filter((item) => item.name !== name);
    setCustomScenarios(nextCustom);
    setSelectedScenarios((cur) => {
      const next = new Set(cur);
      next.delete(key);
      applyScenarioSet(next, nextCustom);
      return next;
    });
    showToast(`Scenario "${name}" deleted`);
  };

  const clockStr = (() => { const d = new Date(); return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); })();
  const dhcPortfolio = computePortfolio(selectedActions, sEvar);
  const dhcActiveScenarioName = [...selectedScenarios].map((k) => k.startsWith("preset:") ? k.slice(7) : null).filter(Boolean)[0] ?? null;
  const activeSignalCount = Object.values(activeVars).filter(Boolean).length;
  const pipelineItems = (feed.length ? feed.slice(-8).map((e) => {
    const meta = agentFromWho(e.who);
    return {
      ...e,
      agent: e.agent || meta.name,
      agentKey: e.agentKey || meta.key,
      summary: oneLine(e.summary || e.msg || "", 90),
      bridge: feedBridgeLabel(e),
    };
  }) : ORCHESTRATION_PIPELINE_SEED).filter(Boolean);
  const filteredPackets = useMemo(() => PACKETS.filter((packet) => packet.source === packetSourceFilter), [packetSourceFilter]);
  const controlSignalStats = { analyzed: 124, graphUpdates: 87, watchEvents: 21, scenarioTriggers: 5, packets: 1 };
  const alertCount = 3;

  useEffect(() => {
    if (packetStage !== "packets" || !filteredPackets.length) return;
    if (!filteredPackets.some((packet) => packet.id === selPacket)) setSelPacket(filteredPackets[0].id);
  }, [filteredPackets, packetStage, selPacket]);

  if (landing) {
    return <LandingPage onEnter={() => setLanding(false)} />;
  }

  const NAV = [
    ["dhc", "Data Health Center", Database],
    ["control", "Control Center", LayoutGrid],
    ["bi", "Business Intelligence", Activity],
    ["map", "Risk Map", GitBranch],
    ["scenario", "Scenario Room", FlaskConical],
    ["packet", "Decision Center", FileCheck2],
    ["reports", "Reports", FileText],
    ["governance", "Value Center", ShieldCheck],
  ];

  const ControlCenter = () => (
    <div>
      {/* ── CINEMATIC HERO ── */}
      <div style={{ borderRadius: 14, overflow: "hidden", background: "linear-gradient(115deg,#13082B 0%,#2D0A55 48%,#4A0E86 100%)", color: "#fff", padding: "20px 24px", marginBottom: 16, position: "relative", display: "flex", alignItems: "center", gap: 24 }}>
        <svg viewBox="0 0 520 120" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.13 }}>
          {Array.from({ length: 14 }).map((_, i) => <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="120" stroke="#fff" strokeWidth="0.5" />)}
          {Array.from({ length: 4 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 40} x2="520" y2={i * 40} stroke="#fff" strokeWidth="0.5" />)}
          <path d="M0 92 L80 70 L160 78 L240 44 L320 56 L400 26 L480 36 L520 18" stroke="#fff" strokeWidth="1.5" fill="none" />
          {[[80,70],[240,44],[400,26],[520,18]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3" fill="#fff" />)}
        </svg>
        <div style={{ position: "relative", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.6, textTransform: "uppercase", opacity: 0.62, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: "#3DE38A", animation: "pulse 1.8s infinite" }} /> Live · Enterprise Control Center
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, marginTop: 7, lineHeight: 1.08, letterSpacing: -0.5 }}>Uncertainty, governed in real time.</div>
          <div style={{ fontSize: 12.5, opacity: 0.72, marginTop: 6, maxWidth: 470 }}>14 signal feeds · 6 specialist agents + Orchestrator + Audit Agent collaborating · every figure traced to a deterministic graph path.</div>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 12 }}>
          {[["EES", String(ees)], ["EVaR", `€${evar.toFixed(1)}M`], ["Agents", "8"]].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 12, padding: "12px 16px", minWidth: 84, textAlign: "center" }}>
              <div style={{ fontSize: 9.5, opacity: 0.6, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase" }}>{l}</div>
              <div style={{ fontSize: 24, fontWeight: 900, ...NUM }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1.2fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 18 }} onClick={() => setScreen("map")}>
          <SectionLabel icon={ShieldCheck}>Enterprise Exposure Score</SectionLabel>
          <Gauge value={ees} />
          <div style={{ fontSize: 11, color: C.soft, textAlign: "center", marginTop: 10 }}>Click → Risk Map, filtered to the active signal</div>
        </Card>
        <Card style={{ padding: 18 }}>
          <SectionLabel icon={AlertTriangle}>Enterprise Value at Risk</SectionLabel>
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
          <div style={{ fontSize: 11.5, color: C.soft }}>Cocoa position at this S&amp;OP decision: <b style={NUM}>€{K.weeklyExposure}M</b> (~6–7 weeks of cover)</div>
        </Card>
        <Card style={{ padding: 18 }}>
          <SectionLabel icon={Layers}>Top risks & opportunities</SectionLabel>
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

      <SectionLabel icon={Layers}>Domain exposure — 5 MVP areas</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 16 }}>
        {K.domains.map((d) => {
          const st = d.id === "procurement" ? procState : d.state;
          const dcol ={ procurement: C.core, production: "#1E7145", logistics: "#0070C0", commercial: "#D41876", finance: "#B86E00" }[d.id] || C.core;
          const maxE = 1.45;
          return (
            <Card key={d.id} style={{ padding: 0, overflow: "hidden" }} onClick={() => { setBiTab(d.id); setScreen("bi"); }}>
              <div style={{ height: 4, background: dcol }} />
              <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: dcol + "12", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <DomainIcon3D id={d.id} color={dcol} />
                  </span>
                  {d.name}
                </span>
                <Pill tone={stateTone(st)}>{st}</Pill>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, color: dcol, ...NUM }}>{fmtMoneyCompact(d.evar)}</div>
              <div style={{ height: 4, background: C.faint, borderRadius: 99, margin: "7px 0 9px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, d.evar / maxE * 100)}%`, height: "100%", background: dcol, opacity: 0.55 }} />
              </div>
              <div style={{ fontSize: 11, color: C.soft, marginBottom: 10, lineHeight: 1.45, minHeight: 32 }}>{d.driver}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: d.fresh === "stale" ? C.amber : C.green }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: d.fresh === "stale" ? C.amber : C.green }} />
                {d.fresh === "stale" ? `Last validated ${d.validated} — refresh requested from ${d.steward}` : `Validated · ${d.steward} · ${d.validated}`}
              </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 16, alignItems: "start" }}>
        <div>
          <SectionLabel icon={Radio}>Orchestration widget</SectionLabel>
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.soft, letterSpacing: 1, textTransform: "uppercase" }}>
                  {controlOpsView === "signals" ? "Signal pipeline today" : "Orchestrator status"}
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink, marginTop: 3 }}>
                  {controlOpsView === "signals" ? "Signals → graph → watch events" : "Monitoring → evaluation → packets"}
                </div>
              </div>
              <button
                onClick={() => setControlOpsView((v) => v === "signals" ? "orchestrator" : "signals")}
                style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line}`, background: C.faint, display: "grid", placeItems: "center", cursor: "pointer" }}
              >
                <ChevronRight size={14} color={C.deep} style={{ transform: controlOpsView === "signals" ? "none" : "rotate(180deg)" }} />
              </button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {(controlOpsView === "signals"
                ? [
                    ["Signals analyzed today", String(controlSignalStats.analyzed), C.ink],
                    ["Graph updates", String(controlSignalStats.graphUpdates), C.deep],
                    ["Watch events", String(controlSignalStats.watchEvents), C.amber],
                    ["Scenario triggers", String(controlSignalStats.scenarioTriggers), C.red],
                    ["Decision packets", String(controlSignalStats.packets), C.green],
                  ]
                : [
                    ["Monitoring", "Active", C.green],
                    ["Signals processed", String(controlSignalStats.analyzed), C.ink],
                    ["Graph updates", String(controlSignalStats.graphUpdates), C.deep],
                    ["Scenario evaluations", String(controlSignalStats.scenarioTriggers), C.red],
                    ["Packets generated", String(controlSignalStats.packets), C.green],
                  ]
              ).map(([label, value, tone], i) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingBottom: i < 4 ? 9 : 0, marginBottom: i < 4 ? 9 : 0, borderBottom: i < 4 ? `1px solid ${C.line}` : "none" }}>
                  <span style={{ fontSize: 12, color: C.soft, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: tone, ...NUM }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <SectionLabel icon={FileCheck2}>Pending decision packets</SectionLabel>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.line}`, background: C.redBg, display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle size={15} color={C.red} />
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.red }}>Escalated alert stream</div>
                <div style={{ fontSize: 11.5, color: C.soft }}>Only high-materiality alerts are promoted into packets for human review.</div>
              </div>
            </div>
            {packetReady || approved ? (
              <div onClick={() => openPacketView(24, "scenario")} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", cursor: "pointer", borderLeft: `4px solid ${approved ? C.green : C.core}` }}>
                <FileCheck2 size={18} color={approved ? C.green : C.core} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>#24 — Cocoa supply shock: advance purchase + hedge</div>
                  <div style={{ fontSize: 11.5, color: C.soft }}>{approved ? "Approved by Operations Director · outcome validation T+4 weeks" : "Alert-derived scenario packet · pending Operations Director approval · 12 min from signal"}</div>
                </div>
                {approved ? <Pill tone="green">Approved</Pill> : <Pill tone="amber">Alert</Pill>}
                <span style={{ color: C.core, fontSize: 13, fontWeight: 700 }}><Chev />Review packet</span>
              </div>
            ) : (
              <div style={{ padding: "16px 18px", fontSize: 13, color: C.soft, display: "flex", alignItems: "center", gap: 10 }}>
                <Radio size={15} color={C.core} /> No packets pending approval — the orchestrator is monitoring 14 signal feeds and 3 alert paths.
              </div>
            )}
            <div onClick={() => openPacketView(25, "planning")} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderTop: `1px solid ${C.line}`, cursor: "pointer" }}>
              <Zap size={16} color={C.green} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>#25 — Buying window: cocoa P50 below 90-day average · advance 200t</div>
                <div style={{ fontSize: 11.5, color: C.soft }}>Planning packet · margin secured €140k · single approval (Operations Lead, €50–200k tier)</div>
              </div>
              <Pill tone="green">{approved25 ? "Approved" : "Planning"}</Pill>
            </div>
          </Card>
        </div>
      </div>
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

    const portfolio = computePortfolio(selectedActions, sEvar);
    const activeScenarioName = [...selectedScenarios].map((k) => k.startsWith("preset:") ? k.slice(7) : null).filter(Boolean)[0] ?? null;
    const scenarioIntel = activeScenarioName ? SCENARIO_INTELLIGENCE[activeScenarioName] : null;
    const scenarioAccents = ["#E8760A","#0070C0","#047857","#D41876","#B86E00"];
    const activeScenarioCount = selectedScenarios.size;
    const activeScenarioNames = [...selectedScenarios].map((key) => scenarioByKey(key)?.name).filter(Boolean);
    const scenarioTitle = activeScenarioNames.length ? activeScenarioNames.slice(0, 2).join(" + ") + (activeScenarioNames.length > 2 ? ` +${activeScenarioNames.length - 2}` : "") : "No scenario selected";
    const scenarioTone = portfolio.residual < sEvar - 0.05 ? C.green : sEvar > K.evar + 0.05 ? C.red : C.soft;
    const scenarioStatus = portfolio.list.length ? `${portfolio.list.length} action${portfolio.list.length === 1 ? "" : "s"} reconfiguring the twin` : "Select actions to weaken the propagation path";

    return (
      <div style={{ animation: "slideIn .38s ease both" }}>
        {/* Cinematic scenario header banner */}
        <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, position: "relative",
          background: "linear-gradient(120deg,#13082B 0%,#1E0A45 50%,#2D0A55 100%)", boxShadow: "0 16px 44px rgba(70,0,115,0.16)" }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes srSweep { from { stroke-dashoffset: 120; opacity:.12 } to { stroke-dashoffset: 0; opacity:.34 } }
              @keyframes srOrb { 0%,100%{ transform:translateY(0) scale(1) } 50%{ transform:translateY(-9px) scale(1.08) } }
            `}</style>
            <defs><pattern id="srGrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.08" />
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#srGrid)" />
            <path d="M40 88 C260 20 420 120 640 55 S950 22 1160 80" stroke="#fff" strokeWidth="1.2" fill="none" strokeDasharray="12 18" style={{ animation: "srSweep 1.2s ease-out both" }} />
            {scenarioAccents.map((ac, i) => (
              <circle key={i} cx={`${12 + i * 20}%`} cy="50%" r="40" fill={ac} opacity="0.07" style={{ transformOrigin: `${12 + i * 20}% 50%`, animation: `srOrb ${3 + i * 0.35}s ease-in-out infinite` }} />
            ))}
          </svg>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FlaskConical size={20} color={C.core} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Scenario Room</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginTop: 1 }}>
                  {scenarioTitle}
                </div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.58)", marginTop: 3 }}>
                  {activeScenarioCount} scenario{activeScenarioCount === 1 ? "" : "s"} · {scenarioStatus}
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            {[
              ["Scenario EVaR", `€${sEvar.toFixed(2)}M`, sEvar > K.evar + 0.05 ? C.red : "#fff"],
              ["Residual EVaR", `€${portfolio.residual.toFixed(2)}M`, scenarioTone],
              ["Value protected", `€${portfolio.valueProtected.toFixed(2)}M`, portfolio.valueProtected > 0 ? C.green : "rgba(255,255,255,0.55)"],
              ["Trust", `${portfolio.conf}%`, portfolio.list.length ? C.green : "rgba(255,255,255,0.72)"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: "center", padding: "0 15px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>{l}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: c, ...NUM, letterSpacing: -0.5 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <GradSep />

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
          <div>
          <Card style={{ padding: 16, marginBottom: 14 }}>
            <SectionLabel icon={FlaskConical}>Select scenario</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 7, marginBottom: 12 }}>
              {Object.keys(PRESETS).map((p) => {
                const key = `preset:${p}`;
                const active = selectedScenarios.has(key);
                const pIntel = SCENARIO_INTELLIGENCE[p];
                return (
                  <div key={p} style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "stretch", gap: 4 }}>
                      <button onClick={() => toggleScenario(key)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, textAlign: "left", padding: "9px 11px", borderRadius: 8, fontSize: 12.5, fontWeight: 700, fontFamily: FONT, cursor: "pointer", border: `1px solid ${active ? C.core : C.line}`, background: active ? C.purpBg : C.bg, color: active ? C.deep : C.ink, transition: "all .15s" }}>
                        <Chev />{p}
                      </button>
                      <button
                        onMouseEnter={() => setScenHoverPop(p)}
                        onMouseLeave={() => setScenHoverPop(null)}
                        onClick={(e) => e.stopPropagation()}
                        title="AI portfolio details"
                        style={{ width: 30, borderRadius: 8, border: `1px solid ${active ? C.core + "60" : C.line}`, background: active ? C.purpBg : C.faint, cursor: "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Sparkles size={12} color={active ? C.core : C.soft} />
                      </button>
                    </div>
                    {scenHoverPop === p && pIntel && (
                      <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#fff", border: `1px solid ${C.core}28`, borderRadius: 11, padding: "12px 13px", boxShadow: "0 10px 30px rgba(0,0,0,0.13)", zIndex: 300 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: C.core, marginBottom: 7, display: "flex", alignItems: "center", gap: 5, letterSpacing: 0.4, textTransform: "uppercase" }}>
                          <Sparkles size={9} /> AI Portfolio Intelligence
                        </div>
                        <div style={{ fontSize: 10.5, color: C.ink, lineHeight: 1.5, marginBottom: 6 }}>{pIntel.context}</div>
                        <div style={{ fontSize: 10, color: C.soft, lineHeight: 1.45, marginBottom: 7 }}>
                          <b style={{ color: C.ink }}>Why this scenario:</b> {pIntel.reason}
                        </div>
                        <div style={{ display: "flex", gap: 5, marginBottom: 7, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: C.purpBg, color: C.core }}>{pIntel.evaluated.toLocaleString()} portfolios</span>
                          <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: C.greenBg, color: C.green }}>{pIntel.confidence}% confidence</span>
                          <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: C.faint, color: C.soft }}>{[...pIntel.optimalIds].length} actions pre-selected</span>
                        </div>
                        <div style={{ fontSize: 10, color: C.soft, borderTop: `1px solid ${C.line}`, paddingTop: 7, lineHeight: 1.45 }}>
                          <b style={{ color: C.ink }}>Why this portfolio:</b> {pIntel.why}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {customScenarios.map((p) => {
                const key = `custom:${p.name}`;
                const active = selectedScenarios.has(key);
                return (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "7px 9px", borderRadius: 8, border: `1px solid ${active ? C.core : C.line}`, background: active ? C.purpBg : C.bg, color: active ? C.deep : C.ink }}>
                    <button onClick={() => toggleScenario(key)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, textAlign: "left", padding: "2px 0", border: "none", background: "transparent", color: "inherit", fontSize: 12.5, fontWeight: 700, fontFamily: FONT, cursor: "pointer" }}>
                      <Chev />{p.name}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCustomScenario(p.name); }} title={`Delete ${p.name}`} aria-label={`Delete ${p.name}`} style={{ width: 24, height: 24, display: "grid", placeItems: "center", borderRadius: 7, border: `1px solid ${active ? C.core : C.line}`, background: active ? "#fff" : C.faint, color: active ? C.deep : C.soft, cursor: "pointer" }}>
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: 11, background: C.faint, borderRadius: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 9, display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} color={C.core} /> Add scenario</div>
              <input value={customScenarioName} onChange={(e) => setCustomScenarioName(e.target.value)} placeholder="Scenario name" style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 10px", fontSize: 12.5, fontFamily: FONT, marginBottom: 9 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 5, marginBottom: 10 }}>
                {[
                  ["external", "External"],
                  ["internal", "Internal"],
                ].map(([id, label]) => (
                  <button
                    key={label}
                    onClick={() => setCustomScenarioGroup(id)}
                    style={{ border: `1px solid ${customScenarioGroup === id ? C.core : C.line}`, background: customScenarioGroup === id ? C.purpBg : C.bg, color: customScenarioGroup === id ? C.deep : C.soft, borderRadius: 7, padding: "6px 0", fontSize: 10.5, fontWeight: 800, cursor: "pointer", fontFamily: FONT }}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setCustomScenarioDraft(Object.fromEntries(VARIABLES.map((v) => [v.id, 0])))}
                  style={{ border: `1px solid ${C.line}`, background: C.bg, color: C.soft, borderRadius: 7, padding: "6px 8px", fontSize: 10.5, fontWeight: 800, cursor: "pointer", fontFamily: FONT }}
                >
                  Clear
                </button>
              </div>
              {VARIABLES.filter((v) => v.group === customScenarioGroup).map((v) => {
                const val = customScenarioDraft[v.id] || 0;
                const enabled = val > 0;
                const fallback = v.id === "lead" ? 6 : v.id === "hedge" ? 30 : Math.round((v.max - v.min) * 0.4);
                return (
                  <div key={v.id} style={{ marginBottom: 10, opacity: enabled ? 1 : 0.58 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: C.ink, fontWeight: 800, marginBottom: 6, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => setCustomScenarioDraft((d) => ({ ...d, [v.id]: enabled ? 0 : fallback }))}
                        style={{ accentColor: C.core }}
                      />
                      <span style={{ flex: 1 }}>{v.label}</span>
                      <b style={{ color: C.deep, ...NUM }}>{enabled ? `+${val}${v.unit}` : "off"}</b>
                    </label>
                    <input
                      type="range"
                      min={v.min}
                      max={v.max}
                      step={v.step}
                      value={val}
                      disabled={!enabled}
                      onChange={(e) => setCustomScenarioDraft((d) => ({ ...d, [v.id]: +e.target.value }))}
                      style={{ width: "100%", accentColor: C.core, opacity: enabled ? 1 : 0.45 }}
                    />
                  </div>
                );
              })}
              <button onClick={addCustomScenario} style={{ width: "100%", background: C.dark, color: "#fff", border: "none", padding: "9px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: FONT }}>
                Add and apply
              </button>
            </div>
            <button onClick={runMC} style={{ width: "100%", background: C.core, color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
              {mcBusy ? "Running 10,000 paths…" : "Run Monte Carlo"}
            </button>
            <div style={{ fontSize: 10.5, color: C.soft, marginTop: 6, textAlign: "center" }}>10,000 paths · deterministic engine · last run {mcBusy ? "now" : "4s ago"}</div>
          </Card>
        </div>
        <div>
          {scenarioIntel && (
            <div style={{ marginBottom: 12, padding: "12px 16px", borderRadius: 11,
              background: "linear-gradient(135deg,#F6EBFF 0%,#EDE0FF 100%)",
              border: "1px solid rgba(161,0,255,0.18)",
              boxShadow: "0 2px 14px rgba(161,0,255,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                <Sparkles size={15} color={C.core} />
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.deep }}>AI Portfolio Intelligence</div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10.5, color: C.soft }}><b style={{ color: C.ink, fontVariantNumeric: "tabular-nums" }}>{(scenarioIntel.evaluated).toLocaleString()}</b> portfolios evaluated</span>
                  <Pill tone="purple">{scenarioIntel.confidence}% confidence</Pill>
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.ink, lineHeight: 1.55, marginBottom: 6 }}>
                <b style={{ color: C.deep }}>Optimal selection:</b> {scenarioIntel.why}
              </div>
              <div style={{ fontSize: 10.5, color: C.soft, padding: "7px 11px", background: "rgba(255,255,255,0.7)", borderRadius: 8, lineHeight: 1.5 }}>
                📍 {scenarioIntel.context}
              </div>
            </div>
          )}
          <LivingCausalGraph
            sEvar={sEvar}
            portfolio={portfolio}
            selectedActions={selectedActions}
            hoverAction={hoverAction}
            setHoverAction={setHoverAction}
            toggleAction={toggleAction}
            mcBusy={mcBusy}
            scenarioIntel={scenarioIntel}
            activeScenarioName={activeScenarioName}
          />

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 2px 4px" }}>
            <div style={{ fontSize: 12.5, color: C.soft }}>
              {portfolio.list.length} action{portfolio.list.length === 1 ? "" : "s"} · cost <b style={{ color: C.ink, ...NUM }}>€{portfolio.cost}k</b> · residual EVaR <b style={{ color: C.green, ...NUM }}>€{portfolio.residual.toFixed(2)}M</b> · ROI <b style={{ color: C.deep, ...NUM }}>{portfolio.roi || "—"}{portfolio.roi ? "×" : ""}</b>
            </div>
            <div style={{ flex: 1 }} />
            <button onClick={() => openPacketView(24, "scenario", "Scenario packet generated from the active mitigation portfolio")} disabled={portfolio.list.length === 0}
              style={{ background: portfolio.list.length ? C.core : C.line, color: "#fff", border: "none", padding: "11px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: portfolio.list.length ? "pointer" : "default", fontFamily: FONT }}>
              Generate Decision Packet
            </button>
          </div>
        </div>
      </div>
      </div>
    );
  };

  const PacketExplanationBanner = () => (
    <Card style={{ padding: "14px 16px", marginBottom: 14, background: "linear-gradient(135deg,#FCF8FF 0%,#FFFFFF 100%)", border: `1px solid ${C.core}20` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ width: 28, height: 28, borderRadius: 10, background: C.purpBg, display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.core, flexShrink: 0 }}>
          <Info size={14} />
        </span>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: C.deep, marginBottom: 4 }}>Escalation logic</div>
          <div style={{ fontSize: 11.5, color: C.soft, lineHeight: 1.6 }}>
            Agents continuously monitor signals and update the Knowledge Graph. Most signals remain alerts. Some become agent recommendations. Only cross-domain, high-impact recommendations are promoted by the Orchestrator into auditable Decision Packets.
          </div>
        </div>
      </div>
    </Card>
  );

  const PacketStageControl = () => {
    const options = [
      ["alerts", "Live Alerts"],
      ["recommendations", "Agent Recommendations"],
      ["packets", "Decision Packets"],
    ];
    return (
      <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 12, background: "#F5F2FA", border: `1px solid ${C.line}`, marginBottom: 14 }}>
        {options.map(([id, label]) => {
          const active = packetStage === id;
          return (
            <button key={id} onClick={() => setPacketStage(id)}
              style={{ border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 12.5, fontWeight: 800, padding: "9px 14px", borderRadius: 9, background: active ? C.bg : "transparent", color: active ? C.deep : C.soft, boxShadow: active ? "0 6px 16px rgba(10,10,15,0.06)" : "none" }}>
              {label}
            </button>
          );
        })}
      </div>
    );
  };

  const PacketSourceControl = () => {
    const options = [
      ["monitoring", "Monitoring"],
      ["scenario", "Scenario"],
      ["planning", "Planning"],
    ];
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "0 0 14px", flexWrap: "wrap" }}>
        <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 12, background: "#F5F2FA", border: `1px solid ${C.line}` }}>
          {options.map(([id, label]) => {
            const active = packetSourceFilter === id;
            return (
              <button key={id} onClick={() => setPacketSourceFilter(id)}
                style={{ border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 12.5, fontWeight: 800, padding: "9px 14px", borderRadius: 9, background: active ? C.bg : "transparent", color: active ? C.deep : C.soft, boxShadow: active ? "0 6px 16px rgba(10,10,15,0.06)" : "none" }}>
                {label}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setShowDiagrams((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT, background: showDiagrams ? C.purpBg : C.bg, border: `1px solid ${showDiagrams ? C.core : C.line}`, color: showDiagrams ? C.deep : C.ink }}>
            <Network size={15} /> {showDiagrams ? "Hide diagrams" : "Risk diagrams"}
          </button>
          <button onClick={() => setScreen("reports")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT, background: C.bg, border: `1px solid ${C.line}`, color: C.ink }}>
            <FileText size={15} /> Report
          </button>
        </div>
      </div>
    );
  };

  const packetStatusMeta = (id) => {
    if (id === 24) return approved ? { label: "Approved", tone: "green" } : { label: packetReady ? "Pending" : "Scenario", tone: packetReady ? "amber" : "purple" };
    if (id === 25) return approved25 ? { label: "Approved", tone: "green" } : { label: "Planning", tone: "amber" };
    if (monitoringDecision === "approved") return { label: "Approved", tone: "green" };
    if (monitoringDecision === "rejected") return { label: "Rejected", tone: "red" };
    return { label: "Monitoring", tone: "amber" };
  };

  const packetTimelineContent = {
    26: {
      timeline: [
        { left: "09:12", title: "External Intelligence Agent", sub: "ICE cocoa +18% vs prior month" },
        { left: "09:13", title: "Procurement Agent", sub: "Cover policy breached · 18d < 30d" },
        { left: "09:13", title: "Logistics Agent", sub: "Abidjan lead time +8d on 2 vessels" },
        { left: "09:14", title: "Orchestrator", sub: "Cross-domain materiality confirmed" },
        { left: "09:15", title: "Scenario Room triggered", sub: "Monitoring escalation promoted to simulation" },
      ],
      signals: [
        { left: "5", title: "Signals clustered", sub: "Commodity, weather, logistics, policy and margin recalculation" },
        { left: "4", title: "Agents aligned", sub: "External, Procurement, Logistics and Finance" },
        { left: "1", title: "Graph story", sub: "Cocoa → cover → inbound → margin → enterprise exposure" },
      ],
      approval: [
        { left: "A", title: "Approval path", sub: "No human approval yet — package is routed into Scenario Room first" },
        { left: "B", title: "Expected next step", sub: "Run simulations and convert best portfolio into scenario packet #24" },
      ],
    },
    24: {
      timeline: [
        { left: "09:12", title: "Signal detected", sub: "Cocoa z-score +2.3 and ICCO deficit confirmed" },
        { left: "09:18", title: "Agents completed analysis", sub: "Constraint catch included for Line 2 / Line 3" },
        { left: "09:21", title: "Simulation completed", sub: "10,000 paths × 4 portfolios" },
        { left: "09:23", title: "Audit passed", sub: "4 / 4 checks completed" },
        { left: "09:24", title: "Packet ready", sub: "Operations Director notified" },
      ],
      signals: [
        { left: "9", title: "Signals used", sub: "ICE cocoa, ICCO deficit, rainfall, cover breach and logistics delay among validated inputs" },
        { left: "4", title: "Contributing agents", sub: "Procurement, Finance, Production and Logistics" },
        { left: "24", title: "Portfolios tested", sub: "Best one selected on EVaR / € efficiency" },
      ],
      approval: [
        { left: "1", title: "Materiality gate", sub: "€230k total impact routes to Operations Director tier" },
        { left: "2", title: "Policy gate", sub: "Forward cover remains within §3.1 board mandate" },
        { left: "3", title: "Audit gate", sub: "Groundedness, numerics, policy and completeness all passed" },
      ],
    },
    25: {
      timeline: [
        { left: "08:48", title: "Buying window opened", sub: "Cocoa P50 moved 12% below 90-day average" },
        { left: "08:52", title: "Procurement agent recommendation", sub: "Advance 200t inside policy window" },
        { left: "08:57", title: "Finance validation", sub: "Margin secured > execution cost by €85k net" },
        { left: "09:01", title: "Orchestrator validation", sub: "No cross-domain conflict detected" },
        { left: "09:03", title: "Packet ready", sub: "Operations Lead review opened" },
      ],
      signals: [
        { left: "6", title: "Signals used", sub: "ICE price curve, hedge window, cover, margin spread and recipe demand" },
        { left: "2", title: "Contributing agents", sub: "Procurement and Finance" },
        { left: "4k", title: "Scenario sims", sub: "Opportunity value stress-tested across 4,000 paths" },
      ],
      approval: [
        { left: "1", title: "Authority tier", sub: "€55k cost stays inside Operations Lead mandate" },
        { left: "2", title: "Policy gate", sub: "Action remains inside 4-week forward cover rule" },
        { left: "3", title: "Audit gate", sub: "Packet complete and numerically consistent before release" },
      ],
    },
  };

  const PacketTimelineCard = ({ packetId }) => {
    const views = [
      ["timeline", "Flow"],
      ["signals", "Signals"],
      ["approval", "Approval path"],
    ];
    const rows = packetTimelineContent[packetId]?.[packetTimelineView] || [];
    return (
      <Card style={{ padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <SectionLabel icon={Clock} style={{ marginBottom: 0, flexShrink: 0, whiteSpace: "nowrap" }}>Timeline — signal to packet</SectionLabel>
          <div style={{ display: "inline-flex", gap: 4, padding: 3, borderRadius: 10, background: "#F5F2FA", border: `1px solid ${C.line}` }}>
            {views.map(([id, label]) => {
              const active = packetTimelineView === id;
              return (
                <button key={id} onClick={() => setPacketTimelineView(id)}
                  style={{ border: "none", cursor: "pointer", fontFamily: FONT, fontSize: 11, fontWeight: 800, padding: "6px 10px", borderRadius: 8, background: active ? C.bg : "transparent", color: active ? C.deep : C.soft }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        {rows.map((row, i) => (
          <div key={`${row.left}-${row.title}`} style={{ display: "flex", gap: 10, marginBottom: i < rows.length - 1 ? 10 : 0 }}>
            <div style={{ width: 42, fontSize: 11.5, fontWeight: 800, color: C.deep, ...NUM }}>{row.left}</div>
            <div style={{ position: "relative", paddingLeft: 14, flex: 1 }}>
              <span style={{ position: "absolute", left: 0, top: 5, width: 8, height: 8, borderRadius: 99, background: C.core }} />
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, lineHeight: 1.35 }}>{row.title}</div>
              <div style={{ fontSize: 11.5, color: C.soft, lineHeight: 1.45, marginTop: 2 }}>{row.sub}</div>
            </div>
          </div>
        ))}
      </Card>
    );
  };

  const LiveAlertsView = () => {
    const sevTone = (s) => s === "Escalated" ? "red" : s === "Watch" ? "amber" : "grey";
    const sevColor = (s) => s === "Escalated" ? C.red : s === "Watch" ? C.amber : C.soft;
    return (
      <Card style={{ padding: 18 }}>
        <SectionLabel icon={Radio}>Live alerts — specialist agent timeline</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {PACKET_ALERTS.map((a, i) => (
            <div key={`${a.ts}-${a.agent}`} style={{ display: "grid", gridTemplateColumns: "54px 1fr auto", gap: 14, padding: "12px 0", borderBottom: i < PACKET_ALERTS.length - 1 ? `1px solid ${C.line}` : "none", alignItems: "start" }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: C.deep, ...NUM }}>{a.ts}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.soft, letterSpacing: 0.7, textTransform: "uppercase" }}>{a.agent}</span>
                  <Pill tone={sevTone(a.severity)}>{a.severity}</Pill>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, lineHeight: 1.4 }}>{a.signal}</div>
              </div>
              <div style={{ textAlign: "right", minWidth: 132 }}>
                <div style={{ fontSize: 11, color: C.soft, marginBottom: 4 }}>Confidence</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: sevColor(a.severity), ...NUM }}>{a.confidence}%</div>
                <div style={{ marginTop: 7 }}>
                  <Pill tone={a.graph ? "green" : "grey"}>{a.graph ? "Graph updated" : "No graph change"}</Pill>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const AgentRecommendationsView = () => {
    const statusTone = (s) => s === "Included in packet" ? "green" : s === "Rejected by orchestrator" ? "red" : "amber";
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
        {PACKET_RECOMMENDATIONS.map((r) => (
          <Card key={`${r.agent}-${r.title}`} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: C.soft, letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 4 }}>{r.agent}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{r.title}</div>
              </div>
              <Pill tone={statusTone(r.status)}>{r.status}</Pill>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ padding: "10px 11px", borderRadius: 10, background: C.faint }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: C.soft, letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 4 }}>Expected local impact</div>
                <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.45 }}>{r.impact}</div>
              </div>
              <div style={{ padding: "10px 11px", borderRadius: 10, background: C.faint }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: C.soft, letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 4 }}>Evidence used</div>
                <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.45 }}>{r.evidence}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const PacketMetaStrip = ({ rows }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 10, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
      {rows.map(([label, value, tone], i) => (
        <div key={i} style={{ padding: "10px 11px", borderRadius: 10, background: C.faint }}>
          <div style={{ fontSize: 9.5, color: C.soft, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: tone || C.ink, lineHeight: 1.35 }}>{value}</div>
        </div>
      ))}
    </div>
  );

  const PacketSelector = () => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(filteredPackets.length, 1)},minmax(0,1fr))`, gap: 16, marginBottom: 14 }}>
      {filteredPackets.map((p) => {
        const status = packetStatusMeta(p.id);
        const Icon = p.icon;
        const active = selPacket === p.id;
        const isRisk = p.kind === "risk";
        return (
          <div key={p.id} onClick={() => setSelPacket(p.id)}
            style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", background: C.bg,
              border: `1.5px solid ${active ? p.accent : C.line}`,
              boxShadow: active ? `0 0 0 3px ${p.accent}22, 0 10px 36px ${p.accent}28` : "0 2px 12px rgba(10,10,15,0.07)",
              transition: "all .22s", transform: active ? "translateY(-1px)" : "none" }}>

            {/* Bold colored top stripe */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${p.accent}, ${p.accent}66)` }} />

            {/* Header */}
            <div style={{ position: "relative", overflow: "hidden", padding: "18px 20px 16px",
              background: `linear-gradient(150deg, ${p.accent}12 0%, ${p.accent}06 55%, transparent 100%)` }}>

              {/* Animated thematic background */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "hidden" }}
                viewBox="0 0 340 130" preserveAspectRatio="xMaxYMin slice" xmlns="http://www.w3.org/2000/svg">
                {/* Date watermark */}
                <text x="336" y="116" fontSize="46" fontWeight="900" fill={p.accent} fillOpacity="0.055"
                  textAnchor="end" letterSpacing="-2" fontFamily={FONT}>{p.date}</text>
                {isRisk ? (
                  // Risk: rotating diamond crystals + oscillating wave → market volatility
                  <>
                    <g>
                      <animateTransform attributeName="transform" type="rotate" from="0 278 44" to="360 278 44" dur="14s" repeatCount="indefinite" />
                      <polygon points="278,22 296,44 278,66 260,44" fill="none" stroke={p.accent} strokeWidth="1.2" opacity="0.12" />
                      <polygon points="278,32 290,44 278,56 266,44" fill={p.accent} fillOpacity="0.05" />
                    </g>
                    <g>
                      <animateTransform attributeName="transform" type="rotate" from="30 318 22" to="-330 318 22" dur="21s" repeatCount="indefinite" />
                      <polygon points="318,10 329,22 318,34 307,22" fill="none" stroke={p.accent} strokeWidth="0.9" opacity="0.09" />
                    </g>
                    <path fill="none" stroke={p.accent} strokeWidth="0.9" opacity="0.09">
                      <animate attributeName="d"
                        values="M192,96 Q232,79 264,93 Q294,107 330,88;M192,96 Q232,111 264,93 Q294,77 330,104;M192,96 Q232,79 264,93 Q294,107 330,88"
                        dur="5s" repeatCount="indefinite" />
                    </path>
                    <circle cx="248" cy="18" r="2.5" fill={p.accent} fillOpacity="0.2">
                      <animate attributeName="cy" values="18;12;18" dur="3.5s" repeatCount="indefinite" />
                      <animate attributeName="fillOpacity" values="0.2;0.35;0.2" dur="3.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="264" cy="32" r="1.8" fill={p.accent} fillOpacity="0.13">
                      <animate attributeName="cy" values="32;26;32" dur="4.5s" begin="1s" repeatCount="indefinite" />
                    </circle>
                  </>
                ) : (
                  // Opportunity: rising bubbles + dashed upward arc → price window opening
                  <>
                    <circle cx="282" cy="96" r="22" fill="none" stroke={p.accent} strokeWidth="0.9">
                      <animate attributeName="cy" values="96;42;96" dur="5.5s" repeatCount="indefinite" />
                      <animate attributeName="r" values="22;29;22" dur="5.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.14;0.01;0.14" dur="5.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="315" cy="86" r="13" fill="none" stroke={p.accent} strokeWidth="0.7">
                      <animate attributeName="cy" values="86;36;86" dur="7s" begin="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.10;0.01;0.10" dur="7s" begin="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="300" cy="112" r="7" fill="none" stroke={p.accent} strokeWidth="0.6">
                      <animate attributeName="cy" values="112;68;112" dur="4s" begin="3.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.08;0;0.08" dur="4s" begin="3.2s" repeatCount="indefinite" />
                    </circle>
                    <path d="M208,106 Q258,60 332,30" fill="none" stroke={p.accent} strokeWidth="1" opacity="0.10" strokeDasharray="5,5">
                      <animate attributeName="strokeDashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite" />
                    </path>
                  </>
                )}
              </svg>

              {/* Icon + meta */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 15,
                  background: `linear-gradient(135deg, ${p.accent}28, ${p.accent}14)`,
                  border: `1.5px solid ${p.accent}50`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: `0 4px 14px ${p.accent}28` }}>
                  <Icon size={24} color={p.accent} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: C.soft, letterSpacing: "0.08em", ...NUM }}>#{p.id}</span>
                    <Pill tone={isRisk ? "red" : "green"} style={{ fontSize: 9.5 }}>{isRisk ? "Risk" : "Opportunity"}</Pill>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9.5, fontWeight: 700,
                      color: status.tone === "green" ? C.green : status.tone === "amber" ? C.amber : C.deep,
                      background: status.tone === "green" ? C.greenBg : status.tone === "amber" ? C.amberBg : C.purpBg,
                      padding: "2px 8px", borderRadius: 99 }}>
                      {status.tone === "amber" && <span style={{ width: 5, height: 5, borderRadius: 99, background: C.amber, animation: "pulse 1.4s infinite", flexShrink: 0 }} />}
                      {status.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, lineHeight: 1.3, color: C.ink, marginBottom: 3, letterSpacing: -0.2 }}>{p.title}</div>
                  <div style={{ fontSize: 10.5, color: C.soft }}>{p.tier}</div>
                </div>
              </div>

              {/* Headline metric — bottom of header, full-width */}
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10.5, color: C.soft, fontWeight: 600 }}>
                  {isRisk ? "Portfolio impact" : "Net opportunity"}
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6,
                  padding: "5px 14px", borderRadius: 10,
                  background: isRisk ? C.redBg : C.greenBg,
                  border: `1px solid ${p.accent}35` }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: p.accent, ...NUM, letterSpacing: -1 }}>{p.headline}</span>
                </div>
              </div>
            </div>

            {/* Metrics row */}
            <div style={{ display: "flex", borderTop: `1px solid ${C.line}` }}>
              {p.m.map(([l, v], i) => {
                const valCol = l === "ROI" ? C.deep : i === 0 ? C.red : i === 1 ? C.green : C.soft;
                const bg = l === "ROI" ? C.purpBg : i === 0 ? `${C.red}05` : i === 1 ? `${C.green}05` : "transparent";
                return (
                  <div key={i} style={{ flex: 1, padding: "12px 16px", background: bg,
                    borderRight: i < p.m.length - 1 ? `1px solid ${C.line}` : "none" }}>
                    <div style={{ fontSize: 9.5, color: C.soft, fontWeight: 700, marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</div>
                    <div style={{ fontSize: 17, fontWeight: 900, ...NUM, color: valCol, letterSpacing: -0.5 }}>{v}</div>
                  </div>
                );
              })}
            </div>
          </div>
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
              <div style={{ fontSize: 11.5, color: C.soft, fontWeight: 600 }}>DECISION PACKET #24 · ref AUD-24-0093 · generated by Orchestrator</div>
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
          <PacketMetaStrip rows={[
            ["Generated by", "Orchestrator", C.deep],
            ["Contributing agents", "Procurement · Finance · Production · Logistics", C.ink],
            ["Signals used", "9 validated signals", C.ink],
            ["Scenario sims", "10,000 paths", C.ink],
            ["Confidence", "84%", C.green],
            ["Approval", approved ? "Approved" : "Pending Operations Director", approved ? C.green : C.amber],
          ]} />
        </Card>

        <Card style={{ padding: 18, marginBottom: 14 }}>
          <SectionLabel icon={Activity}>Risk waterfall — current EVaR to residual</SectionLabel>
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
          <SectionLabel icon={Sparkles}>Agent rationale — every claim cited</SectionLabel>

          <div style={{ background: C.purpBg, border: `1px solid ${C.core}25`, borderRadius: 10, padding: "12px 14px", marginBottom: 6 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: C.deep, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 }}>Executive brief</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: C.ink }}>
              A confirmed cocoa price shock has pushed enterprise exposure into the materiality zone. The Orchestrator recommends an advance-purchase-and-hedge portfolio that cuts Enterprise EVaR by <b>57%</b> at a net cost of <b>€230k</b> — the best risk reduction per euro across every combination it simulated.
            </div>
          </div>

          {[
            { label: "Problem detected", color: C.red, body: (
              <>ICE cocoa is up <b>18% month-on-month</b> and the ICCO has confirmed a structural supply deficit <Pill tone="purple" style={{ fontSize: 10 }}>signal · ICE/ICCO</Pill>, while inventory cover has fallen to <b>18 days</b> — twelve days under the 30-day policy minimum <Pill tone="grey" style={{ fontSize: 10 }}>policy §3.1</Pill>. Rising prices and a thin buffer are converging on the same procurement path.</>
            ) },
            { label: "Business impact", color: C.amber, body: (
              <>Tracing the exposure through the knowledge graph, the shock reaches <b>3 recipes, 11 SKUs, 2 production lines and 4 key customers</b> <Pill tone="purple" style={{ fontSize: 10 }}>graph path</Pill>, consolidating into <b>€2.8M</b> of Enterprise EVaR this cycle.</>
            ) },
            { label: "Why this action", color: C.deep, body: (
              <>The Orchestrator evaluated <b>24 response portfolios</b> with a 10,000-path Monte Carlo simulation <Pill tone="grey" style={{ fontSize: 10 }}>Monte Carlo · deterministic</Pill>. Advance purchase plus a 30% forward hedge delivers the <b>largest EVaR reduction per euro invested</b>, and the last 3 comparable patterns saw advance purchase beat waiting by €180k on average <Pill tone="amber" style={{ fontSize: 10 }}>precedent #19 · simulated</Pill>.</>
            ) },
            { label: "Expected outcome", color: C.green, body: (
              <>Executing the portfolio brings Enterprise EVaR from <b>€2.8M down to €1.2M</b> — a <b>57% reduction</b> — and protects an estimated <b>€1.60M</b> of margin, all within board-approved policy limits.</>
            ) },
            { label: "If no action", color: C.red, body: (
              <>Left unaddressed, exposure stays above policy limits and keeps compounding as the cocoa position reprices, putting up to <b>€1.56M of margin</b> at risk of erosion before the next S&OP cycle can respond.</>
            ) },
          ].map((s) => (
            <div key={s.label} style={{ padding: "12px 0", borderTop: `1px solid ${C.line}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10.5, fontWeight: 800, color: C.deep, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: C.ink }}>{s.body}</div>
            </div>
          ))}
        </Card>
      </div>

      <div>
        <PacketTimelineCard packetId={24} />
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <SectionLabel icon={ShieldCheck}>Audit verdict</SectionLabel>
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
        <Card style={{ padding: 16 }}>
          <SectionLabel icon={CheckCircle2}>Approval — dual sign-off on conflict</SectionLabel>
          <div style={{ fontSize: 12, color: C.soft, marginBottom: 12, lineHeight: 1.5 }}>Total impact €230k &gt; €200k tier → Operations Director. Conflicting agent recommendations would escalate to dual approval.</div>
          <button onClick={approve} disabled={approved} style={{ width: "100%", background: approved ? C.green : C.core, color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: approved ? "default" : "pointer", fontFamily: FONT, marginBottom: 8 }}>
            {approved ? "✓ Approved & logged" : "Approve packet"}
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
              <div style={{ fontSize: 11.5, color: C.soft, fontWeight: 600 }}>DECISION PACKET #25 · ref AUD-25-0094 · generated by Orchestrator</div>
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
          <PacketMetaStrip rows={[
            ["Generated by", "Orchestrator", C.deep],
            ["Contributing agents", "Procurement · Finance", C.ink],
            ["Signals used", "6 validated signals", C.ink],
            ["Scenario sims", "4,000 paths", C.ink],
            ["Confidence", "79%", C.green],
            ["Approval", approved25 ? "Approved" : "Pending Operations Lead", approved25 ? C.green : C.amber],
          ]} />
        </Card>

        <Card style={{ padding: 18, marginBottom: 14 }}>
          <SectionLabel icon={Zap}>Opportunity build-up — margin secured to net value</SectionLabel>
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
          <SectionLabel icon={Sparkles}>Agent rationale — every claim cited</SectionLabel>
          <div style={{ fontSize: 13.5, lineHeight: 1.85, color: C.ink }}>
            ICE cocoa P50 is currently 12% below its 90-day average <Pill tone="purple" style={{ fontSize: 10 }}>signal · ICE</Pill>, inside the window the Procurement Agent's Hedging specialist flags as favorable for incremental cover <Pill tone="grey" style={{ fontSize: 10 }}>policy §3.1</Pill>. Advancing 200t at current pricing secures €140k of margin versus the 90-day baseline <Pill tone="purple" style={{ fontSize: 10 }}>graph path · cocoa → recipes → SKUs</Pill>, at an execution cost of €55k, for a net value of €85k <Pill tone="grey" style={{ fontSize: 10 }}>Monte Carlo · deterministic</Pill>. This mirrors the 2026 backtest buying-window episode <Pill tone="amber" style={{ fontSize: 10 }}>backtest · simulated</Pill>.
          </div>
        </Card>
      </div>

      <div>
        <PacketTimelineCard packetId={25} />
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <SectionLabel icon={ShieldCheck}>Audit verdict</SectionLabel>
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
          <SectionLabel icon={CheckCircle2}>Approval — single sign-off</SectionLabel>
          <div style={{ fontSize: 12, color: C.soft, marginBottom: 12, lineHeight: 1.5 }}>Total impact €55k is within the €50k–200k Operations Lead tier — single approval, no escalation required.</div>
          <button onClick={approve25} disabled={approved25} style={{ width: "100%", background: approved25 ? C.green : C.core, color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: approved25 ? "default" : "pointer", fontFamily: FONT, marginBottom: 8 }}>
            {approved25 ? "✓ Approved & logged" : "Approve packet"}
          </button>
          <button disabled={approved25} style={{ width: "100%", background: C.bg, color: C.red, border: `1px solid ${C.line}`, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Reject</button>
          {approved25 && <div style={{ fontSize: 11, color: C.green, marginTop: 8, display: "flex", gap: 5, alignItems: "center" }}><Lock size={11} /> Immutable record created · outcome validation T+4 weeks</div>}
        </Card>
      </div>
    </div>
  );

  const Packet26 = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 16 }}>
      <div>
        <Card style={{ padding: 0, marginBottom: 14, overflow: "hidden" }}>
          <div style={{ position: "relative", padding: "18px 20px", background: "linear-gradient(120deg,#16093A 0%,#2A0A55 55%,#430C7E 100%)", overflow: "hidden" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5 }} xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="pk26g" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M 26 0 L 0 0 0 26" fill="none" stroke="#fff" strokeWidth="0.4" opacity="0.1"/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#pk26g)"/>
            </svg>
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 0.5 }}>DECISION PACKET #26 · ref MON-26-0092</div>
                <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5, margin: "5px 0 10px", color: "#fff", lineHeight: 1.15 }}>Monitoring Escalation — Cocoa Shock Entering Materiality Zone</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Pill tone="purple">Source: specialist agents</Pill>
                  <Pill tone={monitoringDecision === "approved" ? "green" : monitoringDecision === "rejected" ? "red" : "amber"}>
                    {monitoringDecision === "approved" ? "Approved for Scenario Room" : monitoringDecision === "rejected" ? "Escalation rejected" : "Awaiting escalation decision"}
                  </Pill>
                  <Pill tone="green">Audit passed · 3/3</Pill>
                </div>
              </div>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, minWidth: 230 }}>
                <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", color: "#fff", textAlign: "center", fontSize: 14, fontWeight: 900 }}>
                  {monitoringDecision === "approved" ? "Approved to Scenario Room" : monitoringDecision === "rejected" ? "Escalation rejected" : "Approve or reject escalation"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button onClick={approve26} disabled={monitoringDecision === "approved"} style={{ background: monitoringDecision === "approved" ? C.green : "#fff", color: monitoringDecision === "approved" ? "#fff" : C.deep, border: "none", padding: "11px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 800, cursor: monitoringDecision === "approved" ? "default" : "pointer", fontFamily: FONT }}>
                    Approve
                  </button>
                  <button onClick={reject26} disabled={monitoringDecision === "rejected"} style={{ background: monitoringDecision === "rejected" ? C.red : "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.22)", padding: "11px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 800, cursor: monitoringDecision === "rejected" ? "default" : "pointer", fontFamily: FONT }}>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
              {[["Signals clustered", "5", C.ink], ["Agents aligned", "4", C.ink], ["Enterprise EVaR", "€2.80M", C.red], ["Next step", "Run scenario", C.deep], ["Status", "Triggered", C.amber]].map(([l, v, col]) => (
                <div key={l} style={{ padding: "10px 12px", borderRadius: 10, background: C.faint, borderLeft: `3px solid ${col}` }}>
                  <div style={{ fontSize: 10, color: C.soft, fontWeight: 700, letterSpacing: 0.3 }}>{l}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, ...NUM, color: col, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
            <PacketMetaStrip rows={[
              ["Generated by", "Orchestrator", C.deep],
              ["Contributing agents", "External · Procurement · Logistics · Finance", C.ink],
              ["Signals used", "5 validated signals", C.ink],
              ["Graph updates", "4 causal paths refreshed", C.green],
              ["Confidence", "82%", C.green],
              ["Promotion", "Scenario Room triggered", C.amber],
            ]} />
          </div>
        </Card>

        <Card style={{ padding: 18, marginBottom: 14 }}>
          <SectionLabel icon={Activity}>Monitoring synthesis — why it was escalated</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
            {[
              ["Commodity", "ICE cocoa +18% and ICCO deficit aligned into one price stress signal.", "#E8760A"],
              ["Policy", "Coverage dropped to 18 days, breaching the 30-day threshold.", C.red],
              ["Logistics", "Abidjan delay added +8d, increasing path fragility before mitigation.", "#0070C0"],
            ].map(([label, body, col]) => (
              <div key={label} style={{ padding: "12px 13px", borderRadius: 10, background: C.faint, borderTop: `3px solid ${col}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: col }} />
                  <div style={{ fontSize: 10, fontWeight: 800, color: C.soft, letterSpacing: 0.7, textTransform: "uppercase" }}>{label}</div>
                </div>
                <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}>{body}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 18 }}>
          <SectionLabel icon={Sparkles}>Escalation rationale</SectionLabel>
          <div style={{ fontSize: 13.5, lineHeight: 1.85, color: C.ink }}>
            This package exists to explain <b>why raw agent alerts were promoted</b>. The External Intelligence Agent detected a sustained cocoa shock, the Procurement Agent confirmed a policy breach on cover, and the Logistics Agent added a lead-time degradation that materially widened the exposure path. Once those signals converged, the Orchestrator updated the Knowledge Graph, recalculated EVaR and triggered the Scenario Room so that mitigation portfolios could be simulated and converted into an auditable scenario packet.
          </div>
        </Card>
      </div>

      <div>
        <PacketTimelineCard packetId={26} />
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <SectionLabel icon={ShieldCheck}>Audit verdict</SectionLabel>
          {[
            ["Groundedness", "All alerts cite a source agent and resolved graph update.", "ai"],
            ["Numerical integrity", "Escalated EVaR matches the current propagation model output.", "det"],
            ["Completeness", "Contributing agents, signals and promotion target are present.", "det"],
          ].map(([h, s, k], i) => (
            <div key={i} style={{ padding: "9px 0", borderBottom: i < 2 ? `1px solid ${C.line}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700 }}>
                <CheckCircle2 size={14} color={C.green} /> {h} <span style={{ marginLeft: "auto" }}><Tag kind={k} /></span>
              </div>
              <div style={{ fontSize: 11, color: C.soft, marginTop: 3, paddingLeft: 21 }}>{s}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  const Packet = () => {
    const dPortfolio = computePortfolio(selectedActions, sEvar);
    const dScenName = [...selectedScenarios].map((k) => k.startsWith("preset:") ? k.slice(7) : null).filter(Boolean)[0] ?? null;
    const dIntel = dScenName ? SCENARIO_INTELLIGENCE[dScenName] : null;
    return (
    <div>
      {showDiagrams && (
        <div style={{ marginBottom: 16 }}>
          <Card style={{ padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <SectionLabel icon={Activity} style={{ marginBottom: 0 }}>Risk landscape — likelihood × impact</SectionLabel>
              <div style={{ display: "flex", gap: 12, fontSize: 10.5, color: C.soft }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: C.core }} /> External</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: C.deep }} /> Internal</span>
              </div>
            </div>
            <MiniHeatMap />
          </Card>
          <LivingCausalGraph
            sEvar={sEvar}
            portfolio={dPortfolio}
            selectedActions={selectedActions}
            hoverAction={hoverAction}
            setHoverAction={setHoverAction}
            toggleAction={toggleAction}
            mcBusy={mcBusy}
            scenarioIntel={dIntel}
            activeScenarioName={dScenName}
          />
        </div>
      )}

      <PacketExplanationBanner />
      <PacketSourceControl />
      <PacketSelector />
      {selPacket === 24 ? Packet24() : selPacket === 25 ? Packet25() : Packet26()}
    </div>
    );
  };

  const Dept = () => {
    const d = K.domains.find((x) => x.id === deptTab);
    const kpis = {
      procurement: [["Days of cover", "18", "red"], ["Contracted volume", "1,420 t", "grey"], ["Supplier concentration", "48%", "amber"], ["Forward contract", "€3,870/t", "grey"]],
      production: [["OEE", "71%", "amber"], ["Utilization", "87%", "grey"], ["Changeover hrs/wk", "14.2", "grey"], ["Downtime (planning)", "21 h/wk", "red"]],
      logistics: [["Avg lead time", "12.6 d", "amber"], ["Port congestion", "+8 d", "red"], ["Freight deviation", "+11%", "amber"], ["Carrier OTD", "91%", "grey"]],
      commercial: [["Forecast accuracy", "78%", "amber"], ["OTIF", "93%", "green"], ["Forecast deviation", "9.4%", "amber"], ["Top-10 at risk", "1", "amber"]],
      finance: [["Working capital", "+€2.1M", "amber"], ["FX unhedged", "USD/EUR", "red"], ["Cash runway", "3.4 wks", "grey"], ["Margin protected", "€1.60M", "green"]],
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
            <div style={{ fontSize: 24, fontWeight: 800, ...NUM }}>{fmtMoneyCompact(d.evar)}</div>
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
            <SectionLabel icon={CheckCircle2}>Open actions</SectionLabel>
            {(d.id === "procurement" ? [["Advance purchase 500t — Packet #24", packetReady || approved ? (approved ? "Approved" : "Pending") : "Drafting", approved ? "green" : "amber"], ["Hedge 30% forward exposure — Packet #24", approved ? "Approved" : "Pending", approved ? "green" : "amber"], ["Buying window 200t — Packet #25", approved25 ? "Approved" : "Pending Operations Lead", "green"]] : d.id === "production" ? [["Validate schedule T+2–T+6 (cascade)", "Constraint catch resolved — Line 3", "green"], ["Allergen window review — Line 2", "Scheduled Thu 22:00", "grey"]] : d.id === "logistics" ? [["Reroute 1 vessel from Abidjan — Packet #24", approved ? "Approved" : "Pending", approved ? "green" : "amber"], ["Valencia port capacity check (cascade)", "Confirmed", "green"]] : d.id === "finance" ? [["Hedge USD/EUR exposure — forward cover", "Pending Treasury", "amber"], ["Working capital release — €2.1M above norm", "Under review", "amber"], ["Margin protection — Packet #24 cascade", approved ? "Secured €1.60M" : "Modelled", approved ? "green" : "grey"]] : [["Promotional pre-build confirmation", "Supply secured (cascade)", "green"], ["Top-10 customer OTIF watch — Retailer X", "Monitoring", "amber"]]).map(([a, s, t], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.line}`, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}><Chev />{a}</span><Pill tone={t}>{s}</Pill>
              </div>
            ))}
          </Card>
          <Card style={{ padding: 16 }}>
            <SectionLabel icon={Database}>Data steward</SectionLabel>
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
                <Pill tone="purple">Domain EVaR {fmtMoneyCompact(d.evar)}</Pill>
                <Pill tone={d.fresh === "stale" ? "amber" : "green"}>{d.fresh === "stale" ? `Stale · ${d.validated}` : `Validated · ${d.validated}`}</Pill>
              </div>
              <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.7, marginBottom: 14, padding: 12, background: C.faint, borderRadius: 8 }}>
                {d.id === "procurement" && "Procurement carries the highest domain exposure this cycle (€1.45M), driven by the cocoa price shock and a cover position 12 days below policy. Packet #24 (advance purchase + hedge) and Packet #25 (opportunistic buying window) are both in flight."}
                {d.id === "production" && "Production exposure (€650k) is moderate. The constraint catch on Line 2's allergen window has been resolved by shifting the proposed run to Line 3 at a €8k changeover cost — feasibility confirmed for the cascaded Packet #24 volume."}
                {d.id === "logistics" && "Logistics exposure (€450k) reflects Abidjan port congestion adding 8 days of lead time on 2 inbound vessels. A reroute via Valencia is part of Packet #24's recommended portfolio."}
                {d.id === "commercial" && "Commercial is in Pre-Alert: forecast deviation (9.4%) is approaching the 10% escalation threshold and agent confidence (63%) sits below the 65% trust gate. Recommendations from this domain are visibly flagged until confidence recovers."}
                {d.id === "finance" && "Finance exposure (€300k) is driven by an unhedged USD/EUR position and €2.1M of working capital above norm. Packet #24's portfolio protects €1.60M of margin; a forward FX cover is queued with Treasury to close the remaining exposure."}
              </div>
              <SectionLabel icon={Activity}>KPIs</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                {kpis.map(([l, v, t], i) => (
                  <div key={i} style={{ padding: 10, background: C.faint, borderRadius: 8 }}>
                    <div style={{ fontSize: 10.5, color: C.soft }}>{l}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: t === "red" ? C.red : t === "amber" ? C.amber : t === "green" ? C.green : C.ink, ...NUM }}>{v}</div>
                  </div>
                ))}
              </div>
              <SectionLabel icon={AlertTriangle}>Risks owned by this department</SectionLabel>
              <div style={{ marginBottom: 14 }}>
                {ownerRisks.length === 0 && <div style={{ fontSize: 12, color: C.soft }}>No risk-register items directly owned by this department.</div>}
                {ownerRisks.map((r) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.line}`, fontSize: 12.5 }}>
                    <span style={{ fontWeight: 600 }}>#{r.id} {r.name}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Pill tone={r.source === "external" ? "amber" : "green"} style={{ textTransform: "capitalize" }}>{r.source}</Pill>
                      <Pill tone="purple">{fmtMoneyCompact(r.impact)}</Pill>
                    </div>
                  </div>
                ))}
              </div>
              <SectionLabel icon={ShieldCheck}>Steward sign-off</SectionLabel>
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
              <SectionLabel icon={ShieldCheck}>COSO ERM 2017 — five components, applied</SectionLabel>
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
              <SectionLabel icon={Search}>The four audit checks — what they really are</SectionLabel>
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
              <SectionLabel icon={Cpu}>Model & cost console</SectionLabel>
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
              <div style={{ padding: "12px 16px 0" }}><SectionLabel icon={Database}>Closed agent registry — 9 governed components</SectionLabel></div>
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
              <SectionLabel icon={CheckCircle2}>Approval tiers — COSO governance & culture</SectionLabel>
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
          <SectionLabel icon={Activity}>Pre-go-live backtest — the 2024–2026 cocoa market, replayed</SectionLabel>
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

  /* ─── Module banner headers ──────────────────────────────────────────────── */
  const GradSep = () => <div style={{ height: 2.5, background: "linear-gradient(90deg,transparent 0%,#A100FF 22%,#5BC4FF 52%,#A100FF 78%,transparent 100%)", opacity: 0.82, borderRadius: 2, marginBottom: 18 }} />;
  const _biTC = { procurement: C.core, production: "#1E7145", logistics: "#0070C0", commercial: "#D41876", finance: "#B86E00", external: "#5B5B72" };
  const _biDom = K.domains.find(d => d.id === biTab);
  const _biAc = _biTC[biTab] || C.core;
  const _biLabel = { procurement: "Procurement Intelligence", production: "Production Intelligence", logistics: "Logistics Intelligence", commercial: "Commercial Intelligence", finance: "Finance Intelligence", external: "External Signal Intelligence" };

  const DHCHeader = () => (
    <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, position: "relative",
      background: "linear-gradient(120deg,#130830 0%,#1E0A45 50%,#2D0A55 100%)", boxShadow: "0 16px 44px rgba(70,0,115,0.18)" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
        <style>{`@keyframes mhd_p{0%,100%{r:4.5;opacity:.28}50%{r:7;opacity:.6}} @keyframes mhd_e{0%,100%{opacity:.12}50%{opacity:.32}}`}</style>
        <defs><pattern id="mhd_g" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.08"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#mhd_g)"/>
        <line x1="820" y1="28" x2="920" y2="56" stroke={C.core} strokeWidth="1" style={{ animation: "mhd_e 3s ease-in-out infinite" }}/>
        <line x1="920" y1="56" x2="878" y2="95" stroke={C.core} strokeWidth="1" style={{ animation: "mhd_e 3.6s ease-in-out infinite" }}/>
        <line x1="820" y1="28" x2="878" y2="95" stroke={C.core} strokeWidth="0.8" style={{ animation: "mhd_e 4.2s ease-in-out infinite" }}/>
        <line x1="878" y1="95" x2="955" y2="112" stroke="#fff" strokeWidth="0.6" opacity="0.12"/>
        <circle cx="820" cy="28" r="4.5" fill={C.core} style={{ animation: "mhd_p 2.8s ease-in-out infinite" }}/>
        <circle cx="920" cy="56" r="4.5" fill={C.deep} style={{ animation: "mhd_p 3.3s ease-in-out infinite" }}/>
        <circle cx="878" cy="95" r="4.5" fill={C.core} style={{ animation: "mhd_p 3.9s ease-in-out infinite" }}/>
        <circle cx="955" cy="112" r="3" fill="#fff" opacity="0.22"/>
        <path d="M40 75 C300 22 520 110 760 48 S1060 25 1240 68" stroke="#fff" strokeWidth="1" fill="none" strokeDasharray="10 16" opacity="0.10"/>
      </svg>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Database size={20} color={C.core}/>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Data Health Center</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginTop: 1 }}>Company Master Knowledge Graph</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>8 sources · {EG_NODE_COUNT} graph nodes · steward governance active</div>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        {[
          ["Graph Score",   "91 / 100",         C.green],
          ["Trust Gate",    "Active",            C.green],
          ["Validated",     "7 / 8",             C.amber],
          ["AI Confidence", `${K.confidence}%`,  "rgba(255,255,255,0.85)"],
        ].map(([l, v, c]) => (
          <div key={l} style={{ textAlign: "center", padding: "0 15px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c, ...NUM, letterSpacing: -0.5 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const GovernanceHeader = () => (
    <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, position: "relative",
      background: "linear-gradient(120deg,#130830 0%,#1E0A45 50%,#2D0A55 100%)", boxShadow: "0 16px 44px rgba(70,0,115,0.18)" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="mhg_g" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.08"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#mhg_g)"/>
        <path d="M40 76 C280 22 540 112 800 50 S1090 20 1240 64" stroke="#fff" strokeWidth="1" fill="none" strokeDasharray="10 16" opacity="0.10"/>
      </svg>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck size={20} color={C.core}/>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Value Center</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginTop: 1 }}>FactoryMind implementation outlook</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>Modeled enterprise improvement after scenario analysis, AI guidance, and mitigation orchestration</div>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        {[
          ["Residual EVaR", fmtMoneyCompact(1.2), C.green],
          ["Value Protected", fmtMoneyCompact(1.6), C.green],
          ["Confidence", `91%`, C.green],
        ].map(([l, v, c]) => (
          <div key={l} style={{ textAlign: "center", padding: "0 15px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c, ...NUM, letterSpacing: -0.5 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const BIHeader = () => (
    <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, position: "relative",
      background: "linear-gradient(120deg,#130830 0%,#1E0A45 50%,#2D0A55 100%)", boxShadow: "0 16px 44px rgba(70,0,115,0.18)" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
        <style>{`@keyframes mhb_s{from{stroke-dashoffset:80}to{stroke-dashoffset:0}}`}</style>
        <defs><pattern id="mhb_g" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.08"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#mhb_g)"/>
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="660" y1={18 + i * 26} x2="1240" y2={18 + i * 26} stroke={_biAc} strokeWidth="0.9" strokeDasharray="14 22" opacity={0.09 + i * 0.02}
            style={{ animation: `mhb_s ${2.4 + i * 0.45}s linear infinite` }}/>
        ))}
        <path d="M40 68 C280 28 500 108 760 46 S1070 18 1240 64" stroke="#fff" strokeWidth="1" fill="none" strokeDasharray="10 16" opacity="0.09"/>
      </svg>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Activity size={20} color={_biAc}/>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Business Intelligence</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginTop: 1 }}>{_biLabel[biTab] || "Intelligence"}</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
              {_biDom ? `${_biDom.driver} · steward ${_biDom.steward}` : "6 external feeds active · ICE cocoa z-score +2.3 · West Africa rainfall anomaly"}
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        {[
          ["Domain EVaR",  _biDom ? fmtMoneyCompact(_biDom.evar) : "—",  _biDom?.state === "High-Risk" ? C.red : "rgba(255,255,255,0.85)"],
          ["Status",       _biDom?.state || "Monitoring",                  _biDom?.state === "High-Risk" ? C.red : _biDom?.state === "Pre-Alert" ? C.amber : C.green],
          ["Confidence",   `${_biDom?.conf || 84}%`,                        (_biDom?.conf || 84) < 70 ? C.amber : C.green],
          ["AI Agents",    "6 active",                                      "rgba(255,255,255,0.85)"],
        ].map(([l, v, c]) => (
          <div key={l} style={{ textAlign: "center", padding: "0 15px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c, ...NUM, letterSpacing: -0.5 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const RiskMapHeader = () => (
    <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, position: "relative",
      background: "linear-gradient(120deg,#130830 0%,#1E0A45 50%,#2D0A55 100%)", boxShadow: "0 16px 44px rgba(70,0,115,0.18)" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
        <style>{`@keyframes mhrm_r{0%{r:28;opacity:.28}100%{r:88;opacity:0}} @keyframes mhrm_sw{from{stroke-dashoffset:120;opacity:.16}to{stroke-dashoffset:0;opacity:.34}}`}</style>
        <defs><pattern id="mhrm_g" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.08"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#mhrm_g)"/>
        <circle cx="960" cy="62" r="28" fill="none" stroke={C.red} strokeWidth="1" style={{ animation: "mhrm_r 3s ease-out infinite" }}/>
        <circle cx="960" cy="62" r="28" fill="none" stroke={C.red} strokeWidth="1" style={{ animation: "mhrm_r 3s ease-out infinite", animationDelay: "1s" }}/>
        <circle cx="960" cy="62" r="28" fill="none" stroke={C.red} strokeWidth="1" style={{ animation: "mhrm_r 3s ease-out infinite", animationDelay: "2s" }}/>
        <circle cx="960" cy="62" r="6" fill={C.red} opacity="0.38"/>
        <path d="M40 80 C300 26 550 115 810 52 S1110 22 1260 70" stroke={C.red} strokeWidth="1.2" fill="none" strokeDasharray="12 18" style={{ animation: "mhrm_sw 1.4s ease-out both" }}/>
      </svg>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <GitBranch size={20} color={C.red}/>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Risk Map</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginTop: 1 }}>Active Signal Topology</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>Causal propagation graph · 8 risk signals · 5 operational domains</div>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        {[
          ["Enterprise EVaR", `€${evar.toFixed(2)}M`, C.red],
          ["Active Signals",  "8",                     "rgba(255,255,255,0.85)"],
          ["Risk Domains",    "5 / 5",                 C.amber],
          ["EES Score",       `${ees}`,                 ees < 55 ? C.red : ees < 70 ? C.amber : C.green],
        ].map(([l, v, c]) => (
          <div key={l} style={{ textAlign: "center", padding: "0 15px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: 1 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c, ...NUM, letterSpacing: -0.5 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const PacketHeader = () => (
    <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14, position: "relative",
      background: "linear-gradient(120deg,#130830 0%,#1E0A45 50%,#2D0A55 100%)", boxShadow: "0 16px 44px rgba(70,0,115,0.18)" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
        <style>{`@keyframes mhpk_orb{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-9px) scale(1.07)}}`}</style>
        <defs><pattern id="mhpk_g" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.08"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#mhpk_g)"/>
        <circle cx="20%" cy="50%" r="42" fill={C.core} opacity="0.07" style={{ transformOrigin:"20% 50%", animation:"mhpk_orb 3.4s ease-in-out infinite" }}/>
        <circle cx="45%" cy="50%" r="38" fill={C.deep} opacity="0.07" style={{ transformOrigin:"45% 50%", animation:"mhpk_orb 3.9s ease-in-out infinite" }}/>
        <circle cx="70%" cy="50%" r="44" fill={C.dark} opacity="0.06" style={{ transformOrigin:"70% 50%", animation:"mhpk_orb 4.3s ease-in-out infinite" }}/>
        <path d="M40 88 C260 22 420 118 640 56 S950 24 1160 78" stroke="#fff" strokeWidth="1.2" fill="none" strokeDasharray="12 18" opacity="0.10"/>
      </svg>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, padding: "18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(161,0,255,0.18)", border: "1px solid rgba(161,0,255,0.35)", display: "grid", placeItems: "center", flexShrink: 0 }}><FileCheck2 size={21} color={C.core}/></div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Decision Center</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 1 }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: -1, ...NUM }}>12</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>Active Cases</span>
              </div>
            </div>
          </div>
        <div style={{ flex: 1 }}/>
        {[
          ["Monitoring", "4", C.amber],
          ["Scenario",   "3", C.core],
          ["Planning",   "5", C.green],
        ].map(([l, v, col]) => (
          <div key={l} style={{ textAlign: "center", padding: "0 18px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 0.6 }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: col, ...NUM, letterSpacing: -0.5 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: FONT, height: "100vh", display: "flex", background: C.faint, color: C.ink, overflow: "hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:none} }
        @keyframes slideInRight { from{transform:translateX(100%)} to{transform:none} }
        @keyframes popIn { from{opacity:0; transform:scale(.92) translateY(10px)} to{opacity:1; transform:none} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        input[type=range]{ height: 4px; }
        ::-webkit-scrollbar{ width:8px; height:8px } ::-webkit-scrollbar-thumb{ background:${C.line}; border-radius:99px }
      `}</style>

      <div style={{ width: 226, background: C.bg, borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "12px 16px", minHeight: 62, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <svg width="38" height="38" viewBox="0 0 40 40" style={{ flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sb_g2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#A100FF"/>
                  <stop offset="100%" stopColor="#6600CC"/>
                </linearGradient>
              </defs>
              {/* Outer hexagon — static */}
              <polygon points="20,2 35,11 35,29 20,38 5,29 5,11" fill="#A100FF" fillOpacity="0.07" stroke="url(#sb_g2)" strokeWidth="1.8"/>
              {/* Inner hexagon — slow continuous rotation */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="9s" repeatCount="indefinite"/>
                <polygon points="20,10 27.5,14.5 27.5,25.5 20,30 12.5,25.5 12.5,14.5" fill="none" stroke="url(#sb_g2)" strokeWidth="1.1" opacity="0.55"/>
              </g>
              {/* Center dot — gentle breath */}
              <circle cx="20" cy="20" r="3" fill="url(#sb_g2)">
                <animate attributeName="r" values="3;4.2;3" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.75;1;0.75" dur="3s" repeatCount="indefinite"/>
              </circle>
            </svg>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 18.5, fontWeight: 900, letterSpacing: -0.7, lineHeight: 1.02, color: C.ink }}>FactoryMind</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                <span style={{ fontSize: 9.5, fontWeight: 900, color: C.core, letterSpacing: "0.12em", background: C.purpBg, padding: "2px 8px", borderRadius: 4, lineHeight: 1.2 }}>COCOARISK</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: 10, flex: 1 }}>
          {NAV.map(([id, label, Icon]) => {
            const active = screen === id;
            return (
              <div key={id} style={{ marginBottom: 2 }}>
                <button onClick={() => setScreen(id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: FONT, cursor: "pointer", border: "none", textAlign: "left", background: active ? C.purpBg : "transparent", color: active ? C.deep : C.ink, borderLeft: `3px solid ${active ? C.core : "transparent"}`, position: "relative" }}>
                  <Icon size={16} /> {label}
                  {id === "packet" && packetReady && !approved && <span style={{ position: "absolute", right: 10, width: 8, height: 8, borderRadius: 99, background: C.core, animation: "pulse 1.4s infinite" }} />}
                </button>
                {id === "bi" && active && (
                  <div style={{ margin: "4px 0 8px 22px", paddingLeft: 10, borderLeft: `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 3 }}>
                    {BI_TABS.map((tb) => {
                      const selected = biTab === tb.id;
                      const TabIcon = tb.icon;
                      return (
                        <button key={tb.id} onClick={() => { setScreen("bi"); setBiTab(tb.id); }} style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "7px 9px", borderRadius: 7, border: `1px solid ${selected ? C.core : "transparent"}`, background: selected ? C.purpBg : "transparent", color: selected ? C.deep : C.soft, cursor: "pointer", fontFamily: FONT, fontSize: 11.5, fontWeight: 700, textAlign: "left" }}>
                          <TabIcon size={13} />
                          <span>{tb.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Challenge badge */}
        <div style={{ margin: "0 10px 12px", borderRadius: 10, overflow: "hidden", position: "relative", background: "linear-gradient(135deg,#130830 0%,#2D0A55 60%,#4A0E86 100%)", border: "1px solid rgba(161,0,255,0.28)", boxShadow: "0 4px 18px rgba(100,0,200,0.18)" }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="cb_g" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M 14 0 L 0 0 0 14" fill="none" stroke="#fff" strokeWidth="0.4"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#cb_g)"/>
          </svg>
          <div style={{ position: "relative", padding: "10px 12px" }}>
            <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Presented at</div>
            <div style={{ fontSize: 12.5, fontWeight: 900, color: "#fff", letterSpacing: -0.2, lineHeight: 1.2 }}>LUISS Business School</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: C.core, background: "rgba(161,0,255,0.18)", border: "1px solid rgba(161,0,255,0.35)", borderRadius: 4, padding: "1px 6px", letterSpacing: 0.3 }}>Accenture Challenge</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.55)", ...NUM }}>2026</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.line}`, background: C.bg, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, background: C.greenBg, border: `1px solid ${C.green}30` }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: C.green, animation: "pulse 2s infinite", flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, fontWeight: 800, color: C.green, fontFamily: FONT, ...NUM }}>Signal refresh · {secs}s ago</span>
          </div>
          <button onClick={() => setFeedOpen(!feedOpen)} style={{ display: "flex", alignItems: "center", gap: 7, background: C.bg, border: `1px solid ${C.line}`, color: C.ink, padding: "9px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
            <Radio size={14} color={C.core} /> Agent Feed
          </button>
          <button onClick={() => openPacketView(26, "monitoring")} style={{ display: "flex", alignItems: "center", gap: 7, background: C.bg, border: `1px solid ${C.line}`, color: C.ink, padding: "9px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>
            <AlertTriangle size={14} color={C.red} /> Alerts {alertCount}
          </button>
          <button onClick={() => { setScreen("scenario"); showToast("Live episode opened in Scenario Room"); }} style={{ display: "flex", alignItems: "center", gap: 7, background: C.core, border: "none", color: "#fff", padding: "10px 16px", borderRadius: 10, fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: FONT }}>
            <Play size={14} fill="#fff" /> Run live episode
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, overflowY: "auto", padding: 20 }}>
            {screen === "map" && <div style={{ animation: "slideIn .38s ease both" }}><RiskMapHeader /><GradSep /><div style={{ height: "calc(100vh - 220px)" }}><RiskMap /></div></div>}
            {screen === "scenario" && ScenarioRoom()}
            {screen === "packet" && <div style={{ animation: "slideIn .38s ease both" }}><PacketHeader /><GradSep />{Packet()}</div>}
            {screen === "dhc" && (
              <div style={{ animation: "slideIn .38s ease both" }}>
                <DHCHeader />
                <GradSep />
                <EnterpriseGraph onOpenPacket={(label) => {
                  if (label === "Packet #24") openPacketView(24, "scenario");
                  else if (label === "Packet #25") openPacketView(25, "planning");
                  else if (label === "Packet #26") openPacketView(26, "monitoring");
                  else if (label === "Report #7") setScreen("reports");
                  else if (label === "Scenario #3") setScreen("scenario");
                }} />
              </div>
            )}
            {screen === "governance" && (
              <div style={{ animation: "slideIn .38s ease both" }}>
                <GovernanceHeader />
                <GradSep />
                <GovernanceDashboard
                  sEvar={sEvar}
                  sEes={sEes}
                  portfolio={dhcPortfolio}
                  activeScenarioName={dhcActiveScenarioName}
                  activeSignalCount={activeSignalCount}
                  selectedActions={selectedActions}
                />
              </div>
            )}
            {screen === "control" && ControlCenter()}
            {screen === "bi" && <div style={{ animation: "slideIn .38s ease both" }}><BIHeader /><GradSep /><BI biTab={biTab} setBiTab={setBiTab} onGenerateReport={() => setScreen("reports")} /></div>}
            {screen === "reports" && <Reports />}
          </div>

          {feedOpen && (
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 332, background: C.bg, borderLeft: `1px solid ${C.line}`, display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 40, boxShadow: "-8px 0 24px rgba(10,10,15,0.10)", animation: "slideInRight .28s ease" }}>
              <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase", color: C.soft }}>Orchestration Pipeline</div>
                  <div style={{ fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: C.green, animation: "pulse 2s infinite" }} /> Signal → Graph → Orchestrator → Packet
                  </div>
                </div>
                <button onClick={() => setFeedOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={15} color={C.soft} /></button>
              </div>
              <div ref={feedRef} style={{ flex: 1, overflowY: "auto", padding: "14px 14px 18px" }}>
                {pipelineItems.map((e, idx) => {
                  const agentName = e.agent;
                  const agentKey = e.agentKey;
                  const status = e.status || statusFromEvent(e);
                  const summary = e.summary;
                  const Icon = AGENT_ICON[agentKey] || Network;
                  const st = STATUS_STYLE[status] || STATUS_STYLE.Monitoring;
                  const open = hoverFeed === (e.key || `${e.ts}-${idx}`);
                  const go = () => {
                    setFeedOpen(false);
                    if (agentKey === "orchestrator" || agentKey === "audit") openPacketView(24, "scenario");
                    else if (agentKey === "procurement" || agentKey === "logistics" || agentKey === "commercial" || agentKey === "finance" || agentKey === "production" || agentKey === "external") { setBiTab(agentKey === "weather" ? "external" : agentKey); setScreen("bi"); }
                    else { setScreen("scenario"); }
                  };
                  return (
                    <div key={e.key || `${e.ts}-${idx}`} style={{ marginBottom: idx < pipelineItems.length - 1 ? 8 : 0 }}>
                      <div
                        onClick={go}
                        onMouseEnter={() => setHoverFeed(e.key || `${e.ts}-${idx}`)}
                        onMouseLeave={() => setHoverFeed(null)}
                        style={{ cursor: "pointer", borderRadius: 12, border: `1px solid ${open ? st.c : C.line}`, background: open ? C.faint : "#fff", padding: "11px 12px", boxShadow: open ? "0 8px 22px rgba(10,10,15,0.06)" : "none", transition: "all .16s ease" }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 10 }}>
                          <div style={{ fontSize: 10.5, color: C.soft, fontWeight: 800, ...NUM }}>{e.ts}</div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                              <Icon size={13} color={st.c} strokeWidth={1.9} />
                              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", color: C.dark }}>{agentName}</span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9.5, fontWeight: 800, color: st.c, background: st.bg, borderRadius: 999, padding: "3px 8px" }}>
                                <span style={{ width: 5, height: 5, borderRadius: 99, background: st.c }} />{status}
                              </span>
                            </div>
                            <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.38, fontWeight: 650 }}>{summary}</div>
                            {(e.conf != null || e.evar) && (
                              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6, fontSize: 9.5, color: C.soft }}>
                                {e.conf != null && <span><b style={{ color: C.ink, ...NUM }}>{e.conf}%</b> confidence</span>}
                                {e.evar && <span><b style={{ color: C.ink }}>{e.evar}</b> impact</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {idx < pipelineItems.length - 1 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 6px 6px 20px", color: C.soft }}>
                          <span style={{ fontSize: 14, color: C.core }}>↓</span>
                          <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: C.deep }}>{e.bridge || "Graph Updated"}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
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
              <div style={{ fontSize: 13, fontWeight: 800 }}>FactoryMind Analyst</div>
              <div style={{ fontSize: 10.5, color: C.soft }}>Figures from the engines · narrative by Claude</div>
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
