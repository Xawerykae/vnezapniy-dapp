import { NextRequest, NextResponse } from "next/server";
import { NFTStorage } from "nft.storage";

// Получаем токен из переменных окружения
const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY || process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;

export async function POST(request: NextRequest) {
  try {
    // Проверяем наличие токена
    if (!NFT_STORAGE_KEY) {
      console.error("NFT_STORAGE_TOKEN не настроен");
      return NextResponse.json({ error: "IPFS service not configured" }, { status: 500 });
    }

    // Проверяем тип контента
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Unsupported content type. Use multipart/form-data" }, { status: 400 });
    }

    // Получаем данные формы
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Uploading file to NFT.Storage:", file.name, file.size);

    // Создаем клиент NFT.Storage
    const client = new NFTStorage({ token: NFT_STORAGE_KEY });

    // Загружаем файл
    const cid = await client.storeBlob(file);
    const url = `https://${cid}.ipfs.nftstorage.link`;

    console.log("✅ File uploaded successfully. CID:", cid);

    return NextResponse.json({
      success: true,
      cid,
      url,
      gatewayUrl: url,
    });
  } catch (error: any) {
    console.error("❌ Error in upload route:", error);

    return NextResponse.json(
      {
        error: "Upload failed",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// Опционально: настройки для увеличения лимита размера файла
export const config = {
  api: {
    bodyParser: false,
    // Увеличиваем лимит до 100MB
    responseLimit: "100mb",
  },
};
