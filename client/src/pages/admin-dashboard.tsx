import { useState } from "react";
import { format } from "date-fns";
import { useActivities, useDeleteActivity } from "@/hooks/use-activities";
import { useRegistrations, useUpdateRegistrationStatus } from "@/hooks/use-registrations";
import { useUsers } from "@/hooks/use-auth";
import { ActivityForm } from "@/components/activity-form";
import { type Activity } from "@shared/schema";
import {
  Plus, Edit, Trash2, Users, Calendar, Trophy, Palette,
  MapPin, CheckCircle2, XCircle, Clock
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

const floemaEase = [0.76, 0, 0.24, 1];

const ACTIVITY_IMAGES = [
  "1486406146926-c627a92ad1ab", // Facade
  "1506784365847-bbad939e9335", // Calendar
  "1550751827-4bd374c3f58b", // Analytics
  "1522071820081-009f0129c71c", // Office
  "1600607688969-a5bfcd646154", // Indian Constitution
  "1497366216548-37526070297c", // Abstract
  "1431578500526-9d7b5c4d257e", // Building
  "1449844908441-8829872d2607"  // Modern structure
];

export default function AdminDashboard() {
  const { data: activities, isLoading: loadingActs } = useActivities();
  const { data: registrations } = useRegistrations();
  const { data: users } = useUsers();
  const deleteActivity = useDeleteActivity();
  const updateStatus = useUpdateRegistrationStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);

  if (loadingActs) {
    return (
      <div className="py-20 text-center text-[#111111] font-bold font-display uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  const handleEdit = (act: Activity) => {
    setEditingActivity(act);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingActivity(null);
    setFormOpen(true);
  };

  const getRegistrationsForActivity = (actId: number) => {
    if (!registrations || !users) return [];
    return registrations
      .filter(r => r.activityId === actId)
      .map(r => ({
        ...r,
        user: users.find(u => u.id === r.userId)
      }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: floemaEase }}
      className="space-y-12 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-300 pb-8">
        <div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold text-[#111111] tracking-tighter uppercase">
            Activity Management.
          </h1>
          <p className="text-[#666666] mt-4 uppercase tracking-widest text-sm font-semibold">
            Create and oversee all extracurriculars.
          </p>
        </div>
        <button 
          onClick={handleCreate} 
          className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 rounded-none"
        >
          <Plus strokeWidth={1.5} className="w-5 h-5" />
          Create Activity
        </button>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border border-gray-300">
        {activities?.map((act, index) => {
          const actRegs = getRegistrationsForActivity(act.id);

          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: floemaEase }}
              className="group relative bg-white aspect-square flex flex-col justify-between p-8 overflow-hidden hover:text-white border-[0.5px] border-gray-300"
            >
              {/* Hover Image */}
              <img 
                src={`https://images.unsplash.com/photo-${ACTIVITY_IMAGES[act.id % ACTIVITY_IMAGES.length]}?q=80&w=800&auto=format&fit=crop`}
                alt={act.name}
                className="absolute inset-0 w-full h-full object-cover img-placeholder opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="uppercase tracking-widest text-[10px] font-bold border border-current px-2 py-1">
                      {act.category}
                    </span>
                    <div className="flex gap-2">
                      <button className="text-current hover:opacity-50 transition-opacity" onClick={() => handleEdit(act)}>
                        <Edit strokeWidth={1} className="w-5 h-5" />
                      </button>
                      <button className="text-current hover:text-red-500 transition-colors" onClick={() => {
                        if (confirm("Are you sure you want to delete this?")) deleteActivity.mutate(act.id);
                      }}>
                        <Trash2 strokeWidth={1} className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display text-3xl font-bold tracking-tighter leading-tight group-hover:text-white transition-colors duration-300">
                    {act.name}
                  </h3>
                  <p className="mt-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-3">
                    {act.description}
                  </p>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-200 group-hover:border-white/30 transition-colors flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-widest font-bold group-hover:text-white transition-colors">
                      {format(new Date(act.date), "MMM d, yyyy • h:mm a")}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                      <Users strokeWidth={1} className="w-4 h-4" />
                      {actRegs.length} Registered
                    </div>
                  </div>

                  <button
                    onClick={() => setViewingActivity(act)}
                    className="w-full text-left font-bold text-xs uppercase tracking-widest group-hover:text-white hover:opacity-50 transition-opacity"
                  >
                    View Roster
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {activities?.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white border border-gray-300">
            <h3 className="font-display text-2xl font-bold tracking-tighter">No Activities Yet</h3>
            <p className="text-[#666666] mt-2 uppercase tracking-widest text-xs font-bold mb-6">Get started by creating the first activity.</p>
            <button onClick={handleCreate} className="border border-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-colors rounded-none">
              Create Activity
            </button>
          </div>
        )}
      </div>

      <ActivityForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        initialData={editingActivity}
      />

      {/* Roster Modal */}
      <Dialog open={!!viewingActivity} onOpenChange={(open) => !open && setViewingActivity(null)}>
        <DialogContent className="sm:max-w-[700px] rounded-none border border-black p-0 overflow-hidden bg-[#F9F9F9]">
          <DialogHeader className="p-8 border-b border-gray-300 bg-white">
            <DialogTitle className="font-display text-3xl font-bold tracking-tighter text-[#111111] uppercase">
              {viewingActivity?.name} Roster
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto p-8 bg-[#F9F9F9]">
            {viewingActivity && getRegistrationsForActivity(viewingActivity.id).length > 0 ? (
              <div className="space-y-0 border border-gray-300">
                {getRegistrationsForActivity(viewingActivity.id).map((reg, idx) => (
                  <div key={reg.id} className={`flex items-center justify-between p-6 bg-white ${idx !== 0 ? 'border-t border-gray-300' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border border-gray-300 flex items-center justify-center text-[#111111] font-display font-bold text-xl uppercase">
                        {reg.user?.name.substring(0, 1)}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-[#111111] tracking-tight">{reg.user?.name}</p>
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#666666] mt-1">
                          {reg.status === 'registered' && <Clock strokeWidth={1.5} className="w-3 h-3" />}
                          {reg.status === 'attended' && <CheckCircle2 strokeWidth={1.5} className="w-3 h-3" />}
                          {reg.status === 'cancelled' && <XCircle strokeWidth={1.5} className="w-3 h-3" />}
                          {reg.status}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors border rounded-none ${reg.status === 'attended' ? 'bg-black text-white border-black' : 'bg-transparent text-[#111111] border-gray-300 hover:border-black'}`}
                        onClick={() => updateStatus.mutate({ id: reg.id, status: 'attended' })}
                        disabled={updateStatus.isPending}
                      >
                        Attended
                      </button>
                      <button
                        className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors border rounded-none ${reg.status === 'cancelled' ? 'bg-red-600 text-white border-red-600' : 'bg-transparent text-red-600 border-red-200 hover:border-red-600'}`}
                        onClick={() => updateStatus.mutate({ id: reg.id, status: 'cancelled' })}
                        disabled={updateStatus.isPending}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[#666666] font-bold uppercase tracking-widest text-xs">
                No students registered yet.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
