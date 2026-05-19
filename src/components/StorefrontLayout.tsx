import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import CatalogStatusBanner from "@/components/CatalogStatusBanner";

const StorefrontLayout = () => (
  <div className="min-h-screen flex flex-col bg-background w-full overflow-x-hidden">
    <Header />
    <CatalogStatusBanner />
    <main className="flex-1 flex flex-col w-full">
      <Outlet />
    </main>
    <SiteFooter />
  </div>
);

export default StorefrontLayout;
