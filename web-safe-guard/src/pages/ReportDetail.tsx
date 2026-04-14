import { useLocation, useNavigate } from "react-router-dom";
import { ScanReport } from "@/lib/reports-data";
import ScanResults from "@/components/ScanResults";
import VulnerabilityDetails from "@/components/VulnerabilityDetails";
import { useState } from "react";
import { Vulnerability } from "@/lib/scanner-data";

const ReportDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const report = (location.state as { report?: ScanReport })?.report;
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

  if (!report) {
    navigate("/reports");
    return null;
  }

  if (selectedVuln) {
    return (
      <div className="min-h-screen bg-background px-4 py-12">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(160 100% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 45%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10">
          <VulnerabilityDetails
            vulnerability={selectedVuln}
            onBack={() => setSelectedVuln(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(160 100% 45%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 45%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="relative z-10">
        <ScanResults
          targetUrl={report.targetUrl}
          vulnerabilities={report.vulnerabilities}
          onNewScan={() => navigate("/reports")}
          onSelectVuln={setSelectedVuln}
        />
      </div>
    </div>
  );
};

export default ReportDetail;
