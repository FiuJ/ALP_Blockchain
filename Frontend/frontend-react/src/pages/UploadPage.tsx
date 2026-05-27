import MainLayout from "../layouts/MainLayout"

function UploadPage() {
  return (
    <MainLayout>

      <div className="max-w-3xl mx-auto">

        <h1 className="text-5xl font-bold mb-3">
          Upload Medical Letter
        </h1>

        <p className="text-gray-500 mb-10">
          Upload PDF document for blockchain verification
        </p>

        <div className="bg-white border border-green-300 rounded-3xl p-10 shadow-xl shadow-green-400/10">

          <div className="flex flex-col gap-6">

            <input
              type="text"
              placeholder="Patient Name"
              className="border border-green-300 rounded-xl px-5 py-4 outline-none focus:border-green-500"
            />

            <input
              type="text"
              placeholder="Doctor Name"
              className="border border-green-300 rounded-xl px-5 py-4 outline-none focus:border-green-500"
            />

            <input
              type="file"
              className="border border-dashed border-green-400 rounded-2xl p-10"
            />

            <button className="bg-gradient-to-r from-green-400 to-green-500 text-black font-bold py-4 rounded-2xl shadow-lg shadow-green-400/30 hover:scale-[1.02] transition-all">
              Upload & Verify
            </button>

          </div>

        </div>

      </div>

    </MainLayout>
  )
}

export default UploadPage