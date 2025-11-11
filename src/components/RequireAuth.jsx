// src/components/RequireAuth.jsx
import { Navigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
export default function RequireAuth({ children }) {
  const session = useSession();
  if (session === null) return <div className="p-6">Chargement…</div>;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
