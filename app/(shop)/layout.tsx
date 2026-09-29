import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LocationModal } from "@/components/layout/LocationModal";
import { SidebarDrawer } from "@/components/layout/SidebarDrawer";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SidebarDrawer />
      <LocationModal />
    </>
  );
}
