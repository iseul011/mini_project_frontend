# mini_frontend — 팀 설정

## Vercel Environment Variables (이것만)

| Key | Production 값 | Preview (선택) |
|-----|----------------|----------------|
| **API_URL** | `http://43.201.95.108:8080` | 동일 또는 생략 |

- **https 아님** — EC2에 TLS 없으면 `http://` + IP + `:8080`
- `/api/v1` 붙여도 됨: `http://43.201.95.108:8080/api/v1`

**넣지 말 것:** `GEMINI_API_KEY`, `DATABASE_URL`, `NEON_*` (백엔드 GHA 시크릿 전용)

Vercel → Project → Settings → Environment Variables → `API_URL` → Production 체크 → Save → Redeploy

## BFF

- cleaning 5 routes — Cookie 포워딩 없음
- `scan` / `verify` / `chat`: `maxDuration = 120`

## 연동

- BE: `mini_project_backend` GHA → EC2 `:8080`
- AWS 보안 그룹: 인바운드 **8080** (Vercel 서버 → EC2 API)
