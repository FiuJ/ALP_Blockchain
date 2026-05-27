import { Link } from "react-router-dom"

function MainLayout({ children }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-white">

      <nav className="border-b border-green-200 backdrop-blur-md bg-white/70 px-10 py-5 flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          ALP Blockchain
        </h1>

        <div className="flex gap-6 items-center">

          <Link to="/dashboard" className="hover:text-green-500">
            Dashboard
          </Link>

          <Link to="/upload" className="hover:text-green-500">
            Upload
          </Link>

          <Link to="/verify" className="hover:text-green-500">
            Verify
          </Link>

          <button className="border border-green-400 px-5 py-2 rounded-xl hover:bg-green-100 transition-all shadow-lg shadow-green-400/20">
            Connect Wallet
          </button>

        </div>

      </nav>

      <div className="p-10">
        {children}
      </div>

    </div>
  )
}

export default MainLayout