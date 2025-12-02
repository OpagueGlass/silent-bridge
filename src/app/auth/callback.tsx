import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import LoadingScreen from "../../components/sections/LoadingScreen";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { loadProfile } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const profile = await loadProfile(user);
      if (profile) {
        router.push("/");
      } else {
        router.push("/auth/account-type");
      }
    };
    handleCallback();
  }, []);

  return <LoadingScreen />;
}
