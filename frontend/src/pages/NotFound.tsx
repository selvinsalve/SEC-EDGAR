import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Shield } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <div className="w-14 h-14 rounded-sm bg-muted border border-border flex items-center justify-center mx-auto mb-6">
          <Shield className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1
          className="text-5xl text-foreground mb-3"
          style={{ fontFamily: "'Source Serif 4', serif", fontWeight: 700 }}
        >
          404
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          The page you requested could not be located. This may be due to an expired session, incorrect URL, or insufficient permissions.
        </p>
        <a
          href="/"
          className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-semibold tracking-wide uppercase"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
