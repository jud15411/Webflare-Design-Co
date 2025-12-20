import React from 'react';

const Dashboard = ({ user }) => {
  if (!user)
    return (
      <div className="p-8 text-slate-400 animate-pulse font-mono">
        Loading Branch Protocol...
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <header className="flex items-end justify-between border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
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
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Session Status
          </p>
          <p className="text-xs font-bold text-green-500 uppercase tracking-tighter">
            ● Encrypted & Active
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user.branch === 'admin' && <AdminView />}
        {user.branch === 'cyber_security' && <CyberView />}
        {user.branch === 'web_dev' && <WebView />}
      </div>

      {/* Lower Metadata Container - Uses a subtle deep gray overlay */}
      <div className="p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-inner transition-colors duration-300">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
          Live Branch Metadata
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <MetadataItem label="Branch" value={user.branch} />
          <MetadataItem label="Access Level" value={user.role} />
          <MetadataItem
            label="Permissions"
            value={user.permissions?.length || 0}
          />
          <MetadataItem label="Auth Type" value="JWT/HttpOnly" />
        </div>
      </div>
    </div>
  );
};

/* View Components preserved from original logic */
const AdminView = () => (
  <>
    <StatCard title="Total Revenue" value="$45,231" change="+12%" />
    <StatCard title="Active Users" value="1,204" change="+4.2%" />
    <StatCard
      title="API Latency"
      value="14ms"
      change="Optimal"
      color="text-green-500"
    />
  </>
);

const CyberView = () => (
  <>
    <StatCard
      title="Threat Level"
      value="DEFCON 5"
      change="Stable"
      color="text-green-500"
    />
    <StatCard
      title="Open Vulns"
      value="3"
      change="-2 today"
      color="text-indigo-500"
    />
    <StatCard title="Last Scan" value="14m ago" change="Success" />
  </>
);

const WebView = () => (
  <>
    <StatCard
      title="Active Build"
      value="v2.4.1"
      change="Production"
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

/* Card Components - Updated for Dark Mode surfaces */
const StatCard = ({
  title,
  value,
  change,
  color = 'text-slate-900 dark:text-zinc-100',
}) => (
  <div className="bg-white dark:bg-zinc-900 p-7 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:border-indigo-500/30 transition-all cursor-default">
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
      {title}
    </p>
    <div className="flex items-baseline justify-between mt-4">
      {/* text-zinc-100 ensures the text is white/off-white in dark mode */}
      <h2 className={`text-3xl font-black tracking-tighter ${color}`}>
        {value}
      </h2>
      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-full">
        {change}
      </span>
    </div>
  </div>
);

const MetadataItem = ({ label, value }) => (
  <div className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 transition-colors duration-300">
    <span className="text-slate-400 block mb-1 uppercase text-[9px] tracking-tighter">
      {label}:
    </span>
    <span className="text-slate-700 dark:text-zinc-200 font-bold break-all">
      {value}
    </span>
  </div>
);

export default Dashboard;
