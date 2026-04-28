import { useLogin, useSignup } from "@/hooks/use-auth";
import { ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Mail, KeyRound, ArrowUpRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { EMAILJS_CONFIG, isEmailJSConfigured } from "@/lib/emailjs-config";

// Allowed email domains
const ALLOWED_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
  "icloud.com", "protonmail.com", "mail.com",
  "edu", "ac.in", "edu.in"
];

function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(email)) return false;
  const domain = email.split("@")[1].toLowerCase();
  return ALLOWED_DOMAINS.some(d => domain === d || domain.endsWith("." + d));
}

const floemaEase = [0.76, 0, 0.24, 1];

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "student">("student");
  const login = useLogin();
  const signup = useSignup();
  const { toast } = useToast();

  // OTP State
  const [signupStep, setSignupStep] = useState(1);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = useCallback(async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email (Gmail, Yahoo, Outlook, or university email)");
      return;
    }

    setError("");
    setOtpSending(true);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (isEmailJSConfigured()) {
      try {
        await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          { to_email: email, email: email, passcode: otp },
          EMAILJS_CONFIG.PUBLIC_KEY
        );

        setGeneratedOtp(otp);
        setOtpSending(false);
        setSignupStep(2);
        setOtpTimer(60);
        setOtpDigits(["", "", "", "", "", ""]);

        toast({ title: "Verification code sent", description: `Check your inbox at ${email}` });
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } catch (err: any) {
        setOtpSending(false);
        setError(err?.text || "Failed to send verification email. Please try again.");
      }
    } else {
      setTimeout(() => {
        setGeneratedOtp(otp);
        setOtpSending(false);
        setSignupStep(2);
        setOtpTimer(60);
        setOtpDigits(["", "", "", "", "", ""]);
        console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        toast({ title: "Verification code sent", description: `Check your inbox at ${email}` });
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }, 1500);
    }
  }, [email, toast]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setError("");

    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();

    const fullOtp = newDigits.join("");
    if (fullOtp.length === 6) {
      if (fullOtp === generatedOtp) {
        setOtpVerified(true);
        setTimeout(() => setSignupStep(3), 600);
      } else {
        setError("Invalid OTP. Please check your email and try again.");
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpInputRefs.current[5]?.focus();
      if (pasted === generatedOtp) {
        setOtpVerified(true);
        setTimeout(() => setSignupStep(3), 600);
      } else {
        setError("Invalid OTP. Please check your email and try again.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      if (signupStep === 1) return handleSendOtp();
      if (signupStep === 3) {
        if (!username || !password) return setError("Please fill in all fields");
        if (password.length < 6) return setError("Password must be at least 6 characters");
        const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        signup.mutate({ name, username, password, role }, {
          onSuccess: () => {
            toast({ title: "Account created successfully", description: "Please login with your credentials." });
            resetSignup();
            setIsSignup(false);
          },
          onError: (err: any) => setError(err.message || "Failed to create account"),
        });
      }
      return;
    }

    if (!username || !password) return setError("Please enter both username and password");
    login.mutate({ username, password }, {
      onError: (err: any) => setError(err.message || "Invalid username or password"),
    });
  };

  const resetSignup = () => {
    setSignupStep(1);
    setEmail("");
    setUsername("");
    setPassword("");
    setOtpDigits(["", "", "", "", "", ""]);
    setGeneratedOtp("");
    setOtpVerified(false);
    setOtpTimer(0);
    setError("");
  };

  return (
    <div className="h-screen w-full flex bg-[#F9F9F9] overflow-hidden">
      {/* LEFT PANEL: Architectural Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-200">
        <img 
          src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?q=80&w=2070&auto=format&fit=crop" 
          alt="Brutalist Architecture" 
          className="absolute inset-0 w-full h-full object-cover img-placeholder"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-12 left-12">
          <h1 className="text-white font-display text-4xl font-bold tracking-tighter mix-blend-difference">
            Campus<br/>Connect
          </h1>
        </div>
      </div>

      {/* RIGHT PANEL: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: floemaEase }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-2">
            <h2 className="text-5xl font-display font-bold text-[#111111] tracking-tighter">
              {isSignup ? "Create Account." : "Sign In."}
            </h2>
            <p className="text-[#666666] text-sm">
              {isSignup ? "Enter your academic email to proceed." : "Welcome back. Enter your credentials."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isSignup ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8, ease: floemaEase }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-[#666666] uppercase tracking-widest">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full py-3 bg-transparent border-b border-gray-300 text-lg font-medium text-[#111111] focus:outline-none focus:border-black transition-colors rounded-none"
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-[#666666] uppercase tracking-widest">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3 bg-transparent border-b border-gray-300 text-lg font-medium text-[#111111] focus:outline-none focus:border-black transition-colors rounded-none"
                      placeholder="Enter password"
                    />
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

                <div className="pt-4 space-y-6">
                  <button 
                    type="submit" 
                    disabled={login.isPending}
                    className="w-full py-4 bg-black text-white font-bold text-lg hover:bg-white hover:text-black border border-black transition-colors duration-300 flex items-center justify-between px-6 rounded-none"
                  >
                    <span>{login.isPending ? "AUTHENTICATING..." : "SIGN IN"}</span>
                    <ArrowUpRight strokeWidth={1.5} className="w-5 h-5" />
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => { setIsSignup(true); resetSignup(); }}
                    className="w-full text-left text-sm font-semibold text-[#666666] hover:text-black transition-colors uppercase tracking-widest"
                  >
                    Or create an account
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8, ease: floemaEase }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                <AnimatePresence mode="wait">
                  {/* STEP 1: Email */}
                  {signupStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: floemaEase }} className="space-y-8">
                      <div>
                        <label className="block text-xs font-semibold mb-2 text-[#666666] uppercase tracking-widest">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(""); }}
                          className="w-full py-3 bg-transparent border-b border-gray-300 text-lg font-medium text-[#111111] focus:outline-none focus:border-black transition-colors rounded-none"
                          placeholder="yourname@gmail.com"
                          autoFocus
                        />
                        <p className="text-[10px] text-[#666666] mt-2 uppercase tracking-wider">
                          Supported domains: .edu, gmail, outlook, etc.
                        </p>
                      </div>

                      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

                      <button type="submit" disabled={otpSending} className="w-full py-4 bg-black text-white font-bold text-lg hover:bg-white hover:text-black border border-black transition-colors duration-300 flex items-center justify-between px-6 rounded-none">
                        <span>{otpSending ? "SENDING CODE..." : "CONTINUE"}</span>
                        <ArrowUpRight strokeWidth={1.5} className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 2: OTP */}
                  {signupStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: floemaEase }} className="space-y-8">
                      <div>
                        <label className="block text-xs font-semibold mb-2 text-[#666666] uppercase tracking-widest">Enter Verification Code</label>
                        <div className="flex gap-2" onPaste={handleOtpPaste}>
                          {otpDigits.map((digit, i) => (
                            <input
                              key={i}
                              ref={(el) => { otpInputRefs.current[i] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              className="w-12 h-14 text-center text-xl font-bold bg-transparent border-b-2 border-gray-300 text-[#111111] focus:outline-none focus:border-black transition-colors rounded-none"
                            />
                          ))}
                        </div>
                      </div>

                      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

                      <div className="flex items-center justify-between pt-4">
                        <button type="button" onClick={() => { setSignupStep(1); setError(""); }} className="text-sm font-semibold text-[#666666] hover:text-black uppercase tracking-widest flex items-center gap-2">
                          <ArrowLeft strokeWidth={1.5} className="w-4 h-4" /> Back
                        </button>
                        {otpTimer > 0 ? (
                          <span className="text-sm font-bold text-[#111111] uppercase tracking-widest">{otpTimer}s</span>
                        ) : (
                          <button type="button" onClick={handleSendOtp} className="text-sm font-bold text-[#111111] hover:text-gray-600 uppercase tracking-widest">
                            Resend Code
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Details */}
                  {signupStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: floemaEase }} className="space-y-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-semibold mb-2 text-[#666666] uppercase tracking-widest">Username</label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full py-3 bg-transparent border-b border-gray-300 text-lg font-medium text-[#111111] focus:outline-none focus:border-black transition-colors rounded-none"
                            placeholder="Choose username"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-2 text-[#666666] uppercase tracking-widest">Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full py-3 bg-transparent border-b border-gray-300 text-lg font-medium text-[#111111] focus:outline-none focus:border-black transition-colors rounded-none"
                            placeholder="Min 6 characters"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-3 text-[#666666] uppercase tracking-widest">Role</label>
                          <div className="grid grid-cols-2 gap-0 border border-gray-300">
                            <button type="button" onClick={() => setRole("student")} className={`py-3 text-sm font-bold uppercase tracking-widest transition-colors ${role === 'student' ? 'bg-black text-white' : 'bg-transparent text-[#666666] hover:bg-gray-50'}`}>
                              Student
                            </button>
                            <button type="button" onClick={() => setRole("admin")} className={`py-3 text-sm font-bold uppercase tracking-widest transition-colors border-l border-gray-300 ${role === 'admin' ? 'bg-black text-white' : 'bg-transparent text-[#666666] hover:bg-gray-50'}`}>
                              Admin
                            </button>
                          </div>
                        </div>
                      </div>

                      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

                      <button type="submit" disabled={signup.isPending} className="w-full py-4 bg-black text-white font-bold text-lg hover:bg-white hover:text-black border border-black transition-colors duration-300 flex items-center justify-between px-6 rounded-none">
                        <span>{signup.isPending ? "CREATING..." : "CREATE ACCOUNT"}</span>
                        <ArrowUpRight strokeWidth={1.5} className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setIsSignup(false); resetSignup(); }}
                    className="w-full text-left text-sm font-semibold text-[#666666] hover:text-black transition-colors uppercase tracking-widest"
                  >
                    Return to login
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
