import type { ConstellationEdgePayload, ConstellationNodePayload } from "./constellation"

const HUB_MIN_DEGREE = 2
const PULL = 0.26

/** 허브는 고정, 인접 허브가 있는 일반 노드만 허브 군집 방향으로 당김(최대 PULL 비율). */
export function computePulledPositions(
  nodes: ConstellationNodePayload[],
  edges: ConstellationEdgePayload[]
): Map<string, { x: number; y: number; z: number }> {
  const pos = new Map(nodes.map((n) => [n.relPath, { x: n.x, y: n.y, z: n.z }]))
  const hubs = new Set(
    nodes.filter((n) => n.degree >= HUB_MIN_DEGREE).map((n) => n.relPath)
  )
  if (hubs.size === 0) {
    return new Map(nodes.map((n) => [n.relPath, { x: n.x, y: n.y, z: n.z }]))
  }

  const neighbors = new Map<string, string[]>()
  for (const n of nodes) neighbors.set(n.relPath, [])
  for (const e of edges) {
    neighbors.get(e.from)!.push(e.to)
    neighbors.get(e.to)!.push(e.from)
  }

  const out = new Map<string, { x: number; y: number; z: number }>()

  for (const n of nodes) {
    if (hubs.has(n.relPath)) {
      out.set(n.relPath, { x: n.x, y: n.y, z: n.z })
      continue
    }
    const nbrs = neighbors.get(n.relPath) ?? []
    const hubNbrs = nbrs.filter((id) => hubs.has(id))
    if (hubNbrs.length === 0) {
      out.set(n.relPath, { x: n.x, y: n.y, z: n.z })
      continue
    }
    let sx = 0
    let sy = 0
    let sz = 0
    for (const id of hubNbrs) {
      const p = pos.get(id)!
      sx += p.x
      sy += p.y
      sz += p.z
    }
    const k = hubNbrs.length
    const cx = sx / k
    const cy = sy / k
    const cz = sz / k
    out.set(n.relPath, {
      x: n.x + (cx - n.x) * PULL,
      y: n.y + (cy - n.y) * PULL,
      z: n.z + (cz - n.z) * PULL,
    })
  }

  return out
}
