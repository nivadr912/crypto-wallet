import React, { useEffect, useMemo, useState } from "react";
import {
  getMockPrices,
  refreshMockPrices,
  type PriceMap,
} from "../services/prices.mock.ts";

type Holding = {
  id: string;
  symbol: string;
  name: string;
  amount: number;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPct(v: number) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function DashboardPage() {
  const [currency, setCurrency] = useState<"ZAR">("ZAR");
  const [prices, setPrices] = useState<PriceMap>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Mocked holdings (in-app for now)
  const holdings: Holding[] = useMemo(
    () => [
      { id: "btc", symbol: "BTC", name: "Bitcoin", amount: 0.0523 },
      { id: "eth", symbol: "ETH", name: "Ethereum", amount: 0.84 },
      { id: "sol", symbol: "SOL", name: "Solana", amount: 12.4 },
      { id: "xrp", symbol: "XRP", name: "XRP", amount: 580 },
    ],
    []
  );

  useEffect(() => {
    setPrices(getMockPrices());
  }, []);

  const rows = useMemo(() => {
    return holdings.map((h) => {
      const p = prices[h.symbol];
      const priceNow = p?.price ?? 0;
      const change24hPct = p?.change24hPct ?? 0;
      const priceYesterday = priceNow / (1 + change24hPct / 100);
      const valueNow = h.amount * priceNow;
      const valueYesterday = h.amount * priceYesterday;
      const valueChange = valueNow - valueYesterday;

      return {
        ...h,
        priceNow,
        change24hPct,
        valueNow,
        valueChange,
      };
    });
  }, [holdings, prices]);

  const totalBalance = useMemo(
    () => rows.reduce((sum, r) => sum + r.valueNow, 0),
    [rows]
  );

  const dayChangeAmount = useMemo(
    () => rows.reduce((sum, r) => sum + r.valueChange, 0),
    [rows]
  );

  const dayChangePct = useMemo(() => {
    const yesterday = rows.reduce((sum, r) => {
      const priceYesterday = r.priceNow / (1 + r.change24hPct / 100);
      return sum + r.amount * priceYesterday;
    }, 0);
    if (yesterday <= 0) return 0;
    return ((totalBalance - yesterday) / yesterday) * 100;
  }, [rows, totalBalance]);

  async function handleRefreshPrices() {
    setLoadingPrices(true);
    try {
      const next = await refreshMockPrices();
      setPrices(next);
    } finally {
      setLoadingPrices(false);
    }
  }

  const dayChangeTone =
    dayChangeAmount > 0 ? "pos" : dayChangeAmount < 0 ? "neg" : "neu";

  return (
    <div className="cp-shell" data-testid="app-shell">
      {/* LEFT SIDEBAR (match screenshot) */}
      <aside className="cp-sidebar">
        <div className="cp-brand">
          <img
            className="cp-brand-mark"
            src="/images/logo-mark.png"
            alt="CryptoPortfolio"
          />
          <div className="cp-brand-name">CryptoPortfolio</div>
        </div>

        <nav className="cp-nav">
          <button className="cp-nav-item active" type="button">
            <img
              className="cp-nav-ico"
              src="/images/icon-home.png"
              alt=""
              aria-hidden="true"
            />
            <span>Dashboard</span>
          </button>

          <button className="cp-nav-item" type="button">
            <img
              className="cp-nav-ico"
              src="/images/icon-accounts.png"
              alt=""
              aria-hidden="true"
            />
            <span>Accounts</span>
          </button>

          <button className="cp-nav-item" type="button">
            <img
              className="cp-nav-ico"
              src="/images/icon-assets.png"
              alt=""
              aria-hidden="true"
            />
            <span>Assets</span>
          </button>

          <button className="cp-nav-item" type="button">
            <img
              className="cp-nav-ico"
              src="/images/icon-settings.png"
              alt=""
              aria-hidden="true"
            />
            <span>Settings</span>
          </button>
        </nav>

        <div className="cp-sidebar-spacer" />

        <div className="cp-sidebar-panels">
          <div className="cp-panel">
            <div className="cp-panel-row">
              <img
                className="cp-panel-ico"
                src="/images/icon-currency.png"
                alt=""
                aria-hidden="true"
              />
              <div className="cp-panel-label">Currency: {currency}</div>
              <select
                className="cp-panel-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "ZAR")}
                aria-label="Currency"
              >
                <option value="ZAR">ZAR</option>
              </select>
            </div>
          </div>

          <div className="cp-panel">
            <div className="cp-panel-row">
              <img
                className="cp-panel-ico"
                src="/images/icon-refresh.png"
                alt=""
                aria-hidden="true"
              />
              <div className="cp-panel-label">Refresh</div>
              <button
                type="button"
                className="cp-panel-action"
                data-testid="refresh-prices"
                onClick={handleRefreshPrices}
                disabled={loadingPrices}
                aria-label="Refresh prices"
                title="Refresh prices"
              >
                {loadingPrices ? "…" : "⟳"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="cp-main">
        {/* top header strip */}
        <div className="cp-topbar" />

        {/* center welcome hero (match screenshot) */}
        <section className="cp-hero">
          <h1 className="cp-hero-title">Welcome to CryptoPortfolio</h1>
          <p className="cp-hero-subtitle">
            Track your crypto holdings, see live prices, and gain insights into
            your portfolio — all in one place.
          </p>

          <img
            className="cp-hero-illustration"
            src="/images/wallet-hero.png"
            alt=""
            aria-hidden="true"
          />

          <div className="cp-hero-actions">
            <button className="cp-btn primary" type="button">
              <span className="cp-btn-plus">＋</span>
              Create First Account
            </button>

            <button className="cp-btn ghost" type="button">
              <img
                className="cp-btn-ico"
                src="/images/icon-holding.png"
                alt=""
                aria-hidden="true"
              />
              Add First Holding <span className="cp-btn-arrow">›</span>
            </button>
          </div>

          <div className="cp-hero-currency">
            <span>Default Currency.</span>
            <select
              className="cp-hero-currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "ZAR")}
              aria-label="Default currency"
            >
              <option value="ZAR">ZAR</option>
            </select>
          </div>

          <div className="cp-hero-footnote">
            You're just a few clicks away from building your portfolio.
          </div>
        </section>

        {/* CoinStats-style summary + holdings (required testids) */}
        <section className="cp-summary">
          <div className="cp-metric">
            <div className="cp-metric-label">Total Balance</div>
            <div className="cp-metric-value" data-testid="total-balance">
              {formatMoney(totalBalance, currency)}
            </div>
          </div>

          <div className="cp-metric">
            <div className="cp-metric-label">24h Change</div>
            <div
              className={`cp-metric-value ${dayChangeTone}`}
              data-testid="day-change"
            >
              {formatMoney(dayChangeAmount, currency)}{" "}
              <span className="cp-metric-sub">
                ({formatPct(clamp(dayChangePct, -99, 999))})
              </span>
            </div>
          </div>
        </section>

        <section className="cp-table-wrap">
          <div className="cp-table-head">
            <div className="cp-table-title">Holdings</div>
            <button
              type="button"
              className="cp-mini-refresh"
              onClick={handleRefreshPrices}
              disabled={loadingPrices}
              aria-label="Refresh prices"
              title="Refresh prices"
            >
              Refresh
            </button>
          </div>

          <div className="cp-table-card">
            <table className="cp-table" data-testid="holdings-table">
              <thead>
                <tr>
                  <th align="left">Asset</th>
                  <th align="right">Holdings</th>
                  <th align="right">Price</th>
                  <th align="right">Value</th>
                  <th align="right">24h</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tone =
                    r.change24hPct > 0 ? "pos" : r.change24hPct < 0 ? "neg" : "";
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="cp-asset">
                          <img
                            className="cp-asset-ico"
                            src={`/images/coin-${r.symbol.toLowerCase()}.png`}
                            alt=""
                            aria-hidden="true"
                          />
                          <div className="cp-asset-meta">
                            <div className="cp-asset-name">{r.name}</div>
                            <div className="cp-asset-symbol">{r.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td align="right" className="mono">
                        {r.amount.toLocaleString("en-ZA", {
                          maximumFractionDigits: 8,
                        })}
                      </td>
                      <td align="right" className="mono">
                        {formatMoney(r.priceNow, currency)}
                      </td>
                      <td align="right" className="mono">
                        {formatMoney(r.valueNow, currency)}
                      </td>
                      <td align="right" className={`mono ${tone}`}>
                        {formatPct(r.change24hPct)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Component-scoped CSS (no extra files needed) */}
        <style>{`
          :root {
            --cp-bg: #f7f8fb;
            --cp-white: #ffffff;
            --cp-text: #121a2b;
            --cp-muted: #6b7280;
            --cp-blue: #1f5fd4;
            --cp-blue-2: #2b74ff;
            --cp-border: rgba(15, 23, 42, 0.08);
            --cp-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
          }

          .cp-shell {
            min-height: 100vh;
            display: grid;
            grid-template-columns: 320px 1fr;
            background: var(--cp-bg);
            color: var(--cp-text);
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
          }

          /* Sidebar */
          .cp-sidebar {
            background: radial-gradient(1200px 600px at -200px -200px, #2e4c8f 0%, rgba(46,76,143,0.0) 60%),
                        linear-gradient(180deg, #1a2d57 0%, #0f1d38 100%);
            padding: 22px 18px;
            display: flex;
            flex-direction: column;
            box-shadow: inset -1px 0 0 rgba(255,255,255,0.06);
          }

          .cp-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 10px 18px 10px;
          }

          .cp-brand-mark {
            width: 34px;
            height: 34px;
            object-fit: contain;
          }

          .cp-brand-name {
            color: #eaf0ff;
            font-weight: 700;
            letter-spacing: 0.2px;
            font-size: 20px;
          }

          .cp-nav {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding-top: 10px;
          }

          .cp-nav-item {
            width: 100%;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.04);
            color: rgba(234,240,255,0.85);
            border-radius: 10px;
            padding: 12px 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
          }

          .cp-nav-item:hover {
            transform: translateY(-1px);
            background: rgba(255,255,255,0.06);
            border-color: rgba(255,255,255,0.18);
          }

          .cp-nav-item.active {
            background: linear-gradient(180deg, var(--cp-blue-2), var(--cp-blue));
            border-color: rgba(255,255,255,0.25);
            color: #ffffff;
            box-shadow: 0 10px 22px rgba(31,95,212,0.35);
          }

          .cp-nav-ico {
            width: 18px;
            height: 18px;
            opacity: 0.95;
          }

          .cp-sidebar-spacer {
            flex: 1;
          }

          .cp-sidebar-panels {
            display: grid;
            gap: 10px;
          }

          .cp-panel {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.10);
            border-radius: 10px;
            padding: 10px 12px;
          }

          .cp-panel-row {
            display: grid;
            grid-template-columns: 22px 1fr auto;
            align-items: center;
            gap: 10px;
          }

          .cp-panel-ico {
            width: 18px;
            height: 18px;
            opacity: 0.9;
          }

          .cp-panel-label {
            color: rgba(234,240,255,0.82);
            font-size: 14px;
          }

          .cp-panel-select {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            color: #eaf0ff;
            border-radius: 8px;
            padding: 6px 8px;
            outline: none;
          }

          .cp-panel-action {
            width: 34px;
            height: 30px;
            border-radius: 8px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            color: #eaf0ff;
            cursor: pointer;
          }

          .cp-panel-action:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          /* Main */
          .cp-main {
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .cp-topbar {
            height: 68px;
            background: linear-gradient(180deg, #f0f2f6 0%, rgba(240,242,246,0.0) 100%);
            box-shadow: inset 0 -1px 0 var(--cp-border);
          }

          .cp-hero {
            padding: 44px 28px 14px 28px;
            max-width: 980px;
            margin: 0 auto;
            text-align: center;
          }

          .cp-hero-title {
            font-size: 44px;
            font-weight: 750;
            margin: 0;
            letter-spacing: -0.6px;
            color: #0f172a;
          }

          .cp-hero-subtitle {
            margin: 14px auto 0;
            max-width: 720px;
            color: #6b7280;
            font-size: 18px;
            line-height: 1.6;
          }

          .cp-hero-illustration {
            width: min(460px, 90%);
            margin: 26px auto 0;
            display: block;
            filter: drop-shadow(0 18px 40px rgba(15,23,42,0.10));
          }

          .cp-hero-actions {
            margin-top: 22px;
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
          }

          .cp-btn {
            border-radius: 10px;
            padding: 12px 18px;
            font-weight: 650;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            border: 1px solid var(--cp-border);
            cursor: pointer;
            box-shadow: 0 10px 22px rgba(15,23,42,0.06);
          }

          .cp-btn.primary {
            background: linear-gradient(180deg, var(--cp-blue-2), var(--cp-blue));
            color: #fff;
            border-color: rgba(255,255,255,0.2);
          }

          .cp-btn.ghost {
            background: #ffffff;
            color: #1f2937;
          }

          .cp-btn-plus {
            font-size: 18px;
            line-height: 0;
            margin-top: -1px;
          }

          .cp-btn-ico {
            width: 18px;
            height: 18px;
            opacity: 0.8;
          }

          .cp-btn-arrow {
            margin-left: 2px;
            color: #6b7280;
          }

          .cp-hero-currency {
            margin-top: 16px;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            border-radius: 10px;
            background: #ffffff;
            border: 1px solid var(--cp-border);
            color: #6b7280;
          }

          .cp-hero-currency-select {
            border: none;
            outline: none;
            background: transparent;
            color: #111827;
            font-weight: 700;
          }

          .cp-hero-footnote {
            margin-top: 22px;
            color: #6b7280;
          }

          /* Summary + Table */
          .cp-summary {
            max-width: 980px;
            margin: 18px auto 0;
            padding: 0 28px;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .cp-metric {
            background: #ffffff;
            border: 1px solid var(--cp-border);
            border-radius: 14px;
            padding: 14px 16px;
            box-shadow: var(--cp-shadow);
            text-align: left;
          }

          .cp-metric-label {
            color: #6b7280;
            font-size: 13px;
            margin-bottom: 6px;
          }

          .cp-metric-value {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.2px;
            color: #0f172a;
          }

          .cp-metric-sub {
            font-size: 14px;
            font-weight: 700;
            color: #6b7280;
            margin-left: 6px;
          }

          .pos { color: #0f7a3a; }
          .neg { color: #b42318; }
          .neu { color: #0f172a; }
          .mono { font-variant-numeric: tabular-nums; }

          .cp-table-wrap {
            max-width: 980px;
            margin: 14px auto 40px;
            padding: 0 28px;
          }

          .cp-table-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 14px 0 10px;
          }

          .cp-table-title {
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.2px;
          }

          .cp-mini-refresh {
            border-radius: 10px;
            padding: 10px 12px;
            border: 1px solid var(--cp-border);
            background: #ffffff;
            cursor: pointer;
            font-weight: 650;
            color: #1f2937;
          }

          .cp-mini-refresh:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .cp-table-card {
            background: #ffffff;
            border: 1px solid var(--cp-border);
            border-radius: 14px;
            overflow: hidden;
            box-shadow: var(--cp-shadow);
          }

          .cp-table {
            width: 100%;
            border-collapse: collapse;
          }

          .cp-table th {
            font-size: 12px;
            letter-spacing: 0.4px;
            text-transform: uppercase;
            color: #6b7280;
            background: #f8fafc;
            border-bottom: 1px solid var(--cp-border);
            padding: 12px 14px;
          }

          .cp-table td {
            padding: 12px 14px;
            border-bottom: 1px solid rgba(15, 23, 42, 0.06);
          }

          .cp-table tbody tr:hover {
            background: rgba(31, 95, 212, 0.04);
          }

          .cp-asset {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .cp-asset-ico {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            background: #f1f5f9;
            border: 1px solid rgba(15,23,42,0.08);
            object-fit: cover;
          }

          .cp-asset-name {
            font-weight: 800;
            color: #0f172a;
            line-height: 1.1;
          }

          .cp-asset-symbol {
            color: #6b7280;
            font-size: 12px;
            margin-top: 2px;
          }

          @media (max-width: 980px) {
            .cp-shell { grid-template-columns: 280px 1fr; }
            .cp-hero-title { font-size: 36px; }
            .cp-summary { grid-template-columns: 1fr; }
          }

          @media (max-width: 760px) {
            .cp-shell { grid-template-columns: 1fr; }
            .cp-sidebar { display: none; }
            .cp-hero { padding-top: 24px; }
          }
        `}</style>
      </main>
    </div>
  );
}
