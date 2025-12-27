// Проверяем, доходит ли файл до endpoint'а
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const keys = Array.from(formData.keys()); // Какие ключи пришли

    return NextResponse.json({
      success: true,
      message: "✅ Файл получен сервером!",
      fileName: file?.name || "Файл не найден",
      fileSize: file?.size || 0,
      receivedKeys: keys,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "❌ Ошибка при получении файла",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
