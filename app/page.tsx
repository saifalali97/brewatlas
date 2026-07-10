import Link from "next/link";
import { FaqAccordion } from "./components/faq-accordion";
import { BrewingMethodsSection } from "./components/brewing-methods-section";
import { CoffeeOriginsSection } from "./components/coffee-origins-section";
import { FeaturedRecipesSection } from "./components/featured-recipes-section";
import { FloatingActions } from "./components/floating-actions";
import { HeroSection } from "./components/hero-section";
import { PremiumImage } from "./components/premium-image";
import { RevealOnScroll } from "./components/reveal-on-scroll";
import { RippleLink } from "./components/ripple-link";
import { SiteNav } from "./components/site-nav";
import { TopRoastersSection } from "./components/top-roasters-section";
import { TiltCard } from "./components/tilt-card";

const unsplash = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const heroImage = unsplash("photo-1511920170033-f8396924c348", 1600);

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
  {
    country: "Ethiopia",
    region: "Gedeo & Sidama",
    tastingProfile: "Jasmine, bergamot, and bright stone fruit with tea-like clarity.",
    altitude: "1,700–2,200m",
    process: "Washed",
    roastRecommendation: "Light Roast",
    brewingMethod: "Pour Over",
    image: "/images/recipes/ethiopian-pour-over.png",
    premium: true,
  },
  {
    country: "Colombia",
    region: "Huila & Cauca",
    tastingProfile: "Caramel, red apple, and gentle citrus with balanced sweetness.",
    altitude: "1,400–2,000m",
    process: "Washed",
    roastRecommendation: "Medium Roast",
    brewingMethod: "Chemex",
    image: "/images/origins/colombia.svg",
  },
  {
    country: "Kenya",
    region: "Nyeri & Kirinyaga",
    tastingProfile: "Blackcurrant, tomato, and juicy acidity with syrupy body.",
    altitude: "1,600–2,100m",
    process: "Double Washed",
    roastRecommendation: "Light-Medium",
    brewingMethod: "V60",
    image: "/images/recipes/espresso-tonic.png",
    premium: true,
  },
  {
    country: "Guatemala",
    region: "Antigua & Huehuetenango",
    tastingProfile: "Dark chocolate, hazelnut, and honey sweetness with full body.",
    altitude: "1,500–2,000m",
    process: "Washed",
    roastRecommendation: "Medium Roast",
    brewingMethod: "Espresso",
    image: "/images/recipes/cortado.png",
  },
  {
    country: "Panama",
    region: "Boquete & Volcán",
    tastingProfile: "Jasmine, mango, and tea-like elegance with luminous acidity.",
    altitude: "1,400–1,900m",
    process: "Washed",
    roastRecommendation: "Light Roast",
    brewingMethod: "Pour Over",
    image: "/images/recipes/chemex.png",
    premium: true,
  },
  {
    country: "Indonesia",
    region: "Sumatra & Java",
    tastingProfile: "Cedar, dark cocoa, and earthy depth with low acidity.",
    altitude: "1,100–1,600m",
    process: "Wet-Hulled",
    roastRecommendation: "Dark Roast",
    brewingMethod: "French Press",
    image: "/images/recipes/sumatra-moka.png",
  },
];

const topRoasters = [
  {
    name: "Onyx Coffee Lab",
    country: "United States",
    founded: "2012",
    specialty: "Competition-grade single origins",
    rating: "4.9",
    recipes: "142 recipes",
    description:
      "Award-winning roastery pushing boundaries with meticulous sourcing and innovative roast profiles.",
    image: "/images/roasters/onyx.svg",
    premium: true,
  },
  {
    name: "Counter Culture",
    country: "United States",
    founded: "1995",
    specialty: "Direct trade and education",
    rating: "4.8",
    recipes: "218 recipes",
    description:
      "Pioneer of transparent sourcing with deep farmer relationships and industry-leading training programs.",
    image: "/images/roasters/counter-culture.svg",
    premium: true,
  },
  {
    name: "Saint Frank",
    country: "United States",
    founded: "2013",
    specialty: "Light roasts with terroir focus",
    rating: "4.9",
    recipes: "96 recipes",
    description:
      "San Francisco roastery celebrating origin expression through delicate, terroir-forward light roasts.",
    image: "/images/roasters/saint-frank.svg",
  },
  {
    name: "Tim Wendelboe",
    country: "Norway",
    founded: "2007",
    specialty: "Nordic-style precision roasting",
    rating: "5.0",
    recipes: "84 recipes",
    description:
      "Oslo institution defining Nordic coffee with obsessive quality control and seasonal microlots.",
    image: "/images/roasters/tim-wendelboe.svg",
    premium: true,
  },
  {
    name: "La Cabra",
    country: "Denmark",
    founded: "2012",
    specialty: "Scandinavian clarity and sweetness",
    rating: "4.9",
    recipes: "112 recipes",
    description:
      "Aarhus-based roaster known for luminous clarity, gentle sweetness, and minimalist Nordic aesthetics.",
    image: "/images/roasters/la-cabra.svg",
    premium: true,
  },
  {
    name: "Koppi",
    country: "Sweden",
    founded: "2007",
    specialty: "Seasonal microlots and blends",
    rating: "4.8",
    recipes: "78 recipes",
    description:
      "Helsingborg roastery crafting thoughtful seasonal offerings with a focus on balance and approachability.",
    image: "/images/roasters/koppi.svg",
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

        <CoffeeOriginsSection origins={coffeeOrigins} />

        <TopRoastersSection roasters={topRoasters} />

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
