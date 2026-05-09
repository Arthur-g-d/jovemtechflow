
import EditProfile from "@/components/EditProfile";
import Navigation from "@/components/Navigation";

const ProfilePage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16 max-w-2xl mx-auto px-4">
        <EditProfile />
      </div>
    </div>
  );
};

export default ProfilePage;
