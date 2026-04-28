import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCurrentUser } from "./hooks/use-auth";

// Pages & Layout
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin-dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import StudentCalendar from "@/pages/student-calendar";
import AdminDirectory from "@/pages/admin-directory";
import AdminAnalytics from "@/pages/admin-analytics";
import ProfilePage from "@/pages/profile-page";
import ApiDocs from "@/pages/api-docs";
import AdminAuditLogs from "@/pages/admin-audit-logs";
import TeamWorkspaces from "@/pages/team-workspaces";
import { Layout } from "@/components/layout";

// Protected Route Wrapper
function ProtectedRoute({ component: Component, allowedRole }: { component: any, allowedRole?: string }) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]">
        <div className="inline-block h-8 w-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Redirect to="/login" />;
  if (allowedRole && user.role !== allowedRole) {
    return <Redirect to={user.role === 'admin' ? '/admin' : '/student'} />;
  }

  return <Component />;
}

function Router() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return null;

  return (
    <Switch>
      {/* Root redirect */}
      <Route path="/">
        {user 
          ? <Redirect to={user.role === 'admin' ? '/admin' : '/student'} /> 
          : <Redirect to="/login" />}
      </Route>

      <Route path="/login">
        {user 
          ? <Redirect to={user.role === 'admin' ? '/admin' : '/student'} /> 
          : <AuthPage />}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRole="admin" />
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute component={AdminAnalytics} allowedRole="admin" />
      </Route>
      <Route path="/admin/directory">
        <ProtectedRoute component={AdminDirectory} allowedRole="admin" />
      </Route>
      <Route path="/admin/profile">
        <ProtectedRoute component={ProfilePage} allowedRole="admin" />
      </Route>
      <Route path="/admin/audit-logs">
        <ProtectedRoute component={AdminAuditLogs} allowedRole="admin" />
      </Route>
      <Route path="/admin/api-docs">
        <ProtectedRoute component={ApiDocs} allowedRole="admin" />
      </Route>
      <Route path="/admin/teams">
        <ProtectedRoute component={TeamWorkspaces} allowedRole="admin" />
      </Route>

      {/* Student Routes */}
      <Route path="/student">
        <ProtectedRoute component={StudentDashboard} allowedRole="student" />
      </Route>
      <Route path="/student/calendar">
        <ProtectedRoute component={StudentCalendar} allowedRole="student" />
      </Route>
      <Route path="/student/profile">
        <ProtectedRoute component={ProfilePage} allowedRole="student" />
      </Route>
      <Route path="/student/teams">
        <ProtectedRoute component={TeamWorkspaces} allowedRole="student" />
      </Route>
      <Route path="/student/api-docs">
        <ProtectedRoute component={ApiDocs} allowedRole="student" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
