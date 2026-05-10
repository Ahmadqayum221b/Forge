import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Capacitor } from '@capacitor/core';
import Index from "./pages/Index.tsx";
import Builder from "./pages/Builder.tsx";
import NotFound from "./pages/NotFound.tsx";
import { NativeRenderer } from "./pages/NativeRenderer.tsx";
import { PhonePreview } from "./pages/PhonePreview.tsx";
import Guide from "./pages/Guide.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {Capacitor.isNativePlatform() ? (
            <Route path="*" element={<NativeRenderer />} />
          ) : (
            <>
              <Route path="/" element={<Index />} />
              <Route path="/builder" element={<Builder />} />
              <Route path="/preview" element={<PhonePreview />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
