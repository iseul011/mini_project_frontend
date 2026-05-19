# mini_frontend — 팀 설정

## Vercel Environment Variables

| 변수 | 설명 |
|------|------|
| `API_URL` | mini API EC2 — 예: `http://<host>:8080` (또는 끝에 `/api/v1`) |

로컬 빌드는 생략 가능 — **Vercel에서 빌드·배포**.

## BFF

- cleaning 5 routes — **Cookie 포워딩 없음**
- `scan` / `verify` / `chat`: `maxDuration = 120`, upstream timeout 110s

## 연동

- BE: `mini_backend` GHA → EC2 `:8080`
- `GEMINI_API_KEY`는 **백엔드 GHA 시크릿만** (프론트에 두지 않음)
