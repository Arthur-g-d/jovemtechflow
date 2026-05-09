
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";

const DashboardPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <Dashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
