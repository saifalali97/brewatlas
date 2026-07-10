import { FaqSection } from "./components/faq-section";
import { BrewingMethodsSection } from "./components/brewing-methods-section";
import { CoffeeOriginsSection } from "./components/coffee-origins-section";
import { FeaturedRecipesSection } from "./components/featured-recipes-section";
import { FloatingActions } from "./components/floating-actions";
import { HeroSection } from "./components/hero-section";
import { PricingSection } from "./components/pricing-section";
import { PremiumImage } from "./components/premium-image";
import { RevealOnScroll } from "./components/reveal-on-scroll";
import { SiteFooter } from "./components/site-footer";
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
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start your specialty coffee journey with community recipes and essential tools.",
    recipeCount: "500+",
    accessLevel: "Community",
    offlineAccess: false,
    favorites: "10 saves",
    aiRecommendations: false,
    brewTracking: "Basic",
    prioritySupport: false,
    features: [
      "Basic brew calculators",
      "Weekly origin spotlights",
      "Community recipe access",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$12",
    period: "month",
    description: "For enthusiasts who brew daily and want the complete BrewAtlas experience.",
    recipeCount: "12,400+",
    accessLevel: "Full Library",
    offlineAccess: true,
    favorites: "Unlimited",
    aiRecommendations: true,
    brewTracking: "Advanced",
    prioritySupport: true,
    features: [
      "Advanced extraction tools",
      "Roaster-exclusive releases",
      "Personalized brew insights",
    ],
    cta: "Start Premium",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$99",
    period: "month",
    description: "Built for cafés and roaster teams who need collaboration and publishing tools.",
    recipeCount: "12,400+",
    accessLevel: "Team + Publishing",
    offlineAccess: true,
    favorites: "Unlimited",
    aiRecommendations: true,
    brewTracking: "Team Analytics",
    prioritySupport: true,
    features: [
      "Everything in Premium",
      "Up to 10 team accounts",
      "Custom recipe publishing",
      "Analytics dashboard",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "What's included in Premium membership?",
    answer:
      "Premium unlocks the full recipe library of 12,400+ recipes, advanced brew calculators, unlimited favorites, roaster-exclusive releases, offline mobile access, AI recommendations, and advanced brew tracking with priority email support.",
  },
  {
    question: "Can I access recipes offline?",
    answer:
      "Yes. Premium and Team members can download recipes for offline use on iOS and Android. Saved recipes sync automatically when you reconnect, so your library stays current across devices.",
  },
  {
    question: "How does brew tracking work?",
    answer:
      "Log each brew with grind size, dose, yield, and timing. BrewAtlas charts extraction trends over time and flags when a recipe drifts from its target profile. Premium includes advanced tracking; Team plans add shared logs for café staff.",
  },
  {
    question: "How do AI recommendations work?",
    answer:
      "BrewAtlas analyzes your saved recipes, brew methods, and flavor preferences to suggest new recipes and dial-in adjustments. Recommendations improve as you log more brews and rate results.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Premium memberships include a 14-day money-back guarantee. Cancel anytime from your account settings. Team plans are billed monthly and can be adjusted at the end of each billing cycle with no long-term lock-in.",
  },
  {
    question: "How often are recipes updated?",
    answer:
      "New recipes are added weekly from partner roasters and the barista community. Existing recipes are reviewed quarterly and updated when equipment standards, water profiles, or roast profiles change.",
  },
  {
    question: "Which devices does BrewAtlas support?",
    answer:
      "BrewAtlas works on modern web browsers, plus native apps for iOS 16+ and Android 10+. Your account, favorites, and offline downloads stay in sync across all supported devices.",
  },
  {
    question: "How do Team plans work?",
    answer:
      "Team plans include everything in Premium for up to 10 members, shared brew logs, custom recipe publishing, and an analytics dashboard. Contact sales to add seats, set permissions, or connect multiple café locations.",
  },
];

const sectionPad =
  "px-5 py-36 sm:px-6 md:px-7 md:py-40 lg:px-8 lg:py-44";
const eyebrow =
  "text-[0.8125rem] font-medium uppercase tracking-[0.24em] text-amber-500/90";
const sectionTitle =
  "mt-5 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-stone-50 sm:text-4xl lg:text-[2.875rem]";
const cardBase =
  "rounded-[1.5rem] border border-white/[0.05] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent shadow-[0_4px_24px_-8px_rgba(0,0,0,0.25)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-amber-700/20 hover:from-white/[0.06] hover:shadow-[0_36px_72px_-24px_rgba(180,120,60,0.16)]";
const btnPrimary =
  "inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-stone-50 px-8 text-sm font-medium text-stone-900 transition-all duration-300 ease-out hover:scale-[1.04] hover:bg-stone-200 hover:shadow-[0_14px_44px_rgba(255,255,255,0.16)] active:scale-[0.97]";
const btnSecondary =
  "inline-flex h-12 min-w-[180px] items-center justify-center rounded-full border border-stone-600/45 bg-white/[0.04] px-8 text-sm font-medium text-stone-100 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.04] hover:border-amber-600/40 hover:bg-white/[0.08] hover:shadow-[0_0_40px_rgba(217,119,6,0.16)] active:scale-[0.97]";

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

        <PricingSection plans={pricingPlans} />

        <FaqSection faqs={faqs} />
      </main>

      <FloatingActions />

      <SiteFooter />
    </div>
  );
}
