import { notFound } from "next/navigation";
import { getCase } from "@/lib/caseData";
import { JourneyProvider } from "@/components/JourneyProvider";
import { JourneySteps } from "@/components/JourneySteps";

export default function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const demoCase = getCase(params.id);
  if (!demoCase) notFound();

  return (
    <JourneyProvider caseId={params.id}>
      <div className="container-page space-y-5 py-6">
        <JourneySteps />
        {children}
      </div>
    </JourneyProvider>
  );
}
