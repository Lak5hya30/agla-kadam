import { notFound } from "next/navigation";
import { getCase } from "@/lib/caseData";
import { ADHOC_ID } from "@/lib/adhocCase";
import { JourneyProvider } from "@/components/JourneyProvider";
import { JourneySteps } from "@/components/JourneySteps";

export default function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  // Curated cases are validated server-side; the ad-hoc USER-DRAFT case is
  // resolved on the client from sessionStorage, so it is allowed through.
  if (params.id !== ADHOC_ID && !getCase(params.id)) notFound();

  return (
    <JourneyProvider caseId={params.id}>
      <div className="container-reading space-y-5 py-6">
        <JourneySteps />
        {children}
      </div>
    </JourneyProvider>
  );
}
