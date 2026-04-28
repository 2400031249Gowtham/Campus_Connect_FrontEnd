import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Shield, UserCheck, Trash2, Edit, Plus, LogIn, LogOut as LogOutIcon, Filter } from "lucide-react";
import { useState } from "react";

const floemaEase = [0.76, 0, 0.24, 1];

// Audit log type
interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  userId: number;
  userName: string;
  details: string;
  timestamp: string;
}

const ACTION_ICONS: Record<string, React.ElementType> = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogOutIcon,
  REGISTER: UserCheck,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-600",
  UPDATE: "bg-amber-600",
  DELETE: "bg-red-600",
  LOGIN: "bg-blue-600",
  LOGOUT: "bg-gray-600",
  REGISTER: "bg-indigo-600",
};

function getActionType(action: string): string {
  if (action.includes("CREATE")) return "CREATE";
  if (action.includes("UPDATE")) return "UPDATE";
  if (action.includes("DELETE")) return "DELETE";
  if (action.includes("LOGIN")) return "LOGIN";
  if (action.includes("LOGOUT")) return "LOGOUT";
  if (action.includes("REGISTER")) return "REGISTER";
  return "CREATE";
}

export default function AdminAuditLogs() {
  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
  });

  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredLogs = logs?.filter(log => {
    if (filterType === "ALL") return true;
    return getActionType(log.action) === filterType;
  }) || [];

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#111111] font-bold font-display uppercase tracking-widest">
        Loading...
      </div>
    );
  }

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
          src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop"
          alt="Server room"
          className="w-full h-full object-cover filter grayscale"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-6 left-8 z-10">
          <span className="text-white text-[10px] uppercase tracking-widest font-bold bg-black px-3 py-1.5">
            System Monitor
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-gray-300 pb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold text-[#111111] tracking-tighter uppercase">
            Audit Logs.
          </h1>
          <p className="text-[#666666] mt-4 uppercase tracking-widest text-sm font-semibold">
            Immutable system activity trail — every action is recorded.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#666]" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border-2 border-black rounded-none px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-[#111] cursor-pointer"
          >
            <option value="ALL">All Events</option>
            <option value="CREATE">Creates</option>
            <option value="UPDATE">Updates</option>
            <option value="DELETE">Deletes</option>
            <option value="LOGIN">Logins</option>
            <option value="REGISTER">Registrations</option>
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-300">
        {[
          { label: "Total Events", value: logs?.length || 0 },
          { label: "Creates", value: logs?.filter(l => l.action.includes("CREATE")).length || 0 },
          { label: "Deletes", value: logs?.filter(l => l.action.includes("DELETE")).length || 0 },
          { label: "Logins", value: logs?.filter(l => l.action.includes("LOGIN")).length || 0 },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border-[0.5px] border-gray-300">
            <p className="text-[10px] text-[#999] font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="font-display text-4xl font-bold text-[#111] tracking-tighter mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Log Entries */}
      <div className="border border-gray-300">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-0 bg-black text-white p-4">
          <span className="col-span-1 text-[10px] font-bold uppercase tracking-widest">Type</span>
          <span className="col-span-2 text-[10px] font-bold uppercase tracking-widest">Action</span>
          <span className="col-span-2 text-[10px] font-bold uppercase tracking-widest">Actor</span>
          <span className="col-span-4 text-[10px] font-bold uppercase tracking-widest">Details</span>
          <span className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-right">Timestamp</span>
        </div>

        {filteredLogs.length > 0 ? filteredLogs.map((log, index) => {
          const actionType = getActionType(log.action);
          const Icon = ACTION_ICONS[actionType] || Shield;

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.5, ease: floemaEase }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-0 p-4 lg:p-4 bg-white border-b border-gray-300 last:border-b-0 hover:bg-gray-50 transition-colors items-center"
            >
              {/* Icon */}
              <div className="col-span-1 flex items-center">
                <div className={`w-8 h-8 ${ACTION_COLORS[actionType]} text-white flex items-center justify-center`}>
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
              </div>

              {/* Action */}
              <div className="col-span-2">
                <span className="font-mono text-xs font-bold text-[#111]">{log.action}</span>
                <span className="block text-[10px] text-[#999] uppercase tracking-widest">{log.entityType}</span>
              </div>

              {/* Actor */}
              <div className="col-span-2">
                <span className="text-xs font-bold text-[#111]">{log.userName}</span>
                <span className="block text-[10px] text-[#999]">ID: {log.userId}</span>
              </div>

              {/* Details */}
              <div className="col-span-4">
                <span className="text-xs text-[#666] line-clamp-2">{log.details}</span>
              </div>

              {/* Timestamp */}
              <div className="col-span-3 text-right">
                <span className="font-mono text-[10px] text-[#999] font-bold">
                  {format(new Date(log.timestamp), "MMM d, yyyy • HH:mm:ss")}
                </span>
              </div>
            </motion.div>
          );
        }) : (
          <div className="py-24 text-center bg-white">
            <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-display text-2xl font-bold tracking-tighter">No audit logs yet.</h3>
            <p className="text-[#666] mt-2 uppercase tracking-widest text-xs font-bold">
              System events will appear here once the backend integration is complete.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
