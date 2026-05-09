
import Navigation from "@/components/Navigation";
import Forum from "@/components/Forum";

const ForumPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <Forum />
      </div>
    </div>
  );
};

export default ForumPage;
