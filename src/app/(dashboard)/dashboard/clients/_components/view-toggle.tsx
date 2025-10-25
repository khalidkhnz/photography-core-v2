"use client";

import { useState, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Grid3X3, Table } from "lucide-react";

type ViewType = "grid" | "table";

const ViewContext = createContext<{
  view: ViewType;
  setView: (view: ViewType) => void;
}>({
  view: "grid",
  setView: () => {
    // Default implementation
  },
});

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<ViewType>("grid");

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  return useContext(ViewContext);
}

export function ViewToggle() {
  const { view, setView } = useView();

  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      <Button
        variant={view === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("grid")}
        className="h-8 w-8 p-0"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={view === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => setView("table")}
        className="h-8 w-8 p-0"
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
}
