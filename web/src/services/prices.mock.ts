export type PricePoint = {
  symbol: string;
  price: number; // in ZAR for now
  change24hPct: number;
};

export type PriceMap = Record<string, PricePoint>;

let state: PriceMap = {
  BTC: { symbol: "BTC", price: 1185000, change24hPct: 1.42 },
  ETH: { symbol: "ETH", price: 62450, change24hPct: -0.85 },
  SOL: { symbol: "SOL", price: 3250, change24hPct: 3.12 },
  XRP: { symbol: "XRP", price: 11.8, change24hPct: 0.24 },
};

function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function getMockPrices(): PriceMap {
  return { ...state };
}

// Simulate a lightweight "refresh" (random walk) to power UI + automation
export async function refreshMockPrices(): Promise<PriceMap> {
  // tiny artificial latency to feel real
  await new Promise((r) => setTimeout(r, 200));

  const next: PriceMap = {};
  for (const sym of Object.keys(state)) {
    const current = state[sym];

    // random walk price +/- 0.0% to 1.2%
    const driftPct = randBetween(-1.2, 1.2);
    const nextPrice = current.price * (1 + driftPct / 100);

    // random walk 24h change +/- 0.6
    const nextChange = current.change24hPct + randBetween(-0.6, 0.6);

    next[sym] = {
      symbol: sym,
      price: round2(nextPrice),
      change24hPct: round2(nextChange),
    };
  }

  state = next;
  return { ...state };
}
