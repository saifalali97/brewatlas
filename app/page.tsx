import Link from "next/link";
import { FaqAccordion } from "./components/faq-accordion";
import { BrewingMethodsSection } from "./components/brewing-methods-section";
import { FeaturedRecipesSection } from "./components/featured-recipes-section";
import { FloatingActions } from "./components/floating-actions";
import { HeroSection } from "./components/hero-section";
import { PremiumImage } from "./components/premium-image";
import { RevealOnScroll } from "./components/reveal-on-scroll";
import { RippleLink } from "./components/ripple-link";
import { SiteNav } from "./components/site-nav";
import { TiltCard } from "./components/tilt-card";

const unsplash = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const heroImage = unsplash("photo-1511920170033-f8396924c348", 1600);
const originsFarmImage = unsplash("photo-1447933601403-0c6688de566e", 1000);

const featuredRecipes = [
  {
    name: "Ethiopian Yirgacheffe Pour Over",
    country: "Ethiopia",
    origin: "Gedeo Zone, Ethiopia",
    brewMethod: "V60",
    roastLevel: "Light Roast",
    difficulty: "Intermediate" as const,
    ratio: "1:16",
    time: "3:30",
    notes: "Jasmine, bergamot, and stone fruit with a silky finish.",
    image: "/images/recipes/ethiopian-pour-over.png",
    premium: true,
    featured: true,
  },
  {
    name: "Kyoto Cold Brew",
    country: "Colombia",
    origin: "Huila, Colombia",
    brewMethod: "Cold Brew",
    roastLevel: "Medium Roast",
    difficulty: "Beginner" as const,
    ratio: "1:12",
    time: "8 hr",
    notes: "Dark chocolate and caramel with zero bitterness.",
    image: "/images/recipes/cold-brew.png",
    premium: true,
  },
  {
    name: "Signature Cortado",
    country: "Guatemala",
    origin: "Antigua, Guatemala",
    brewMethod: "Espresso",
    roastLevel: "Medium-Dark",
    difficulty: "Advanced" as const,
    ratio: "1:1",
    time: "25 sec",
    notes: "Velvety microfoam over a balanced double shot.",
    image: "/images/recipes/cortado.png",
    premium: true,
  },
  {
    name: "Espresso Tonic",
    country: "Kenya",
    origin: "Nyeri, Kenya",
    brewMethod: "Espresso",
    roastLevel: "Light-Medium",
    difficulty: "Intermediate" as const,
    ratio: "1:4",
    time: "30 sec",
    notes: "Bright citrus sparkle over a syrupy Kenyan base.",
    image: "/images/recipes/espresso-tonic.png",
  },
  {
    name: "Panama Geisha Chemex",
    country: "Panama",
    origin: "Boquete, Panama",
    brewMethod: "Chemex",
    roastLevel: "Light Roast",
    difficulty: "Advanced" as const,
    ratio: "1:15",
    time: "4:00",
    notes: "Jasmine tea, mango, and honey with extraordinary clarity.",
    image: "/images/recipes/chemex.png",
    premium: true,
  },
  {
    name: "Sumatra Mandheling Moka",
    country: "Indonesia",
    origin: "North Sumatra, Indonesia",
    brewMethod: "Moka Pot",
    roastLevel: "Dark Roast",
    difficulty: "Beginner" as const,
    ratio: "1:10",
    time: "5:00",
    notes: "Earthy cedar, dark cocoa, and a heavy, syrupy body.",
    image: "/images/recipes/sumatra-moka.png",
  },
  {
    name: "Costa Rica Honey Aeropress",
    country: "Costa Rica",
    origin: "Tarrazú, Costa Rica",
    brewMethod: "Aeropress",
    roastLevel: "Medium Roast",
    difficulty: "Intermediate" as const,
    ratio: "1:14",
    time: "2:00",
    notes: "Honey sweetness, red apple, and a clean caramel finish.",
    image: "/images/recipes/costa-rica-aeropress.png",
    premium: true,
  },
  {
    name: "Rwanda Bourbon V60",
    country: "Rwanda",
    origin: "Nyamasheke, Rwanda",
    brewMethod: "V60",
    roastLevel: "Light Roast",
    difficulty: "Advanced" as const,
    ratio: "1:16",
    time: "3:45",
    notes: "Black tea, cranberry, and brown sugar with vibrant acidity.",
    image: "/images/recipes/rwanda-v60.png",
  },
];

const brewMethods = [
  {
    name: "Pour Over",
    description: "Clarity and nuance. Full control over every variable.",
    brewTime: "3–4 min",
    difficulty: "Intermediate" as const,
    body: 2,
    acidity: 4,
    sweetness: 3,
    suitableRoast: "Light to Medium",
    image: "/images/recipes/ethiopian-pour-over.png",
  },
  {
    name: "Espresso",
    description: "Pressure, precision, and the foundation of café culture.",
    brewTime: "25–30 sec",
    difficulty: "Advanced" as const,
    body: 4,
    acidity: 3,
    sweetness: 2,
    suitableRoast: "Medium to Dark",
    image: "/images/recipes/cortado.png",
  },
  {
    name: "French Press",
    description: "Full-bodied immersion with rich oils and depth.",
    brewTime: "4 min",
    difficulty: "Beginner" as const,
    body: 5,
    acidity: 2,
    sweetness: 3,
    suitableRoast: "Medium to Dark",
    image: "/images/methods/french-press.svg",
  },
  {
    name: "Aeropress",
    description: "Versatile, fast, and endlessly experiment-friendly.",
    brewTime: "1.5–2 min",
    difficulty: "Intermediate" as const,
    body: 3,
    acidity: 3,
    sweetness: 4,
    suitableRoast: "Light to Medium",
    image: "/images/recipes/costa-rica-aeropress.png",
  },
  {
    name: "Cold Brew",
    description: "Slow extraction for smooth, low-acid refreshment.",
    brewTime: "12–18 hr",
    difficulty: "Beginner" as const,
    body: 4,
    acidity: 1,
    sweetness: 3,
    suitableRoast: "Medium to Dark",
    image: "/images/recipes/cold-brew.png",
  },
  {
    name: "Siphon",
    description: "Theatrical vacuum brewing with exceptional clarity.",
    brewTime: "3–5 min",
    difficulty: "Advanced" as const,
    body: 2,
    acidity: 4,
    sweetness: 4,
    suitableRoast: "Light Roast",
    image: "/images/methods/siphon.svg",
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
    image: unsplash("photo-1442512595331-e89e73853f31"),
  },
  {
    name: "Counter Culture",
    location: "Durham, North Carolina",
    specialty: "Direct trade and education",
    rating: "4.8",
    image: unsplash("photo-1498804103079-a6351b050096"),
  },
  {
    name: "Saint Frank",
    location: "San Francisco, California",
    specialty: "Light roasts with terroir focus",
    rating: "4.9",
    image: unsplash("photo-1442512595331-e89e73853f31"),
  },
  {
    name: "Tim Wendelboe",
    location: "Oslo, Norway",
    specialty: "Nordic-style precision roasting",
    rating: "5.0",
    image: unsplash("photo-1495474472287-4d71bcdd2085"),
  },
  {
    name: "La Cabra",
    location: "Aarhus, Denmark",
    specialty: "Scandinavian clarity and sweetness",
    rating: "4.9",
    image: unsplash("photo-1495474472287-4d71bcdd2085"),
  },
  {
    name: "Koppi",
    location: "Helsingborg, Sweden",
    specialty: "Seasonal microlots and blends",
    rating: "4.8",
    image: unsplash("photo-1517245386807-bb43f82c33c4"),
  },
];

const testimonials = [
  {
    quote:
      "BrewAtlas transformed how I train my team. Every recipe is dialed, documented, and reproducible across shifts.",
    name: "Elena Vasquez",
    role: "Head Barista, Formative Coffee",
    location: "Portland, OR",
    image: unsplash("photo-1724910326117-66dc0406f4ed", 600),
  },
  {
    quote:
      "The origin maps and ratio calculators alone are worth Premium. It's the most thoughtful coffee platform I've used.",
    name: "James Okonkwo",
    role: "Roaster & Q Grader",
    location: "London, UK",
    image: unsplash("photo-1517245386807-bb43f82c33c4", 600),
  },
  {
    quote:
      "We partner with roasters worldwide. BrewAtlas is where our customers discover the perfect brew for every bag we ship.",
    name: "Sofia Lindström",
    role: "Founder, Nord Roast Collective",
    location: "Stockholm, SE",
    image: unsplash("photo-1743389412243-7dbfdf6c48dd", 600),
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

const sectionPad =
  "px-5 py-36 sm:px-6 md:px-7 md:py-40 lg:px-8 lg:py-44";
const eyebrow =
  "text-[0.8125rem] font-medium uppercase tracking-[0.24em] text-amber-500/90";
const sectionTitle =
  "mt-5 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-stone-50 sm:text-4xl lg:text-[2.875rem]";
const sectionLead =
  "mt-7 max-w-2xl text-lg leading-[1.8] text-stone-400 md:text-xl md:leading-[1.75]";
const cardBase =
  "rounded-[1.5rem] border border-white/[0.05] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent shadow-[0_4px_24px_-8px_rgba(0,0,0,0.25)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-amber-700/20 hover:from-white/[0.06] hover:shadow-[0_36px_72px_-24px_rgba(180,120,60,0.16)]";
const btnPrimary =
  "inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-stone-50 px-8 text-sm font-medium text-stone-900 transition-all duration-300 ease-out hover:scale-[1.04] hover:bg-stone-200 hover:shadow-[0_14px_44px_rgba(255,255,255,0.16)] active:scale-[0.97]";
const btnSecondary =
  "inline-flex h-12 min-w-[180px] items-center justify-center rounded-full border border-stone-600/45 bg-white/[0.04] px-8 text-sm font-medium text-stone-100 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.04] hover:border-amber-600/40 hover:bg-white/[0.08] hover:shadow-[0_0_40px_rgba(217,119,6,0.16)] active:scale-[0.97]";
const btnPremium =
  "inline-flex h-12 items-center justify-center rounded-full bg-amber-600 px-8 text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-[1.04] hover:bg-amber-500 hover:shadow-[0_0_44px_rgba(217,119,6,0.48)] active:scale-[0.97]";

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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_50%_50%,rgba(180,120,60,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(217,119,6,0.04),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_65%,rgba(120,70,40,0.05),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(90,50,30,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(217,119,6,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f0a]/40 via-transparent to-[#0a0705]" />
      </div>

      <SiteNav />

      <main>
        <HeroSection
          heroImage={heroImage}
          btnPrimary={btnPrimary}
          btnSecondary={btnSecondary}
        />

        <FeaturedRecipesSection
          recipes={featuredRecipes}
          btnSecondary={btnSecondary}
        />

        <BrewingMethodsSection methods={brewMethods} />

        {/* Coffee Origins */}
        <section id="origins" className={sectionPad}>
          <RevealOnScroll>
            <div className="mx-auto max-w-6xl">
              <div className="grid items-center gap-16 md:gap-24 lg:grid-cols-2 lg:gap-28">
                <div>
                  <p className={eyebrow}>From Farm to Cup</p>
                  <h2 className={sectionTitle}>Coffee Origins</h2>
                  <p className={sectionLead}>
                    Trace every recipe to its source. Explore flavor profiles,
                    altitude data, and processing methods from the world&apos;s
                    greatest growing regions.
                  </p>
                  <div className="mt-14 space-y-4">
                    {coffeeOrigins.slice(0, 5).map((origin) => (
                      <div
                        key={origin.name}
                        className="group flex items-center justify-between rounded-2xl border border-white/[0.04] bg-gradient-to-r from-white/[0.03] to-transparent px-6 py-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-amber-800/20 hover:bg-white/[0.04] hover:shadow-[0_20px_40px_-20px_rgba(180,120,60,0.12)] md:px-7 md:py-6"
                      >
                        <div>
                          <p className="font-medium text-stone-50">{origin.name}</p>
                          <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{origin.region}</p>
                        </div>
                        <span className="text-sm font-medium text-amber-600/80 transition-colors duration-300 group-hover:text-amber-500">
                          {origin.recipes}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-4 rounded-[1.75rem] bg-gradient-to-br from-amber-900/15 to-transparent blur-2xl" />
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-gradient-to-br from-stone-900/60 via-stone-950/80 to-[#0a0705]/60 shadow-[0_28px_56px_-24px_rgba(0,0,0,0.45)]">
                    <PremiumImage
                      src={originsFarmImage}
                      alt="Coffee farm in a lush growing region"
                      overlay="card"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="h-48 w-full sm:h-52"
                    />
                    <div className="p-8 sm:p-10 md:p-11">
                      <WorldMap />
                      <div className="mt-9 flex flex-wrap gap-3">
                        {coffeeOrigins.map((origin) => (
                          <span
                            key={origin.name}
                            className="rounded-full border border-white/[0.05] bg-white/[0.03] px-3.5 py-1.5 text-xs text-stone-400 transition-all duration-300 hover:border-amber-800/25 hover:text-stone-300"
                          >
                            {origin.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* Top Roasters */}
        <section
          id="roasters"
          className={`border-t border-white/[0.04] bg-white/[0.008] ${sectionPad}`}
        >
          <RevealOnScroll>
            <div className="mx-auto max-w-6xl">
              <div className="mb-20 max-w-2xl md:mb-24">
                <p className={eyebrow}>Roaster Partners</p>
                <h2 className={sectionTitle}>Top Roasters</h2>
                <p className={sectionLead}>
                  Discover recipes tailored to beans from the world&apos;s most
                  respected specialty roasters.
                </p>
              </div>
              <div className="grid gap-7 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                {topRoasters.map((roaster) => (
                  <TiltCard key={roaster.name}>
                    <div
                      className={`group flex flex-col justify-between overflow-hidden ${cardBase} from-stone-900/40 p-0`}
                    >
                      <PremiumImage
                        src={roaster.image}
                        alt={`${roaster.name} roastery`}
                        overlay="card"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="h-36 w-full"
                      />
                      <div className="flex flex-1 flex-col justify-between p-8 md:p-10">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="text-lg font-medium leading-snug tracking-tight text-stone-50">
                              {roaster.name}
                            </h3>
                            <span className="shrink-0 rounded-full bg-amber-950/50 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                              {roaster.rating}
                            </span>
                          </div>
                          <p className="mt-2.5 text-sm leading-relaxed text-stone-500">{roaster.location}</p>
                        </div>
                        <p className="mt-7 text-sm leading-relaxed text-amber-600/80 transition-colors duration-300 group-hover:text-amber-500">
                          {roaster.specialty}
                        </p>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className={sectionPad}>
          <RevealOnScroll>
            <div className="mx-auto max-w-6xl">
              <div className="mb-20 text-center md:mb-24">
                <p className={eyebrow}>Trusted by Professionals</p>
                <h2 className={sectionTitle}>What Baristas Say</h2>
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
                {testimonials.map((item) => (
                  <TiltCard key={item.name}>
                    <blockquote className={`group flex flex-col overflow-hidden ${cardBase} p-0`}>
                      <PremiumImage
                        src={item.image}
                        alt={`${item.name}, ${item.role}`}
                        overlay="portrait"
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="h-52 w-full"
                      />
                      <div className="flex flex-1 flex-col p-9 md:p-11">
                        <p className="flex-1 text-base leading-[1.8] text-stone-300">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                        <footer className="mt-10 border-t border-white/[0.04] pt-8">
                          <p className="font-medium text-stone-50">{item.name}</p>
                          <p className="mt-2 text-sm leading-relaxed text-stone-500">{item.role}</p>
                          <p className="mt-1 text-xs text-amber-600/70">{item.location}</p>
                        </footer>
                      </div>
                    </blockquote>
                  </TiltCard>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* Premium Pricing */}
        <section
          id="pricing"
          className={`border-y border-white/[0.04] ${sectionPad}`}
        >
          <RevealOnScroll>
            <div className="mx-auto max-w-6xl">
              <div className="mb-20 text-center md:mb-24">
                <p className={eyebrow}>Membership</p>
                <h2 className={sectionTitle}>Premium Plans</h2>
                <p className={`mx-auto max-w-xl ${sectionLead}`}>
                  Choose the plan that fits your craft. Upgrade anytime as your
                  coffee journey evolves.
                </p>
              </div>
              <div className="grid gap-8 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <TiltCard key={plan.name}>
                    <div
                      className={`relative flex h-full flex-col rounded-[1.5rem] border p-9 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 sm:p-10 md:p-11 ${
                        plan.highlighted
                          ? "border-amber-700/35 bg-gradient-to-b from-amber-950/40 via-stone-950/50 to-[#0a0705]/80 shadow-[0_36px_72px_-24px_rgba(180,120,60,0.2)] hover:border-amber-600/45 hover:shadow-[0_44px_80px_-24px_rgba(180,120,60,0.26)]"
                          : `${cardBase} hover:border-white/10`
                      }`}
                    >
                      {plan.highlighted && (
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-600 px-4 py-1 text-xs font-medium text-white shadow-[0_0_24px_rgba(217,119,6,0.35)]">
                          Most Popular
                        </span>
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-stone-50">{plan.name}</h3>
                        <div className="mt-6 flex items-baseline gap-1">
                          <span className="text-4xl font-semibold tracking-tight text-stone-50 lg:text-[2.5rem]">
                            {plan.price}
                          </span>
                          {plan.price !== "Free" && (
                            <span className="text-sm text-stone-500">/{plan.period}</span>
                          )}
                        </div>
                        {plan.price === "Free" && (
                          <span className="text-sm text-stone-500">{plan.period}</span>
                        )}
                        <p className="mt-6 text-sm leading-[1.75] text-stone-400">
                          {plan.description}
                        </p>
                      </div>
                      <ul className="mt-10 flex-1 space-y-4">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-3 text-sm leading-relaxed text-stone-400"
                          >
                            <span className="mt-0.5 text-amber-600">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <RippleLink
                        href="#"
                        className={`mt-11 ${plan.highlighted ? btnPremium : `${btnSecondary} w-full min-w-0`}`}
                      >
                        {plan.cta}
                      </RippleLink>
                    </div>
                  </TiltCard>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* FAQ */}
        <section id="faq" className={sectionPad}>
          <RevealOnScroll>
            <div className="mx-auto max-w-3xl">
              <div className="mb-20 text-center md:mb-24">
                <p className={eyebrow}>Support</p>
                <h2 className={sectionTitle}>Frequently Asked Questions</h2>
              </div>
              <FaqAccordion faqs={faqs} />
            </div>
          </RevealOnScroll>
        </section>
      </main>

      <FloatingActions />

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#080504] px-5 pt-28 pb-14 sm:px-6 md:px-7 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll>
            <div className="grid gap-16 sm:grid-cols-2 sm:gap-14 lg:grid-cols-4 lg:gap-20">
              <div className="lg:col-span-1">
                <Link
                  href="/"
                  className="text-xl font-semibold tracking-tight text-stone-50 transition-opacity duration-300 hover:opacity-80"
                >
                  BrewAtlas
                </Link>
                <p className="mt-6 max-w-xs text-sm leading-[1.8] text-stone-500">
                  The definitive platform for specialty coffee recipes, origins,
                  and brew science. Craft coffee, mapped.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wider text-stone-400">
                  Product
                </h4>
                <ul className="mt-6 space-y-3.5 text-sm text-stone-500">
                  <li>
                    <a href="#recipes" className="transition-colors duration-300 hover:text-stone-300">
                      Recipes
                    </a>
                  </li>
                  <li>
                    <a href="#methods" className="transition-colors duration-300 hover:text-stone-300">
                      Brew Methods
                    </a>
                  </li>
                  <li>
                    <a href="#origins" className="transition-colors duration-300 hover:text-stone-300">
                      Origins
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="transition-colors duration-300 hover:text-stone-300">
                      Pricing
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wider text-stone-400">
                  Company
                </h4>
                <ul className="mt-6 space-y-3.5 text-sm text-stone-500">
                  <li>
                    <a href="#" className="transition-colors duration-300 hover:text-stone-300">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors duration-300 hover:text-stone-300">
                      Roaster Partners
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors duration-300 hover:text-stone-300">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors duration-300 hover:text-stone-300">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wider text-stone-400">
                  Legal
                </h4>
                <ul className="mt-6 space-y-3.5 text-sm text-stone-500">
                  <li>
                    <a href="#" className="transition-colors duration-300 hover:text-stone-300">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors duration-300 hover:text-stone-300">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors duration-300 hover:text-stone-300">
                      Cookie Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </RevealOnScroll>
          <div className="mt-24 flex flex-col items-center justify-between gap-5 border-t border-white/[0.04] pt-12 sm:flex-row">
            <p className="text-sm text-stone-600">
              © {new Date().getFullYear()} BrewAtlas. All rights reserved.
            </p>
            <p className="text-sm text-stone-600">Crafted for coffee lovers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
