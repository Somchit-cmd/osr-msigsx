import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import users from "@/data/users.json";
import logo from "@/assets/logo-png-only.webp";
import { authenticate } from "@/lib/authService";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const user = await authenticate(employeeId, password);
    if (user) {
      // Clear previous sessions
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      // Store user session based on "Remember me"
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("user", JSON.stringify(user));
      }
      toast({
        title: "Login successful",
        description: `Welcome, ${user.name} ${user.surname}!`,
      });
      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } else {
      toast({
        title: "Login failed",
        description: "Invalid employee ID or password",
        variant: "destructive",
      });
      setError("Invalid employee ID or password");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Company Logo" className="w-20 h-20 object-contain" />
          </div>
          <CardTitle className="text-xl font-bold text-center text-brand-blue mb-2">
            Welcome to MSIGSX OSR
          </CardTitle>
          <CardDescription className="text-center text-gray-500 mb-4">
            Please sign in with your staff credentials to continue.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="Your staff id number"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Repeat your staff id number"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Remember me
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-brand-blue hover:bg-brand-blue/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </CardFooter>
        </form>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </Card>
    </div>
  );
};

export default Login;
