
import Navigation from "@/components/Navigation";
import ProjectLibrary from "@/components/ProjectLibrary";

const ProjectsPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <ProjectLibrary />
      </div>
    </div>
  );
};

export default ProjectsPage;
