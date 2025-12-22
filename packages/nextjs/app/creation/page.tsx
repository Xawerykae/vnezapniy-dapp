"use client";

import { useState } from "react";
import FileUploader from "./components/FileUploader";
import NFTMinter from "./components/NFTMinter";

export default function CreationPage() {
  const [cid, setCid] = useState<string>(""); // CID загруженного файла

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">🎨 Create NFT</h1>

      {/* Шаг 1: Загрузить файл → получить CID */}
      <FileUploader onUploadComplete={setCid} />

      {/* Шаг 2: Если есть CID → показать форму минтинга */}
      {cid && <NFTMinter imageCid={cid} />}
    </div>
  );
}
