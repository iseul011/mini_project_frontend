# mini_frontend — 설정 가이드

Next.js 16 · cleaning + chungsora UI · BFF → EC2 API.

---

## 1. 어디에 무엇을 넣나요?

| 변수 | 넣는 곳 | 넣지 않는 곳 |
|------|---------|----------------|
| **`API_URL`** | Vercel Environment Variables | GitHub, `.env`에 Gemini/DB/JWT |
| **`GEMINI_API_KEY`, `JWT_SECRET`, DB** | — | **백엔드 GHA·`.env`만** |

---

## 2. Vercel 설정 (단계)

1. [vercel.com](https://vercel.com) → 프로젝트 `mini_project_frontend`
2. **Settings → Environment Variables**
3. 추가:

| Key | Value (Production) |
|-----|-------------------|
| `API_URL` | `http://43.201.95.108:8080` |

4. **Production** 체크 → Save  
5. **Deployments → Redeploy** (env 바꾼 뒤 필수)

- `https` 아님 (EC2에 SSL 없음)
- `/api/v1` 붙여도 BFF가 잘라 줌

---

## 3. 커스텀 도메인 (mini3.cloud)

**가비아 DNS만으로는 부족합니다.**

1. 가비아: `@` A `76.76.21.21`, `www` CNAME `cname.vercel-dns.com`
2. Vercel **Settings → Domains** 에 `mini3.cloud`, `www.mini3.cloud` 추가 → **Valid**
3. 접속: `https://mini3.cloud` ( `http://www...` 만 쓰면 `DEPLOYMENT_NOT_FOUND` 날 수 있음)

---

## 4. 로컬 실행

```powershell
cd mini_frontend
pnpm install
pnpm dev
```

- http://localhost:34567  
- 백엔드를 같이 띄울 때: `mini_backend` conda + port **37651** (`../LOCAL_TEST_PORTS.md`)  
- 선택 `.env.local`: `MINI_LOCAL_API_URL=http://127.0.0.1:37651`

```powershell
pnpm build
pnpm lint
```

---

## 5. BFF (서버만 EC2 호출)

모든 JSON BFF route는 `bffProxyJson` / `readUpstreamJson` / `proxyUpstreamJsonMapped` 사용 (§27).

### cleaning

| Route | 비고 |
|-------|------|
| `/api/v1/cleaning/ai-info` | |
| `/api/v1/cleaning/scan` | `maxDuration=120`, multipart |
| `/api/v1/cleaning/verify` | 동일 |
| `/api/v1/cleaning/chat` | 동일 |
| `/api/v1/cleaning/memory` | |

### chungsora (JWT — `Authorization: Bearer` BFF가 upstream 전달)

| Route | 비고 |
|-------|------|
| `/api/v1/auth/login`, `signup`, `me` | 로그인·회원가입 |
| `/api/v1/family/summary`, `pair/issue`, `pair/verify` | 가족 페어링 |
| `/api/v1/points` | 포인트 |
| `/api/v1/lock/policy` | 잠금 정책 |
| `/api/v1/praise-presets` | 칭찬 프리셋 |
| `/api/v1/child/propose`, `/api/v1/parent/propose` | 제안 스레드 |
| `/api/v1/rewards/shop`, `daily-quests` | 보상 상점·퀘스트 |
| `/api/v1/logs/calendar/[yearMonth]`, `/api/v1/logs/[date]/*` | 청소 로그·사진 URL rewrite |
| `/api/v1/uploads/[...path]` | 바이너리 프록시 |

- 브라우저는 **같은 도메인** `/api/v1/...` 만 호출 (`clientApi.ts` 단일 진입점)
- chungsora UI: `/parent/login` — Neon `parent_accounts`에 등록된 아이디·비밀번호로 로그인

---

## 6. 연동 테스트 순서

1. `http://43.201.95.108:8080/health` · `/health/ready` (EC2·8080 SG)
2. `https://mini3.cloud/cleaning` — 스캔 **200**, `model_id` 가 `gemini-...`
3. `https://mini3.cloud/parent/login` — Neon에 등록된 부모 계정으로 로그인 → `/parent` 대시보드
4. chungsora: 포인트·로그·보상 API Network **200** (401이면 JWT·BFF `Authorization` 확인)

---

## 7. 트러블슈팅

| 증상 | 조치 |
|------|------|
| `DEPLOYMENT_NOT_FOUND` | Vercel Domains에 도메인 등록 |
| `.next` not found 빌드 실패 | `next.config`에 `distDir` 없는지 확인 |
| `503` 백엔드 연결 실패 | Vercel `API_URL`, EC2 컨테이너·8080 |
| chungsora `401` | 로그인 후 localStorage JWT, BFF upstream 전달 확인 |
| 스캔만 30초에 끊김 | BFF 110s·`maxDuration` 120 확인 |
| `model_id: fallback` | 백엔드 Gemini 키·로그 |

규칙 전체: `CODE_RULES.md` (모노레포 루트) 또는 팀 공유 문서  
백엔드·GHA: `../mini_backend/TEAM_SETUP.md`
