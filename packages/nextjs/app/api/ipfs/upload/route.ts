import { NextRequest, NextResponse } from "next/server";
import { NFTStorage } from "nft.storage";

const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;

export async function POST(request: NextRequest) {
  try {
    // 1. Проверяем ключ
    if (!NFT_STORAGE_KEY) {
      console.error("❌ NFT_STORAGE_KEY не настроен");
      return NextResponse.json({ error: "IPFS service not configured" }, { status: 500 });
    }

    // 2. Получаем файл
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("🚀 Загружаем файл в NFT.Storage:", file.name);

    // 3. ЗАГРУЖАЕМ В IPFS (РАБОЧИЙ КОД)
    const client = new NFTStorage({ token: NFT_STORAGE_KEY });
    const cid = await client.storeBlob(file);
    const url = `https://${cid}.ipfs.nftstorage.link`;

    console.log("✅ Успех! CID:", cid);

    // 4. Возвращаем настоящий CID
    return NextResponse.json({
      success: true,
      cid, // ← НАСТОЯЩИЙ CID
      url,
      gatewayUrl: url,
      fileName: file.name
    });

  } catch (error: any) {
    console.error("❌ Ошибка NFT.Storage:", error);

    // Подробная ошибка для отладки
    return NextResponse.json(
      {
        error: "Upload failed",
        message: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}