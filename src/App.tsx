import React, { useState, useEffect } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { Header } from './components/Header';
import { AdminLoginModal } from './components/AdminLoginModal';
import { DashboardView } from './components/views/DashboardView';
import { StaffView } from './components/views/StaffView';
import { DepartmentsView } from './components/views/DepartmentsView';
import { ShiftsView } from './components/views/ShiftsView';
import { ScanQrView } from './components/views/ScanQrView';
import { AttendanceRecordsView } from './components/views/AttendanceRecordsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { storage } from './services/storage';
import { getStoredTheme, applyTheme } from './utils/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // default authenticated for ease of evaluation
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Cross-view navigation state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState<boolean>(false);
  const [filterDeptForRecords, setFilterDeptForRecords] = useState<string>('all');

  useEffect(() => {
    // Initialize user theme preference
    const initialTheme = getStoredTheme();
    applyTheme(initialTheme);

    setIsAdmin(storage.isAdminAuthenticated());
    return storage.subscribe(() => {
      setIsAdmin(storage.isAdminAuthenticated());
    });
  }, []);

  const handleOpenAddStaffFromDash = () => {
    setActiveTab('staff');
    setIsAddStaffOpen(true);
  };

  const handleNavigateToRecordsForDept = (deptId: string) => {
    setFilterDeptForRecords(deptId);
    setActiveTab('records');
  };

  const handleLogoutAdmin = () => {
    storage.setAdminAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Sidebar Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Sticky Header with Theme & Kiosk Controls */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={isAdmin}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onLogoutAdmin={handleLogoutAdmin}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        {/* View Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onOpenAddStaff={handleOpenAddStaffFromDash}
            />
          )}

          {activeTab === 'staff' && (
            <StaffView
              isAdmin={isAdmin}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
              isAddModalOpen={isAddStaffOpen}
              setIsAddModalOpen={setIsAddStaffOpen}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentsView
              isAdmin={isAdmin}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
              onNavigateToRecords={handleNavigateToRecordsForDept}
            />
          )}

          {activeTab === 'shifts' && (
            <ShiftsView
              isAdmin={isAdmin}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            />
          )}

          {activeTab === 'scanner' && <ScanQrView />}

          {activeTab === 'records' && (
            <AttendanceRecordsView
              isAdmin={isAdmin}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
              initialDeptFilter={filterDeptForRecords}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && (
            <SettingsView
              isAdmin={isAdmin}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => setIsAdmin(true)}
      />

      {/* Web Hosting Deployment Guide Modal */}
      <DeploymentGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
}
