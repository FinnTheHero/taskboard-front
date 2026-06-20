import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as groupsApi from "../api/groups";
import { useAuth } from "./AuthContext";
import type { GroupMembership } from "../types";

interface GroupContextValue {
  membership: GroupMembership | null;
  loading: boolean;
  isManager: boolean;
  refreshGroup: () => Promise<void>;
  setMembership: (membership: GroupMembership | null) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [membership, setMembership] = useState<GroupMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshGroup = useCallback(async () => {
    if (!user) {
      setMembership(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await groupsApi.getMe();
      if (result.group && result.role) {
        setMembership({ group: result.group, role: result.role });
      } else {
        setMembership(null);
      }
    } catch {
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshGroup();
  }, [refreshGroup]);

  const value = useMemo(
    () => ({
      membership,
      loading,
      isManager: membership?.role === "MANAGER",
      refreshGroup,
      setMembership,
    }),
    [membership, loading, refreshGroup],
  );

  return (
    <GroupContext.Provider value={value}>{children}</GroupContext.Provider>
  );
}

export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroup must be used within GroupProvider");
  return ctx;
}
