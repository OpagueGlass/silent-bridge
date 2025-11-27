"use client";

import { useAuth } from "@/contexts/AuthContext";
import SearchScreen from "@/components/sections/SearchScreen";
import RequestScreen from "@/components/sections/RequestScreen";


export default function Discovery() {
  const { isInterpreter, profile, getValidProviderToken } = useAuth();

  if (!isInterpreter) {
    return <SearchScreen profile={profile} />
  } else {
    return <RequestScreen profile={profile} getToken={getValidProviderToken} />;
  }
}