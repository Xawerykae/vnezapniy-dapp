import { useState } from "react";

interface FileUploaderProps {
  onUploadComplete: (cid: string) => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string>("");

  const uploadToIPFS = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setCid(data.cid);
      onUploadComplete(data.cid);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="card bg-base-200 p-6">
      <input
        type="file"
        onChange={e => setFile(e.target.files?.[0] || null)}
        className="file-input file-input-bordered w-full"
      />
      <button onClick={uploadToIPFS} className="btn btn-primary mt-4" disabled={!file}>
        Upload to IPFS
      </button>
      {cid && (
        <div className="mt-4">
          <p className="font-semibold">IPFS CID:</p>
          <code className="bg-base-300 p-2 rounded break-all">{cid}</code>
        </div>
      )}
    </div>
  );
}
