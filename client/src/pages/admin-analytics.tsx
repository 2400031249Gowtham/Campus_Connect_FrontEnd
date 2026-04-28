import { useActivities } from "@/hooks/use-activities";
import { useRegistrations } from "@/hooks/use-registrations";
import { useUsers } from "@/hooks/use-auth";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Users, UserCheck, TrendingUp, Trophy, Palette, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const MONO_COLORS = ['#111111', '#444444', '#888888', '#BBBBBB', '#E5E5E5'];
const floemaEase = [0.76, 0, 0.24, 1];

export default function AdminAnalytics() {
  const { data: activities, isLoading: loadingActs } = useActivities();
  const { data: registrations, isLoading: loadingRegs } = useRegistrations();
  const { data: users } = useUsers();

  if (loadingActs || loadingRegs) {
    return (
      <div className="py-20 text-center text-[#111111] font-bold font-display uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  const allActs = activities || [];
  const allRegs = registrations || [];
  const allUsers = users || [];
  const activeRegs = allRegs.filter(r => r.status !== 'cancelled');
  const attendedRegs = allRegs.filter(r => r.status === 'attended');
  const activeStudents = new Set(activeRegs.map(r => r.userId)).size;
  const attendanceRate = activeRegs.length > 0
    ? Math.round((attendedRegs.length / activeRegs.length) * 100)
    : 0;

  // Chart: Registrations per activity
  const barData = useMemo(() => {
    return allActs.map(act => ({
      name: act.name.length > 15 ? act.name.substring(0, 15) + '...' : act.name,
      registrations: activeRegs.filter(r => r.activityId === act.id).length,
    })).sort((a, b) => b.registrations - a.registrations);
  }, [allActs, activeRegs]);

  // Chart: Category breakdown
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    allActs.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allActs]);

  // Recent registrations
  const recentRegs = useMemo(() => {
    return activeRegs
      .slice(-8)
      .reverse()
      .map(r => {
        const user = allUsers.find(u => u.id === r.userId);
        const act = allActs.find(a => a.id === r.activityId);
        return { ...r, userName: user?.name || 'Unknown', actName: act?.name || 'Unknown', category: act?.category || 'event' };
      });
  }, [activeRegs, allUsers, allActs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-black p-4 text-xs font-bold uppercase tracking-widest shadow-none">
          <p className="text-[#111111]">{label}</p>
          <p className="text-[#666666] mt-2">{payload[0].value} registrations</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: floemaEase }}
      className="space-y-12 pb-12"
    >
      {/* Hero Image */}
      <div className="w-full h-48 md:h-64 overflow-hidden border border-gray-300 relative">
        <img 
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop" 
          alt="Abstract structural lines" 
          className="w-full h-full object-cover filter grayscale"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Header */}
      <div className="border-b border-gray-300 pb-8">
        <h1 className="font-display text-4xl lg:text-6xl font-bold text-[#111111] tracking-tighter uppercase">
          Analytics.
        </h1>
        <p className="text-[#666666] mt-4 uppercase tracking-widest text-sm font-semibold">
          Overview of campus activity engagement.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-300">
        {[
          { label: 'Activities', value: allActs.length, icon: Activity },
          { label: 'Registrations', value: activeRegs.length, icon: UserCheck },
          { label: 'Students', value: activeStudents, icon: Users },
          { label: 'Attendance', value: `${attendanceRate}%`, icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: floemaEase }}
            className="bg-white p-8 border-[0.5px] border-gray-300 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-8">
              <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest">{stat.label}</p>
              <stat.icon strokeWidth={1.5} className="w-5 h-5 text-[#111111]" />
            </div>
            <p className="text-5xl font-display font-bold text-[#111111] tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-gray-300">
        {/* Bar Chart */}
        <div className="lg:col-span-2 p-8 bg-white border-[0.5px] border-gray-300">
          <h3 className="font-display font-bold text-2xl text-[#111111] tracking-tighter uppercase mb-2">Activity Popularity</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#666666] mb-8">Registrations per activity</p>

          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#666666', fontSize: 10, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#666666', fontSize: 10, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9F9F9' }} />
                <Bar dataKey="registrations" fill="#111111" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[320px] flex items-center justify-center text-[#666666] text-[10px] uppercase tracking-widest font-bold">
              No data yet.
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="p-8 bg-white border-[0.5px] border-gray-300">
          <h3 className="font-display font-bold text-2xl text-[#111111] tracking-tighter uppercase mb-2">Categories</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#666666] mb-8">Activity type breakdown</p>

          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={MONO_COLORS[i % MONO_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="bg-white border border-black p-3 text-xs font-bold uppercase tracking-widest shadow-none">
                            <span className="text-[#111111]">{payload[0].name}</span>
                            <span className="text-[#666666] ml-4">{payload[0].value}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 justify-center">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#111111]">
                    <div className="w-3 h-3 border border-[#111111]" style={{ backgroundColor: MONO_COLORS[i % MONO_COLORS.length] }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-[#666666] text-[10px] uppercase tracking-widest font-bold">
              No data yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white border border-gray-300">
        <div className="p-8 border-b border-gray-300">
          <h3 className="font-display font-bold text-2xl text-[#111111] tracking-tighter uppercase mb-2">Recent Registrations</h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#666666]">Latest student sign-ups</p>
        </div>

        {recentRegs.length > 0 ? (
          <div className="space-y-0">
            {recentRegs.map((reg, i) => (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: floemaEase }}
                className={`flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors ${i !== 0 ? 'border-t border-gray-300' : ''}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 border border-gray-300 flex items-center justify-center shrink-0 text-[10px] font-bold uppercase tracking-widest">
                    {reg.category.substring(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#111111] tracking-tight">
                      {reg.userName} <span className="text-[#666666] font-normal">registered for</span> {reg.actName}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 border border-gray-300 text-[10px] uppercase tracking-widest font-bold text-[#111111] shrink-0 ml-4 bg-[#F9F9F9]">
                  {reg.status}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[#666666] text-[10px] uppercase tracking-widest font-bold">
            No registrations yet.
          </div>
        )}
      </div>
    </motion.div>
  );
}
