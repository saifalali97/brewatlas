import Link from "next/link";

const featuredRecipes = [
  {
    name: "Ethiopian Yirgacheffe Pour Over",
    origin: "Gedeo Zone, Ethiopia",
    method: "V60 · Light Roast",
    ratio: "1:16",
    time: "3:30",
    notes: "Jasmine, bergamot, and stone fruit with a silky finish.",
  },
  {
    name: "Kyoto Cold Brew",
    origin: "Huila, Colombia",
    method: "Slow Drip · Medium Roast",
    ratio: "1:12",
    time: "8 hr",
    notes: "Dark chocolate and caramel with zero bitterness.",
  },
  {
    name: "Signature Cortado",
    origin: "Antigua, Guatemala",
    method: "Espresso · Medium-Dark",
    ratio: "1:1",
    time: "25 sec",
    notes: "Velvety microfoam over a balanced double shot.",
  },
  {
    name: "Espresso Tonic",
    origin: "Nyeri, Kenya",
    method: "Espresso · Light-Medium",
    ratio: "1:4",
    time: "30 sec",
    notes: "Bright citrus sparkle over a syrupy Kenyan base.",
  },
];

const brewMethods = [
  {
    name: "Pour Over",
    description: "Clarity and nuance. Full control over every variable.",
    icon: "◯",
  },
  {
    name: "Espresso",
    description: "Pressure, precision, and the foundation of café culture.",
    icon: "◆",
  },
  {
    name: "French Press",
    description: "Full-bodied immersion with rich oils and depth.",
    icon: "▣",
  },
  {
    name: "Aeropress",
    description: "Versatile, fast, and endlessly experiment-friendly.",
    icon: "△",
  },
  {
    name: "Cold Brew",
    description: "Slow extraction for smooth, low-acid refreshment.",
    icon: "◇",
  },
  {
    name: "Siphon",
    description: "Theatrical vacuum brewing with exceptional clarity.",
    icon: "◎",
  },
];

const topRoasters = [
  {
    name: "Onyx Coffee Lab",
    location: "Rogers, Arkansas",
    specialty: "Competition-grade single origins",
  },
  {
    name: "Counter Culture",
    location: "Durham, North Carolina",
    specialty: "Direct trade and education",
  },
  {
    name: "Saint Frank",
    location: "San Francisco, California",
    specialty: "Light roasts with terroir focus",
  },
  {
    name: "Tim Wendelboe",
    location: "Oslo, Norway",
    specialty: "Nordic-style precision roasting",
  },
  {
    name: "La Cabra",
    location: "Aarhus, Denmark",
    specialty: "Scandinavian clarity and sweetness",
  },
  {
    name: "Koppi",
    location: "Helsingborg, Sweden",
    specialty: "Seasonal microlots and blends",
  },
];

const whyBrewAtlas = [
  {
    title: "Precision-tested recipes",
    description:
      "Every recipe is dialed in by professional baristas and validated across equipment, water, and grind profiles.",
  },
  {
    title: "Global roaster network",
    description:
      "Partner with world-class roasters. Discover beans matched to your brew method and taste preferences.",
  },
  {
    title: "Brew intelligence",
    description:
      "Interactive ratio calculators, grind guides, and extraction timers built into every recipe.",
  },
  {
    title: "Community of craft",
    description:
      "Share variations, rate results, and learn from thousands of specialty coffee enthusiasts worldwide.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0705] text-stone-100">
      {/* Ambient gradient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
      >
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
          <div className="hidden items-center gap-8 text-sm text-stone-400 md:flex">
            <a href="#recipes" className="transition-colors hover:text-stone-100">
              Recipes
            </a>
            <a href="#methods" className="transition-colors hover:text-stone-100">
              Methods
            </a>
            <a href="#roasters" className="transition-colors hover:text-stone-100">
              Roasters
            </a>
            <a href="#why" className="transition-colors hover:text-stone-100">
              Why Us
            </a>
          </div>
          <Link
            href="#premium"
            className="rounded-full bg-amber-600/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
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
                  className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-stone-50 px-8 text-sm font-medium text-stone-900 transition hover:bg-stone-200"
                >
                  Explore Recipes
                </Link>
                <Link
                  href="#premium"
                  className="inline-flex h-12 min-w-[180px] items-center justify-center rounded-full border border-stone-600/60 bg-white/5 px-8 text-sm font-medium text-stone-100 backdrop-blur-sm transition hover:border-amber-600/50 hover:bg-white/10"
                >
                  Join Premium
                </Link>
              </div>
            </div>

            {/* Hero visual accent */}
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
        <section id="recipes" className="px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                Curated Collection
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
                Featured Recipes
              </h2>
              <p className="mt-4 text-stone-400">
                Handpicked by our barista community. Each recipe includes grind
                size, water temperature, and step-by-step guidance.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {featuredRecipes.map((recipe) => (
                <article
                  key={recipe.name}
                  className="group rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition hover:border-amber-700/30 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-stone-50 group-hover:text-amber-100">
                        {recipe.name}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">{recipe.origin}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-950/60 px-3 py-1 text-xs font-medium text-amber-400/90">
                      {recipe.method}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-stone-400">
                    {recipe.notes}
                  </p>
                  <div className="mt-5 flex gap-6 border-t border-white/5 pt-4 text-xs text-stone-500">
                    <span>
                      Ratio{" "}
                      <strong className="text-stone-300">{recipe.ratio}</strong>
                    </span>
                    <span>
                      Time{" "}
                      <strong className="text-stone-300">{recipe.time}</strong>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Brew Methods */}
        <section id="methods" className="border-y border-white/5 bg-white/[0.02] px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                Master Every Technique
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
                Brew Methods
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-stone-400">
                From first pour to competition dial-in. Explore recipes organized
                by method, equipment, and skill level.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brewMethods.map((method) => (
                <div
                  key={method.name}
                  className="rounded-2xl border border-white/8 bg-[#0a0705]/60 p-6 transition hover:border-amber-800/40"
                >
                  <span className="text-2xl text-amber-600/80">{method.icon}</span>
                  <h3 className="mt-4 text-base font-medium text-stone-50">
                    {method.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">
                    {method.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Roasters */}
        <section id="roasters" className="px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                Roaster Partners
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
                Top Roasters
              </h2>
              <p className="mt-4 text-stone-400">
                Discover recipes tailored to beans from the world&apos;s most
                respected specialty roasters.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topRoasters.map((roaster) => (
                <div
                  key={roaster.name}
                  className="flex flex-col justify-between rounded-2xl border border-white/8 bg-gradient-to-br from-stone-900/40 to-transparent p-6"
                >
                  <div>
                    <h3 className="font-medium text-stone-50">{roaster.name}</h3>
                    <p className="mt-1 text-sm text-stone-500">{roaster.location}</p>
                  </div>
                  <p className="mt-4 text-sm text-amber-600/80">{roaster.specialty}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why BrewAtlas */}
        <section id="why" className="border-t border-white/5 px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-500/90">
                  Built for Craft
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 sm:text-4xl">
                  Why BrewAtlas
                </h2>
                <p className="mt-4 text-stone-400">
                  We believe great coffee is a craft worth documenting. BrewAtlas
                  is the definitive home for specialty recipes, roaster knowledge,
                  and brew science.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {whyBrewAtlas.map((item) => (
                  <div key={item.title}>
                    <h3 className="font-medium text-stone-50">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-500">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Premium CTA */}
        <section id="premium" className="px-6 pb-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-3xl border border-amber-800/30 bg-gradient-to-br from-amber-950/80 via-stone-900/90 to-[#0a0705] px-8 py-16 text-center sm:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,119,6,0.15),transparent_60%)]"
              />
              <div className="relative">
                <h2 className="text-2xl font-semibold tracking-tight text-stone-50 sm:text-3xl">
                  Elevate every cup.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-stone-400">
                  Premium unlocks advanced brew calculators, exclusive roaster
                  recipes, and offline access to your entire library.
                </p>
                <Link
                  href="#"
                  className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-amber-600 px-8 text-sm font-medium text-white transition hover:bg-amber-500"
                >
                  Join Premium
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} BrewAtlas. Craft coffee, mapped.
          </p>
          <div className="flex gap-6 text-sm text-stone-500">
            <Link href="#" className="transition hover:text-stone-300">
              Privacy
            </Link>
            <Link href="#" className="transition hover:text-stone-300">
              Terms
            </Link>
            <Link href="#" className="transition hover:text-stone-300">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
