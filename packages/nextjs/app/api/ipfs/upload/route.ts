import { NextRequest, NextResponse } from "next/server";
import { NFTStorage } from "nft.storage";

// ОБРАТИТЕ ВНИМАНИЕ: меняем порядок проверки!
const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || process.env.NFT_STORAGE_KEY;

export async function POST(request: NextRequest) {
  console.log("🟢 API route called at:", new Date().toISOString());

  try {
    // Добавляем подробное логирование
    console.log("🔑 Checking environment variables...");
    console.log("NEXT_PUBLIC_NFT_STORAGE_KEY exists:", !!process.env.NEXT_PUBLIC_NFT_STORAGE_KEY);
    console.log("NFT_STORAGE_KEY exists:", !!process.env.NFT_STORAGE_KEY);
    console.log("Final NFT_STORAGE_KEY value:", NFT_STORAGE_KEY ? "SET" : "NOT SET");

    // Проверяем наличие токена
    if (!NFT_STORAGE_KEY) {
      console.error("❌ NFT_STORAGE_KEY не настроен");
      console.error(
        "Available env variables:",
        Object.keys(process.env).filter(k => k.includes("NFT")),
      );
      return NextResponse.json(
        {
          error: "IPFS service not configured",
          details: "Check environment variables in Vercel",
        },
        { status: 500 },
      );
    }

    // Получаем данные формы (убираем проверку content-type для надежности)
    console.log("📥 Parsing form data...");
    const formData = await request.formData();
    const file = formData.get("file") as File;

    console.log(
      "📁 File received:",
      file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        : "NO FILE",
    );

    if (!file) {
      return NextResponse.json(
        {
          error: "No file provided",
          receivedFormData: Array.from(formData.keys()),
        },
        { status: 400 },
      );
    }

    console.log("🚀 Uploading file to NFT.Storage...");

    // Создаем клиент NFT.Storage с более детальным логированием
    try {
      const client = new NFTStorage({ token: NFT_STORAGE_KEY });
      console.log("✅ NFT.Storage client created");

      // Загружаем файл
      const cid = await client.storeBlob(file);
      const url = `https://${cid}.ipfs.nftstorage.link`;

      console.log("🎉 File uploaded successfully!");
      console.log("📦 CID:", cid);
      console.log("🔗 URL:", url);

      return NextResponse.json({
        success: true,
        cid,
        url,
        gatewayUrl: url,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (nftError: any) {
      console.error("❌ NFT.Storage specific error:", nftError);
      throw nftError;
    }
  } catch (error: any) {
    console.error("💥 General error in upload route:", error);

    // Возвращаем больше деталей для отладки
    return NextResponse.json(
      {
        success: false,
        error: "Upload failed",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
