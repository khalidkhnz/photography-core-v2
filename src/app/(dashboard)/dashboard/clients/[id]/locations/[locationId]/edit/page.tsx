import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string; locationId: string }>;
}

export default async function ClientLocationEditRedirect({ params }: PageProps) {
  const { locationId } = await params;
  
  // Redirect to the correct location edit route
  redirect(`/dashboard/locations/${locationId}/edit`);
}

