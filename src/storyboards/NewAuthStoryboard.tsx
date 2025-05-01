import { NewAuthProvider } from "@/contexts/NewAuthContext";
import NewLoginPage from "@/components/auth/NewLoginPage";

export default function NewAuthStoryboard() {
  return (
    <div className="bg-background min-h-screen">
      <NewAuthProvider>
        <NewLoginPage />
      </NewAuthProvider>
    </div>
  );
}
