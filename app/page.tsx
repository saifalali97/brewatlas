import Link from "next/link";

const featuredRecipes = [
  {
    name: "Ethiopian Yirgacheffe Pour Over",
    origin: "Gedeo Zone, Ethiopia",
    method: "V60 · Light Roast",
    ratio: "1:16",
    time: "3:30",
    level: "Intermediate",
    notes: "Jasmine, bergamot, and stone fruit with a silky finish.",
  },
  {
    name: "Kyoto Cold Brew",
    origin: "Huila, Colombia",
    method: "Slow Drip · Medium Roast",
    ratio: "1:12",
    time: "8 hr",
    level: "Beginner",
    notes: "Dark chocolate and caramel with zero bitterness.",
  },
  {
    name: "Signature Cortado",
    origin: "Antigua, Guatemala",
    method: "Espresso · Medium-Dark",
    ratio: "1:1",
    time: "25 sec",
    level: "Advanced",
    notes: "Velvety microfoam over a balanced double shot.",
  },
  {
    name: "Espresso Tonic",
    origin: "Nyeri, Kenya",
    method: "Espresso · Light-Medium",
    ratio: "1:4",
    time: "30 sec",
    level: "Intermediate",
    notes: "Bright citrus sparkle over a syrupy Kenyan base.",
  },
  {
    name: "Panama Geisha Chemex",
    origin: "Boquete, Panama",
    method: "Chemex · Light Roast",
    ratio: "1:15",
    time: "4:00",
    level: "Advanced",
    notes: "Jasmine tea, mango, and honey with extraordinary clarity.",
  },
  {
    name: "Sumatra Mandheling Moka",
    origin: "North Sumatra, Indonesia",
    method: "Moka Pot · Dark Roast",
    ratio: "1:10",
    time: "5:00",
    level: "Beginner",
    notes: "Earthy cedar, dark cocoa, and a heavy, syrupy body.",
  },
];

const brewMethods = [
  {
    name: "Pour Over",
    description: "Clarity and nuance. Full control over every variable.",
    recipes: "2,840",
  },
  {
    name: "Espresso",
    description: "Pressure, precision, and the foundation of café culture.",
    recipes: "3,120",
  },
  {
    name: "French Press",
    description: "Full-bodied immersion with rich oils and depth.",
    recipes: "980",
  },
  {
    name: "Aeropress",
    description: "Versatile, fast, and endlessly experiment-friendly.",
    recipes: "1,450",
  },
  {
    name: "Cold Brew",
    description: "Slow extraction for smooth, low-acid refreshment.",
    recipes: "760",
  },
  {
    name: "Siphon",
    description: "Theatrical vacuum brewing with exceptional clarity.",
    recipes: "420",
  },
];

const coffeeOrigins = [
  { name: "Ethiopia", region: "Birthplace of Arabica", recipes: "1,840", x: 58, y: 48 },
  { name: "Colombia", region: "Andean highlands", recipes: "2,100", x: 28, y: 50 },
  { name: "Brazil", region: "Cerrado & Minas Gerais", recipes: "1,620", x: 34, y: 58 },
  { name: "Kenya", region: "Nyeri & Kirinyaga", recipes: "980", x: 59, y: 52 },
  { name: "Guatemala", region: "Antigua & Huehuetenango", recipes: "740", x: 24, y: 46 },
  { name: "Indonesia", region: "Sumatra & Java", recipes: "860", x: 82, y: 52 },
  { name: "Panama", region: "Boquete Geisha", recipes: "320", x: 26, y: 48 },
  { name: "Yemen", region: "Haraz & Matari", recipes: "180", x: 61, y: 44 },
];

const topRoasters = [
  {
    name: "Onyx Coffee Lab",
    location: "Rogers, Arkansas",
    specialty: "Competition-grade single origins",
    rating: "4.9",
  },
  {
    name: "Counter Culture",
    location: "Durham, North Carolina",
    specialty: "Direct trade and education",
    rating: "4.8",
  },
  {
    name: "Saint Frank",
    location: "San Francisco, California",
    specialty: "Light roasts with terroir focus",
    rating: "4.9",
  },
  {
    name: "Tim Wendelboe",
    location: "Oslo, Norway",
    specialty: "Nordic-style precision roasting",
    rating: "5.0",
  },
  {
    name: "La Cabra",
    location: "Aarhus, Denmark",
    specialty: "Scandinavian clarity and sweetness",
    rating: "4.9",
  },
  {
    name: "Koppi",
    location: "Helsingborg, Sweden",
    specialty: "Seasonal microlots and blends",
    rating: "4.8",
  },
];

const testimonials = [
  {
    quote:
      "BrewAtlas transformed how I train my team. Every recipe is dialed, documented, and reproducible across shifts.",
    name: "Elena Vasquez",
    role: "Head Barista, Formative Coffee",
    location: "Portland, OR",
  },
  {
    quote:
      "The origin maps and ratio calculators alone are worth Premium. It's the most thoughtful coffee platform I've used.",
    name: "James Okonkwo",
    role: "Roaster & Q Grader",
    location: "London, UK",
  },
  {
    quote:
      "We partner with roasters worldwide. BrewAtlas is where our customers discover the perfect brew for every bag we ship.",
    name: "Sofia Lindström",
    role: "Founder, Nord Roast Collective",
    location: "Stockholm, SE",
  },
];

const pricingPlans = [
  {
    name: "Explorer",
    price: "Free",
    period: "forever",
    description: "Start your specialty coffee journey.",
    features: [
      "500+ community recipes",
      "Basic brew calculators",
      "Save up to 10 favorites",
      "Weekly origin spotlights",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Barista",
    price: "$12",
    period: "per month",
    description: "For enthusiasts who brew daily.",
    features: [
      "Full recipe library (12,400+)",
      "Advanced extraction tools",
      "Unlimited saved recipes",
      "Roaster-exclusive releases",
      "Offline mobile access",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Roaster",
    price: "$99",
    period: "per year",
    description: "Built for cafés and professionals.",
    features: [
      "Everything in Barista",
      "Team accounts (up to 10)",
      "Custom recipe publishing",
      "Analytics dashboard",
      "Priority roaster support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "What makes BrewAtlas different from other recipe sites?",
    answer:
      "Every recipe on BrewAtlas is tested by professional baristas across multiple equipment setups, water profiles, and grind settings. We document ratios, temperatures, and timing with the precision specialty coffee demands — not generic instructions.",
  },
  {
    question: "Can I use BrewAtlas recipes with any equipment?",
    answer:
      "Yes. Recipes include equipment-specific variations for popular brewers like V60, Chemex, Kalita, espresso machines, and more. Grind size recommendations are calibrated for both home and commercial grinders.",
  },
  {
    question: "What's included in the Premium membership?",
    answer:
      "Premium unlocks the full recipe library, advanced brew calculators, unlimited saves, roaster-exclusive recipes, and offline access. The Roaster plan adds team accounts and publishing tools for cafés.",
  },
  {
    question: "Do roasters partner directly with BrewAtlas?",
    answer:
      "We work with over 840 specialty roasters worldwide. Partner roasters publish official recipes calibrated to their beans, so you always brew with confidence.",
  },
  {
    question: "Is there a free trial for Premium?",
    answer:
      "Barista members get a 14-day free trial with full access. No credit card required to explore the platform — upgrade only when you're ready.",
  },
];

function BrewMethodIcon({ method }: { method: string }) {
  const className = "h-8 w-8 text-amber-500/90 transition-colors duration-300 group-hover:text-amber-400";

  switch (method) {
    case "Pour Over":
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
          <path d="M16 4L8 14h16L16 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10 14v4c0 4 2.5 8 6 10 3.5-2 6-6 6-10v-4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 22h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "Espresso":
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
          <rect x="6" y="10" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 10V8a6 6 0 0112 0v2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 24v4M18 24v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "French Press":
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
          <rect x="9" y="8" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 14h14M9 20h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M23 12h2a2 2 0 012 2v8a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "Aeropress":
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
          <rect x="11" y="6" width="10" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 14h10M11 20h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 26v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "Cold Brew":
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
          <path d="M10 8h12l2 20H8l2-20z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12 14h8M12 18h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="22" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "Siphon":
      return (
        <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
          <circle cx="16" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="24" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 16v3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 19h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function WorldMap() {
  return (
    <svg
      viewBox="0 0 800 400"
      className="h-full w-full"
      aria-label="World map showing coffee origins"
      role="img"
    >
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(180,120,60,0.12)" />
          <stop offset="100%" stopColor="rgba(180,120,60,0)" />
        </radialGradient>
      </defs>
      <rect width="800" height="400" fill="url(#mapGlow)" rx="16" />
      {/* Grid lines */}
      {[...Array(9)].map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * 50}
          x2="800"
          y2={i * 50}
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        />
      ))}
      {[...Array(17)].map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * 50}
          y1="0"
          x2={i * 50}
          y2="400"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        />
      ))}
      {/* Simplified continents */}
      <path
        d="M120 120 Q160 100 200 110 T280 130 Q300 150 290 180 T260 220 Q220 240 180 230 T130 200 Q100 170 120 120Z"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
      <path
        d="M300 100 Q380 80 460 90 T580 110 Q620 130 600 160 T560 200 Q500 220 440 210 T360 190 Q310 160 300 100Z"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
      <path
        d="M340 220 Q400 210 460 230 T540 280 Q520 320 460 330 T380 310 Q340 280 340 220Z"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
      <path
        d="M560 140 Q640 130 700 150 T760 180 Q740 220 680 230 T600 210 Q560 180 560 140Z"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
      <path
        d="M620 240 Q680 230 720 260 T740 300 Q700 320 660 310 T620 280 Q610 260 620 240Z"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
      {/* Origin markers */}
      {coffeeOrigins.map((origin) => {
        const cx = (origin.x / 100) * 800;
        const cy = (origin.y / 100) * 400;
        return (
          <g key={origin.name}>
            <circle cx={cx} cy={cy} r="16" fill="rgba(217,119,6,0.08)" />
            <circle cx={cx} cy={cy} r="6" fill="rgba(217,119,6,0.9)" />
            <circle cx={cx} cy={cy} r="2.5" fill="#fef3c7" />
          </g>
        );
      })}
    </svg>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0705] font-sans text-stone-100">
      {/* Ambient gradient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(180,120,60,0.35),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(120,70,40,0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_10%_80%,rgba(90,50,30,0.25),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f0a]/40 via-transparent to-[#0a0705]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0705]/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-stone-50"
          >
            BrewAtlas
          </Link>
          <div className="hidden items-center gap-7 text-sm text-stone-400 lg:flex">
            <a href="#recipes" className="transition-colors duration-200 hover:text-stone-100">
              Recipes
            </a>
            <a href="#methods" className="transition-colors duration-200 hover:text-stone-100">
              Methods
            </a>
            <a href="#origins" className="transition-colors duration-200 hover:text-stone-100">
              Origins
            </a>
            <a href="#roasters" className="transition-colors duration-200 hover:text-stone-100">
              Roasters
            </a>
            <a href="#pricing" className="transition-colors duration-200 hover:text-stone-100">
              Pricing
            </a>
            <a href="#faq" className="transition-colors duration-200 hover:text-stone-100">
              FAQ
            </a>
          </div>
          <Link
            href="#pricing"
            className="rounded-full bg-amber-600/90 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-amber-500 hover:shadow-[0_0_24px_rgba(217,119,6,0.3)]"
          >
            Join Premium
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative px-6 pb-24 pt-20 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                Specialty Coffee, Perfected
              </p>
              <h1 className="bg-gradient-to-b from-stone-50 to-stone-400 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
                BrewAtlas
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-stone-400 sm:text-xl">
                The world&apos;s largest specialty coffee recipe platform.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="#recipes"
                  className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-stone-50 px-8 text-sm font-medium text-stone-900 transition-all duration-300 hover:bg-stone-200 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]"
                >
                  Explore Recipes
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full border border-stone-600/60 bg-white/5 px-8 text-sm font-medium text-stone-100 backdrop-blur-sm transition-all duration-300 hover:border-amber-600/50 hover:bg-white/10"
                >
                  Join Premium
                </Link>
              </div>
            </div>

            <div className="relative mx-auto mt-20 max-w-4xl">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-900/20 via-amber-700/10 to-stone-800/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900/80 to-stone-950/90 p-8 shadow-2xl backdrop-blur-sm sm:p-12">
                <div className="grid gap-6 sm:grid-cols-3">
                  {[
                    { label: "Recipes", value: "12,400+" },
                    { label: "Roasters", value: "840+" },
                    { label: "Countries", value: "62" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center sm:text-left">
                      <p className="text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Recipes */}
        <section id="recipes" className="px-6 py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                Curated Collection
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl lg:text-5xl">
                Featured Recipes
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-stone-400">
                Handpicked by our barista community. Each recipe includes grind
                size, water temperature, and step-by-step guidance.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredRecipes.map((recipe) => (
                <article
                  key={recipe.name}
                  className="group relative rounded-2xl border border-white/8 bg-white/[0.03] p-7 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-amber-700/30 hover:bg-white/[0.05] hover:shadow-[0_24px_48px_-12px_rgba(180,120,60,0.12)]"
                >
                  <div className="absolute right-5 top-5 rounded-full border border-amber-800/30 bg-amber-950/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-400/90">
                    Premium
                  </div>
                  <div className="pr-16">
                    <h3 className="text-lg font-medium tracking-tight text-stone-50 transition-colors duration-300 group-hover:text-amber-100">
                      {recipe.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-stone-500">{recipe.origin}</p>
                  </div>
                  <span className="mt-4 inline-block rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-stone-400">
                    {recipe.method}
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-stone-400">
                    {recipe.notes}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4 border-t border-white/5 pt-5 text-xs text-stone-500">
                    <span>
                      Ratio{" "}
                      <strong className="font-medium text-stone-300">{recipe.ratio}</strong>
                    </span>
                    <span>
                      Time{" "}
                      <strong className="font-medium text-stone-300">{recipe.time}</strong>
                    </span>
                    <span>
                      Level{" "}
                      <strong className="font-medium text-stone-300">{recipe.level}</strong>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Brew Methods */}
        <section
          id="methods"
          className="border-y border-white/5 bg-white/[0.02] px-6 py-28 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                Master Every Technique
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl lg:text-5xl">
                Brewing Methods
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-stone-400">
                From first pour to competition dial-in. Explore recipes organized
                by method, equipment, and skill level.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {brewMethods.map((method) => (
                <div
                  key={method.name}
                  className="group rounded-2xl border border-white/8 bg-[#0a0705]/60 p-7 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-amber-800/40 hover:bg-white/[0.03] hover:shadow-[0_20px_40px_-12px_rgba(180,120,60,0.1)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] transition-colors duration-300 group-hover:border-amber-800/30 group-hover:bg-amber-950/20">
                    <BrewMethodIcon method={method.name} />
                  </div>
                  <h3 className="mt-5 text-lg font-medium tracking-tight text-stone-50">
                    {method.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">
                    {method.description}
                  </p>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wider text-amber-600/70">
                    {method.recipes} recipes
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coffee Origins */}
        <section id="origins" className="px-6 py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                  From Farm to Cup
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl lg:text-5xl">
                  Coffee Origins
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-stone-400">
                  Trace every recipe to its source. Explore flavor profiles,
                  altitude data, and processing methods from the world&apos;s
                  greatest growing regions.
                </p>
                <div className="mt-10 space-y-3">
                  {coffeeOrigins.slice(0, 5).map((origin) => (
                    <div
                      key={origin.name}
                      className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 transition-all duration-300 hover:border-amber-800/30 hover:bg-white/[0.04]"
                    >
                      <div>
                        <p className="font-medium text-stone-50">{origin.name}</p>
                        <p className="text-sm text-stone-500">{origin.region}</p>
                      </div>
                      <span className="text-sm font-medium text-amber-600/80 transition-colors duration-300 group-hover:text-amber-500">
                        {origin.recipes}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-900/15 to-transparent blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900/60 to-stone-950/80 p-6 sm:p-8">
                  <WorldMap />
                  <div className="mt-6 flex flex-wrap gap-3">
                    {coffeeOrigins.map((origin) => (
                      <span
                        key={origin.name}
                        className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-stone-400"
                      >
                        {origin.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Roasters */}
        <section
          id="roasters"
          className="border-t border-white/5 bg-white/[0.01] px-6 py-28 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                Roaster Partners
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl lg:text-5xl">
                Top Roasters
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-stone-400">
                Discover recipes tailored to beans from the world&apos;s most
                respected specialty roasters.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topRoasters.map((roaster) => (
                <div
                  key={roaster.name}
                  className="group flex flex-col justify-between rounded-2xl border border-white/8 bg-gradient-to-br from-stone-900/40 to-transparent p-7 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-amber-800/30 hover:shadow-[0_20px_40px_-12px_rgba(180,120,60,0.1)]"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-medium tracking-tight text-stone-50">
                        {roaster.name}
                      </h3>
                      <span className="rounded-full bg-amber-950/50 px-2 py-0.5 text-xs font-medium text-amber-400">
                        {roaster.rating}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-stone-500">{roaster.location}</p>
                  </div>
                  <p className="mt-5 text-sm text-amber-600/80 transition-colors duration-300 group-hover:text-amber-500">
                    {roaster.specialty}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="px-6 py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                Trusted by Professionals
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl lg:text-5xl">
                What Baristas Say
              </h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map((item) => (
                <blockquote
                  key={item.name}
                  className="group flex flex-col rounded-2xl border border-white/8 bg-white/[0.02] p-8 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-amber-800/25 hover:bg-white/[0.04]"
                >
                  <p className="flex-1 text-base leading-relaxed text-stone-300">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <footer className="mt-8 border-t border-white/5 pt-6">
                    <p className="font-medium text-stone-50">{item.name}</p>
                    <p className="mt-1 text-sm text-stone-500">{item.role}</p>
                    <p className="mt-0.5 text-xs text-amber-600/70">{item.location}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Pricing */}
        <section id="pricing" className="border-y border-white/5 px-6 py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                Membership
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl lg:text-5xl">
                Premium Plans
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-stone-400">
                Choose the plan that fits your craft. Upgrade anytime as your
                coffee journey evolves.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-500 ease-out hover:-translate-y-1 sm:p-10 ${
                    plan.highlighted
                      ? "border-amber-700/40 bg-gradient-to-b from-amber-950/40 to-stone-950/60 shadow-[0_24px_48px_-12px_rgba(180,120,60,0.15)] hover:border-amber-600/50"
                      : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-600 px-4 py-1 text-xs font-medium text-white">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-stone-50">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-stone-50">
                        {plan.price}
                      </span>
                      {plan.price !== "Free" && (
                        <span className="text-sm text-stone-500">/{plan.period}</span>
                      )}
                    </div>
                    {plan.price === "Free" && (
                      <span className="text-sm text-stone-500">{plan.period}</span>
                    )}
                    <p className="mt-4 text-sm leading-relaxed text-stone-400">
                      {plan.description}
                    </p>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-stone-400"
                      >
                        <span className="mt-0.5 text-amber-600">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="#"
                    className={`mt-10 inline-flex h-12 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-amber-600 text-white hover:bg-amber-500 hover:shadow-[0_0_24px_rgba(217,119,6,0.3)]"
                        : "border border-white/10 bg-white/5 text-stone-100 hover:border-amber-700/40 hover:bg-white/10"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 py-28 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-16 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                Support
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl lg:text-5xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-white/8 bg-white/[0.02] transition-all duration-300 open:border-amber-800/30 open:bg-white/[0.04] hover:border-white/12"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-medium text-stone-50 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="shrink-0 text-stone-500 transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="border-t border-white/5 px-6 pb-5 pt-4">
                    <p className="text-sm leading-relaxed text-stone-400">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#080504] px-6 pt-20 pb-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Link
                href="/"
                className="text-xl font-semibold tracking-tight text-stone-50"
              >
                BrewAtlas
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-500">
                The definitive platform for specialty coffee recipes, origins,
                and brew science. Craft coffee, mapped.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-stone-400">
                Product
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-stone-500">
                <li>
                  <a href="#recipes" className="transition-colors duration-200 hover:text-stone-300">
                    Recipes
                  </a>
                </li>
                <li>
                  <a href="#methods" className="transition-colors duration-200 hover:text-stone-300">
                    Brew Methods
                  </a>
                </li>
                <li>
                  <a href="#origins" className="transition-colors duration-200 hover:text-stone-300">
                    Origins
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition-colors duration-200 hover:text-stone-300">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-stone-400">
                Company
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-stone-500">
                <li>
                  <Link href="#" className="transition-colors duration-200 hover:text-stone-300">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors duration-200 hover:text-stone-300">
                    Roaster Partners
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors duration-200 hover:text-stone-300">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors duration-200 hover:text-stone-300">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-stone-400">
                Legal
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-stone-500">
                <li>
                  <Link href="#" className="transition-colors duration-200 hover:text-stone-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors duration-200 hover:text-stone-300">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors duration-200 hover:text-stone-300">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-sm text-stone-600">
              © {new Date().getFullYear()} BrewAtlas. All rights reserved.
            </p>
            <p className="text-sm text-stone-600">
              Crafted for coffee lovers worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
