import { createWorker, type Worker } from "tesseract.js";

let worker: Worker | null = null;

/** kor+eng — 스크린샷 한·영 혼합 대비. 첫 실행 시 학습 데이터 다운로드. */
export async function recognizeImageBuffer(buffer: Buffer): Promise<string> {
  if (!worker) {
    worker = await createWorker("kor+eng");
  }
  const {
    data: { text },
  } = await worker.recognize(buffer);
  return (text ?? "").trim();
}

export async function terminateOcrWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
