import { useState, useRef, useEffect } from "react";

/* ---------------- Step definitions ---------------- */
const STEPS = [
  {
    key: "discover",
    title: "Discover",
    short: "Explore vetted campaigns and providers",
    detail:
      "Browse verified campaigns curated for urgency and impact. Filter by category, provider verification status, and proximity so you find the people and causes you care about.",
    icon: DiscoverIcon,
  },
  {
    key: "donate",
    title: "Donate",
    short: "Send funds via Lightning or local rails",
    detail:
      "Choose payment method — Bitcoin (on-chain), Lightning for instant micro-donations, or local rails like M-PESA for native settlements. All donations are tokenized and tracked for transparency.",
    icon: DonateIcon,
  },
  {
    key: "escrow",
    title: "Escrow",
    short: "Funds held conditionally if required",
    detail:
      "When required by policy, donations are held in platform escrow until provider verification and admin approval — protecting donors and ensuring funds are used as promised.",
    icon: EscrowIcon,
  },
  {
    key: "deliver",
    title: "Deliver",
    short: "Providers receive instant local payouts",
    detail:
      "Once verification conditions are met, verified providers receive payouts via local rails. This minimizes friction and speeds up service delivery on the ground.",
    icon: DeliverIcon,
  },
  {
    key: "verify",
    title: "Verify",
    short: "Independent proof unlocks final settlement",
    detail:
      "Providers (or independent auditors) submit verification evidence — receipts, photos, or provider-signed confirmations. Admin and provider verifications create an auditable trail before final settlement.",
    icon: VerifyIcon,
  },
];

/* ---------------- Main component ---------------- */
export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const ActiveIcon = STEPS[active].icon;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const buttons = Array.from(el.querySelectorAll("button[data-index]"));
    let current = active;

    function onKey(e) {
      if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        current = (current - 1 + buttons.length) % buttons.length;
        buttons[current].focus();
        setActive(current);
      } else if (["ArrowRight", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        current = (current + 1) % buttons.length;
        buttons[current].focus();
        setActive(current);
      } else if (e.key === "Home") {
        e.preventDefault();
        current = 0;
        buttons[current].focus();
        setActive(current);
      } else if (e.key === "End") {
        e.preventDefault();
        current = buttons.length - 1;
        buttons[current].focus();
        setActive(current);
      }
    }

    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section id="how" className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center lg:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            How DirectAid works
          </h2>
          <p className="mt-3 text-slate-400 max-w-2xl">
            A trust-first process that connects donors to verified providers,
            protects funds, and ensures impact is measurable and auditable.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <nav
            aria-label="How it works steps"
            ref={listRef}
            className="space-y-4"
            role="tablist"
            aria-orientation="vertical"
          >
            {STEPS.map((s, i) => (
              <StepButton
                key={s.key}
                index={i}
                active={i === active}
                onClick={() => setActive(i)}
                title={s.title}
                short={s.short}
                Icon={s.icon}
              />
            ))}
          </nav>

          <article
            role="tabpanel"
            aria-labelledby={`how-step-${STEPS[active].key}`}
            className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-slate-800/70 to-slate-700/50 border border-white/5 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="flex-none">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/5 border border-white/6">
                  <ActiveIcon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-white">
                  {STEPS[active].title}
                </h3>
                <p className="mt-2 text-slate-300">{STEPS[active].detail}</p>
              </div>
            </div>

            <div className="mt-6">
              <ProgressBar step={active} total={STEPS.length} />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Step Button ---------------- */
function StepButton({ index, active, onClick, title, short, Icon }) {
  return (
    <button
      id={`how-step-${title.toLowerCase()}`}
      role="tab"
      aria-selected={active}
      data-index={index}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl flex items-start gap-4 focus:outline-none focus:ring-2 focus:ring-amber-400 transition
        ${active ? "bg-gradient-to-r from-amber-400/10 border border-amber-400/30" : "bg-white/3 border border-white/6"}
      `}
    >
      <div
        className={`flex-none w-12 h-12 rounded-lg flex items-center justify-center ${
          active ? "bg-amber-400/10" : "bg-white/5"
        }`}
      >
        <Icon className={`w-6 h-6 ${active ? "text-amber-300" : "text-white/80"}`} />
      </div>
      <div className="min-w-0">
        <div className={`font-semibold ${active ? "text-white" : "text-slate-100"}`}>
          {index + 1}. {title}
        </div>
        <p className="mt-1 text-sm text-slate-300">{short}</p>
      </div>
    </button>
  );
}

/* ---------------- Progress Bar ---------------- */
function ProgressBar({ step, total }) {
  const pct = Math.round(((step + 1) / total) * 100);
  return (
    <div className="mt-2">
      <div className="text-xs text-slate-400 mb-2">Progress to completion</div>
      <div className="w-full bg-white/6 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-amber-400 transition-all"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 text-xs text-slate-500">{pct}%</div>
    </div>
  );
}

/* ---------------- Inline SVG Icons ---------------- */
function DiscoverIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 2l2.8 5.7L21 9l-4.5 3.9L17 20l-5-2.6L7 20l.5-7.1L3 9l6.2-1.3L12 2z" fill="currentColor" />
    </svg>
  );
}
function DonateIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 21s-6-4.35-9-7.2C-3 8 3 3 12 8c9-5 15 0 9 5.8-3 2.85-9 7.2-9 7.2z" fill="currentColor"/>
    </svg>
  );
}
function EscrowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 7h16v5a7 7 0 01-8 7 7 7 0 01-8-7V7z" fill="currentColor" />
    </svg>
  );
}
function DeliverIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 12h13l4 4v3H8l-5-7zM16 3v9H8l3-6 5-3z" fill="currentColor" />
    </svg>
  );
}
function VerifyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 2l3 6 6 .5-4.5 4 1.3 6.7L12 16l-6 3.2L7 12 2.5 8 8 7z" fill="currentColor" />
    </svg>
  );
}
