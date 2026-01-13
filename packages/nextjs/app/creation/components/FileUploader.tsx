"use client";

import { useState, useEffect } from "react";

interface FileUploaderProps {
  onUploadComplete: (cid: string, url: string, fileName: string) => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cid, setCid] = useState<string>("");
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Очистка blob URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    // Очищаем предыдущий URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("Файл слишком большой. Максимум 100MB");
        setFile(null);
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Поддерживаются только изображения (JPEG, PNG, GIF, WebP, SVG)");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setError("");
    }
  };

  const uploadToIPFS = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    // 🔴 ДОБАВЛЕН ОТЛАДОЧНЫЙ КОД
    console.log("🟡 [FileUploader] Начинаю загрузку файла:", file.name);
    console.log("🟡 [FileUploader] Размер файла:", file.size, "байт");
    console.log("🟡 [FileUploader] Тип файла:", file.type);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 🔴 ДОБАВЛЕН ОТЛАДОЧНЫЙ КОД
      console.log("🟡 [FileUploader] FormData создан. Отправляю запрос на /api/ipfs/upload");

      // Используем ваш API endpoint
      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formData,
      });

      // 🔴 ДОБАВЛЕН ОТЛАДОЧНЫЙ КОД
      console.log("🟡 [FileUploader] Ответ получен. Статус:", response.status);
      console.log("🟡 [FileUploader] Заголовки ответа:", Object.fromEntries(response.headers.entries()));

      const data = await response.json();

      // 🔴 ДОБАВЛЕН ОТЛАДОЧНЫЙ КОД
      console.log("🟡 [FileUploader] Данные ответа:", data);

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setCid(data.cid);
      setUploadUrl(data.url);
      onUploadComplete(data.cid, data.url, file.name);

      // 🔴 ДОБАВЛЕН ОТЛАДОЧНЫЙ КОД
      console.log("✅ [FileUploader] Успешно! CID:", data.cid);

    } catch (error: any) {
      // 🔴 ДОБАВЛЕН ОТЛАДОЧНЫЙ КОД
      console.error("🔴 [FileUploader] Ошибка загрузки:", error);
      console.error("🔴 [FileUploader] Сообщение об ошибке:", error.message);
      console.error("🔴 [FileUploader] Стек ошибки:", error.stack);

      setError(error.message || "Ошибка загрузки файла");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">📤 Upload Image to IPFS</h2>

      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Choose an image for your NFT</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="file-input file-input-bordered file-input-primary w-full"
          disabled={loading}
        />
        <label className="label">
          <span className="label-text-alt">
            Supports: JPEG, PNG, GIF, WebP, SVG (max 100MB)
          </span>
        </label>
      </div>

      {previewUrl && (
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="avatar">
              <div className="w-24 h-24 rounded-lg">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            </div>
            <div>
              <p className="font-semibold">{file?.name}</p>
              <p className="text-sm text-gray-500">
                Size: {file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB
              </p>
              <p className="text-sm text-gray-500">
                Type: {file?.type}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="form-control">
        <button
          onClick={uploadToIPFS}
          className={`btn btn-primary ${loading ? "loading" : ""}`}
          disabled={!file || loading}
        >
          {loading ? "Uploading to IPFS..." : "🚀 Upload to IPFS"}
        </button>
      </div>

      {cid && (
        <div className="mt-6 p-4 bg-success/10 rounded-lg">
          {/* ... остальной код для отображения CID */}
        </div>
      )}
    </div>
  );
}