"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setSidebarOpen } from "@/store/uiSlice";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { sidebarOpen, activeModal, editingTask } = useAppSelector((s) => s.ui);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--color-board-bg)" }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay — closes drawer when tapped */}
      {sidebarOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Global modals — conditionally mount so hooks only run when open */}
      {activeModal === "addTask" && <AddTaskModal />}
      {editingTask && <AddTaskModal task={editingTask} />}
    </div>
  );
}
