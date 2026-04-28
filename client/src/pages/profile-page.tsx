import { useCurrentUser } from "@/hooks/use-auth";
import { useActivities } from "@/hooks/use-activities";
import { useRegistrations } from "@/hooks/use-registrations";
import { useMemo } from "react";
import { format } from "date-fns";
import { Shield, GraduationCap, Calendar, Trophy, Palette, MapPin, Activity, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

const floemaEase = [0.76, 0, 0.24, 1];

export default function ProfilePage() {
  const { data: user } = useCurrentUser();
  const { data: activities } = useActivities();
  const { data: registrations } = useRegistrations();

  if (!user) return null;

  const allActs = activities || [];
  const allRegs = registrations || [];

  const myRegs = allRegs.filter(r => r.userId === user.id);
  const activeRegs = myRegs.filter(r => r.status !== 'cancelled');
  const attendedRegs = myRegs.filter(r => r.status === 'attended');

  const myActivities = useMemo(() => {
    return activeRegs.map(r => {
      const act = allActs.find(a => a.id === r.activityId);
      return act ? { ...act, regStatus: r.status } : null;
    }).filter(Boolean) as (typeof allActs[0] & { regStatus: string })[];
  }, [activeRegs, allActs]);

  const categories = useMemo(() => {
    const set = new Set(myActivities.map(a => a.category));
    return Array.from(set);
  }, [myActivities]);

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
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop" 
          alt="Architectural facade" 
          className="w-full h-full object-cover filter grayscale"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Header */}
      <div className="border-b border-gray-300 pb-8">
        <h1 className="font-display text-4xl lg:text-6xl font-bold text-[#111111] tracking-tighter uppercase">
          Profile.
        </h1>
        <p className="text-[#666666] mt-4 uppercase tracking-widest text-sm font-semibold">
          Account details and activity summary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-gray-300">
        {/* Profile Details */}
        <div className="bg-white p-8 lg:p-12 flex flex-col items-center text-center justify-center border-b lg:border-b-0 lg:border-r border-gray-300">
          <div className="w-32 h-32 border border-gray-300 flex items-center justify-center mb-6 bg-gray-50">
            <span className="font-display text-5xl font-bold text-[#111111] uppercase">
              {user.name.substring(0, 2)}
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold text-[#111111] tracking-tighter">{user.name}</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-[#666666] mt-2">@{user.username}</p>

          <div className="mt-6 border border-black px-4 py-2 flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-bold bg-black text-white">
            {user.role === 'admin' ? <Shield strokeWidth={1.5} className="w-4 h-4" /> : <GraduationCap strokeWidth={1.5} className="w-4 h-4" />}
            {user.role}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 w-full pt-8 border-t border-gray-300">
            <div>
              <p className="font-display text-2xl font-bold text-[#111111]">{activeRegs.length}</p>
              <p className="text-[10px] text-[#666666] uppercase tracking-widest font-bold mt-1">Registered</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-[#111111]">{attendedRegs.length}</p>
              <p className="text-[10px] text-[#666666] uppercase tracking-widest font-bold mt-1">Attended</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-[#111111]">{categories.length}</p>
              <p className="text-[10px] text-[#666666] uppercase tracking-widest font-bold mt-1">Categories</p>
            </div>
          </div>
        </div>

        {/* Activity History */}
        <div className="lg:col-span-2 bg-white p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="font-display font-bold text-2xl text-[#111111] uppercase tracking-tighter">
              {user.role === 'admin' ? 'All Activities' : 'My Activities'}
            </h3>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#666666] border border-gray-300 px-2 py-1">
              {user.role === 'admin' ? `${allActs.length} Total` : `${activeRegs.length} Registered`}
            </span>
          </div>

          {user.role === 'admin' ? (
            /* Admin: Show all activities they manage */
            allActs.length > 0 ? (
              <div className="space-y-0 border border-gray-300">
                {allActs.map((act, i) => {
                  const regCount = allRegs.filter(r => r.activityId === act.id && r.status !== 'cancelled').length;
                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors ${i !== 0 ? 'border-t border-gray-300' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                        <div className="w-12 h-12 border border-gray-300 flex items-center justify-center shrink-0 uppercase font-bold text-[10px] tracking-widest">
                          {act.category.substring(0, 3)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-lg text-[#111111] truncate tracking-tight">{act.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#666666] mt-1">
                            <Calendar strokeWidth={1.5} className="w-3 h-3" />
                            {format(new Date(act.date), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center sm:flex-col sm:items-end gap-2 sm:gap-0">
                        <span className="text-xl font-bold font-display">{regCount}</span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#666666]">Enrolled</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 border border-gray-300 text-center text-[#666666] font-bold uppercase tracking-widest text-xs">
                No activities created yet.
              </div>
            )
          ) : (
            /* Student: Show their registered activities */
            myActivities.length > 0 ? (
              <div className="space-y-0 border border-gray-300">
                {myActivities.map((act, i) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors ${i !== 0 ? 'border-t border-gray-300' : ''}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                      <div className="w-12 h-12 border border-gray-300 flex items-center justify-center shrink-0 uppercase font-bold text-[10px] tracking-widest">
                        {act.category.substring(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-lg text-[#111111] truncate tracking-tight">{act.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#666666] mt-1">
                          <Calendar strokeWidth={1.5} className="w-3 h-3" />
                          {format(new Date(act.date), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className={`mt-4 sm:mt-0 px-3 py-1.5 border text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 w-fit ${act.regStatus === 'attended' ? 'bg-black text-white border-black' : 'bg-transparent text-[#111111] border-gray-300'}`}>
                      {act.regStatus === 'attended' ? <CheckCircle2 strokeWidth={1.5} className="w-3 h-3" /> : <Clock strokeWidth={1.5} className="w-3 h-3" />}
                      {act.regStatus}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 border border-gray-300 text-center text-[#666666] font-bold uppercase tracking-widest text-xs">
                No registered activities yet.
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
