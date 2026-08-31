import { Link } from "react-router-dom";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-background-base text-accent-black flex flex-col">
      <MarketingNav />
      <div className="flex-1 pcl-container flex items-center justify-center py-64">
        <div className="text-center">
          <div className="text-mono-x-small text-black-alpha-32 uppercase">
            [ 404 / not-found ]
          </div>
          <h1 className="mt-12 text-title-h1 text-accent-black tracking-tight">
            Off the <span className="text-heat-100">policy</span>.
          </h1>
          <p className="mt-16 text-body-large text-black-alpha-72 max-w-sm mx-auto">
            We couldn't find what you were looking for. Try the docs, or head back home.
          </p>
          <div className="mt-32 flex flex-wrap items-center justify-center gap-12">
            <Link to="/">
              <Button size="lg">Home</Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="secondary">
                Read the docs
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}