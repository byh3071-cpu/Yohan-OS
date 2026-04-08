/**
 * 레거시 telegram-inbox.md 스크린샷 블록마다 노션 리소스+서머리 푸시.
 * 실행: npx tsx scripts/telegram-ocr-batch.ts [선택: 인박스.md 상대경로]
 * 예: npm run sync:notion:ocr:telegram-batch -- memory/inbox/telegram-ocr-snapshot-20260408.md
 */
import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { loadNotionOcrEnv } from "../src/notion/notion-ocr-env.js";
import { pushOcrResourceAndSummary } from "../src/notion/push-ocr.js";
import { resolveRepoRoot } from "../src/paths.js";

config({ path: join(resolveRepoRoot(), ".env") });

type Block = { received_at: string; message_id: string; body: string };
type Enrich = { summary_title: string; summary_body: string; tags: string[] };

function dateYmdSeoul(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(iso));
}

function parseScreenshotBlocks(md: string): Block[] {
  const chunks = md.split(/^## type: screenshot\s*$/m);
  const out: Block[] = [];
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i] ?? "";
    const mRa = chunk.match(/received_at:\s*(\S+)/);
    const mId = chunk.match(/message_id:\s*(\d+)/);
    if (!mRa || !mId) {
      continue;
    }
    const lines = chunk.split(/\r?\n/);
    let bodyStart = -1;
    for (let li = 0; li < lines.length; li++) {
      if (lines[li].startsWith("from_chat_id:")) {
        bodyStart = li + 1;
        while (bodyStart < lines.length && lines[bodyStart].trim() === "") {
          bodyStart++;
        }
        break;
      }
    }
    let body = "";
    if (bodyStart >= 0) {
      const rest = lines.slice(bodyStart).join("\n");
      body = rest.split(/\n---\n/)[0]?.trim() ?? "";
    }
    out.push({ received_at: mRa[1], message_id: mId[1], body });
  }
  return out;
}

function mk(p: {
  category: string;
  gist: string;
  detail: string[];
  supplement: string;
  input: string;
  output: string;
  apply: string;
}): string {
  return [
    "## 카테고리",
    p.category,
    "",
    "## 핵심 요약",
    p.gist,
    "",
    "## 상세 내용",
    ...p.detail.map((d) => `- ${d}`),
    "",
    "## 보충 설명",
    p.supplement || "(없음)",
    "",
    "## 인풋",
    p.input,
    "",
    "## 아웃풋",
    p.output,
    "",
    "## 적용 사항",
    p.apply,
  ].join("\n");
}

const BODY_KARPATHY_PARA = mk({
  category: "생산성 / 제2의 뇌 / PARA",
  gist:
    "저장·캡처는 많은데 정리·재탐색·업데이트·백링크·개발 연계가 어렵다는 병목을 정리하고, 조사·브레인스토밍 끝에 PARA를 채택했다는 서사.",
  detail: [
    "병목: (1) 쌓인 지식 과다·정리 부담 (2) 같은 정보 재구글링 (3) 반복 질문 부담 (4) 더 나은 방식으로의 일괄 업데이트 귀찮음 (5) 백링크 미활용 아쉬움 (6) 개발 시 재참조 욕구.",
    "대응: 기존 사례 조사 후 약 3일 브레인스토밍 끝 PARA Method로 결론.",
  ],
  supplement: "OCR 오타(이름·영문 단편)는 맥락만 살려 정리.",
  input: "텔레그램 스크린 인용 카드(Karpathy·옵시디언).",
  output: "병목 리스트 + PARA 채택 결론.",
  apply: "`memory/ingest/insights/karpathy-obsidian-para-workflow.md`·볼트 헌법 노트.",
});

const BODY_INBOX_LEGACY = mk({
  category: "옵시디언 워크플로",
  gist: "모든 raw는 인박스에 모은 뒤, 레거시 노트는 헌법에 맞게 리팩토링. Karpathy 구조가 더 깔끔해 그 버전으로 업그레이드·정교화하겠다는 실천 선언(2/2).",
  detail: [
    "① raw 데이터 → Inbox",
    "② 기존 볼트 노트 → 헌법 기준 리팩토링 예정",
    "③ Karpathy 스타일 구조 우위 → 업데이트 결심",
  ],
  supplement: "OCR: Inbox·레거시·‘안드레카파시’ 등 표기.",
  input: "텔레그램 스크린 2/2.",
  output: "실행 순서 + 구조 갱신 태도.",
  apply: "볼트 `00_Inbox`·시스템 문서와 실제 폴더 규칙 대조.",
});

const BODY_VAULT_CONSTITUTION = mk({
  category: "옵시디언 / PARA / 시스템 설계",
  gist: "Vault를 ‘제2의 뇌’로 유지하는 시스템 가이드. 수집은 저마찰, 정리는 AI 레버리지. PARA 변형 대분류만 유지·하위 폴더 난립 금지. 수집과 정리 분리.",
  detail: [
    "대분류: Inbox, 대시보드, 사업(Areas), 프로젝트, 지식 리소스, 보관함, 일기, 개인, 시스템 등.",
    "수집: 이동 중 인박스 투철, 폴더 고민 없이 복귀.",
  ],
  supplement: "OCR 특수문자·숫자 깨짐은 의미만 반영.",
  input: "옵시디언 System Guide 스크린.",
  output: "폴더 체계 + 인박스 룰.",
  apply: "Yohan OS `memory/inbox`·규칙 문서와 비교.",
});

const BODY_FIVE_PILLARS = mk({
  category: "창업 / 수익모델",
  gist: "상속 없이 벌어온 사람에게 공통적으로 전문성·시장성·성실성·객단가·재구매 다섯 축이 있다는 카드. 안 풀리면 다섯을 점검하라는 CTA.",
  detail: [
    "전문성: 대체 가능성 낮은 역량.",
    "시장성: 지불 의사 있는 수요.",
    "성실성: 반복 이행.",
    "객단가: 거래당 가치.",
    "재구매·재계약: LTV 축.",
  ],
  supplement: "‘흙수저’ 등은 출처 카드 인용어.",
  input: "숏 카드 OCR.",
  output: "5요소 체크리스트.",
  apply: "1인 기업 오퍼·가격·리텐션 5줄 스코어.",
});

const BODY_LOW_ENERGY_TOP3 = mk({
  category: "재무 / 습관 설계",
  gist: "여러 목표를 한꺼번에 밀면 금방 지친다. ‘적은 노력으로 효과 큰 3개’ 조건으로 우선순위를 정하면 지속 가능한 행동이 나온다. 자산관리는 장기전이라 초기 에너지가 적게 드는 전략이 중요.",
  detail: ["다중 목표 동시 도전 → 피로·포기.", "Top 3 제약으로 부담 완화.", "저부담 전략 선호."],
  supplement: "OCR 오타 다수 → 의미 위주.",
  input: "숏폼 카드 캡처.",
  output: "실천: 소수 우선순위 + 저마찰.",
  apply: "월간 돈·시간 루틴 3개 고정.",
});

const BODY_INCOME_STRUCTURE_1 = mk({
  category: "부/레버리지",
  gist: "시스템·파이프라인·자본 소득을 함께 이해해야 한다. 연장 노동만으로 부족, ‘돈이 들어오는 구조’ 학습이 중요. 금액보다 반복 가능한 자산·시스템. SAVE YOURSELF TIME, ENERGY AND MONEY 프레임.",
  detail: ["레버리지+시스템 시대.", "시간·에너지·돈 새는 구조 줄이기."],
  supplement: "OCR 기호·끊김 보정.",
  input: "텔레그램 msg 35.",
  output: "소득 3종·구조 우선.",
  apply: "`memory/ingest/insights/system-income-leverage-structure.md`.",
});

const BODY_INCOME_STRUCTURE_2 = mk({
  category: "부/자유",
  gist: "멈추면 소득이 끊기는 구조만으로 삶의 자유에 한계. 노동량보다 구조 학습·설계 우선. 큰 자본보다 ‘흐름’ 이해가 격차를 만든다.",
  detail: ["노동 단절=소득 단절.", "개념 선행 vs 노동만 반복."],
  supplement: "",
  input: "텔레그램 msg 36.",
  output: "구조 설계 우선.",
  apply: "`system-income-leverage-structure.md`·파이프라인 지도.",
});

const ENRICH: Record<string, Enrich> = {
  "18": { summary_title: "[캡처] Karpathy 옵시디언·지식 병목과 PARA 수렴", summary_body: BODY_KARPATHY_PARA, tags: ["생산성", "개발"] },
  "20": { summary_title: "[캡처] 인박스·레거시 리팩토링·Karpathy 구조 갱신", summary_body: BODY_INBOX_LEGACY, tags: ["생산성", "IT"] },
  "19": { summary_title: "[캡처] 옵시디언 볼트 헌법 — 저마찰 수집·PARA 10분류", summary_body: BODY_VAULT_CONSTITUTION, tags: ["생산성", "IT"] },
  "29": { summary_title: "[캡처] 자산관리 — ‘효과 큰 3개’로 장기 유지", summary_body: BODY_LOW_ENERGY_TOP3, tags: ["재무", "생산성", "투자"] },
  "32": { summary_title: "[캡처] Karpathy·PARA (재캡처)", summary_body: BODY_KARPATHY_PARA, tags: ["생산성", "개발"] },
  "31": { summary_title: "[캡처] 스스로 벌어온 사람의 수익 5요소", summary_body: BODY_FIVE_PILLARS, tags: ["창업레이더", "마케팅"] },
  "34": { summary_title: "[캡처] 인박스·레거시·Karpathy (재캡처)", summary_body: BODY_INBOX_LEGACY, tags: ["생산성", "IT"] },
  "33": { summary_title: "[캡처] 볼트 헌법·인박스 룰 (재캡처)", summary_body: BODY_VAULT_CONSTITUTION, tags: ["생산성", "IT"] },
  "35": { summary_title: "[캡처] 시스템·파이프라인·자본 소득·구조 우선", summary_body: BODY_INCOME_STRUCTURE_1, tags: ["투자", "재무", "생산성"] },
  "36": { summary_title: "[캡처] 노동의존 소득 한계·구조 설계", summary_body: BODY_INCOME_STRUCTURE_2, tags: ["투자", "재무"] },
};

async function main(): Promise<void> {
  const root = resolveRepoRoot();
  const pathArg = process.argv[2]?.trim();
  const inboxPath = pathArg
    ? resolve(root, pathArg.replace(/^\//, ""))
    : join(root, "memory", "inbox", "telegram-inbox.md");
  const md = await readFile(inboxPath, "utf8");
  const blocks = parseScreenshotBlocks(md);
  console.error(`인박스: ${inboxPath.replace(/\\/g, "/")} → 스크린샷 블록 ${blocks.length}개`);
  if (blocks.length === 0) {
    console.error("스크린샷 블록이 없습니다.");
    return;
  }
  const env = loadNotionOcrEnv();

  for (const b of blocks) {
    const e = ENRICH[b.message_id];
    if (!e) {
      throw new Error(`ENRICH 없음: message_id=${b.message_id}`);
    }
    const date_ymd = dateYmdSeoul(b.received_at);
    const resource_title = `[${date_ymd}] OCR 원본 텔레그램 msg ${b.message_id}`;
    const r = await pushOcrResourceAndSummary(env, {
      date_ymd,
      resource_title,
      ocr_raw_body: b.body,
      summary_title: e.summary_title,
      summary_body: e.summary_body,
      tags: e.tags,
      source_select: "텔레그램 스크린샷",
    });
    console.log(JSON.stringify({ message_id: b.message_id, ...r }));
  }
  console.error(`완료: ${blocks.length}건 리소스+서머리 푸시.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
