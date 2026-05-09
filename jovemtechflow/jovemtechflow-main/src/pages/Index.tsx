
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import ProjectLibrary from "@/components/ProjectLibrary";
import Forum from "@/components/Forum";
import Events from "@/components/Events";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <Hero />
        <Dashboard />
        <ProjectLibrary />
        <Forum />
        <Events />
      </div>
    </div>
  );
};

export default Index;
