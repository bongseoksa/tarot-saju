import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// App URL for redirect (client-side routing)
const APP_URL = Deno.env.get("APP_URL") ?? "https://jeomhana.vercel.app";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const shareId = url.searchParams.get("id");

  if (!shareId) {
    return new Response("Missing id parameter", { status: 400 });
  }

  // Query shared_readings from Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("shared_readings")
    .select("theme_title, summary")
    .eq("id", shareId)
    .gt("expires_at", new Date().toISOString())
    .single();

  const title = data?.theme_title ?? "타로 결과";
  const description = data?.summary ?? "점하나에서 AI 타로를 체험해보세요";

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>점하나 - ${escapeHtml(title)}</title>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="점하나 - ${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${APP_URL}/shared/${shareId}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="점하나 - ${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <script>window.location.href = "${APP_URL}/shared/${shareId}";</script>
</head>
<body>
  <p>리다이렉트 중...</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
