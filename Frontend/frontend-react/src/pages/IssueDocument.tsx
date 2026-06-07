import { useState } from 'react';
import axios from 'axios';
import { FileText, Send } from 'lucide-react';

export default function IssueDocument() {
  const [patientAddress, setPatientAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle'); // idle, drafting, minting, finalizing

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. DRAFT (Minta Hash dari Backend)
      setStatus('drafting');
      const draftRes = await axios.post('http://localhost:3000/api/documents/draft', { patientAddress, notes });
      const documentHash = draftRes.data.hash;

      // 2. MINT KE BLOCKCHAIN
      setStatus('minting');
      // PSEUDOCODE WAGMI:
      // const tx = await writeContractAsync({ functionName: 'issueDocument', args: [patientAddress, documentHash] });
      const fakeTokenId = "1"; // Nanti ambil dari tx.logs

      // 3. FINALIZE (Simpan permanen ke DB)
      setStatus('finalizing');
      await axios.post('http://localhost:3000/api/documents/finalize', {
        hash: documentHash,
        tokenId: fakeTokenId
      });

      setStatus('success');
      alert("Surat berhasil diterbitkan ke blockchain!");
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-8">
          <FileText className="text-blue-600" size={32} /> Terbitkan Surat Medis
        </h2>
        
        <form onSubmit={handleIssue} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Wallet Pasien (0x...)</label>
            <input type="text" required className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-mono text-sm"
              onChange={(e) => setPatientAddress(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis & Keterangan Istirahat</label>
            <textarea required rows={5} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button type="submit" disabled={status !== 'idle' && status !== 'error'} 
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-full shadow-lg transition flex justify-center items-center gap-2">
            <Send size={20} /> 
            {status === 'idle' ? 'Tandatangani & Terbitkan' : `Memproses (${status})...`}
          </button>
        </form>
      </div>
    </div>
  );
}