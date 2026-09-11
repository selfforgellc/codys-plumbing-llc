import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const SERVICE_PRICES: Record<string, number> = {
  "Drain Cleaning": 150,
  "Water Heater Repair/Replacement": 450,
  "Pipe Leak Repair": 200,
  "Toilet / Fixture Installation": 175,
  "Emergency Service Call": 250,
};

export default function InstantEstimator() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [urgency, setUrgency] = useState<string>("standard");

  const basePrice = selectedService ? SERVICE_PRICES[selectedService] : 0;
  const multiplier = urgency === "emergency" ? 1.5 : 1;
  const estimatedTotal = Math.round(basePrice * multiplier);

  return (
    <section className="py-12 bg-slate-900 text-white rounded-xl p-8">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span className="text-cyan-400 text-sm font-bold tracking-wider uppercase">
          Budgeting Tool
        </span>
        <h2 className="text-3xl font-bold">Plan ahead without the guesswork</h2>
        <p className="text-slate-300">
          Use our plumbing price ranges as a budgeting guide—not exact pricing or a formal quote.
          Your local Cody's technician will inspect the job and confirm the final price before work begins.
        </p>

        <Button
          size="lg"
          onClick={() => setIsOpen(true)}
          className="bg-cyan-400 text-black hover:bg-cyan-300 font-semibold px-8 py-3 rounded-lg"
        >
          Get an exact quote
        </Button>
      </div>

      {/* Estimator Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-slate-900 text-white border-slate-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-cyan-400">Instant Online Estimator</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select your service details below for an instant rough estimate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Service Type</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-cyan-400 focus:border-cyan-400"
              >
                <option value="">-- Choose a Service --</option>
                {Object.keys(SERVICE_PRICES).map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Timeline / Urgency</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgency("standard")}
                  className={`p-3 rounded-lg border text-sm font-medium ${
                    urgency === "standard"
                      ? "border-cyan-400 bg-cyan-950/40 text-cyan-400"
                      : "border-slate-700 bg-slate-800 text-slate-300"
                  }`}
                >
                  Standard Service
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency("emergency")}
                  className={`p-3 rounded-lg border text-sm font-medium ${
                    urgency === "emergency"
                      ? "border-cyan-400 bg-cyan-950/40 text-cyan-400"
                      : "border-slate-700 bg-slate-800 text-slate-300"
                  }`}
                >
                  24/7 Emergency
                </button>
              </div>
            </div>

            {/* Price Output Display */}
            {selectedService && (
              <div className="p-4 bg-slate-800 rounded-lg border border-cyan-500/30 text-center space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Estimated Starting Price</p>
                <p className="text-3xl font-extrabold text-cyan-400">${estimatedTotal}</p>
                <p className="text-xs text-slate-400">*Final price confirmed on-site by technician</p>
              </div>
            )}

            {/* Action Button */}
            <Button
              className="w-full bg-cyan-400 text-black hover:bg-cyan-300 font-semibold py-3"
              onClick={() => {
                setIsOpen(false);
                window.location.href = `/request-quote?service=${encodeURIComponent(selectedService)}&est=${estimatedTotal}`;
              }}
              disabled={!selectedService}
            >
              Confirm & Schedule Technician
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}