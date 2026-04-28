import { useActivities } from "@/hooks/use-activities";
import { useRegistrations, useCreateRegistration, useDeleteRegistration } from "@/hooks/use-registrations";
import { useCurrentUser } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

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

export default function StudentDashboard() {
  const { data: user } = useCurrentUser();
  const { data: activities, isLoading: loadingActs } = useActivities();
  const { data: registrations, isLoading: loadingRegs } = useRegistrations();

  const register = useCreateRegistration();
  const unregister = useDeleteRegistration();

  if (loadingActs || loadingRegs || !user) {
    return (
      <div className="py-20 text-center text-[#111111] font-bold font-display uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  const myRegs = registrations?.filter(r => r.userId === user.id) || [];
  const myRegMap = new Map(myRegs.map(r => [r.activityId, r]));

  const upcomingActs = activities?.filter(a => new Date(a.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  const myUpcoming = upcomingActs.filter(a => {
    const reg = myRegMap.get(a.id);
    return reg && reg.status !== 'cancelled';
  });

  const handleRegister = (actId: number) => {
    register.mutate({ userId: user.id, activityId: actId, status: "registered" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: floemaEase }}
      className="space-y-12 pb-12"
    >
      {/* Welcome Banner */}
      <div className="border-b border-gray-300 pb-8">
        <h1 className="font-display text-4xl lg:text-6xl font-bold text-[#111111] tracking-tighter uppercase">
          Welcome, {user.name.split(' ')[0]}.
        </h1>
        <p className="text-[#666666] mt-4 uppercase tracking-widest text-sm font-semibold">
          You have {myUpcoming.length} upcoming activities.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="flex w-full border-b border-gray-300 mb-8 p-0 h-auto bg-transparent rounded-none">
          <TabsTrigger 
            value="discover" 
            className="rounded-none py-4 px-8 font-bold uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white text-[#666666] bg-transparent border-none shadow-none transition-colors"
          >
            Discover
          </TabsTrigger>
          <TabsTrigger 
            value="my-schedule" 
            className="rounded-none py-4 px-8 font-bold uppercase tracking-widest data-[state=active]:bg-black data-[state=active]:text-white text-[#666666] bg-transparent border-none shadow-none transition-colors"
          >
            My Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="focus-visible:outline-none">
          {/* Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border border-gray-300">
            {upcomingActs.map((act, index) => {
              const reg = myRegMap.get(act.id);
              const isRegistered = !!reg && reg.status !== 'cancelled';
              const isOnlyChild = upcomingActs.length === 1;

              return (
                <motion.div 
                  key={act.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8, ease: floemaEase }}
                  className={`group relative bg-white flex flex-col justify-between overflow-hidden border-[0.5px] border-gray-300 ${
                    isOnlyChild 
                      ? 'md:col-span-2 xl:col-span-3 md:flex-row aspect-auto min-h-[400px]' 
                      : 'aspect-square hover:text-white'
                  }`}
                >
                  {/* Image */}
                  <img 
                    src={`https://images.unsplash.com/photo-${ACTIVITY_IMAGES[act.id % ACTIVITY_IMAGES.length]}?q=80&w=800&auto=format&fit=crop`}
                    alt={act.name}
                    className={`absolute inset-0 object-cover img-placeholder transition-opacity duration-500 z-0 ${
                      isOnlyChild 
                        ? 'w-full md:w-1/3 xl:w-1/4 h-full opacity-100 filter grayscale md:relative' 
                        : 'w-full h-full opacity-0 group-hover:opacity-100'
                    }`}
                  />
                  {!isOnlyChild && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                  )}

                  {/* Content */}
                  <div className={`relative z-10 flex flex-col h-full justify-between ${
                    isOnlyChild 
                      ? 'w-full md:w-2/3 xl:w-3/4 p-8 lg:p-12 text-[#111111]' 
                      : 'p-8'
                  }`}>
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="uppercase tracking-widest text-[10px] font-bold border border-current px-2 py-1">
                          {act.category}
                        </span>
                        {isRegistered && (
                          <span className={`uppercase tracking-widest text-[10px] font-bold px-2 py-1 ${
                            isOnlyChild ? 'bg-black text-white' : 'bg-current text-white group-hover:text-black'
                          }`}>
                            Registered
                          </span>
                        )}
                      </div>
                      <h3 className={`font-display font-bold tracking-tighter leading-tight transition-colors duration-300 ${
                        isOnlyChild ? 'text-4xl lg:text-6xl text-[#111111]' : 'text-3xl group-hover:text-white'
                      }`}>
                        {act.name}
                      </h3>
                      <p className={`mt-4 font-medium transition-opacity duration-300 ${
                        isOnlyChild 
                          ? 'text-base lg:text-lg text-[#666666] opacity-100 mt-8 max-w-3xl whitespace-pre-wrap' 
                          : 'text-sm opacity-0 group-hover:opacity-100 line-clamp-3'
                      }`}>
                        {act.description}
                      </p>
                    </div>

                    <div className={`mt-auto pt-6 border-t flex flex-col gap-4 ${
                      isOnlyChild ? 'border-gray-300 mt-12' : 'border-gray-200 group-hover:border-white/30'
                    }`}>
                      <div className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${
                        isOnlyChild ? 'text-[#111111]' : 'group-hover:text-white'
                      }`}>
                        {format(new Date(act.date), "MMM d, yyyy • h:mm a")}
                      </div>

                      {isRegistered ? (
                        <button
                          className={`w-full text-left font-bold text-xs uppercase tracking-widest text-red-500 transition-colors ${
                            isOnlyChild ? 'hover:text-red-700' : 'hover:text-red-300'
                          }`}
                          onClick={() => unregister.mutate(reg.id)}
                          disabled={unregister.isPending}
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          className={`w-full text-left font-bold text-xs uppercase tracking-widest transition-opacity ${
                            isOnlyChild ? 'text-[#111111] hover:text-[#666666]' : 'group-hover:text-white hover:opacity-50'
                          }`}
                          onClick={() => handleRegister(act.id)}
                          disabled={register.isPending}
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {upcomingActs.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white">
                <p className="font-display text-2xl font-bold tracking-tighter">No upcoming activities.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-schedule" className="focus-visible:outline-none">
          {myUpcoming.length > 0 ? (
            <div className="grid gap-0 border border-gray-300">
              {myUpcoming.map((act, index) => {
                const reg = myRegMap.get(act.id)!;
                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.8, ease: floemaEase }}
                    className="bg-white border-b border-gray-300 last:border-b-0 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h3 className="font-display font-bold text-2xl tracking-tighter">{act.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                        <span className="text-xs uppercase tracking-widest font-bold text-[#666666]">
                          {format(new Date(act.date), "EEEE, MMMM d")}
                        </span>
                        <span className="text-xs uppercase tracking-widest font-bold text-[#666666]">
                          Status: <span className="text-black">{reg.status}</span>
                        </span>
                      </div>
                    </div>
                    <button
                      className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => unregister.mutate(reg.id)}
                    >
                      Cancel
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center border border-gray-300 bg-white">
              <h3 className="font-display text-2xl font-bold tracking-tighter">Schedule is empty</h3>
              <p className="text-[#666666] mt-2 uppercase tracking-widest text-xs font-bold">
                Browse the discover tab to join.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
