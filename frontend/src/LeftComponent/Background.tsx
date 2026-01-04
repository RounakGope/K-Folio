
import MainContent from "./MainContent";


const Background: React.FC = () => {
  return (
    <div className="bg-[linear-gradient(140deg,#020B3A_0%,#01030A_30%,#01030A_40%,#020B3A_90%,#010B6A_5%)] relative min-h-screen w-screen flex">
      <div
        className="absolute top-0 left-0 h-screen w-7/12 bg-repeat bg-left bg-contain opacity-65"
        style={{
          backgroundImage: "url('/bg-pattern.svg')",
        }}
      />

      <div className="relative z-10 h-screen w-7/12 flex">
        <MainContent />
      </div>

      <div className="w-5/12 bg-black">
        
      </div>
    </div>
  );
};

export default Background;