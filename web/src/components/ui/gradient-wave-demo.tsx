import { GradientWave } from "@/components/ui/gradient-wave";

export default function DemoOne() {
  return (
    <div className="relative h-screen w-full flex items-center justify-center">
      <GradientWave />
      <h1 className="text-black tracking-tighter text-7xl font-bold text-center z-10">
        Gradient Wave
      </h1>
    </div>
  );
}
