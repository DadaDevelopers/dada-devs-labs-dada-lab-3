// src/components/layout/ProvidersSection.tsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";

export type PublicProvider = {
  id: string;
  organizationName: string;
  organizationType: string;
  city: string;
  country: string;
};

const ORGANIZATION_TYPE_LABELS: Record<string, string> = {
  hospital: "Hospital",
  school: "School",
  clinic: "Clinic",
  ngo: "NGO",
  other: "Partner",
};

function formatOrgType(value: string): string {
  if (!value) return "Partner";
  return ORGANIZATION_TYPE_LABELS[value.toLowerCase()] ?? value;
}

export default function ProvidersSection(): React.JSX.Element {
  const [providers, setProviders] = useState<PublicProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get("/providers/public")
      .then((res: { providers?: PublicProvider[] }) => {
        if (cancelled) return;
        const list = Array.isArray(res?.providers) ? res.providers : [];
        setProviders(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load providers");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="providers"
      className="py-12 relative"
      aria-labelledby="providers-heading"
      style={{ background: "transparent" }}
    >
      {/* Glow backdrop — same as FAQ */}
      <div className="absolute inset-0 pointer-events-none -z-10" aria-hidden>
        <div className="absolute inset-0 backdrop-blur-[8px]" />
        <div className="absolute right-8 top-10 w-[360px] h-[360px] bg-yellow-300/8 blur-[80px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="inline-block w-10 h-1 rounded bg-yellow-500" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-yellow-500">
              Network
            </span>
          </div>

          <h2
            id="providers-heading"
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
          >
            Verified Providers
          </h2>

          <p className="mt-3 text-slate-300 max-w-xl">
            Registered and approved aid providers you can support through DirectAid campaigns.
          </p>
        </div>

        {error && (
          <div
            className="rounded-2xl border border-red-500/30 bg-red-950/20 px-6 py-4 text-red-200 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card overflow-hidden rounded-2xl border border-white/6 p-6 animate-pulse"
              >
                <div className="h-5 bg-white/10 rounded w-3/4 mb-4" />
                <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && providers.length === 0 && (
          <div
            className="rounded-2xl border border-white/6 p-8 text-center text-slate-400"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="text-lg font-medium text-white/80">No approved providers yet</p>
            <p className="mt-1 text-sm">Check back later as we onboard verified partners.</p>
          </div>
        )}

        {!loading && !error && providers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider, i) => (
              <article
                key={provider.id}
                className="glass-card overflow-hidden rounded-2xl border border-white/6 transition-shadow duration-300 hover:shadow-2xl hover:border-yellow-500/40 transform-gpu"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0px)" : "translateY(8px)",
                  transition: "opacity 420ms ease, transform 420ms ease, box-shadow 300ms, border-color 300ms",
                  transitionDelay: `${Math.min(i * 70, 400)}ms`,
                }}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-11 h-11 rounded-lg flex items-center justify-center text-sm font-extrabold bg-[#00AABB] text-white shadow-md shadow-cyan-900/30">
                        {(provider.organizationName || "P")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-white truncate">
                        {provider.organizationName || "Provider"}
                      </h3>
                      <p className="mt-1 text-xs text-yellow-500 uppercase tracking-wider">
                        {formatOrgType(provider.organizationType)}
                      </p>
                      {(provider.city || provider.country) && (
                        <p className="mt-2 text-sm text-slate-300">
                          {[provider.city, provider.country].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Support footer — same style as FAQ */}
        <div
          className="mt-12 p-6 sm:p-8 rounded-2xl border border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ backgroundColor: "rgba(255, 238, 170, 0.03)" }}
        >
          <div>
            <h4 className="text-lg font-bold text-white">Become a provider</h4>
            <p className="text-sm text-slate-300 mt-1">
              Get verified and receive donations through DirectAid campaigns.
            </p>
          </div>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-yellow-300 text-slate-900 font-extrabold px-4 py-2 rounded-lg shadow hover:bg-yellow-200 transition"
          >
            Get Started →
          </a>
        </div>
      </div>
    </section>
  );
}
