import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowRight, Loader2 } from "lucide-react";

export function AuthForm() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [businessDetails, setBusinessDetails] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(userId, password);
      } else {
        await register({
          email: userId,
          password,
          first_name: firstName,
          last_name: lastName,
          age: parseInt(age),
          business_details: businessDetails,
          address
        });
        setIsLogin(true);
        setError("Registration successful. Please sign in.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="surface-glass rounded-sm p-8 glow-gov border border-border/80">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6 pb-5 border-b border-border">
          <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2
              className="text-lg text-foreground"
              style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700 }}
            >
              {isLogin ? "Sign In" : "Sign Up"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLogin
                ? "Authorized personnel only. All access is logged."
                : "Create your SEC compliance account."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="userId" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              {isLogin ? "User ID (Email)" : "Email"}
            </Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={isLogin ? "Enter your email" : "Enter your email address"}
              className="bg-secondary border-border focus:ring-primary text-sm rounded-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-secondary border-border focus:ring-primary text-sm rounded-sm"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="bg-secondary border-border focus:ring-primary text-sm rounded-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="bg-secondary border-border focus:ring-primary text-sm rounded-sm"
                    required
                  />
                </div>
              </div>

              {/* <div className="space-y-1.5">
                <Label htmlFor="age" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                  className="bg-secondary border-border focus:ring-primary text-sm rounded-sm"
                  required
                />
              </div> */}

              <div className="space-y-1.5">
                <Label htmlFor="businessDetails" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  Business Details
                </Label>
                <Input
                  id="businessDetails"
                  value={businessDetails}
                  onChange={(e) => setBusinessDetails(e.target.value)}
                  placeholder="Company Name"
                  className="bg-secondary border-border focus:ring-primary text-sm rounded-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  Address
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full Address"
                  className="bg-secondary border-border focus:ring-primary text-sm rounded-sm"
                  required
                />
              </div>
            </>
          )}

          {error && (
            <div className={`text-sm ${error.includes("successful") ? "text-primary bg-primary/8" : "text-destructive bg-destructive/8"} border border-border/20 rounded-sm px-3 py-2`}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/85 font-semibold h-10 text-sm rounded-sm tracking-wide mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLogin ? "Sign In" : "Sign Up"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? "Need an account? Sign Up" : "Already registered? Sign In"}
          </button>
        </div>
        {/* 
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Demo credentials:{" "}
            <span className="text-primary font-mono">demo / demo</span>
          </p>
        </div> */}
      </div>
    </div>
  );
}
