# 실시간 투표 플랫폼

WebSocket 기반 실시간 투표 및 채팅 플랫폼

## 🚀 프로젝트 개요

컴퓨터 네트워크 9팀 프로젝트로, 실시간 투표, 채팅, 개인 메모 기능을 제공하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- 🗳️ **실시간 투표 시스템**
  - 투표 생성 및 참여
  - 실시간 결과 시각화
  - 다양한 투표 옵션 지원

- 💬 **실시간 채팅**
  - WebSocket 기반 실시간 메시징
  - 시스템 알림 메시지
  - 투표 업데이트 알림

- 📝 **개인 메모 기능**
  - 투표별 개인 메모 작성
  - 로컬 저장소 활용
  - 실시간 저장

- 🎨 **모던한 UI/UX**
  - 다크 테마 디자인
  - 글래스모피즘 효과
  - 반응형 디자인 (모바일/데스크톱)

## 🛠️ 기술 스택

### Frontend
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Lucide React
- **Real-time**: Socket.IO Client
- **Charts**: Recharts
- **Build Tool**: Vite

### 개발 환경
- Node.js
- Git/GitHub
- VSCode

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── ui/            # 공통 UI 컴포넌트
│   │   ├── LoginForm.tsx
│   │   └── Header.tsx
│   ├── voting/        # 투표 관련 컴포넌트
│   │   ├── PollList.tsx
│   │   ├── VotingInterface.tsx
│   │   └── CreatePollModal.tsx
│   ├── chat/          # 채팅 관련 컴포넌트
│   │   └── ChatPanel.tsx
│   └── memo/          # 메모 관련 컴포넌트
│       └── MemoPanel.tsx
├── types/             # TypeScript 타입 정의
├── utils/             # 유틸리티 및 상수
├── hooks/             # Custom React Hooks
├── services/          # API 및 소켓 서비스
└── stores/            # 상태 관리
```

## 🚀 실행 방법

```bash
# 프로젝트 클론
git clone https://github.com/hwouu/realtime-voting-frontend.git
cd realtime-voting-frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 🎯 다음 단계

- [ ] FastAPI 백엔드 서버 구현
- [ ] WebSocket 실시간 통신 연동
- [ ] 패킷 캡처 및 분석 구현
- [ ] Wireshark를 통한 네트워크 분석
- [ ] 보고서 작성 및 시연 준비

## 👥 팀원

- 노현우 (2020121070) - 프론트엔드 개발
- 김민수 (2020125008) - 백엔드 개발
- 이수현 (2021121141) - 네트워크 분석
- 김지홍 (2021125017) - 시스템 통합

## 📋 프로젝트 일정

- **1주차**: 프로젝트 설계 및 환경 구축 ✅
- **2주차**: 프론트엔드 UI 구현 ✅
- **3주차**: 백엔드 API 및 WebSocket 구현
- **4주차**: 패킷 분석 및 보안 검증
- **5주차**: 통합 테스트 및 최적화
- **6주차**: 최종 보고서 및 발표 준비

## 📊 평가 기준

- 캡처한 패킷의 다양성 (Layer, Protocol)
- 분석의 정밀도 (시나리오, 데이터)
- 다양한 패킷을 생성할 수 있는 구조

---

**컴퓨터 네트워크 프로젝트 · 9팀**
