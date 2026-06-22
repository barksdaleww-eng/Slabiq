const Section = ({ icon, title, children }) => (
  <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 mb-6">
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
      <span className="text-3xl">{icon}</span> {title}
    </h2>
    {children}
  </div>
);

const Pill = ({ label, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-900 text-blue-300 border-blue-700",
    green: "bg-green-900 text-green-300 border-green-700",
    yellow: "bg-yellow-900 text-yellow-300 border-yellow-700",
    purple: "bg-purple-900 text-purple-300 border-purple-700",
    red: "bg-red-900 text-red-300 border-red-700",
    orange: "bg-orange-900 text-orange-300 border-orange-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[color]}`}>
      {label}
    </span>
  );
};

const GradeCard = ({ company, tier, description, known, color }) => {
  const borders = { blue: "border-blue-600", red: "border-red-600", yellow: "border-yellow-500" };
  return (
    <div className={`bg-gray-800 rounded-xl p-5 border-t-4 ${borders[color]}`}>
      <div className="text-xl font-black mb-1">{company}</div>
      <div className="text-sm text-gray-400 mb-3">{tier}</div>
      <p className="text-gray-300 text-sm mb-3">{description}</p>
      <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Known for</div>
      <p className="text-xs text-gray-400">{known}</p>
    </div>
  );
};

const BrandCard = ({ name, why, holdValue, icon }) => (
  <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-2">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-lg">{name}</span>
    </div>
    <p className="text-gray-300 text-sm">{why}</p>
    <div className="mt-auto pt-2">
      <span className="text-xs text-gray-500 uppercase font-semibold">Why it holds value</span>
      <p className="text-xs text-green-400 mt-0.5">{holdValue}</p>
    </div>
  </div>
);

const TipCard = ({ number, title, tip, badge }) => (
  <div className="bg-gray-800 rounded-xl p-5 flex gap-4">
    <div className="text-3xl font-black text-gray-700 shrink-0 w-8">{number}</div>
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-bold">{title}</span>
        {badge && <Pill label={badge} color="green" />}
      </div>
      <p className="text-gray-400 text-sm">{tip}</p>
    </div>
  </div>
);

export default function Academy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black mb-3">🎓 Collector Academy</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Everything you need to collect smarter — grading, brands, parallels, and finding value before everyone else.
        </p>
      </div>

      {/* Grading */}
      <Section icon="🏅" title="How Grading Works">
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          Grading is the process of having a professional company evaluate your card's condition and seal it in a tamper-evident case (called a "slab"). A graded card is more liquid — buyers trust the grade, so you can charge a premium and sell faster.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GradeCard
            company="PSA"
            tier="Professional Sports Authenticator"
            description="The most recognized grading company in the hobby. A PSA 10 commands the highest premiums of any grading company, especially for modern cards."
            known="Highest resale premiums. PSA 10 is the gold standard."
            color="blue"
          />
          <GradeCard
            company="BGS"
            tier="Beckett Grading Services"
            description="Uses a subgrades system (centering, corners, edges, surface). A BGS 9.5 Black Label (all 10s) is arguably the most prestigious grade in the hobby."
            known="Subgrades, premium cases. BGS 9.5 = PSA 10 in most markets."
            color="red"
          />
          <GradeCard
            company="SGC"
            tier="Sportscard Guaranty Corp"
            description="Fast turnaround times and growing popularity. SGC 10s are gaining acceptance, especially for vintage cards and raw card investors."
            known="Speed and affordability. Good choice for mid-tier cards."
            color="yellow"
          />
        </div>

        <div className="bg-blue-950 border border-blue-800 rounded-xl p-4">
          <div className="font-bold text-blue-300 mb-2">📊 Grade Scale Quick Reference</div>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { grade: "10", label: "Gem Mint", color: "text-green-400" },
              { grade: "9.5", label: "Gem Mint+", color: "text-green-400" },
              { grade: "9", label: "Mint", color: "text-yellow-400" },
              { grade: "8", label: "Near Mint", color: "text-yellow-400" },
              { grade: "7 or less", label: "Avoid for value", color: "text-red-400" },
            ].map(g => (
              <div key={g.grade} className="bg-gray-800 rounded-lg p-2">
                <div className={`text-lg font-black ${g.color}`}>{g.grade}</div>
                <div className="text-gray-400">{g.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-yellow-950 border border-yellow-800 rounded-xl p-4 text-sm text-yellow-200">
          <span className="font-bold">💡 Pro Tip:</span> Only grade cards worth at least 3–5× the grading cost. PSA grading runs $20–$150+ depending on tier. Don't grade a $30 card through a $50 service.
        </div>
      </Section>

      {/* Brands */}
      <Section icon="🏷️" title="Why Certain Brands Hold Value">
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          Not all brands age equally. Some maintain (or grow) value over years. Others flood the market and crater. Here's what separates the blue-chips from the junk wax.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <BrandCard
            icon="💎"
            name="Panini Prizm"
            why="The dominant modern flagship. Prizm Rookies are the first cards serious collectors buy. Enormous secondary market liquidity and global recognition."
            holdValue="Iconic status, huge buyer pool, rookies are first target for graders."
          />
          <BrandCard
            icon="🌟"
            name="Bowman Chrome"
            why="The home of prospect cards. A Bowman Chrome Auto of a player before they hit the majors can 10× if they break out. Baseball's most speculative product."
            holdValue="Prospect autos age like wine when the player pans out."
          />
          <BrandCard
            icon="🏆"
            name="National Treasures"
            why="Ultra-premium, low-print patches and autos. NT cards scream investment. High entry price but historically holds value for stars."
            holdValue="Low print runs, premium materials, serious collector appeal."
          />
          <BrandCard
            icon="🔵"
            name="Topps Chrome"
            why="Baseball's Prizm equivalent. Chrome Rookies of Hall of Famers are foundational to any vintage modern collection. Very liquid."
            holdValue="Baseball's most trusted modern flagship. Decades of history."
          />
          <BrandCard
            icon="🟠"
            name="Panini Select"
            why="Multi-tier product with Concourse, Premier, and Courtside levels. Great mid-range option with strong designs and decent print runs."
            holdValue="Accessible price point, recognizable brand, good for budget collectors."
          />
          <BrandCard
            icon="❌"
            name="Brands to Avoid"
            why="Score, Donruss base (non-chrome/optic), Hoops base, and retail-only products tend to flood the market. Beautiful cards, poor long-term value."
            holdValue="These rarely appreciate. Buy for fun, not investment."
          />
        </div>
        <div className="bg-gray-800 rounded-xl p-4 text-sm">
          <span className="font-bold text-white">🔑 Rule of thumb:</span>
          <span className="text-gray-300"> Chrome = better. Autograph = better. Low print run = better. Rookie = better. Stack these attributes for maximum investment potential.</span>
        </div>
      </Section>

      {/* Parallels & Print Runs */}
      <Section icon="🌈" title="Parallels & Print Runs Explained">
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          A parallel is a variation of the base card — same photo, different color or finish. The rarer the parallel, the higher the premium. Print runs (the number printed) are stamped on the card itself.
        </p>

        <div className="mb-6">
          <div className="text-sm text-gray-400 font-semibold mb-3">Prizm Parallel Hierarchy (most to least common)</div>
          <div className="space-y-2">
            {[
              { name: "Base Prizm", run: "Unlimited", color: "bg-gray-600", mult: "1×" },
              { name: "Silver Prizm", run: "~199–499", color: "bg-gray-400", mult: "2–4×" },
              { name: "Blue Prizm", run: "/199", color: "bg-blue-500", mult: "3–5×" },
              { name: "Green Prizm", run: "/99", color: "bg-green-500", mult: "5–8×" },
              { name: "Red Prizm", run: "/49", color: "bg-red-500", mult: "8–15×" },
              { name: "Gold Prizm", run: "/10", color: "bg-yellow-500", mult: "20–50×" },
              { name: "Black Prizm", run: "1/1", color: "bg-gray-900 border border-white", mult: "One of a kind" },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2">
                <div className={`w-4 h-4 rounded-full shrink-0 ${p.color}`} />
                <span className="flex-1 text-sm font-medium">{p.name}</span>
                <span className="text-xs text-gray-400 w-24 text-right">{p.run}</span>
                <span className="text-xs text-green-400 font-bold w-20 text-right">{p.mult} base</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-950 border border-green-800 rounded-xl p-4 text-sm">
            <div className="font-bold text-green-300 mb-2">✅ High-Value Parallel Traits</div>
            <ul className="text-gray-300 space-y-1 text-xs">
              <li>• Print run under /99</li>
              <li>• Rookie card year</li>
              <li>• On-card autograph version</li>
              <li>• "1st Bowman" designation</li>
              <li>• Super Short Print (SSP)</li>
            </ul>
          </div>
          <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-sm">
            <div className="font-bold text-red-300 mb-2">⚠️ Lower Value Signs</div>
            <ul className="text-gray-300 space-y-1 text-xs">
              <li>• Retail-only parallel (Target/Walmart)</li>
              <li>• No print run listed ("unlimited")</li>
              <li>• 2nd+ year card, not rookie</li>
              <li>• Sticker auto (not on-card)</li>
              <li>• Unlicensed product (no logos)</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Spotting Undervalued Cards */}
      <Section icon="💡" title="How to Spot Undervalued Cards">
        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
          The biggest gains in card collecting come from buying before the crowd. These are the signals experienced collectors watch to get ahead of price moves.
        </p>

        <div className="space-y-3 mb-6">
          <TipCard
            number="01"
            title="Buy the Prospect, Not the Star"
            badge="High Risk / High Reward"
            tip="Cards of players still in the minors (baseball) or college/G-League (basketball) are dirt cheap. One great rookie season and they 5–20× overnight. Bowman Chrome autos of top prospects are the play."
          />
          <TipCard
            number="02"
            title="Injury Recovery Windows"
            badge="Timing Play"
            tip="When a star player gets injured, their card prices dip. If they're expected to return at full strength, buying during the dip and selling on the comeback is a proven strategy."
          />
          <TipCard
            number="03"
            title="Track Sold Comps, Not Listed Prices"
            badge="Always Do This"
            tip='eBay "sold" listings tell the real story. A card listed at $500 means nothing. A card that sold 3 times in 7 days for $320–$340 tells you exactly what the market is. Use the eBay search in SlabIQ.'
          />
          <TipCard
            number="04"
            title="Watch for Position Changes"
            badge="Sleeper Signal"
            tip="A running back moving to wide receiver, or a backup QB becoming a starter — these role changes can spike card values fast before the market adjusts."
          />
          <TipCard
            number="05"
            title="Low Pop Report = Hidden Gem"
            badge="PSA/BGS Research"
            tip='PSA and BGS publish "pop reports" — how many copies of a card have received each grade. A PSA 10 with a pop of 3 is far more scarce than one with a pop of 3,000. Low pop + rising player = big upside.'
          />
          <TipCard
            number="06"
            title="End-of-Season Selloffs"
            badge="Buy the Dip"
            tip="When a team is eliminated or a player has a rough stretch, casual collectors panic-sell. Disciplined buyers with a 2–5 year view can acquire great cards at 30–50% discounts."
          />
        </div>

        <div className="bg-blue-950 border border-blue-700 rounded-xl p-5">
          <div className="font-bold text-blue-300 text-lg mb-2">🧠 The Golden Rule</div>
          <p className="text-gray-300 text-sm">
            Collect players you believe in <span className="text-white font-semibold">before</span> they become mainstream.
            The best card deals happen when only 10% of the market sees what 100% will see in two years.
            Use Player Intel, eBay comps, and news signals to find that 10% moment.
          </p>
        </div>
      </Section>

      <div className="text-center text-gray-600 text-xs pb-4">
        SlabIQ Academy · Built for collectors, by collectors
      </div>
    </div>
  );
}
