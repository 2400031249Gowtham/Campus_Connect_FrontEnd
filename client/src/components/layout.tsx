import { ReactNode } from "react";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { LayoutDashboard, Calendar, Users, BarChart3, User, LogOut, FolderOpen, Shield, Code2 } from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

export function Layout({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [location] = useLocation();

  if (!user) return <>{children}</>;

  // Role-based navigation items
  const navItems: NavItem[] = user.role === 'admin'
    ? [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
        { label: 'Directory', icon: Users, href: '/admin/directory' },
        { label: 'Teams', icon: FolderOpen, href: '/admin/teams' },
        { label: 'Audit', icon: Shield, href: '/admin/audit-logs' },
        { label: 'Profile', icon: User, href: '/admin/profile' },
      ]
    : [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/student' },
        { label: 'Calendar', icon: Calendar, href: '/student/calendar' },
        { label: 'Teams', icon: FolderOpen, href: '/student/teams' },
        { label: 'Profile', icon: User, href: '/student/profile' },
      ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-sans text-[#111111]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-300">
        <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-8">
          
          {/* Logo */}
          <Link href={user.role === 'admin' ? '/admin' : '/student'}>
            <a className="flex-shrink-0">
              <span className="font-display font-bold text-2xl tracking-tighter uppercase text-[#111111]">
                Campus<span className="opacity-40">Connect.</span>
              </span>
            </a>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
            {navItems.map(item => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <a className={`h-20 flex items-center px-4 uppercase tracking-widest text-[10px] font-bold transition-all border-b-2 ${
                    isActive 
                      ? 'border-black text-black' 
                      : 'border-transparent text-[#666666] hover:text-black hover:border-gray-300'
                  }`}>
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>

          {/* Right Side: User & Logout */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link href={user.role === 'admin' ? '/admin/profile' : '/student/profile'}>
              <a className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-[#111111] uppercase tracking-tight">{user.name}</p>
                  <p className="text-[10px] text-[#666666] uppercase tracking-widest">{user.role}</p>
                </div>
                <div className="h-10 w-10 bg-black text-white flex items-center justify-center font-display font-bold text-lg uppercase">
                  {user.name.substring(0, 2)}
                </div>
              </a>
            </Link>

            <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>

            <button
              onClick={() => logout.mutate()}
              className="text-[#666666] hover:text-black transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold"
              title="Logout"
            >
              <LogOut strokeWidth={1.5} className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation (Scrollable horizontal list) */}
        <div className="md:hidden w-full border-t border-gray-300 overflow-x-auto bg-white">
          <nav className="flex px-4 min-w-max">
            {navItems.map(item => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <a className={`flex-shrink-0 h-14 flex items-center px-4 uppercase tracking-widest text-[10px] font-bold transition-all border-b-2 ${
                    isActive 
                      ? 'border-black text-black' 
                      : 'border-transparent text-[#666666] hover:text-black'
                  }`}>
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 lg:px-8 py-8 lg:py-12 relative z-10">
        {children}
      </main>
    </div>
  );
}
