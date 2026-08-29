import { GradientWave } from "@/components/ui/gradient-wave";

/** The exact React component the user asked us to add (color-adapted to policyctl tokens). */
export function App(): JSX.Element {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <GradientWave
        colors={["#0D9373", "#02241e", "#F59E0B", "#043a2f", "#34d399", "#086651"]}
        darkenTop
        shadowPower={6}
        noiseSpeed={0.00001}
        noiseFrequency={[0.0001, 0.0009]}
        deform={{ incline: 0.4, noiseAmp: 240, noiseFlow: 4 }}
      />
      <div className="relative z-10 text-center px-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-300/90">
          Provider-agnostic policy runtime
        </p>
        <h1 className="mt-4 text-balance text-6xl md:text-7xl font-semibold tracking-tight text-white">
          policyctl
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-emerald-100/80">
          WebGL gradient layered behind a hero — adapted to the policyctl design tokens.
        </p>
      </div>
    </div>
  );
}
