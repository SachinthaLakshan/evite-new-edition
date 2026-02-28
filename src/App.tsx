import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "@/legacy-pages/Dashboard";
import Auth from "@/legacy-pages/Auth";
import NotFound from "@/legacy-pages/NotFound";
import EventDetails from "@/legacy-pages/EventDetails";
import PublicRSVP from "@/legacy-pages/PublicRSVP";
import CreateEvent from "@/legacy-pages/CreateEvent";
import { AuthProvider } from "@/components/AuthProvider";
import Profile from "@/legacy-pages/Profile";
import Landing from "@/legacy-pages/Index";
import ShortUrlRedirect from "@/legacy-pages/ShortUrlRedirect";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/create-event" element={<CreateEvent />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/response" element={<PublicRSVP />} />
            <Route path="/s/:shortId" element={<ShortUrlRedirect />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
        <Toaster position="bottom-right" richColors />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
