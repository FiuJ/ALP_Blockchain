import { useState, useEffect } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isRabby, setIsRabby] = useState<boolean>(false);

  // Cek apakah wallet sudah terkoneksi sebelumnya saat halaman dimuat
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      // Rabby menyuntikkan properti isRabby = true
      if (window.ethereum.isRabby) setIsRabby(true);

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Gagal mengecek koneksi wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Harap install Rabby Wallet atau MetaMask!");
      return;
    }

    try {
      // Meminta user untuk memilih akun di Rabby
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
      
      if (window.ethereum.isRabby) setIsRabby(true);
      
    } catch (error: any) {
      if (error.code === 4001) {
        console.log("User menolak koneksi");
      } else {
        console.error(error);
      }
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    // Catatan: Putus koneksi sepenuhnya hanya bisa dilakukan dari UI ekstensi Rabby,
    // tapi kita bisa menghapus state-nya dari frontend.
  };

  return { address, isRabby, connectWallet, disconnectWallet };
};