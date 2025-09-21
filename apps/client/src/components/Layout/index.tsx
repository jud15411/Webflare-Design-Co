// in apps/client/src/components/Layout/index.tsx
import { Outlet } from 'react-router-dom';
import { SidebarComponent } from '../Sidebar';

export const MainLayout = () => {
  return (
    <div className="app-layout">
      <SidebarComponent />
      <main className="main-content">
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
};
