// Просто проверяем, отвечает ли сервер
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "✅ Сервер работает!", timestamp: new Date().toISOString() });
}
export async function POST() {
  return NextResponse.json({ message: "✅ POST-запрос работает!", timestamp: new Date().toISOString() });
}
