import { useUsers } from "@/hooks/use-auth";
import { useRegistrations } from "@/hooks/use-registrations";
import { useState, useMemo } from "react";
import { Search, Users, Shield, GraduationCap, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const floemaEase = [0.76, 0, 0.24, 1];

export default function AdminDirectory() {
  const { data: users, isLoading } = useUsers();
  const { data: registrations } = useRegistrations();
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#111111] font-bold font-display uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  const allUsers = users || [];
  const admins = allUsers.filter(u => u.role === 'admin');
  const students = allUsers.filter(u => u.role === 'student');

  // Registration counts per user
  const regCountMap = useMemo(() => {
    const map = new Map<number, number>();
    registrations?.forEach(r => {
      if (r.status !== 'cancelled') {
        map.set(r.userId, (map.get(r.userId) || 0) + 1);
      }
    });
    return map;
  }, [registrations]);

  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

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
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop" 
          alt="People working in minimal office" 
          className="w-full h-full object-cover filter grayscale"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Header */}
      <div className="border-b border-gray-300 pb-8">
        <h1 className="font-display text-4xl lg:text-6xl font-bold text-[#111111] tracking-tighter uppercase">
          Directory.
        </h1>
        <p className="text-[#666666] mt-4 uppercase tracking-widest text-sm font-semibold">
          Manage and view all registered users.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-gray-300">
        <div className="bg-white p-8 border-[0.5px] border-gray-300">
          <div className="flex items-start justify-between mb-8">
            <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest">Total Users</p>
            <Users strokeWidth={1.5} className="w-5 h-5 text-[#111111]" />
          </div>
          <p className="text-5xl font-display font-bold text-[#111111] tracking-tighter">{allUsers.length}</p>
        </div>

        <div className="bg-white p-8 border-[0.5px] border-gray-300">
          <div className="flex items-start justify-between mb-8">
            <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest">Administrators</p>
            <Shield strokeWidth={1.5} className="w-5 h-5 text-[#111111]" />
          </div>
          <p className="text-5xl font-display font-bold text-[#111111] tracking-tighter">{admins.length}</p>
        </div>

        <div className="bg-white p-8 border-[0.5px] border-gray-300">
          <div className="flex items-start justify-between mb-8">
            <p className="text-[10px] text-[#666666] font-bold uppercase tracking-widest">Students</p>
            <GraduationCap strokeWidth={1.5} className="w-5 h-5 text-[#111111]" />
          </div>
          <p className="text-5xl font-display font-bold text-[#111111] tracking-tighter">{students.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative border-b-2 border-black">
        <Search strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#111111]" />
        <input
          type="text"
          placeholder="SEARCH BY NAME OR USERNAME..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-14 pr-4 py-6 bg-transparent text-xl font-display font-bold text-[#111111] focus:outline-none placeholder:text-[#BBBBBB] tracking-widest"
        />
      </div>

      {/* User List */}
      <div className="border border-gray-300 bg-white">
        {filtered.map((u, index) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: floemaEase }}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 hover:bg-gray-50 transition-colors ${index !== 0 ? 'border-t border-gray-300' : ''}`}
          >
            <div className="flex items-center gap-6 min-w-0">
              {/* Avatar Box */}
              <div className={`w-16 h-16 shrink-0 flex items-center justify-center font-display text-2xl font-bold uppercase border ${u.role === 'admin' ? 'bg-black text-white border-black' : 'bg-gray-100 text-black border-gray-300'}`}>
                {u.name.substring(0, 2)}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-4">
                  <h3 className="font-display font-bold text-2xl text-[#111111] truncate tracking-tight">{u.name}</h3>
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 border ${u.role === 'admin' ? 'border-black text-black' : 'border-gray-300 text-[#666666]'}`}>
                    {u.role}
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#666666] mt-1 truncate">@{u.username}</p>
              </div>
            </div>

            {/* Registration Count */}
            <div className="mt-6 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 shrink-0">
              <div className="flex items-center gap-2">
                <UserCheck strokeWidth={1.5} className="w-4 h-4 text-[#111111]" />
                <span className="font-display font-bold text-2xl text-[#111111]">{regCountMap.get(u.id) || 0}</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#666666]">Registrations</p>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="py-24 text-center text-[#666666]">
            <p className="font-display text-2xl font-bold tracking-tighter text-[#111111]">No Users Found</p>
            <p className="text-[10px] uppercase tracking-widest font-bold mt-2">Adjust your search query.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
