import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const floemaEase = [0.76, 0, 0.24, 1];

interface Endpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  role?: string;
  requestBody?: string;
  responseBody?: string;
}

const ENDPOINTS: { section: string; endpoints: Endpoint[] }[] = [
  {
    section: "Authentication",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/signup",
        description: "Register a new user account. Validates unique username and hashes the password before storage.",
        auth: false,
        requestBody: `{
  "username": "john.doe@university.edu",
  "password": "SecureP@ss123",
  "name": "John Doe",
  "role": "student"
}`,
        responseBody: `{
  "id": 1,
  "username": "john.doe@university.edu",
  "name": "John Doe",
  "role": "student"
}`,
      },
      {
        method: "POST",
        path: "/api/auth/login",
        description: "Authenticate user credentials. Returns session cookie and user object on success.",
        auth: false,
        requestBody: `{
  "username": "john.doe@university.edu",
  "password": "SecureP@ss123"
}`,
        responseBody: `{
  "id": 1,
  "username": "john.doe@university.edu",
  "name": "John Doe",
  "role": "student"
}`,
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        description: "Invalidate the current session. Clears the HTTP-only session cookie.",
        auth: true,
      },
      {
        method: "GET",
        path: "/api/auth/me",
        description: "Return the currently authenticated user from the session. Returns 401 if not logged in.",
        auth: true,
        responseBody: `{
  "id": 1,
  "username": "john.doe@university.edu",
  "name": "John Doe",
  "role": "student"
}`,
      },
      {
        method: "GET",
        path: "/api/auth/users",
        description: "Retrieve all registered users. Used by admin directory and analytics modules.",
        auth: true,
        role: "admin",
        responseBody: `[
  { "id": 1, "username": "admin@klu.ac.in", "name": "Admin User", "role": "admin" },
  { "id": 2, "username": "student@klu.ac.in", "name": "Student", "role": "student" }
]`,
      },
    ],
  },
  {
    section: "Activities",
    endpoints: [
      {
        method: "GET",
        path: "/api/activities",
        description: "Fetch all extracurricular activities. Returns full list sorted by date. Powers both student discover feed and admin management grid.",
        auth: true,
        responseBody: `[
  {
    "id": 1,
    "name": "Hack The Box CTF",
    "description": "Hands-on cyber security activity...",
    "date": "2026-04-30T09:30:00.000Z",
    "category": "club"
  }
]`,
      },
      {
        method: "POST",
        path: "/api/activities",
        description: "Create a new activity. Admin-only operation. Validates all required fields and stores ISO 8601 date format.",
        auth: true,
        role: "admin",
        requestBody: `{
  "name": "Digital Forensics Workshop",
  "description": "Deep dive into forensic analysis...",
  "date": "2026-05-15T14:00:00.000Z",
  "category": "event"
}`,
      },
      {
        method: "PATCH",
        path: "/api/activities/:id",
        description: "Partially update an existing activity. Supports updating any subset of fields. Admin-only.",
        auth: true,
        role: "admin",
        requestBody: `{
  "name": "Updated Activity Name"
}`,
      },
      {
        method: "DELETE",
        path: "/api/activities/:id",
        description: "Permanently remove an activity and cascade-delete all associated registrations. Admin-only. Irreversible.",
        auth: true,
        role: "admin",
      },
    ],
  },
  {
    section: "Registrations",
    endpoints: [
      {
        method: "GET",
        path: "/api/registrations",
        description: "Fetch all registration records. Used to compute attendance analytics, populate student schedules, and drive admin reports.",
        auth: true,
        responseBody: `[
  {
    "id": 1,
    "userId": 2,
    "activityId": 1,
    "status": "registered"
  }
]`,
      },
      {
        method: "POST",
        path: "/api/registrations",
        description: "Register a student for an activity. Validates that the user and activity exist. Prevents duplicate registrations.",
        auth: true,
        requestBody: `{
  "userId": 2,
  "activityId": 1,
  "status": "registered"
}`,
      },
      {
        method: "DELETE",
        path: "/api/registrations/:id",
        description: "Cancel a registration. Removes the student from the activity roster.",
        auth: true,
      },
    ],
  },
  {
    section: "Audit Logs",
    endpoints: [
      {
        method: "GET",
        path: "/api/audit-logs",
        description: "Retrieve the immutable system audit trail. Tracks all CRUD operations, authentication events, and administrative actions with timestamps and actor metadata.",
        auth: true,
        role: "admin",
        responseBody: `[
  {
    "id": 1,
    "action": "CREATE_ACTIVITY",
    "entityType": "Activity",
    "entityId": 5,
    "userId": 1,
    "userName": "Admin User",
    "details": "Created activity: Hack The Box CTF",
    "timestamp": "2026-04-28T10:30:00.000Z"
  }
]`,
      },
    ],
  },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-600 text-white",
    POST: "bg-blue-600 text-white",
    PATCH: "bg-amber-600 text-white",
    DELETE: "bg-red-600 text-white",
  };
  return (
    <span className={`inline-block w-16 text-center text-[10px] font-bold uppercase tracking-wider py-1 ${colors[method]}`}>
      {method}
    </span>
  );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#999]">{label}</span>
        <button onClick={handleCopy} className="text-[#999] hover:text-black transition-colors">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="bg-[#111111] text-[#e0e0e0] p-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap border border-black">
        {code}
      </pre>
    </div>
  );
}

export default function ApiDocs() {
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
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
          alt="Code on screen"
          className="w-full h-full object-cover filter grayscale"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-6 left-8 z-10">
          <span className="text-white text-[10px] uppercase tracking-widest font-bold bg-black px-3 py-1.5">
            Developer Reference
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-gray-300 pb-8">
        <h1 className="font-display text-4xl lg:text-6xl font-bold text-[#111111] tracking-tighter uppercase">
          API Reference.
        </h1>
        <p className="text-[#666666] mt-4 uppercase tracking-widest text-sm font-semibold max-w-2xl">
          Complete documentation of the CampusConnect REST API. Built with Spring Boot, secured with session-based authentication, and backed by MySQL.
        </p>

        <div className="flex flex-wrap gap-4 mt-8">
          <div className="border border-gray-300 px-4 py-2 bg-white">
            <span className="text-[10px] text-[#999] uppercase tracking-widest font-bold block">Base URL</span>
            <code className="font-mono text-sm font-bold text-[#111]">http://localhost:8080</code>
          </div>
          <div className="border border-gray-300 px-4 py-2 bg-white">
            <span className="text-[10px] text-[#999] uppercase tracking-widest font-bold block">Auth</span>
            <code className="font-mono text-sm font-bold text-[#111]">Session Cookie (JSESSIONID)</code>
          </div>
          <div className="border border-gray-300 px-4 py-2 bg-white">
            <span className="text-[10px] text-[#999] uppercase tracking-widest font-bold block">Format</span>
            <code className="font-mono text-sm font-bold text-[#111]">JSON (application/json)</code>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      {ENDPOINTS.map((group, gi) => (
        <motion.section
          key={group.section}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.15, duration: 0.8, ease: floemaEase }}
        >
          <h2 className="font-display text-2xl lg:text-4xl font-bold text-[#111111] tracking-tighter uppercase mb-8 border-b border-gray-300 pb-4">
            {group.section}
          </h2>

          <div className="space-y-0 border border-gray-300">
            {group.endpoints.map((ep, ei) => (
              <details
                key={ei}
                className="bg-white border-b border-gray-300 last:border-b-0 group"
              >
                <summary className="cursor-pointer p-6 flex flex-wrap items-center gap-4 hover:bg-gray-50 transition-colors select-none">
                  <MethodBadge method={ep.method} />
                  <code className="font-mono text-sm font-bold text-[#111]">{ep.path}</code>
                  {ep.auth && (
                    <span className="text-[10px] font-bold uppercase tracking-widest border border-gray-300 px-2 py-0.5 text-[#666]">
                      Auth
                    </span>
                  )}
                  {ep.role && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5">
                      {ep.role}
                    </span>
                  )}
                  <span className="text-sm text-[#666] ml-auto hidden lg:block max-w-md text-right">
                    {ep.description.slice(0, 80)}...
                  </span>
                </summary>
                <div className="px-6 pb-6 border-t border-gray-200 pt-4">
                  <p className="text-sm text-[#666] leading-relaxed max-w-3xl">
                    {ep.description}
                  </p>
                  {ep.requestBody && (
                    <CodeBlock code={ep.requestBody} label="Request Body" />
                  )}
                  {ep.responseBody && (
                    <CodeBlock code={ep.responseBody} label="Response" />
                  )}
                </div>
              </details>
            ))}
          </div>
        </motion.section>
      ))}

      {/* Schema Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: floemaEase }}
      >
        <h2 className="font-display text-2xl lg:text-4xl font-bold text-[#111111] tracking-tighter uppercase mb-8 border-b border-gray-300 pb-4">
          Data Models
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-gray-300">
          {[
            {
              name: "User",
              fields: ["id: number (PK)", "username: string (unique)", "password: string (hashed)", "name: string", "role: 'admin' | 'student'"],
            },
            {
              name: "Activity",
              fields: ["id: number (PK)", "name: string", "description: text", "date: datetime (ISO 8601)", "category: 'club' | 'sport' | 'event'"],
            },
            {
              name: "Registration",
              fields: ["id: number (PK)", "userId: number (FK → User)", "activityId: number (FK → Activity)", "status: 'registered' | 'attended' | 'cancelled'"],
            },
          ].map((model) => (
            <div key={model.name} className="p-8 bg-white border-[0.5px] border-gray-300">
              <h3 className="font-display text-2xl font-bold tracking-tighter uppercase mb-6">{model.name}</h3>
              <ul className="space-y-2">
                {model.fields.map((f, i) => (
                  <li key={i} className="font-mono text-xs text-[#666] border-b border-gray-200 pb-2 last:border-0">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
