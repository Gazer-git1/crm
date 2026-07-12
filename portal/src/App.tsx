import { Route, Routes } from "react-router-dom";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { RequireVerifiedEmail } from "@/components/layout/RequireVerifiedEmail";
import { AuthProvider } from "@/lib/auth";
import { MessagesPage } from "@/pages/Messages";
import { ProfilePage } from "@/pages/Profile";
import { PlaceholderPage } from "@/pages/Placeholder";
import { LoginPage } from "@/pages/Login";
import { SignupPage } from "@/pages/Signup";
import { VerifyEmailPage } from "@/pages/VerifyEmail";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/verify-email"
          element={
            <RequireAuth>
              <VerifyEmailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <RequireVerifiedEmail>
                <PortalLayout>
                  <Routes>
                    <Route path="/" element={<PlaceholderPage title="My Home" />} />
                    <Route path="/properties" element={<PlaceholderPage title="Properties" />} />
                    <Route path="/verification" element={<PlaceholderPage title="Verification" />} />
                    <Route path="/application" element={<PlaceholderPage title="My Application" />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/account" element={<PlaceholderPage title="Account" />} />
                  </Routes>
                </PortalLayout>
              </RequireVerifiedEmail>
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
