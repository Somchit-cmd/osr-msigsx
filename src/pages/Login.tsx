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
import logo from "@/assets/logo-png-only.webp";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Add a specific style for the login page based on language
  const laoFontStyle = i18n.language === 'lo' ? {
    fontFamily: "'Noto Sans Lao', system-ui, sans-serif"
  } : {};

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const userDoc = await getDoc(doc(db, "users", employeeId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.password === password) {
          // If position is an object or null, fix it
          if (typeof userData.position === 'object' || userData.position === null) {
            await updateDoc(doc(db, "users", employeeId), { position: "" });
            userData.position = "";
          }
          
          // Clear previous sessions
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
          
          // Store user session based on "Remember me"
          const userToStore = {...userData, id: employeeId};
          
          if (rememberMe) {
            localStorage.setItem("user", JSON.stringify(userToStore));
          } else {
            sessionStorage.setItem("user", JSON.stringify(userToStore));
          }
          
          toast({
            title: t('login.successTitle'),
            description: t('login.successMessage', {name: `${userData.name} ${userData.surname}`}),
          });
          
          // Redirect based on role
          if (userData.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        } else {
          toast({
            title: t('login.failedTitle'),
            description: t('login.invalidPassword'),
            variant: "destructive",
          });
          setError(t('login.invalidPassword'));
        }
      } else {
        toast({
          title: t('login.failedTitle'),
          description: t('login.userNotFound'),
          variant: "destructive",
        });
        setError(t('login.userNotFound'));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred: " + (error.message || error),
        variant: "destructive",
      });
      setError("Unexpected error. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray p-4 relative">
      <Card className="w-full max-w-md" style={laoFontStyle}>
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <img src={logo} alt={t('login.logoAlt')} className="w-20 h-20 object-contain" />
          </div>
          <CardTitle className="text-xl font-bold text-center text-brand-blue mb-2">
            {t('login.welcomeTitle')}
          </CardTitle>
          <CardDescription className="text-center text-gray-500 mb-4">
            {t('login.welcomeDescription')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">{t('login.employeeId')}</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder={t('login.employeeIdPlaceholder')}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('login.password')}</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
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
                {t('login.rememberMe')}
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-brand-blue hover:bg-brand-blue/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('login.loggingIn') : t('login.login')}
            </Button>
          </CardFooter>
        </form>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </Card>
      
      {/* Language switcher positioned at bottom right */}
      <div className="fixed top-4 right-4">
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default Login;
