import { useState, useEffect } from "react";
import { type Activity, type InsertActivity } from "@shared/schema";
import { useCreateActivity, useUpdateActivity } from "@/hooks/use-activities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Activity | null;
}

export function ActivityForm({ isOpen, onClose, initialData }: ActivityFormProps) {
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  const [formData, setFormData] = useState<Partial<InsertActivity>>({
    name: "",
    description: "",
    date: "",
    category: "event"
  });

  useEffect(() => {
    if (initialData) {
      const d = new Date(initialData.date);
      const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      setFormData({
        name: initialData.name,
        description: initialData.description,
        date: localDate,
        category: initialData.category,
      });
    } else {
      setFormData({ name: "", description: "", date: "", category: "event" });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      date: new Date(formData.date as string).toISOString()
    } as InsertActivity;

    if (initialData) {
      updateActivity.mutate({ id: initialData.id, updates: submissionData }, {
        onSuccess: () => onClose()
      });
    } else {
      createActivity.mutate(submissionData, {
        onSuccess: () => onClose()
      });
    }
  };

  const isPending = createActivity.isPending || updateActivity.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] border border-black bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8">
        <DialogHeader className="border-b border-black pb-4 mb-6">
          <DialogTitle className="font-display text-4xl font-bold tracking-tighter text-[#111111] uppercase">
            {initialData ? "Edit " : "Create "}
            Activity.
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-bold text-[#111111] uppercase tracking-widest">
              Activity Name
            </Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Chess Club Meeting"
              className="border-0 border-b-2 border-black rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-black text-lg bg-transparent font-bold placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-bold text-[#111111] uppercase tracking-widest">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData({...formData, category: val})}
              >
                <SelectTrigger className="border-0 border-b-2 border-black rounded-none px-0 py-4 focus:ring-0 text-lg bg-transparent font-bold">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-black rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold">
                  <SelectItem value="club" className="focus:bg-gray-100 rounded-none cursor-pointer">Club</SelectItem>
                  <SelectItem value="sport" className="focus:bg-gray-100 rounded-none cursor-pointer">Sport</SelectItem>
                  <SelectItem value="event" className="focus:bg-gray-100 rounded-none cursor-pointer">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-[10px] font-bold text-[#111111] uppercase tracking-widest">
                Date & Time
              </Label>
              <Input
                id="date"
                type="datetime-local"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="border-0 border-b-2 border-black rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-black text-lg bg-transparent font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-bold text-[#111111] uppercase tracking-widest">
              Description
            </Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="What will happen at this activity? You can write a detailed description here."
              className="border-2 border-black rounded-none p-4 focus-visible:ring-0 focus-visible:border-black text-sm bg-transparent min-h-[250px] font-medium placeholder:text-gray-400"
            />
          </div>

          <DialogFooter className="pt-6 border-t border-gray-300">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isPending} 
              className="px-6 py-3 border border-gray-300 text-[10px] font-bold uppercase tracking-widest text-[#666666] hover:bg-gray-100 hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="px-6 py-3 border border-black bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              {isPending ? "Saving..." : "Save Activity"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
