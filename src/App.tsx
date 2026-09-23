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
  const [isAdmin, setIsAdmin] = useState<boolean>(() => storage.isAdminAuthenticated());
  const [activeTab, setActiveTab] = useState<NavTab>(() => storage.isAdminAuthenticated() ? 'dashboard' : 'scanner');
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
    setActiveTab('scanner'); // Lock directly into default kiosk mode where main menu is hidden!
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Sidebar Navigation - ONLY display main menu when admin is logged in */}
      {isAdmin && (
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
      )}

      {/* Main Content Area - Full width without sidebar margin when not admin */}
      <div className={`${isAdmin ? 'lg:pl-64' : ''} flex flex-col flex-1 min-w-0 transition-all duration-200`}>
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
          {(!isAdmin || activeTab === 'scanner') && (
            <ScanQrView
              isAdmin={isAdmin}
              onExitKiosk={() => setActiveTab('dashboard')}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            />
          )}

          {isAdmin && activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onOpenAddStaff={handleOpenAddStaffFromDash}
            />
          )}

          {isAdmin && activeTab === 'staff' && (
            <StaffView
              isAdmin={isAdmin}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
              isAddModalOpen={isAddStaffOpen}
              setIsAddModalOpen={setIsAddStaffOpen}
            />
          )}

          {isAdmin && activeTab === 'departments' && (
            <DepartmentsView
              isAdmin={isAdmin}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
              onNavigateToRecords={handleNavigateToRecordsForDept}
            />
          )}

          {isAdmin && activeTab === 'shifts' && (
            <ShiftsView
              isAdmin={isAdmin}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            />
          )}

          {isAdmin && activeTab === 'records' && (
            <AttendanceRecordsView
              isAdmin={isAdmin}
              onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
              initialDeptFilter={filterDeptForRecords}
            />
          )}

          {isAdmin && activeTab === 'reports' && <ReportsView />}

          {isAdmin && activeTab === 'settings' && (
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
        onSuccess={() => {
          setIsAdmin(true);
          if (activeTab === 'scanner') {
            setActiveTab('dashboard');
          }
        }}
      />

      {/* Web Hosting Deployment Guide Modal */}
      <DeploymentGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
}
