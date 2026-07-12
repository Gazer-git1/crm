import { Route, Routes } from "react-router-dom";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { MessagesPage } from "@/pages/Messages";
import { ProfilePage } from "@/pages/Profile";
import { PlaceholderPage } from "@/pages/Placeholder";

export default function App() {
  return (
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
  );
}
