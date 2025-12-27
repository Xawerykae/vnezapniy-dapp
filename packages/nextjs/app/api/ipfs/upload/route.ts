import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🟢 [1] Эндпоинт /api/ipfs/upload ВЫЗВАН");

  try {
    // 1. Читаем запрос
    const formData = await request.formData();
    const file = formData.get("file") as File;

    console.log("📁 [2] Получен файл:", file ? file.name : "НЕТ");

    // 2. Проверяем переменные окружения
    const myKey = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;
    console.log("🔑 [3] Ключ из Vercel:", myKey ? "ЕСТЬ" : "НЕТ");
    if (myKey) {
      console.log("   Длина:", myKey.length);
      console.log("   Начало:", myKey.substring(0, 10) + "...");
    }

    // 3. Формируем простой ответ БЕЗ NFT.Storage
    const responseData = {
      success: true,
      debug: true,
      message: "✅ Диагностика: файл получен сервером.",
      fileInfo: file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        : null,
      envKeyExists: !!myKey,
      timestamp: new Date().toISOString(),
    };

    console.log("📤 [4] Отправляю ответ:", responseData);

    // 4. Отвечаем
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("💥 [5] Ошибка при разборе запроса:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Серверная ошибка",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
