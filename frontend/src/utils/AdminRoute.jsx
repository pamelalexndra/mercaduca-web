export default function AdminRoute({ user, children }) {
  if (!user) return <Navigate to="/vender" replace />;
  if (user.role !== "Administrador") {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
}