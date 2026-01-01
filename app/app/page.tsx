"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the home page when the website loads
    router.push('/user/pages/home');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081028] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        {/* Loading/Redirect Message */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to <span className="text-blue-400">Music Platform</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-md mx-auto">
            Redirecting to home page...
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-gray-400 text-sm">
          <p>If you are not redirected automatically, <a href="/user/pages/home" className="text-blue-400 hover:underline">click here</a></p>
        </div>
      </div>
    </div>
  );
}
