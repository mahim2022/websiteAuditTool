import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-zinc-50 to-zinc-100 dark:from-black dark:via-zinc-900 dark:to-zinc-900 font-sans">
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold">86</div>
          <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-50">Production</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/audit" className="px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-medium hover:bg-sky-700">Run Audit</Link>
          <a href="#features" className="px-4 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300">Features</a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">Industry-leading AI-enhanced Website Audits</h1>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300 max-w-xl">
              86 Production combines AI-driven analysis with fast, practical checks for performance, security, SEO, and accessibility —
              delivering clear triage, prioritized fixes, and an actionable score so teams can ship safer, faster sites.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/audit" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-full font-semibold">
                ▶ Try an Audit
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                Explore Features
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              <div className="rounded-lg bg-white/60 dark:bg-zinc-900/50 p-3 border border-zinc-100 dark:border-zinc-800">
                <div className="text-sm text-zinc-500">Avg Audit Time</div>
                <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">~3s</div>
              </div>
              <div className="rounded-lg bg-white/60 dark:bg-zinc-900/50 p-3 border border-zinc-100 dark:border-zinc-800">
                <div className="text-sm text-zinc-500">AI Prioritization</div>
                <div className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">Top 5 fixes</div>
              </div>
            </div>
          </div>

          <div>
            <div className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white shadow-sm p-6">
              <div className="h-64 flex items-center justify-center bg-linear-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 rounded-lg">
                <div className="text-center text-zinc-400">Live Audit Preview (Run an audit to see results)</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-500">Overall Score</div>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">86</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">LCP</div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">1.2s</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-10">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Features</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300 max-w-2xl">A single audit surfaces performance, security, SEO and accessibility issues — prioritized by AI and presented with clear remediation steps.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="text-3xl">⚡</div>
              <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">Performance</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">LCP/FCP/TTFB estimates and render-path analysis.</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="text-3xl">🔒</div>
              <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">Security</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">HTTPS, HSTS, mixed content and redirect consistency checks.</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="text-3xl">🔎</div>
              <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">SEO</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Title, meta, robots, sitemaps and link health analysis.</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="text-3xl">♿</div>
              <h3 className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">Accessibility</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Alt text coverage, headings structure, and mobile viewport checks.</p>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-8 pb-12 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>© {new Date().getFullYear()} 86 Production — AI-enhanced website auditing for teams.</div>
            <div className="flex gap-4">
              <a href="/audit" className="text-zinc-700 dark:text-zinc-300">Run an audit</a>
              <a href="#features" className="text-zinc-700 dark:text-zinc-300">Features</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
