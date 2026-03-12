import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Navbar */}
      <header className="navbar bg-base-100 border-b border-base-200 px-6">
        <div className="flex-1 gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <span className="text-lg font-bold tracking-tight">VoteSecure</span>
        </div>
        <nav className="flex gap-2">
          <Link href="/voter/login" className="btn btn-ghost btn-sm">Voter Login</Link>
          <Link href="/admin/login" className="btn btn-primary btn-sm">Admin Panel</Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Enterprise Voting Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-base-content leading-tight">
            Secure, Transparent &<br />Reliable Elections
          </h1>
          <p className="mt-4 text-base-content/60 max-w-xl mx-auto leading-relaxed">
            A modern digital voting platform designed for organizations that require integrity, accountability, and seamless election management.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/voter/login" className="btn btn-primary btn-wide gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              Cast Your Vote
            </Link>
            <Link href="/admin/login" className="btn btn-ghost btn-wide gap-2">
              Admin Dashboard
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
            <div className="bg-base-100 border border-base-200 rounded-xl p-6 text-left">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="font-semibold text-sm">End-to-End Security</h3>
              <p className="text-xs text-base-content/50 mt-1">Encrypted ballots with tamper-proof verification and audit trails.</p>
            </div>
            <div className="bg-base-100 border border-base-200 rounded-xl p-6 text-left">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-semibold text-sm">Real-Time Results</h3>
              <p className="text-xs text-base-content/50 mt-1">Live vote counting and result dashboards with instant updates.</p>
            </div>
            <div className="bg-base-100 border border-base-200 rounded-xl p-6 text-left">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="font-semibold text-sm">Voter Management</h3>
              <p className="text-xs text-base-content/50 mt-1">Complete voter registry with CNIC-based identity verification.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-base-200 py-6 text-center">
        <p className="text-xs text-base-content/40">&copy; {new Date().getFullYear()} VoteSecure. Built for integrity.</p>
      </footer>
    </div>
  );
}
