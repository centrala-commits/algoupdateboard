import { useState } from "react";
import { AppProvider, useApp } from "./store.jsx";
import { cx } from "./data.js";
import { loadSession, saveSession, clearSession } from "./auth.js";
import { Login } from "./components/Login.jsx";
import { Background, AGWatermark } from "./components/ui.jsx";
import { Header } from "./components/Header.jsx";
import { BoardView } from "./components/board.jsx";
import { ManagementView } from "./components/management.jsx";
import {
  TeamStatsModal,
  ConfirmAssignAllModal,
  AddCompanyModal,
  AddDriverModal,
  DeleteCompanyModal,
  DeleteDriverModal,
  ContactInfoModal,
  AddAccountModal,
} from "./components/modals.jsx";

function Shell({ user, onLogout }) {
  const { t, isDark, activeTab, modal, closeModal, loading } = useApp();

  return (
    <div className={cx("min-h-screen relative", t.appBg)}>
      <Background isDark={isDark} />
      <AGWatermark />
      <Header t={t} user={user} onLogout={onLogout} />

      {loading && (
        <div className={cx("fixed inset-0 z-30 flex items-center justify-center text-sm font-semibold", t.textSec)}>
          Loading board…
        </div>
      )}

      <main className="pt-14 min-h-screen relative z-10">
        {activeTab === "A" && <BoardView board="A" t={t} />}
        {activeTab === "B" && <BoardView board="B" t={t} />}
        {activeTab === "mgmt" && <ManagementView t={t} />}
      </main>

      {modal?.type === "teamStats" && <TeamStatsModal t={t} onClose={closeModal} />}
      {modal?.type === "confirmAssignAll" && <ConfirmAssignAllModal t={t} onClose={closeModal} />}
      {modal?.type === "addCompany" && <AddCompanyModal t={t} defaultBoard={modal.board} onClose={closeModal} />}
      {modal?.type === "addDriver" && <AddDriverModal t={t} defaultCompanyId={modal.companyId} onClose={closeModal} />}
      {modal?.type === "deleteCompany" && <DeleteCompanyModal t={t} company={modal.company} onClose={closeModal} />}
      {modal?.type === "deleteDriver" && <DeleteDriverModal t={t} driver={modal.driver} companyName={modal.companyName} onClose={closeModal} />}
      {modal?.type === "contactInfo" && <ContactInfoModal t={t} driverId={modal.driverId} driverName={modal.driverName} onClose={closeModal} />}
      {modal?.type === "addAccount" && <AddAccountModal t={t} onClose={closeModal} />}

      <footer className="fixed bottom-0 left-0 z-30 pointer-events-none">
        <p className={cx("text-[10px] px-2.5 py-1 opacity-55 select-none tracking-wide font-medium", t.textSec)}>Created &amp; Designed By Nura ( Norris )</p>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => loadSession());

  if (!user) {
    return (
      <Login
        onLogin={(u) => {
          saveSession(u);
          setUser(u);
        }}
      />
    );
  }

  return (
    <AppProvider user={user}>
      <Shell
        user={user}
        onLogout={() => {
          clearSession();
          setUser(null);
        }}
      />
    </AppProvider>
  );
}
