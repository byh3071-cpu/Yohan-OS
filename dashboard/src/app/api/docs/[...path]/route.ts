import { NextRequest, NextResponse } from "next/server"
import { getDoc } from "@/lib/memory"

export const dynamic = "force-dynamic"

function isSafePath(segments: string[]): boolean {
  return segments.every(
    (s) => s.length > 0 && s !== ".." && s !== "." && !s.includes("\\") && !s.includes("\0")
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params

  if (!isSafePath(path)) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 })
  }

  const relPath = path.join("/")
  const doc = await getDoc(relPath)
  if (!doc) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json(doc)
}
