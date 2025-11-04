import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50">
      <div className="text-center space-y-6 px-4 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              SCO GB IT Vision
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Admin Panel - Manage your platform with ease
          </p>
        </div>
        
        <Link to="/admin">
          <Button size="lg" className="group">
            Access Admin Panel
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
