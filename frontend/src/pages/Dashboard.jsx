import React from 'react';

const Dashboard = ({ user }) => {
  if (!user)
    return (
      <div className="p-8 text-slate-400 animate-pulse font-mono">
        Loading Branch Protocol...
      </div>
    );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 px-4 md:px-0">
      {/* Header Section: Stacks on mobile, Side-by-side on desktop */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-zinc-800 pb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            {user.branch === 'admin'
              ? 'SYSTEM COMMAND'
              : `${user.branch.replace('_', ' ').toUpperCase()} HUB`}
          </h1>
          <p className="text-slate-500 dark:text-zinc-500 text-sm font-medium mt-1">
            Operational status for agent{' '}
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              {user.firstName} {user.lastName}
            </span>
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Session Status
          </p>
          <p className="text-xs font-bold text-green-500 uppercase tracking-tighter">
            ● Encrypted & Active
          </p>
        </div>
      </header>

      {/* Stats Grid: 1 Column on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {user.branch === 'web_dev' && <WebStats />}
        {user.branch === 'cyber_security' && <CyberStats />}
        {user.branch === 'admin' && <AdminStats />}
      </div>

      {/* Main Content Area: Stacks vertically on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-4xl border border-slate-100 dark:border-zinc-800 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-6">
            Branch Activity Feed
          </h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                    Protocol {i * 142} sequence initiated
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                    {i * 2} hours ago // encrypted_log_{i}.bin
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-4xl text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between min-h-50">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-80">
              Security Level
            </h3>
            <h2 className="text-4xl font-black mt-2 tracking-tighter">
              Clearance Level 4
            </h2>
          </div>
          <p className="text-xs font-medium opacity-80 leading-relaxed mt-4">
            Your current biometric signature is authorized for all{' '}
            {user.branch.replace('_', ' ')} sub-directories.
          </p>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS (Keep original logic, just ensuring layout fits) --- */

const WebStats = () => (
  <>
    <StatCard title="Total Sites" value="12" change="+2" />
    <StatCard
      title="Uptime"
      value="99.9%"
      change="Stable"
      color="text-green-500"
    />
    <StatCard title="Avg Load" value="1.2s" change="-0.3s" />
    <StatCard
      title="Active PRs"
      value="4"
      change="High"
      color="text-amber-500"
    />
  </>
);

const CyberStats = () => (
  <>
    <StatCard
      title="Threats Blocked"
      value="1,242"
      change="+14%"
      color="text-red-500"
    />
    <StatCard
      title="Vulnerabilities"
      value="0"
      change="Safe"
      color="text-green-500"
    />
    <StatCard title="Scan Coverage" value="100%" change="Full" />
    <StatCard title="Last Audit" value="2h ago" change="Pass" />
  </>
);

const AdminStats = () => (
  <>
    <StatCard title="Active Clients" value="48" change="+3" />
    <StatCard
      title="System Load"
      value="14%"
      change="Low"
      color="text-indigo-500"
    />
    <StatCard title="Deploy Time" value="1m 04s" change="Fast" />
    <StatCard
      title="Error Rate"
      value="0.02%"
      change="Optimal"
      color="text-green-500"
    />
  </>
);

const StatCard = ({
  title,
  value,
  change,
  color = 'text-slate-900 dark:text-zinc-100',
}) => (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:border-indigo-500/30 transition-all cursor-default">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {title}
    </p>
    <div className="flex items-baseline justify-between mt-4">
      <h2
        className={`text-2xl md:text-3xl font-black tracking-tighter ${color}`}>
        {value}
      </h2>
      <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded-lg">
        {change}
      </span>
    </div>
  </div>
);

export default Dashboard;
