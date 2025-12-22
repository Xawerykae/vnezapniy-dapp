import { useState } from "react";

interface NFTMinterProps {
  imageCid: string;
}

export default function NFTMinter({ imageCid }: NFTMinterProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const mintNFT = async () => {
    if (!name) {
      alert("Введите название NFT");
      return;
    }

    setLoading(true);

    try {
      // 1. Создаём метаданные
      const metadata = {
        name,
        image: `ipfs://${imageCid}`,
        description: "My NFT",
      };

      // 2. Загружаем метаданные в IPFS
      const metadataRes = await fetch("/api/ipfs/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      const { cid: metadataCid } = await metadataRes.json();

      // 3. Показываем результат
      alert(
        `NFT готов к минту!\nCID метаданных: ${metadataCid}\n\nСкопируйте этот CID для минта: ipfs://${metadataCid}`,
      );

      // Сброс формы
      setName("");
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-200 p-6 mt-8">
      <h3 className="text-xl font-bold mb-4">Шаг 2: Создать NFT</h3>

      <div className="mb-4">
        <label className="block mb-2">Название NFT:</label>
        <input
          type="text"
          placeholder="Мой крутой NFT"
          className="input input-bordered w-full"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mb-4 p-3 bg-base-300 rounded">
        <p className="text-sm font-semibold">Загруженное изображение:</p>
        <p className="text-xs break-all mt-1">{imageCid}</p>
        <a href={`https://${imageCid}.ipfs.w3s.link`} target="_blank" className="link text-sm">
          Посмотреть на IPFS ↗
        </a>
      </div>

      <button
        onClick={mintNFT}
        className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
        disabled={!name || loading}
      >
        {loading ? "Создаем..." : "Создать NFT метаданные"}
      </button>
    </div>
  );
}
