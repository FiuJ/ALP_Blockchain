function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="border border-green-400 shadow-lg shadow-green-400/20 rounded-2xl p-10 w-100">
        
        <h1 className="text-3xl font-bold text-center mb-2">
          ALP Blockchain
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Medical Document Verification
        </p>

        <div className="flex flex-col gap-4">
          
          <input
            type="email"
            placeholder="Email"
            className="border border-green-300 rounded-xl px-4 py-3 outline-none focus:border-green-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="border border-green-300 rounded-xl px-4 py-3 outline-none focus:border-green-500"
          />

          <button
            className="bg-green-400 hover:bg-green-500 transition-all text-black font-semibold py-3 rounded-xl"
          >
            Login
          </button>

        </div>

      </div>
    </div>
  )
}

export default LoginPage