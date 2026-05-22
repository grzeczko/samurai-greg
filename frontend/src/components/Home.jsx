import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-6xl font-bold text-white mb-4">Gregory Rzeczko</h1>
        <p className="text-xl text-gray-300 mb-2">Software Engineer • Full Stack Developer</p>
        <p className="text-gray-400 mb-12">
          React • Laravel • AWS • Azure • DevOps
        </p>
        
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-200 transform hover:scale-105"
        >
          Play Resume Game →
        </button>

        <p className="text-gray-500 mt-8 text-sm">
          Navigate the platform, collect skills, and explore my projects!
        </p>
      </div>
    </div>
  );
}
