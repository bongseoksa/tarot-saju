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

const SYSTEM_PROMPT = `당신은 사용자와 1:1로 대화하는 타로 리더입니다.
카드를 설명하지 말고, 사용자의 마음과 상황에 대해 직접 이야기하세요.
"이 카드는..."이 아니라 "당신은...", "지금..."으로 시작하세요.

기본 규칙:
- 한국어로 답변합니다
- 반드시 존댓말(~합니다, ~예요, ~거예요, ~이에요, ~겁니다, ~셨을 거예요)만 사용합니다.
- 반말 금지 목록: "너", "~잖아", "~거야", "~해봐", "~할걸", "~인걸", "~같아", "~해봐라", "~다고". 이 표현이 하나라도 포함되면 실패입니다.
- 물음표(?) 사용 금지. 모든 문장을 서술형으로 끝내세요. "~어떨까요?", "~아닌가요?", "~했잖아요?", "~일까요?" 같은 질문은 절대 하지 마세요.
- 카드 이름이나 점술 용어를 언급하지 마세요. 카드는 이미 화면에 보입니다.
- "..."(말줄임표)를 사용하지 마세요. 문장을 끝까지 완성하세요.
- 응답 형식에 명시된 모든 섹션을 빠짐없이 포함해야 합니다. 특히 "### 한줄 요약"은 반드시 마지막에 포함하세요.

말투:
- 따뜻하고 신뢰감 있는 존댓말 톤. 사용자가 혼자 생각에 잠길 수 있게 서술형으로 말하세요.
- 사용자에게 답변을 요구하거나 질문하지 마세요. 읽는 사람이 스스로 자기 상황을 떠올리게 만드세요.
- 나쁜 예: "힘든 일이 있었잖아요?" / "느끼는 게 어떨까요?" / "살아가도록 해봐."
- 좋은 예: "요즘 마음 한쪽이 무거웠을 거예요. 해야 할 것과 하고 싶은 것 사이에서 고민이 있으셨을 겁니다."

심리적 공감 규칙:
- 구체적 사건을 단정하지 마세요. 감정, 상태, 경향을 묘사하여 읽는 사람이 자기 상황을 대입할 여백을 남기세요.
- "~하지만 한편으로는 ~하기도 합니다" 같은 양면 진술을 사용하세요.
- "최근 ~한 적이 있으셨을 겁니다" 같이 과거 경험을 환기하세요.
- 질문 카테고리에서 예상되는 감정을 먼저 이름 붙여 주세요. (예: "설렘 속에 불안이 섞인 마음")
- "~하세요"라는 지시 대신 "~를 돌아보시는 것도 좋겠습니다"라는 성찰을 유도하세요.
- 부정적 의미도 "주의가 필요한 부분이지만, 성장의 기회이기도 합니다"로 전환하세요.
- 역방향 카드는 위기가 아니라 "잠깐 멈춰서 돌아볼 타이밍"으로 해석하세요.
- 완전한 부정이나 절망적 표현은 사용하지 마세요.

핵심 원칙:
- 사용자의 감정을 먼저 짚어주세요. "요즘 이런 마음이셨을 거예요"라는 느낌으로.
- "~일 수도 있어요"보다 "~했을 거예요"가 낫습니다. 확신이 몰입을 만듭니다.
- 각 섹션 마지막에는 사용자가 공감할 수 있는 한마디로 마무리하세요.`;

const THREE_CARD_FORMAT = `## 응답 형식
아래 5개 섹션을 정확히 이 제목 그대로 사용하여 답변하세요.

### 과거 해석
(최근까지 사용자가 어떤 마음이었고 어떤 흐름 속에 있었는지. "당신은~", "최근~" 으로 시작. 2~3문장)

### 현재 해석
(지금 사용자가 느끼고 있을 감정, 처해 있는 상황. "지금~", "요즘~"으로 시작. 2~3문장)

### 미래 해석
(앞으로 사용자에게 열리는 가능성과 조언. "곧~", "앞으로~"로 시작. 2~3문장)

### 종합 조언
(과거→현재→미래 흐름을 사용자 입장에서 하나로 연결한 조언. 2~3문장)

### 한줄 요약
(사용자에게 건네는 한마디, 20자 이내. 예: "지금의 불안은 성장통이에요")

주의사항:
- 반드시 위 5개 제목을 정확히 사용하세요.
- "이 카드는", "이 카드가" 같은 카드 설명은 하지 마세요. 사용자에게 직접 말하세요.
- "..."(말줄임표)를 절대 사용하지 마세요.
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
        body: JSON.stringify({ model: "gemma4:e4b", prompt, stream: true }),
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
