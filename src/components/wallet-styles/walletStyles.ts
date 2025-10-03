export type WalletStyle = "classic" | "papery" | "cartoony" | "cute" | "oldmoney";

export interface WalletStyleConfig {
  name: string;
  emoji: string;
  description: string;
  walletColors: string;
  walletBorder: string;
  walletTexture: string;
  claspColor: string;
  brandText: string;
  brandTextColor: string;
  totalTextColor: string;
  cardColors: {
    checking: string;
    savings: string;
    credit: string;
    investment: string;
    cash: string;
    asset: string;
    property: string;
    vehicle: string;
    other: string;
  };
  summaryCardStyle: (type: "active" | "assets" | "worth") => string;
}

export const walletStyles: Record<WalletStyle, WalletStyleConfig> = {
  classic: {
    name: "Classic Leather",
    emoji: "👛",
    description: "Traditional brown leather wallet",
    walletColors: "from-amber-800 via-brown-700 to-amber-900",
    walletBorder: "border-amber-950",
    walletTexture: "opacity-30 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]",
    claspColor: "from-yellow-600 to-yellow-800",
    brandText: "My Wealth Wallet",
    brandTextColor: "text-amber-600/50",
    totalTextColor: "text-amber-100",
    cardColors: {
      checking: "from-blue-500 to-blue-700",
      savings: "from-green-500 to-green-700",
      credit: "from-red-500 to-red-700",
      investment: "from-purple-500 to-purple-700",
      cash: "from-amber-500 to-amber-700",
      asset: "from-pink-500 to-pink-700",
      property: "from-stone-500 to-stone-700",
      vehicle: "from-cyan-500 to-cyan-700",
      other: "from-gray-500 to-gray-700",
    },
    summaryCardStyle: (type) => {
      const styles = {
        active: "from-emerald-50 to-emerald-100 border-emerald-200",
        assets: "from-blue-50 to-blue-100 border-blue-200",
        worth: "from-amber-50 to-amber-100 border-amber-200",
      };
      return styles[type];
    },
  },

  papery: {
    name: "Paper Wallet",
    emoji: "📄",
    description: "Cute paper craft style with tape and doodles",
    walletColors: "from-yellow-50 via-amber-50 to-orange-50",
    walletBorder: "border-amber-300",
    walletTexture: "opacity-40 bg-[repeating-linear-gradient(90deg,rgba(139,69,19,0.1)_0px,transparent_2px,transparent_8px)]",
    claspColor: "from-red-400 to-red-600",
    brandText: "💰 My Money Folder",
    brandTextColor: "text-stone-700",
    totalTextColor: "text-stone-800",
    cardColors: {
      checking: "from-blue-200 to-blue-300",
      savings: "from-green-200 to-green-300",
      credit: "from-red-200 to-red-300",
      investment: "from-purple-200 to-purple-300",
      cash: "from-amber-200 to-amber-300",
      asset: "from-pink-200 to-pink-300",
      property: "from-stone-200 to-stone-300",
      vehicle: "from-cyan-200 to-cyan-300",
      other: "from-gray-200 to-gray-300",
    },
    summaryCardStyle: (type) => {
      const styles = {
        active: "from-green-100 to-lime-100 border-green-300",
        assets: "from-sky-100 to-blue-100 border-sky-300",
        worth: "from-yellow-100 to-amber-100 border-yellow-300",
      };
      return styles[type];
    },
  },

  cartoony: {
    name: "Cartoon Fun",
    emoji: "🎨",
    description: "Vibrant cartoon style with bold colors",
    walletColors: "from-purple-500 via-pink-500 to-red-500",
    walletBorder: "border-purple-900",
    walletTexture: "opacity-20 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.3)_0%,transparent_70%)]",
    claspColor: "from-yellow-400 to-orange-500",
    brandText: "🌟 Super Wallet!",
    brandTextColor: "text-white/90",
    totalTextColor: "text-white",
    cardColors: {
      checking: "from-blue-400 to-blue-600",
      savings: "from-green-400 to-green-600",
      credit: "from-red-400 to-red-600",
      investment: "from-purple-400 to-purple-600",
      cash: "from-yellow-400 to-yellow-600",
      asset: "from-pink-400 to-pink-600",
      property: "from-orange-400 to-orange-600",
      vehicle: "from-cyan-400 to-cyan-600",
      other: "from-gray-400 to-gray-600",
    },
    summaryCardStyle: (type) => {
      const styles = {
        active: "from-lime-200 to-green-300 border-lime-400",
        assets: "from-cyan-200 to-blue-300 border-cyan-400",
        worth: "from-yellow-200 to-orange-300 border-yellow-400",
      };
      return styles[type];
    },
  },

  cute: {
    name: "Kawaii Pastel",
    emoji: "🌸",
    description: "Soft pastel colors with adorable details",
    walletColors: "from-pink-200 via-rose-200 to-pink-300",
    walletBorder: "border-pink-400",
    walletTexture: "opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.5)_0%,transparent_70%)]",
    claspColor: "from-pink-400 to-rose-500",
    brandText: "♡ Cute Money Pouch ♡",
    brandTextColor: "text-pink-600",
    totalTextColor: "text-pink-800",
    cardColors: {
      checking: "from-blue-200 to-blue-300",
      savings: "from-green-200 to-green-300",
      credit: "from-rose-300 to-rose-400",
      investment: "from-purple-200 to-purple-300",
      cash: "from-yellow-200 to-yellow-300",
      asset: "from-pink-300 to-pink-400",
      property: "from-orange-200 to-orange-300",
      vehicle: "from-cyan-200 to-cyan-300",
      other: "from-gray-200 to-gray-300",
    },
    summaryCardStyle: (type) => {
      const styles = {
        active: "from-green-100 to-emerald-200 border-green-300",
        assets: "from-blue-100 to-sky-200 border-blue-300",
        worth: "from-pink-100 to-rose-200 border-pink-300",
      };
      return styles[type];
    },
  },

  oldmoney: {
    name: "Old Money",
    emoji: "🎩",
    description: "Elegant vintage style with rich textures",
    walletColors: "from-slate-800 via-gray-800 to-stone-900",
    walletBorder: "border-stone-950",
    walletTexture: "opacity-20 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.05)_0px,transparent_2px,transparent_6px)]",
    claspColor: "from-amber-700 to-yellow-900",
    brandText: "EST. 1920 • PRIVATE RESERVE",
    brandTextColor: "text-amber-500/70",
    totalTextColor: "text-amber-300",
    cardColors: {
      checking: "from-slate-700 to-slate-900",
      savings: "from-emerald-800 to-green-900",
      credit: "from-red-900 to-rose-950",
      investment: "from-indigo-800 to-indigo-950",
      cash: "from-amber-800 to-yellow-900",
      asset: "from-purple-900 to-purple-950",
      property: "from-stone-700 to-stone-900",
      vehicle: "from-cyan-800 to-cyan-950",
      other: "from-gray-700 to-gray-900",
    },
    summaryCardStyle: (type) => {
      const styles = {
        active: "from-emerald-900 to-green-800 border-emerald-700 text-emerald-100",
        assets: "from-slate-800 to-slate-700 border-slate-600 text-slate-100",
        worth: "from-amber-900 to-yellow-800 border-amber-700 text-amber-100",
      };
      return styles[type];
    },
  },
};
