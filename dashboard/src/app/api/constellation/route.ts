import { NextResponse } from "next/server"
import { listDocs } from "@/lib/memory"
import { buildConstellation } from "@/lib/constellation"

export const dynamic = "force-dynamic"

export async function GET() {
  const docs = await listDocs()
  const data = buildConstellation(docs)
  return NextResponse.json(data)
}
