# Figma Make 프롬프트 세트

Figma Make에 **순서대로 붙여넣기**하여 서비스 전체 디자인을 생성하기 위한 프롬프트 모음이다. 각 프롬프트는 자기 완결형으로, 브랜드·캐릭터·팔레트·반응형 규칙을 모두 포함한다. 위에서 정의한 팔레트·캐릭터 참조 섹션을 기반으로 작성했다.

> **사용법:** 아래 번호 순서대로, 각 ```` ```text ```` 블록 안의 내용만 복사해서 Figma Make에 붙여넣는다. 한 번에 하나씩 생성하고, 이전 결과물의 컴포넌트 일관성을 확인한 뒤 다음으로 넘어간다.

```
┌─────────────────────────────────────────────────────┐
│  Figma Make 붙여넣기 순서                              │
│                                                     │
│  STEP 1  디자인 시스템 + 컴포넌트 라이브러리              │
│  STEP 2  허브형 홈 화면                                │
│  STEP 3  카드 뽑기 화면                                │
│  STEP 4  광고 친화 로딩 화면                            │
│  STEP 5  리포트형 결과 화면                              │
│  STEP 6  히스토리 화면                                  │
│  STEP 7  공유 결과 랜딩 화면                             │
│  ─ ─ ─ ─  MVP 여기까지  ─ ─ ─ ─                      │
│  STEP 8  카테고리 탐색 (선택, MVP는 홈 필터로 대체)        │
│  STEP 9  대화형 결과 변형 (부분 적용 전용)                │
│  STEP 10 사주 리포트 대시보드 (Phase 2)                  │
└─────────────────────────────────────────────────────┘
```

---

### STEP 1. 디자인 시스템 + 컴포넌트 라이브러리

> 가장 먼저 붙여넣는다. 브랜드 정체성, 팔레트, 캐릭터, 반응형 규칙, 공통 컴포넌트를 한 번에 정의한다. 이후 모든 화면 프롬프트는 이 시스템 위에서 생성된다.

```text
Create a complete design system and reusable component library for "점하나" (JeomHana), a Korean tarot and fortune web app.
Brand tagline: "오늘, 점 하나 찍어볼까?"
Tone: friendly, lightly mystical, approachable — like chatting with a friend, not a fortune teller.

Generate three frames:
- mobile frame: 390x844
- tablet frame: 768x1024
- desktop frame: 1440x1024

=== COLOR PALETTE ===

Primary colors:
- violet-500 (primary accent): #6B38D4
- violet-100 (light, hover/selected bg): #EDE5FA
- violet-700 (dark, text emphasis): #4A1FA8
- coral-500 (CTA buttons): #B90538
- coral-100 (CTA hover bg): #FDEAEF

Surfaces:
- bg-warm (page background): #FEF7FF
- surface-white (cards, panels): #FFFFFF
- surface-elevated (section bg): #F8F0FC

Text:
- text-900 (body): #1A1523
- text-600 (secondary): #6B6078
- text-400 (placeholder): #9E95A9

Border:
- border-200 (card/divider): #E8E0F0
- border-violet (active): #6B38D4

Semantic:
- success: #2D8A4E / warning: #D4920B / error: #C53030 / info: #2B6CB0

Ad area:
- ad-bg: #F0F0F0 (visually distinct from content)

Character & illustration palette:
- char-violet (mascot body): #A78BDB
- char-hat (witch hat): #4A3570
- char-blush (cheek blush): #E8A0B4
- cloud-white: #F5F0FF
- pastel-pink: #F8C8D8, pastel-yellow: #FFF3D6, pastel-mint: #D6F5ED, pastel-blue: #D6E8F8
- mountain-blue: #8CBAD6, sunset-peach: #F8D8C0
- card-frame (tarot border): #C4A050 (antique mustard, not gold)

=== MASCOT CHARACTER "JeomHana" ===

Style reference: Korean character emoticon art (like Molang, Kamellia — 카카오 이모티콘 스타일)

Shape and body:
- A soft mochi/teardrop blob — narrower at top, wider and flat at bottom, like a sitting rice cake or water droplet
- NOT a perfect circle or sphere. Sits stably with a flat bottom edge
- Body color: muted lavender-purple (#A78BDB), lighter gradient on lower belly
- Clean smooth outline in dark purple (#4A3570)

Face (all features in the upper 1/3 of body):
- Two round white eyes with large black circular pupils, placed close together
- Very tiny pink cat-like mouth (:3 shape), slightly pouting
- Soft pink circular blush marks (#E8A0B4) on both cheeks below eyes
- NO nose, NO eyebrows in default state

Hat:
- Classic pointed witch hat in dark purple (#4A3570), tilted slightly, tip curls/bends
- Simple brim, sits on top of the head

Limbs:
- Default: NO arms or legs visible
- When holding items: very short rounded stubs from body sides, NO fingers

Expression variants:
  - curious (default): wide pupils, :3 mouth
  - excited: sparkle highlights in eyes, open o mouth
  - focused: slightly narrowed eyes, flat — mouth
  - happy: ^^ closed eye smile, wide open grin
  - sorry: small curved eyebrows added, frown
  - waving: default eyes, open smile, one stub arm raised
  - sleepy: half-closed droopy eyes, small z near head

Art style:
- Korean character goods / emoticon illustration (카카오 이모티콘 느낌)
- Clean smooth outlines, flat pastel watercolor coloring with subtle shading
- NEVER scary, realistic, anime, 3D rendered, chibi, or pixel art

=== TYPOGRAPHY ===

- Font family: Pretendard (Korean system font, clean and readable)
- Hierarchy: clear heading/subheading/body/caption scale

=== RESPONSIVE RULES (KRDS standard grid) ===

- mobile-first layout
- 360px+: 4-column grid, 16px gutters, 16px margins
- 768px+: 8-column grid, 16px gutters, 24px margins
- 1024px+: 12-column grid, 24px gutters, 24px margins — side panels allowed
- 1280px+: 12-column grid, 24px gutters, centered max-width with auxiliary panels
- never stretch the mobile layout on desktop
- adaptive regions (left filter rail, center content, right sticky summary) only at 1024px+

=== REUSABLE COMPONENTS TO GENERATE ===

1. Header (mobile: logo + history icon / desktop: logo + nav + history/login)
2. Quick action card (title, subtitle, icon, CTA — used on home)
3. Category chip bar (horizontal scrollable chips with active state: color + underline)
4. Theme card (title, subtitle, hashtag chips, category tag — used on home and category)
5. Tarot card back (tappable, with selected/unselected/disabled states)
6. Card slot (empty state with label: 과거/현재/미래, filled state with card image)
7. Action button (primary coral, secondary outline, disabled gray — 44x44px min touch target)
8. Mascot bubble (avatar + speech text, used in loading/result/empty states)
9. Result section block (collapsible accordion: title + body text)
10. Ad slot (clearly labeled "광고", visually distinct from content cards, gray bg)
11. History list item (category tag, date, theme title, 3 card thumbnails, chevron)
12. Empty state (mascot illustration + friendly message + CTA button)
13. Share/save action cluster (share, save, copy link icons with labels)
14. Footer (개인정보처리방침 | 이용약관)

=== VISUAL DIRECTION ===

- Modern Korean editorial UI
- Light base with subtle mystical accents — NOT dark fantasy, NOT neon AI art
- Clean surfaces, restrained illustration accents
- Clear information hierarchy, real text blocks, visible labels
- High readability: text contrast 4.5:1+, controls contrast 3:1+
- Touch targets at least 44x44px
- Obvious active/focus/selected states — never rely on color alone
- No gold borders, no Chinese characters, no talisman imagery
- No bottom tab bar — linear flow with header back navigation
- Labels and visible text in Korean
```

---

### STEP 2. 허브형 홈 화면

```text
Design the home screen of "점하나" (JeomHana), a Korean tarot web app.
Use the design system established in STEP 1. Generate mobile (390x844), tablet (768x1024), and desktop (1440x1024) frames.

Mobile layout:
- top header: logo "점하나" (left) + mascot icon + history icon 히스토리 (right)
- hero area: small mascot illustration (curious expression) with tagline "오늘, 점 하나 찍어볼까?"
- two quick action cards side by side: "오늘의 타로", "이번 주 타로"
- horizontal scrollable category chips: 전체, 일상, 연애, 직장, 재물, 학업, 기타
- structured theme card list below (show 6-8 of 11 themes)
- each theme card: title, short subtitle, hashtag chips (e.g. #연애 #고민)
- one clearly separated ad slot (labeled "광고", gray bg) after the second content block
- footer: 개인정보처리방침 | 이용약관
- clean vertical scroll, no bottom tab bar

Tablet layout (768px):
- 2-column theme card grid
- quick actions remain side by side
- category chips stay horizontal

Desktop layout (1440px):
- centered max-width container (1280px)
- left filter rail for categories (240px)
- center: hero + quick actions + theme card grid (3-4 columns)
- right sticky panel (280px): recent readings (3 items) + one separated ad block
- no oversized hero art — mascot stays small and accent-like

Colors: bg #FEF7FF, cards #FFFFFF, primary #6B38D4, CTA #B90538
First viewport must show a clear primary action, not a wall of choices.
```

---

### STEP 3. 카드 뽑기 화면

```text
Design a three-card tarot selection screen for "점하나" (JeomHana).
Use the design system established in STEP 1. Generate mobile (390x844), tablet (768x1024), and desktop (1440x1024) frames.

Mobile layout:
- sub-page header: back arrow (left) + theme title e.g. "오늘의 타로" (center)
- instruction: "세 장의 카드를 신중하게 골라주세요"
- three card slots in a row labeled "과거", "현재", "미래" (empty state: dashed border, filled state: card thumbnail)
- below slots: 22 card backs in a 4-column grid (4x5 rows + last 2 centered)
- only the card grid scrolls vertically; slots stay fixed at top
- selected state in grid: opacity reduction + grayscale overlay
- selected cards animate into their corresponding slot
- bottom sticky action bar:
  - before 3 cards selected: disabled button "점 보기 (N/3)" with count
  - after 3 cards: "다시 선택" (secondary outline) + "결과 보기" (primary coral #B90538)
- selection by simple tap only, no swipe or drag required

Desktop layout (1440px):
- left panel (360px): theme title, instruction text, three card slots vertically, CTA buttons
- right panel: 22-card selection board with generous spacing (5-6 columns)
- whitespace to avoid card crowding

Mascot: small excited expression mascot near the instruction text
Card back design: soft violet (#6B38D4) with subtle pattern, rounded corners
Style: focused, immersive, minimal decoration, no flashy game UI
Each card must be a tappable button with accessible label (e.g. "카드 1번")
```

---

### STEP 4. 광고 친화 로딩 화면

```text
Design a loading/transition screen placed between card selection and result for "점하나" (JeomHana).
Use the design system established in STEP 1. Generate mobile (390x844) and desktop (1440x1024) frames.

Mobile layout:
- centered mascot character (sleepy/focused expression) with gentle bounce animation
- branded loading text below: "당신을 위한 점, 하나 준비 중"
- subtle progress indicator or gentle spinner
- one clearly separated ad area below (labeled "광고", #F0F0F0 bg, never looks like a tarot card)
- accessible status text for screen readers (aria-live)
- all user interaction blocked during loading (no touch, no back navigation)

Desktop layout:
- centered loading module (mascot + text + spinner) in a card-like container
- ad placement in a lower or side panel, clearly separated
- preserve focus on the transition experience

Style:
- calm, branded, uncluttered
- bg: #FEF7FF, mascot body: #A78BDB, hat: #4A3570
- no flashy effects — gentle and trustworthy
- the ad block must never be confused with tarot content
```

---

### STEP 5. 리포트형 결과 화면

```text
Design a tarot result/reading screen for "점하나" (JeomHana), focused on reading quality.
Use the design system established in STEP 1. Generate mobile (390x844), tablet (768x1024), and desktop (1440x1024) frames.

Mobile layout:
- sub-page header: back arrow + theme title + share icon (right)
- card summary strip: 3 selected cards in a row (past/present/future labels, card images, Korean card names, upright/reversed indicator badge)
- mascot bubble (focused expression): "점하나가 당신의 카드를 읽고 있어요..." (shown during AI streaming)
- one-line takeaway summary in a highlighted card (#EDE5FA bg)
- collapsible accordion sections: "과거 해석", "현재 해석", "미래 해석", "종합 조언"
- AI text streams with a typing cursor effect in the active section
- share/save actions near top and bottom
- one separated ad slot (labeled "광고") only after the last section, never between paragraphs
- bottom sticky bar: "공유하기" (secondary outline) + "점 하나 더 찍어볼까?" (primary coral CTA)

Desktop layout (1440px):
- left sticky table of contents (220px): section anchors with active indicator
- center reading column (680-760px): comfortable text width for long-form reading
- right sticky summary panel (260-320px): card thumbnails, share, save, "점 하나 더" retry
- no ads inside paragraphs
- never a stretched mobile layout

Mascot: happy expression appears when streaming completes
Style: editorial reading interface, Pretendard typography, calm and trustworthy, streaming area feels alive but not flashy
Colors: bg #FEF7FF, sections on #FFFFFF cards, accent #6B38D4
```

---

### STEP 6. 히스토리 화면

```text
Design a history (past readings) screen for "점하나" (JeomHana).
Use the design system established in STEP 1. Generate mobile (390x844), tablet (768x1024), and desktop (1440x1024) frames.

Mobile layout:
- sub-page header: back arrow + title "히스토리"
- summary statistics at top: readings this month count, key keyword chips
- list of past readings, each item showing:
  - category tag chip (e.g. 연애, 직장)
  - date (e.g. 2026.05.10)
  - theme title
  - 3 card thumbnails in a row
  - chevron icon for navigation
- one-column list with clear item boundaries
- empty state (when no readings exist):
  - mascot with waving expression, centered
  - text: "여기는 아직 비어있어요."
  - sub-text: "점 하나 찍으러 가볼까요?"
  - CTA button: "타로 보러 가기" (primary coral)

Desktop layout (1440px):
- left panel: history list with same item structure
- right panel: result preview pane (shows selected reading's summary)
- no search icon, no bottom tab bar

Colors: bg #FEF7FF, list items on #FFFFFF cards, active item border #6B38D4
Touch targets: 44x44px minimum, enough spacing between items
```

---

### STEP 7. 공유 결과 랜딩 화면

```text
Design a shared result landing page for "점하나" (JeomHana).
This is a social traffic entry point — users arrive via shared links (KakaoTalk, Instagram, etc.)
Use the design system established in STEP 1. Generate mobile (390x844) and desktop (1440x1024) frames.

Mobile layout:
- centered logo header: "점하나" logo + mascot (happy expression), no back button, no navigation
- mascot greeting bubble: "점하나가 전해준 타로 결과예요..."
- card summary: 3 cards in a row (past/present/future) with card images and Korean names
- one-line takeaway in a highlighted card (#EDE5FA bg)
- result sections in timeline style (vertical line + dots for each section: 과거, 현재, 미래, 종합)
- each section shows a condensed version of the interpretation
- advice card at the bottom with accent border
- clear CTA button: "나도 점 하나 찍어볼까?" → navigates to home (primary coral, full-width)
- service caption below: "AI 타로 서비스 점하나(JeomHana)"
- no confusing navigation — single-purpose landing page

Desktop layout (1440px):
- centered single-column layout (max-width 680px) for focused reading
- same structure as mobile but with comfortable desktop spacing
- CTA centered and prominent

Colors: bg #FEF7FF, cards #FFFFFF, timeline accent #6B38D4, CTA #B90538
Style: warm, inviting, makes the viewer want to try the service
```

---

> **MVP는 여기까지.** 아래 STEP 8-10은 선택 사항이거나 Phase 2 대상이다.

---

### STEP 8. 카테고리 탐색 화면 (선택 — MVP는 홈 필터로 대체)

> MVP에서는 별도 카테고리 화면 없이 홈의 카테고리 칩 필터(`/?category=love`)로 처리한다.
> 테마가 20개 이상으로 늘어날 경우 별도 화면을 검토할 수 있다.

```text
Design a category browsing screen for "점하나" (JeomHana), a Korean tarot web app.
Use the design system established in STEP 1. Generate mobile (390x844), tablet (768x1024), and desktop (1440x1024) frames.

Mobile:
- sub-page header: back arrow + page title (currently selected category name)
- horizontal filter chips with active state (color + underline, not color alone)
- theme cards as a structured list (title, subtitle, hashtag chips, CTA button)
- optional sort or filter row
- infinite scroll or "더 보기" load-more button at bottom

Desktop (1440px):
- left category/filter rail (240px)
- center: sort toolbar + 3-column theme card grid
- right panel (280px): "최근 본 결과" and "추천 테마"
- cards feel like readable content modules, not ads

Colors: bg #FEF7FF, cards #FFFFFF, active chip #6B38D4 with underline
Accessibility: readable card titles, enough spacing, no tiny tags or low-contrast gradients
```

---

### STEP 9. 대화형 결과 변형 (부분 적용 전용)

> 점하나에서는 전체 결과를 채팅형으로 만들지 않는다.
> 리포트형 결과의 **첫 2~3문단만** 순차 리빌하는 패턴으로 제한 차용한다.

```text
Design a chat-lite result reveal variation for "점하나" (JeomHana).
This is NOT a full chat screen — it is a partial reveal intro pattern used only for the first 2-3 paragraphs before transitioning to the full report-style result from STEP 5.
Use the design system established in STEP 1. Generate mobile (390x844) and desktop (1440x1024) frames.

Mobile:
- progress header showing reading progress
- mascot (focused expression) introduces the reading
- 2-3 conversation-style explanation blocks that reveal one idea at a time with typing animation
- card image or card summary appears between blocks
- one CTA per step: "다음 보기" (secondary outline)
- no inline ads between message steps
- after the 2-3 block reveal, smooth transition to the full report-style result screen

Desktop (1440px):
- left column: conversation reveal flow
- right column: card summary and final takeaway preview
- compact and readable, not a full messenger clone

Mascot: transitions from focused → happy as blocks reveal
Tone: warm, calm, lightly personal — not childish, not robotic
Colors: bg #FEF7FF, message blocks on #FFFFFF, accent #6B38D4
```

---

### STEP 10. 사주 리포트 대시보드 (Phase 2 — MVP 범위 아님)

> 사주 기능은 Phase 2(유료 수익화 레이어)에서 개발 예정. MVP에서는 구현하지 않는다.
> 디자인 시안만 미리 확보해두면 Phase 2 착수 시 도움이 된다.

```text
Design a saju (Korean four pillars) report dashboard screen for "점하나" (JeomHana).
Use the design system established in STEP 1. Generate mobile (390x844) and desktop (1440x1024) frames.

Mobile:
- sub-page header: back arrow + "사주 리포트" title
- mascot bubble (curious expression): greeting for saju reading
- summary score cards (ohaeng balance, overall fortune rating)
- date or period tabs (오늘, 이번 주, 이번 달)
- compact report sections with collapsible details
- sticky bottom CTA: save or share

Desktop (1440px):
- left navigation rail for report sections (220px)
- center main report content (680-760px)
- right panel (260-320px): calendar widget, highlights, action buttons
- suitable for long-form reading and comparison

Style: modern editorial dashboard — not finance-like, not fantasy-like
Calm icons, subtle traditional Korean visual references (ohaeng color accents from pastel palette)
Must feel like a natural extension of the tarot result screen
Colors: bg #FEF7FF, cards #FFFFFF, primary #6B38D4, CTA #B90538
```
