import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Получаем файл из запроса
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Uploading file:", file.name, file.size);

    // 📌 ВРЕМЕННО: возвращаем фейковый CID для теста
    // В реальности здесь должна быть интеграция с IPFS (Pinata, Web3.Storage, NFT.Storage)
    const fakeCid = `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylq${Date.now().toString().slice(-10)}`;

    return NextResponse.json({
      cid: fakeCid,
      url: `https://ipfs.io/ipfs/${fakeCid}`,
      message: "File uploaded successfully (test mode)",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
