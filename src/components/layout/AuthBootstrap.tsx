"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchCurrentUser } from "@/store/authSlice";
import { getStoredToken, getStoredUserId, setAuthToken } from "@/lib/api";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (user) return;
    const token = getStoredToken();
    const userId = getStoredUserId();
    if (token && userId) {
      setAuthToken(token);
      dispatch(fetchCurrentUser(userId));
    }
  }, [dispatch, user]);

  return null;
}
