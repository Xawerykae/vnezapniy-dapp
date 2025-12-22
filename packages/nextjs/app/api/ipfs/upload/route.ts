"use server";

import { NFTStorage } from 'nft.storage';

const NFT_STORAGE_TOKEN = process.env.NFT_STORAGE_TOKEN || process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!NFT_STORAGE_TOKEN) {
      console.error("NFT_STORAGE_TOKEN не настроен");
      return Response.json(
        { error: "IPFS service not configured" },
        { status: 500 }
      );
    }

    const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });

    if (contentType.includes("multipart/form-data")) {
      // Загрузка файла (изображения)
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return Response.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      console.log("Uploading file to NFT.Storage:", file.name, file.size);

      // Загружаем файл в NFT.Storage
      const cid = await client.storeBlob(file);

      console.log("File uploaded successfully, CID:", cid);

      return Response.json({
        cid,
        url: `https://${cid}.ipfs.nftstorage.link`,
        gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
        name: file.name,
        size: file.size,
        type: file.type,
        timestamp: new Date().toISOString()
      });

    } else if (contentType.includes("application/json")) {
      // Загрузка метаданных NFT
      const metadata = await request.json();

      console.log("Uploading metadata to NFT.Storage:", metadata);

      // Создаем метаданные NFT
      const nftMetadata = {
        name: metadata.name || "My NFT",
        description: metadata.description || "Created with my dApp",
        image: metadata.image,
        attributes: metadata.attributes || [],
        createdBy: metadata.createdBy || "anonymous",
        createdAt: new Date().toISOString()
      };

      // Загружаем метаданные
      const metadataBlob = new Blob([JSON.stringify(nftMetadata)], {
        type: "application/json"
      });

      const cid = await client.storeBlob(metadataBlob);

      console.log("Metadata uploaded successfully, CID:", cid);

      return Response.json({
        cid,
        url: `https://${cid}.ipfs.nftstorage.link`,
        gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
        metadata: nftMetadata,
        timestamp: new Date().toISOString()
      });

    } else {
      return Response.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("NFT.Storage upload error:", error);

    return Response.json(
      {
        error: "Upload failed",
        details: error.message
      },
      { status: 500 }
    );
  }
}