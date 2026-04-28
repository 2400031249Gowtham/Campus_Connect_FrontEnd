import { useActivities } from "@/hooks/use-activities";
import { useRegistrations } from "@/hooks/use-registrations";
import { useCurrentUser } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Trophy, Palette, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

const floemaEase = [0.76, 0, 0.24, 1];

export default function StudentCalendar() {
  const { data: user } = useCurrentUser();
  const { data: activities, isLoading: loadingActs } = useActivities();
  const { data: registrations, isLoading: loadingRegs } = useRegistrations();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  if (loadingActs || loadingRegs || !user) {
    return (
      <div className="py-20 text-center text-[#111111] font-bold font-display uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  const myRegs = registrations?.filter(r => r.userId === user.id && r.status !== 'cancelled') || [];
  const myActivityIds = new Set(myRegs.map(r => r.activityId));
  const myActivities = activities?.filter(a => myActivityIds.has(a.id)) || [];

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 = Sunday

  // Activities mapped to dates
  const activityMap = useMemo(() => {
    const map = new Map<string, typeof myActivities>();
    myActivities.forEach(act => {
      const key = format(new Date(act.date), "yyyy-MM-dd");
      const existing = map.get(key) || [];
      existing.push(act);
      map.set(key, existing);
    });
    return map;
  }, [myActivities]);

  const selectedDayActivities = selectedDate
    ? activityMap.get(format(selectedDate, "yyyy-MM-dd")) || []
    : [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sport': return 'bg-[#111111]';
      case 'club': return 'bg-[#666666]';
      default: return 'bg-[#BBBBBB]';
    }
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
          src="https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=2000&auto=format&fit=crop" 
          alt="Clean structured calendar lines" 
          className="w-full h-full object-cover filter grayscale"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Header */}
      <div className="border-b border-gray-300 pb-8">
        <h1 className="font-display text-4xl lg:text-6xl font-bold text-[#111111] tracking-tighter uppercase">
          Calendar.
        </h1>
        <p className="text-[#666666] mt-4 uppercase tracking-widest text-sm font-semibold">
          View your registered activities by date.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-gray-300">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 p-8 bg-white border-[0.5px] border-gray-300">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-8 border border-gray-300 p-2">
            <button className="p-2 hover:bg-gray-100 transition-colors" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft strokeWidth={1.5} className="h-6 w-6 text-[#111111]" />
            </button>
            <h2 className="font-display text-2xl font-bold text-[#111111] tracking-tight uppercase">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button className="p-2 hover:bg-gray-100 transition-colors" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight strokeWidth={1.5} className="h-6 w-6 text-[#111111]" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-300 mb-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-[#111111] uppercase tracking-widest py-3 border-r border-b border-gray-300 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-0 border-l border-gray-300">
            {/* Empty cells for offset */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border-r border-b border-gray-300 bg-gray-50" />
            ))}

            {calendarDays.map(day => {
              const dayKey = format(day, "yyyy-MM-dd");
              const dayActivities = activityMap.get(dayKey) || [];
              const hasEvents = dayActivities.length > 0;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <button
                  key={dayKey}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square flex flex-col items-center justify-center gap-2 transition-colors relative border-r border-b border-gray-300
                    ${isSelected ? 'bg-black text-white' : today ? 'bg-gray-100 text-black font-bold' : 'bg-white hover:bg-gray-50 text-[#111111]'}
                  `}
                >
                  <span className="text-sm font-display font-bold">
                    {format(day, "d")}
                  </span>
                  {/* Event dots */}
                  {hasEvents && (
                    <div className="flex gap-1.5 mt-1">
                      {dayActivities.slice(0, 3).map((act, i) => (
                        <div key={i} className={`w-2.5 h-2.5 border ${isSelected ? 'bg-white border-white' : `${getCategoryColor(act.category)} border-black`}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="p-8 bg-white border-[0.5px] border-gray-300 flex flex-col">
          <h3 className="font-display text-2xl font-bold text-[#111111] tracking-tighter uppercase mb-6 flex items-center gap-2 border-b border-gray-300 pb-4">
            <Calendar strokeWidth={1.5} className="w-6 h-6" />
            {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select a Day"}
          </h3>

          <div className="flex-1 overflow-y-auto">
            {selectedDate ? (
              selectedDayActivities.length > 0 ? (
                <div className="space-y-0 border border-gray-300">
                  {selectedDayActivities.map((act, i) => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.5, ease: floemaEase }}
                      className={`p-6 bg-white flex flex-col gap-4 ${i !== 0 ? 'border-t border-gray-300' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold border border-black px-2 py-1">
                          {act.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#666666] uppercase tracking-widest font-bold">
                          <Clock strokeWidth={1.5} className="w-3 h-3" />
                          {format(new Date(act.date), "h:mm a")}
                        </div>
                      </div>
                      <h4 className="font-display font-bold text-xl text-[#111111] tracking-tighter">{act.name}</h4>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-[#666666]">
                  <p className="text-[10px] uppercase tracking-widest font-bold">No events on this day.</p>
                </div>
              )
            ) : (
              <div className="py-12 text-center text-[#666666]">
                <p className="text-[10px] uppercase tracking-widest font-bold">Click a date to see your events.</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <p className="text-[10px] font-bold text-[#111111] uppercase tracking-widest mb-4">Legend</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs text-[#666666] font-bold uppercase tracking-widest">
                <div className="w-3 h-3 bg-[#111111] border border-black" /> Sport
              </div>
              <div className="flex items-center gap-3 text-xs text-[#666666] font-bold uppercase tracking-widest">
                <div className="w-3 h-3 bg-[#666666] border border-[#666666]" /> Club
              </div>
              <div className="flex items-center gap-3 text-xs text-[#666666] font-bold uppercase tracking-widest">
                <div className="w-3 h-3 bg-[#BBBBBB] border border-[#BBBBBB]" /> Event
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
