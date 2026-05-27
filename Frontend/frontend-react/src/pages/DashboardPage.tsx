import MainLayout from "../layouts/MainLayout"
// import { documents } from "../data/dummyDocuments"

function DashboardPage() {
  return (
    <MainLayout>

      <div className="mb-10">

        <h1 className="text-5xl font-bold mb-3">
          Dashboard
        </h1>

        <p className="text-gray-500">
          Blockchain medical verification overview
        </p>

      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="bg-white border border-green-300 rounded-3xl p-6 shadow-xl shadow-green-400/10">
          <p className="text-gray-500 mb-2">
            Total Documents
          </p>

          <h2 className="text-5xl font-bold">
            5
          </h2>
        </div>

        <div className="bg-white border border-green-300 rounded-3xl p-6 shadow-xl shadow-green-400/10">
          <p className="text-gray-500 mb-2">
            Verified
          </p>

          <h2 className="text-5xl font-bold text-green-500">
            4
          </h2>
        </div>

        <div className="bg-white border border-red-300 rounded-3xl p-6 shadow-xl shadow-red-400/10">
          <p className="text-gray-500 mb-2">
            Revoked
          </p>

          <h2 className="text-5xl font-bold text-red-500">
            1
          </h2>
        </div>

      </div>

      <div className="bg-white border border-green-200 rounded-3xl overflow-hidden shadow-xl shadow-green-400/5">

        <div className="p-6 border-b border-green-100">
          <h2 className="text-2xl font-bold">
            Recent Documents
          </h2>
        </div>

        <table className="w-full">

          <thead className="bg-green-50">
            <tr>
              <th className="text-left p-5">Patient</th>
              <th className="text-left p-5">Doctor</th>
              <th className="text-left p-5">Status</th>
              <th className="text-left p-5">Date</th>
            </tr>
          </thead>

          {/* <tbody>

            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-t border-green-100 hover:bg-green-50 transition-all"
              >
                <td className="p-5">{doc.patient}</td>
                <td className="p-5">{doc.doctor}</td>
                <td className="p-5">
                  <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm">
                    {doc.status}
                  </span>
                </td>
                <td className="p-5">{doc.createdAt}</td>
              </tr>
            ))}

          </tbody> */}

        </table>

      </div>

    </MainLayout>
  )
}

export default DashboardPage