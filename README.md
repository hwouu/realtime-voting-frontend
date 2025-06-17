# 실시간 투표 플랫폼 (프론트엔드)

WebSocket 기반 실시간 투표 및 채팅 플랫폼의 프론트엔드 애플리케이션

## 🚀 프로젝트 개요

컴퓨터 네트워크 9팀 프로젝트의 프론트엔드로, FastAPI 백엔드와 완전 통합된 실시간 투표, 채팅, 개인 메모 기능을 제공하는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🗳️ 실시간 투표 시스템
- 투표 생성 및 참여
- 실시간 결과 시각화 (Recharts)
- 다양한 투표 옵션 지원 (2-8개)
- 투표 종료 시간 설정

### 💬 실시간 채팅
- WebSocket 기반 실시간 메시징
- 시스템 알림 메시지
- 투표 업데이트 자동 알림
- 사용자 입/퇴장 알림

### 📝 개인 메모 기능
- 투표별 개인 메모 작성
- 백엔드 API 연동 저장
- 실시간 자동 저장
- 메모 편집 및 삭제

### 🎨 모던한 UI/UX
- 다크 테마 디자인
- 글래스모피즘 효과
- 반응형 디자인 (모바일/데스크톱)
- 최신 프론트엔드 트렌드 반영

## 🛠️ 기술 스택

### 📦 Core Technologies
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4.1
- **Icons**: Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite 6.3

### 🔄 Real-time & API
- **WebSocket**: Socket.IO Client 4.8
- **HTTP Client**: Native Fetch API
- **State Management**: React Context + useReducer
- **Custom Hooks**: API, WebSocket, Store hooks

### 🏗️ Architecture
- **Component Structure**: Atomic Design Pattern
- **State Management**: Context API with Custom Hooks
- **API Layer**: Service Layer Pattern
- **Type Safety**: Full TypeScript Integration

## 📁 프로젝트 구조

```
src/
├── components/           # React 컴포넌트
│   ├── ui/              # 공통 UI 컴포넌트
│   │   ├── LoginForm.tsx
│   │   └── Header.tsx
│   ├── voting/          # 투표 관련 컴포넌트
│   │   ├── PollList.tsx
│   │   ├── VotingInterface.tsx
│   │   └── CreatePollModal.tsx
│   ├── chat/            # 채팅 관련 컴포넌트
│   │   └── ChatPanel.tsx
│   └── memo/            # 메모 관련 컴포넌트
│       └── MemoPanel.tsx
├── hooks/               # Custom React Hooks
│   ├── useAPI.ts       # API 호출 훅
│   └── useWebSocket.ts # WebSocket 연결 훅
├── services/            # API 및 WebSocket 서비스
│   ├── api.ts          # REST API 서비스
│   └── websocket.ts    # WebSocket 서비스
├── stores/              # 상태 관리
│   └── useAppStore.ts  # 전역 상태 스토어
├── types/               # TypeScript 타입 정의
│   └── index.ts        # 백엔드 API 스키마 매핑
└── utils/               # 유틸리티 및 상수
```

## 🔧 백엔드 API 통합

### 📡 API 엔드포인트 연동
- **인증**: `POST /api/users/login`, `GET /api/users/me`
- **투표**: `GET/POST/PUT/DELETE /api/polls/*`
- **채팅**: `GET/POST /api/chat/messages`
- **메모**: `GET/POST/PUT/DELETE /api/memos/*`

### 🔌 WebSocket 이벤트
```typescript
// 클라이언트 → 서버
'user:join'         // 사용자 입장
'poll:create'       // 투표 생성
'vote:cast'         // 투표 참여
'chat:message'      // 채팅 메시지
'memo:save'         // 메모 저장

// 서버 → 클라이언트
'user:joined'       // 사용자 입장 알림
'poll:created'      // 새 투표 생성 알림
'vote:result'       // 투표 결과 업데이트
'chat:message_received' // 채팅 메시지 수신
'users:online'      // 온라인 사용자 목록
```

## 🚀 실행 방법

### 1. 의존성 설치
```bash
npm install
# 또는
pnpm install
```

### 2. 환경 변수 설정
`.env` 파일에서 백엔드 서버 URL을 설정하세요:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=http://localhost:8000
```

### 3. 개발 서버 실행
```bash
npm run dev
# 또는
pnpm dev
```

### 4. 빌드 및 배포
```bash
# 타입 체크
npm run type-check

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 🔄 개발 워크플로

### 백엔드 서버 연동 순서
1. **백엔드 서버 실행** (포트 8000)
2. **프론트엔드 개발 서버 실행** (포트 5173)
3. **브라우저에서 접속** (http://localhost:5173)
4. **닉네임으로 로그인** → WebSocket 자동 연결

### 주요 개발 시나리오
1. **로그인** → JWT 토큰 획득 및 WebSocket 연결
2. **투표 생성** → API 호출 + WebSocket 알림
3. **실시간 채팅** → WebSocket 양방향 통신
4. **투표 참여** → API 호출 + 실시간 결과 업데이트
5. **메모 작성** → API 저장 + 로컬 상태 동기화

## 🎯 다음 단계

- [ ] ✅ FastAPI 백엔드 서버 연동 완료
- [ ] ✅ WebSocket 실시간 통신 구현 완료  
- [ ] ✅ 사용자 인증 및 세션 관리 완료
- [ ] ✅ 투표 CRUD 및 실시간 업데이트 완료
- [ ] ✅ 채팅 시스템 완료
- [ ] ✅ 메모 시스템 완료
- [ ] 🔄 패킷 캡처 및 분석 구현
- [ ] 📊 Wireshark를 통한 네트워크 분석
- [ ] 📝 최종 보고서 작성 및 시연 준비

## 📊 패킷 분석 포인트

### 🌐 생성되는 네트워크 트래픽
- **HTTP/HTTPS**: REST API 호출 (인증, CRUD)
- **WebSocket**: 실시간 양방향 통신
- **TCP**: 연결 설정 및 데이터 전송
- **DNS**: 도메인 이름 해석

### 🔍 Wireshark 분석 대상
```bash
# 필터 예시
host localhost or host 127.0.0.1
tcp.port in {3000,5173,8000}
websocket or http
```

## 👥 팀원 및 역할

- **노현우** (2020121070) - 프론트엔드 개발 리드
- **김민수** (2020125008) - 백엔드 API 개발
- **이수현** (2021121141) - 네트워크 패킷 분석
- **김지홍** (2021125017) - 시스템 통합 및 배포

## 📅 개발 일정

- **1주차**: 프로젝트 설계 및 환경 구축 ✅
- **2주차**: 프론트엔드 UI 구현 ✅  
- **3주차**: 백엔드 API 및 WebSocket 통합 ✅
- **4주차**: 패킷 분석 및 보안 검증 🔄
- **5주차**: 통합 테스트 및 최적화
- **6주차**: 최종 보고서 및 발표 준비

## 🏆 평가 기준 대응

### 📦 패킷의 다양성
- **Layer 2**: Ethernet Frame 분석
- **Layer 3**: IP 패킷 (IPv4/IPv6) 분석
- **Layer 4**: TCP/UDP 세그먼트 분석
- **Layer 7**: HTTP/WebSocket 애플리케이션 데이터 분석

### 🔬 분석의 정밀도
- **시나리오 기반**: 사용자 행동별 패킷 플로우 분석
- **프로토콜 해부**: 각 계층별 헤더 및 페이로드 분석
- **성능 측정**: 지연시간, 처리량, 연결 상태 분석

### 🌈 다양한 패킷 생성 구조
- **실시간 통신**: WebSocket을 통한 지속적인 양방향 통신
- **REST API**: 다양한 HTTP 메서드 (GET, POST, PUT, DELETE)
- **인증**: JWT 토큰 기반 보안 통신
- **파일 전송**: 이미지 업로드 및 다운로드 (추후 확장)

---

**🎓 컴퓨터 네트워크 프로젝트 · 9팀**

*"실시간 웹 통신의 모든 것을 패킷 레벨에서 분석하다"*
