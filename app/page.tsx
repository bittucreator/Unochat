import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white p-8">
      <main className="flex flex-col items-center gap-8 w-full max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-blue-400 drop-shadow-lg text-center">
          Welcome to Unochat
        </h1>
        <p className="text-lg sm:text-xl text-blue-200 text-center max-w-xl">
          Experience a modern, sci-fi AI chat powered by Azure OpenAI and Neon.tech. Start chatting with advanced AI models in a beautiful, futuristic interface.
        </p>
        <Link
          href="/chat"
          className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all text-xl mt-4 animate-bounce"
        >
          🚀 Start Chatting
        </Link>
      </main>
      <footer className="mt-16 flex gap-8 flex-wrap items-center justify-center opacity-80 text-sm">
        {/* ...existing code for credits, or leave empty if you want no footer... */}
      </footer>
    </div>
  );
}
