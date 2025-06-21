import { useState, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { LeftSidebar } from "@/components/LeftSidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

// Define interface to match ImperativePanelHandle
interface ImperativePanelHandle {
  collapse: () => void;
  expand: () => void;
  isCollapsed: () => boolean;
  getId: () => string;
  getSize: () => number;
  isExpanded: () => boolean;
  resize: (size: number) => void;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const leftSidebarRef = useRef<ImperativePanelHandle>(null);

  const toggleLeftSidebar = () => {
    const panel = leftSidebarRef.current;
    if (panel) {
      panel.isCollapsed() ? panel.expand() : panel.collapse();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(true)}
          className="h-9 w-9 rounded-md"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <h1 className="text-lg font-semibold">Service Peek</h1>
        <div className="w-9" /> {/* Empty div for balance */}
      </div>

      {/* Mobile Sidebar (Overlay) */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${mobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <div 
          className={`fixed left-0 top-0 h-full z-50 bg-card w-72 shadow-xl transition-transform duration-200 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <LeftSidebar
            collapsed={false}
          />
          <button
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full"
        >
          {/* Left Sidebar */}
          <ResizablePanel
            ref={leftSidebarRef}
            collapsible
            collapsedSize={5}
            minSize={10}
            maxSize={20}
            defaultSize={15}
            onCollapse={() => setLeftSidebarCollapsed(true)}
            onExpand={() => setLeftSidebarCollapsed(false)}
            className="p-0"
          >
            <LeftSidebar
              collapsed={leftSidebarCollapsed}
            />
          </ResizablePanel>
          <ResizableHandle withArrow onCollapse={toggleLeftSidebar} collapsed={leftSidebarCollapsed} />

          {/* Main Content */}
          <ResizablePanel defaultSize={85} className="p-0">
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
