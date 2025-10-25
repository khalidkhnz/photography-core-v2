"use client";

import { useView } from "./view-toggle";
import { ClientsGrid } from "./clients-grid";
import { ClientsTable } from "./clients-table";

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  poc?: string | null;
  createdAt: Date;
  entities?: Array<{
    id: string;
    name: string;
    sites?: Array<{
      id: string;
      name: string;
      pocs?: Array<{ id: string; name: string }>;
    }>;
  }>;
  locations?: Array<{ id: string }>;
  _count?: {
    shoots: number;
    entities: number;
  };
}

interface ClientsViewProps {
  clients: Client[];
}

export function ClientsView({ clients }: ClientsViewProps) {
  const { view } = useView();

  return (
    <>
      {view === "grid" && <ClientsGrid clients={clients} />}
      {view === "table" && <ClientsTable clients={clients} />}
    </>
  );
}
