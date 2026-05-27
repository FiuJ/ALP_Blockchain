import MainLayout from "../layouts/MainLayout"

function VerifyPage() {
  return (
    <MainLayout>

      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-3">
          Verify Document
        </h1>

        <p className="text-gray-500 mb-10">
          Check document authenticity from blockchain
        </p>

        <div className="bg-white border border-green-300 rounded-3xl p-10 shadow-xl shadow-green-400/10">

          <div className="flex gap-4 mb-8">

            <input
              type="text"
              placeholder="Input transaction hash..."
              className="flex-1 border border-green-300 rounded-xl px-5 py-4 outline-none focus:border-green-500"
            />

            <button className="bg-gradient-to-r from-green-400 to-green-500 px-8 rounded-xl font-semibold">
              Verify
            </button>

          </div>

          <div className="border border-green-200 rounded-2xl p-8 bg-green-50">

            <div className="flex justify-between mb-4">
              <span className="text-gray-500">Status</span>
              <span className="text-green-600 font-bold">
                VERIFIED
              </span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-500">Doctor</span>
              <span>Dr. Michael</span>
            </div>

            <div className="flex justify-between mb-4">
              <span className="text-gray-500">Patient</span>
              <span>John Doe</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Blockchain Hash</span>
              <span className="text-sm">
                0x82hshs7shs72
              </span>
            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  )
}

export default VerifyPage