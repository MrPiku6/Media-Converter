'use client';
import { useAuth } from '@/app/context/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

export default function Header() {
  const { user, logout } = useAuth();

  const getRemainingConversions = () => {
    if (!user) return 0;
    const dailyLimit = 10;
    const used = user.conversionCount || 0;
    return dailyLimit - used;
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md w-full">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-white">
          Conversion Tool
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm">
                <p className="text-gray-400">{user.email}</p>
                <p className="font-semibold text-white">Conversions left today: {getRemainingConversions()}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
