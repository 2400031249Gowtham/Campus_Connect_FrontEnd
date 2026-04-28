import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Users, Plus, FolderOpen, Target, Clock, ChevronRight, User } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const floemaEase = [0.76, 0, 0.24, 1];

interface TeamPod {
  id: number;
  name: string;
  description: string;
  category: string; // "hackathon" | "research" | "project" | "ctf"
  createdBy: number;
  createdAt: string;
  members: TeamMember[];
  milestones: Milestone[];
}

interface TeamMember {
  id: number;
  podId: number;
  userId: number;
  userName: string;
  role: string; // "lead" | "developer" | "researcher" | "member"
  joinedAt: string;
}

interface Milestone {
  id: number;
  podId: number;
  title: string;
  description: string;
  dueDate: string;
  status: string; // "pending" | "in_progress" | "completed"
}

const CATEGORY_IMAGES: Record<string, string> = {
  hackathon: "1504384308090-c894fdcc538d",
  research: "1532094349884-543bc11b234d",
  project: "1522202176988-66273c2fd55f",
  ctf: "1526374965328-7f61d4dc18c5",
};

const ROLE_LABELS: Record<string, string> = {
  lead: "Lead",
  developer: "Developer",
  researcher: "Researcher",
  member: "Member",
};

export default function TeamWorkspaces() {
  const { data: user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPod, setSelectedPod] = useState<TeamPod | null>(null);

  const { data: pods, isLoading } = useQuery<TeamPod[]>({
    queryKey: ["/api/team-pods"],
  });

  const createPod = useMutation({
    mutationFn: async (data: { name: string; description: string; category: string }) => {
      const res = await apiRequest("POST", "/api/team-pods", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-pods"] });
      toast({ title: "Team pod created successfully" });
      setShowCreate(false);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create pod", description: error.message, variant: "destructive" });
    },
  });

  const joinPod = useMutation({
    mutationFn: async ({ podId, role }: { podId: number; role: string }) => {
      const res = await apiRequest("POST", `/api/team-pods/${podId}/members`, {
        userId: user!.id,
        userName: user!.name,
        role,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-pods"] });
      toast({ title: "Joined team successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to join", description: error.message, variant: "destructive" });
    },
  });

  const leavePod = useMutation({
    mutationFn: async ({ podId, memberId }: { podId: number; memberId: number }) => {
      await apiRequest("DELETE", `/api/team-pods/${podId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-pods"] });
      toast({ title: "Left team successfully" });
    },
  });

  const [formData, setFormData] = useState({ name: "", description: "", category: "project" });
  const [joinRole, setJoinRole] = useState("member");

  if (isLoading || !user) {
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
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop"
          alt="Team collaboration"
          className="w-full h-full object-cover filter grayscale"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-6 left-8 z-10">
          <span className="text-white text-[10px] uppercase tracking-widest font-bold bg-black px-3 py-1.5">
            Collaboration
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-gray-300 pb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl lg:text-6xl font-bold text-[#111111] tracking-tighter uppercase">
            Team Pods.
          </h1>
          <p className="text-[#666666] mt-4 uppercase tracking-widest text-sm font-semibold">
            Dedicated workspaces for hackathons, research groups, and project teams.
          </p>
        </div>
        {user.role === "admin" && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 rounded-none flex-shrink-0"
          >
            <Plus strokeWidth={1.5} className="w-5 h-5" />
            Create Pod
          </button>
        )}
      </div>

      {/* Pod Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-300">
        {pods && pods.length > 0 ? pods.map((pod, index) => (
          <motion.div
            key={pod.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: floemaEase }}
            className="group relative bg-white border-[0.5px] border-gray-300 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setSelectedPod(pod)}
          >
            {/* Top image strip */}
            <div className="h-40 overflow-hidden relative">
              <img
                src={`https://images.unsplash.com/photo-${CATEGORY_IMAGES[pod.category] || CATEGORY_IMAGES.project}?q=80&w=800&auto=format&fit=crop`}
                alt={pod.name}
                className="w-full h-full object-cover filter grayscale group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-1">
                {pod.category}
              </span>
            </div>

            {/* Content */}
            <div className="p-8">
              <h3 className="font-display text-2xl font-bold tracking-tighter text-[#111] mb-2">
                {pod.name}
              </h3>
              <p className="text-sm text-[#666] line-clamp-2 mb-6">{pod.description}</p>

              <div className="flex items-center justify-between border-t border-gray-300 pt-4">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#999] flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    {pod.members?.length || 0} Members
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#999] flex items-center gap-1.5">
                    <Target className="w-3 h-3" />
                    {pod.milestones?.length || 0} Milestones
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#999] group-hover:text-black transition-colors" />
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-24 text-center bg-white">
            <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-display text-2xl font-bold tracking-tighter">No team pods yet.</h3>
            <p className="text-[#666] mt-2 uppercase tracking-widest text-xs font-bold">
              {user.role === "admin"
                ? "Click 'Create Pod' to set up the first workspace."
                : "Team pods will appear here once created by an admin."}
            </p>
          </div>
        )}
      </div>

      {/* Pod Detail Modal */}
      {selectedPod && (
        <Dialog open={!!selectedPod} onOpenChange={() => setSelectedPod(null)}>
          <DialogContent className="sm:max-w-[700px] border border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-0 rounded-none">
            {/* Modal Header Image */}
            <div className="h-48 overflow-hidden relative">
              <img
                src={`https://images.unsplash.com/photo-${CATEGORY_IMAGES[selectedPod.category] || CATEGORY_IMAGES.project}?q=80&w=1200&auto=format&fit=crop`}
                alt={selectedPod.name}
                className="w-full h-full object-cover filter grayscale"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-6 left-8 z-10">
                <span className="text-white text-[10px] uppercase tracking-widest font-bold bg-black px-2 py-1 mb-2 inline-block">
                  {selectedPod.category}
                </span>
                <h2 className="font-display text-3xl font-bold text-white tracking-tighter">
                  {selectedPod.name}
                </h2>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <p className="text-sm text-[#666] leading-relaxed">{selectedPod.description}</p>

              {/* Join / Leave Button */}
              {(() => {
                const myMembership = selectedPod.members?.find(m => m.userId === user!.id);
                const isMember = !!myMembership;

                return (
                  <div className="border border-gray-300 p-4 bg-gray-50">
                    {isMember ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">✓ You are a member</span>
                          <span className="block text-[10px] text-[#999] uppercase tracking-widest mt-1">
                            Role: {ROLE_LABELS[myMembership.role] || myMembership.role}
                          </span>
                        </div>
                        <button
                          onClick={() => leavePod.mutate({ podId: selectedPod.id, memberId: myMembership.id })}
                          disabled={leavePod.isPending}
                          className="px-4 py-2 border border-red-500 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
                        >
                          {leavePod.isPending ? "Leaving..." : "Leave Team"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <select
                          value={joinRole}
                          onChange={e => setJoinRole(e.target.value)}
                          className="border-2 border-black rounded-none px-3 py-2 text-[10px] font-bold uppercase tracking-widest bg-white cursor-pointer flex-shrink-0"
                        >
                          <option value="member">Member</option>
                          <option value="developer">Developer</option>
                          <option value="researcher">Researcher</option>
                          <option value="lead">Lead</option>
                        </select>
                        <button
                          onClick={() => joinPod.mutate({ podId: selectedPod.id, role: joinRole })}
                          disabled={joinPod.isPending}
                          className="flex-1 px-6 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                        >
                          {joinPod.isPending ? "Joining..." : "Join This Team"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Members */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-4 border-b border-gray-300 pb-2">
                  Team Members ({selectedPod.members?.length || 0})
                </h3>
                {selectedPod.members && selectedPod.members.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPod.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-bold">
                            {member.userName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-bold block">{member.userName}</span>
                            <span className="text-[10px] text-[#999]">ID: {member.userId}</span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold border border-gray-300 px-2 py-0.5">
                          {ROLE_LABELS[member.role] || member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#999]">No members yet. Be the first to join!</p>
                )}
              </div>

              {/* Milestones */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#999] mb-4 border-b border-gray-300 pb-2">
                  Milestones
                </h3>
                {selectedPod.milestones && selectedPod.milestones.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPod.milestones.map(ms => (
                      <div key={ms.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
                        <div>
                          <span className="text-sm font-bold">{ms.title}</span>
                          <span className="block text-[10px] text-[#999]">
                            Due: {format(new Date(ms.dueDate), "MMM d, yyyy")}
                          </span>
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 ${
                          ms.status === "completed" ? "bg-emerald-600 text-white" :
                          ms.status === "in_progress" ? "bg-amber-600 text-white" :
                          "border border-gray-300 text-[#666]"
                        }`}>
                          {ms.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#999]">No milestones set yet.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Pod Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[600px] border border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8">
          <DialogHeader className="border-b border-black pb-4 mb-6">
            <DialogTitle className="font-display text-3xl font-bold tracking-tighter text-[#111111] uppercase">
              Create Pod.
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); createPod.mutate(formData); }} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#111111] uppercase tracking-widest block">Pod Name</label>
              <input
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. CTF Red Team Alpha"
                className="w-full border-0 border-b-2 border-black px-0 py-4 focus:outline-none focus:border-black text-lg font-bold placeholder:text-gray-400 bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#111111] uppercase tracking-widest block">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="border-0 border-b-2 border-black rounded-none px-0 py-4 text-lg font-bold bg-transparent w-full focus:outline-none cursor-pointer"
              >
                <option value="project">Project</option>
                <option value="hackathon">Hackathon</option>
                <option value="research">Research</option>
                <option value="ctf">CTF / Cyber</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#111111] uppercase tracking-widest block">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the team's mission and objectives..."
                className="w-full border-2 border-black p-4 min-h-[150px] focus:outline-none text-sm font-medium placeholder:text-gray-400 bg-transparent"
              />
            </div>

            <DialogFooter className="pt-6 border-t border-gray-300">
              <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-3 border border-gray-300 text-[10px] font-bold uppercase tracking-widest text-[#666666] hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={createPod.isPending} className="px-6 py-3 border border-black bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                {createPod.isPending ? "Creating..." : "Create Pod"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
