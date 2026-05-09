
import Navigation from "@/components/Navigation";
import Events from "@/components/Events";

const EventsPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <Events />
      </div>
    </div>
  );
};

export default EventsPage;
