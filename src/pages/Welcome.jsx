import Sidebar from "../components/Sidebar";
import logo from "../assets/images/logo.png";

const Welcome = () => {
  return (
    <Sidebar>
      <main className="h-full min-h-[calc(100vh-3.5rem)] md:min-h-screen flex items-center justify-center">
        <img
          src={logo}
          alt="Fitness Tracker Logo"
          className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain"
        />
      </main>
    </Sidebar>
  );
};

export default Welcome;