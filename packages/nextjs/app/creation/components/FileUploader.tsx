"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface FileUploaderProps {
  onUploadComplete: (cid: string, url: string, fileName: string) => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Создаем и очищаем превью (как у друга)
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Проверки как у друга + ваши
    if (!selectedFile.type.startsWith("image/")) {
      setError("Выберите файл изображения");
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("Файл должен быть меньше 100MB");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const uploadToIPFS = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUploadComplete(data.cid, data.url, file.name);
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-semibold">Upload NFT Image</span>
        </label>

        {/* UI как у друга */}
        <label className="border-2 border-dashed border-gray-400 rounded-lg p-8 cursor-pointer hover:border-gray-600 transition text-center">
          {preview ? (
            <div className="relative w-full h-64">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 text-gray-400">📷</div>
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 100MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
        </label>

        {file && (
          <p className="label-text-alt mt-2 text-sm">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}

        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={uploadToIPFS}
          className={`btn btn-primary mt-4 ${loading ? "loading" : ""}`}
          disabled={!file || loading}
        >
          {loading ? "Uploading to IPFS..." : "🚀 Upload to IPFS"}
        </button>
      </div>
    </div>
  );
}