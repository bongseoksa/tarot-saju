/**
 * Local proxy server that mimics the interpret Edge Function.
 * Calls local Ollama and streams SSE responses.
 * Usage: node scripts/local-proxy.mjs
 */
import http from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load shared modules (reuse packages/shared)
const { buildPrompt } = await import(join(root, "packages/shared/src/prompts/build-prompt.ts")).catch(() => null) ?? {};

// Since we can't import TS directly, inline the essentials
const cardsJson = JSON.parse(readFileSync(join(root, "supabase/functions/_shared/tarot-cards.json"), "utf-8"));

const THEMES = [
  { id: "daily-today", category: "daily", title: "오늘의 타로", description: "오늘 하루는 어떨까? 카드 한 장에 담긴 오늘의 메시지.", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "daily-week", category: "daily", title: "이번 주 타로", description: "이번 주 흐름을 미리 엿보세요.", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "love-feeling", category: "love", title: "나의 연애운", description: "그 사람도 나를 생각하고 있을까? 상대방의 마음을 들여다보세요.", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "love-heart", category: "love", title: "그 사람의 마음", description: "궁금한 그 사람의 속마음을 타로에게 물어보세요.", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "love-new", category: "love", title: "새로운 인연", description: "새로운 만남이 다가오고 있을까요?", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "career-outlook", category: "career", title: "직장에서의 전망", description: "지금 직장에서의 흐름과 앞으로의 방향을 살펴보세요.", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "career-change", category: "career", title: "이직 타이밍", description: "지금이 타이밍일까 고민된다면 타로에게 조언을 구해보세요.", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "wealth-fortune", category: "wealth", title: "나의 재물운", description: "풍요로운 한 달을 위해 조심해야 할 것과 얻게 될 기회.", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "study-exam", category: "study", title: "시험/학업 결과", description: "시험 결과가 걱정된다면 카드의 메시지를 들어보세요.", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "general-message", category: "general", title: "지금 필요한 메시지", description: "지금 이 순간, 당신에게 필요한 한마디.", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
  { id: "general-choice", category: "general", title: "이 선택이 맞을까", description: "갈림길에 서 있다면 타로의 조언을 들어보세요.", tags: [], spreadType: "three-card", positions: ["과거", "현재", "미래"] },
];

const THREE_CARD_SPREAD = {
  id: "three-card", name: "Three Card", nameKo: "쓰리카드 스프레드", cardCount: 3,
  positions: [
    { index: 0, label: "과거", description: "과거의 흐름을 나타냅니다" },
    { index: 1, label: "현재", description: "현재 상황을 나타냅니다" },
    { index: 2, label: "미래", description: "미래의 가능성을 나타냅니다" },
  ],
};

const SYSTEM_PROMPT = `당신은 경험 많은 타로 리더입니다.
주어진 카드 정보와 질문을 바탕으로 따뜻하고 공감적인 해석을 제공합니다.
당신의 해석을 읽은 사람이 "내 얘기 같다"고 느끼는 것이 가장 중요합니다.

기본 규칙:
- 한국어로 답변합니다
- 존댓말(~합니다)을 사용합니다
- 카드의 의미를 질문 맥락에 맞게 연결합니다
- 점술 용어를 남용하지 않고 일상적 언어로 설명합니다
- 응답 형식에 명시된 모든 섹션을 빠짐없이 포함해야 합니다. 특히 "### 한줄 요약"은 반드시 마지막에 포함하세요.

심리적 공감 규칙:
- 구체적 사건을 단정하지 마세요. 감정, 상태, 경향을 묘사하여 읽는 사람이 자기 상황을 대입할 여백을 남기세요.
- "~하지만 한편으로는 ~하기도 합니다" 같은 양면 진술을 사용하세요.
- "최근 ~한 적이 있으셨을 겁니다" 같이 과거 경험을 환기하세요.
- 질문 카테고리에서 예상되는 감정을 먼저 이름 붙여 주세요.
- "~하세요"라는 지시 대신 "~를 돌아보세요"라는 성찰을 유도하세요.
- 부정적 의미도 "주의가 필요한 부분 → 성장의 기회"로 전환하세요.
- 완전한 부정이나 절망적 표현은 사용하지 마세요.`;

const THREE_CARD_FORMAT = `## 응답 형식
아래 5개 섹션을 정확히 이 제목 그대로 사용하여 답변하세요.

### 과거 해석
(과거 카드가 지금까지의 흐름에서 어떤 의미인지 2~3문장)

### 현재 해석
(현재 카드가 지금 상황에서 어떤 의미인지 2~3문장)

### 미래 해석
(미래 카드가 앞으로의 방향에서 어떤 의미인지 2~3문장)

### 종합 조언
(세 카드의 흐름을 연결한 종합 조언 2~3문장)

### 한줄 요약
(공유용 한 줄 요약, 20자 이내)

주의사항:
- 반드시 위 5개 제목을 정확히 사용하세요.
- 전체 응답 길이는 300~1200자로 유지하세요.`;

const CATEGORY_LABELS = { daily: "일상", love: "연애", career: "직장", wealth: "재물", study: "학업", general: "일반" };

function localBuildPrompt(request) {
  const theme = THEMES.find((t) => t.id === request.themeId);
  if (!theme) throw new Error(`Unknown themeId: ${request.themeId}`);
  const cardBlocks = request.cards.map((drawn) => {
    const card = cardsJson.find((c) => c.id === drawn.cardId);
    if (!card) return "";
    const position = THREE_CARD_SPREAD.positions[drawn.positionIndex];
    const meaning = drawn.isReversed ? card.meaningReversed : card.meaningUpright;
    const direction = drawn.isReversed ? "역방향" : "정방향";
    const contextHint = card.contextHints?.[theme.category] ?? "";
    return `### ${position.label}\n- 카드: ${card.nameKo} (${card.name})\n- 방향: ${direction}\n- 키워드: ${meaning}\n- 설명: ${card.description}${contextHint ? `\n- 맥락 힌트: ${contextHint}` : ""}`;
  }).filter(Boolean).join("\n\n");
  const category = CATEGORY_LABELS[theme.category] ?? theme.category;
  return `${SYSTEM_PROMPT}\n\n## 뽑힌 카드\n\n${cardBlocks}\n\n## 질문\n- 카테고리: ${category}\n- 질문: ${theme.description}\n\n${THREE_CARD_FORMAT}`;
}

function parseResponse(raw) {
  const summaryMatch = raw.match(/###\s*한줄 요약\s*\n(.+)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  const interpretation = raw.replace(/###\s*한줄 요약\s*\n.+/, "").trim();
  return { interpretation, summary };
}

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const PORT = 54321;

const server = http.createServer(async (req, res) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };

  if (req.method === "OPTIONS") { res.writeHead(204, cors); res.end(); return; }

  if (req.url === "/functions/v1/interpret" && req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    const { themeId, cards } = JSON.parse(body);

    if (!themeId || !Array.isArray(cards) || cards.length === 0) {
      res.writeHead(400, { ...cors, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request" }));
      return;
    }

    const prompt = localBuildPrompt({ themeId, cards });
    console.log(`[proxy] themeId=${themeId}, cards=${cards.map(c=>c.cardId).join(",")}`);

    let ollamaRes;
    try {
      ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gemma2:2b", prompt, stream: true }),
      });
    } catch (e) {
      res.writeHead(502, { ...cors, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "AI service unavailable" }));
      return;
    }

    res.writeHead(200, { ...cors, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" });

    let fullText = "";
    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n").filter(Boolean)) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullText += json.response;
              res.write(`data: ${JSON.stringify({ type: "chunk", data: json.response })}\n\n`);
            }
          } catch {}
        }
      }
    } catch (e) {
      res.write(`data: ${JSON.stringify({ type: "error", data: e.message })}\n\n`);
      res.end();
      return;
    }

    const parsed = parseResponse(fullText);
    res.write(`data: ${JSON.stringify({ type: "done", data: JSON.stringify(parsed) })}\n\n`);
    res.end();
    console.log(`[proxy] done, ${fullText.length} chars`);
    return;
  }

  res.writeHead(404, cors);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`[local-proxy] listening on http://localhost:${PORT}`);
  console.log(`[local-proxy] Ollama: ${OLLAMA_URL}`);
  console.log(`[local-proxy] FE should use VITE_SUPABASE_URL=http://localhost:${PORT}`);
});
