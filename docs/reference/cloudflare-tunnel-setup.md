# Cloudflare Tunnel 설정 가이드

Ollama(로컬 PC)를 외부에서 접근 가능하도록 Cloudflare Tunnel로 노출하는 설정 가이드.

> 관련 스펙: `docs/specs/06-infra-spec.md` 섹션 2 (AI 서빙 - Cloudflare Tunnel)

---

## 1. 사전 조건

- macOS (Homebrew 설치 완료)
- Ollama 설치 및 실행 확인 (`ollama serve`)
- Cloudflare 계정 + 터널 생성 완료

---

## 2. cloudflared 설치

```bash
brew install cloudflared
```

---

## 3. Ollama 실행 (필수 환경 변수)

터널을 통한 외부 접근을 허용하려면 반드시 두 환경 변수를 설정해야 한다:

```bash
OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0:11434" ollama serve
```

| 변수 | 용도 |
|---|---|
| `OLLAMA_ORIGINS="*"` | 외부 Origin 허용 (CORS) |
| `OLLAMA_HOST="0.0.0.0:11434"` | 외부 Host 헤더 허용 (터널 경유 시 필수) |

---

## 4. 터널 실행 방식

### 방식 A: Quick Tunnel (도메인 불필요, MVP 권장)

```bash
cloudflared tunnel --url http://localhost:11434
```

- Cloudflare가 `xxxx.trycloudflare.com` 형태의 URL을 자동 생성
- 실행할 때마다 URL이 바뀜 (고정 불가)
- 도메인 구매 불필요, 비용 0원

### 방식 B: Named Tunnel + Public Hostname (도메인 필요)

```bash
sudo cloudflared service install <TUNNEL_TOKEN>
```

- macOS `launchd`에 등록되어 로그인 시 자동 시작
- Cloudflare Dashboard에서 Public Hostname 설정 필요
- 고정 URL 사용 가능 (도메인 구매 필요)

#### Public Hostname 설정 (방식 B)

Cloudflare Dashboard > Networking > Tunnels > 터널 선택 > Routes > Published application:

- **Subdomain**: 원하는 서브도메인 (예: `ollama`)
- **Domain**: Cloudflare에 등록된 도메인
- **Service URL**: `http://localhost:11434`

---

## 5. 터널 상태 확인

```bash
# Quick Tunnel 테스트
curl https://<tunnel-url>/api/tags

# Named Tunnel 서비스 상태
sudo launchctl list | grep cloudflare
```

---

## 6. 보안 참고

- `OLLAMA_URL`은 Supabase Secret으로만 관리 (백엔드 전용)
- 프론트엔드에서 직접 Ollama 접근 불가 (Edge Function 경유만 허용)
- Cloudflare Access 정책으로 접근 제한 추가 권장 (IP 화이트리스트 또는 서비스 토큰)

---

## 7. 서비스 제거

```bash
# Named Tunnel 서비스 제거
sudo cloudflared service uninstall

# cloudflared 삭제
brew uninstall cloudflared
```

---

## 현재 상태

- **방식**: Quick Tunnel (방식 A)
- **cloudflared**: 설치 완료 (`brew install cloudflared`)
- **Named Tunnel 서비스**: 설치됨 (`jeomhana`, Tunnel ID: `3017c817-161c-456d-a91f-2cf657a24754`)
- **도메인**: 미보유 (Public Hostname 미설정)
- **참고**: Named Tunnel은 도메인 구매 후 방식 B로 전환 가능
