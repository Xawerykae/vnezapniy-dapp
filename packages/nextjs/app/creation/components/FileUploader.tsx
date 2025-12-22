import { useState } from "react";

interface FileUploaderProps {
  onUploadComplete: (cid: string, url: string, fileName: string) => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string>("");
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Проверка размера файла (макс 100MB для NFT.Storage)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("Файл слишком большой. Максимум 100MB");
        setFile(null);
        return;
      }

      // Проверка типа файла
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Поддерживаются только изображения (JPEG, PNG, GIF, WebP, SVG)");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError("");
    }
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

      setCid(data.cid);
      setUploadUrl(data.url);

      // Передаем данные родительскому компоненту
      onUploadComplete(data.cid, data.url, file.name);

      console.log("Upload successful:", data);

    } catch (error: any) {
      console.error("Upload error:", error);
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

      {file && (
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="avatar">
              <div className="w-24 h-24 rounded-lg">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-gray-500">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-500">
                Type: {file.type}
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
          <div className="flex items-center mb-2">
            <div className="badge badge-success mr-2">✓</div>
            <p className="font-bold">Successfully uploaded to IPFS!</p>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold">IPFS CID:</p>
              <code className="break-all bg-base-100 p-2 rounded text-sm block mt-1">
                {cid}
              </code>
            </div>

            <div>
              <p className="text-sm font-semibold">IPFS URL:</p>
              <a
                href={uploadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link break-all text-sm"
              >
                {uploadUrl}
              </a>
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => navigator.clipboard.writeText(cid)}
                className="btn btn-sm btn-outline"
              >
                📋 Copy CID
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(uploadUrl)}
                className="btn btn-sm btn-outline"
              >
                🔗 Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}