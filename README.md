# My Todo List

밝은 파스텔 테마와 이미지 배경을 지원하는 개인용 할 일 웹앱입니다. HTML·CSS·JavaScript와 **Cloudflare Workers + D1 + R2**를 기준으로 구성되어 있습니다.

## 가장 간단한 전달 방법

1. 이 저장소를 **Code → Download ZIP**으로 받거나 Release의 ZIP을 다운로드합니다.
2. 압축을 풀고 폴더 전체를 사용할 AI에게 전달합니다.
3. **[AI_INSTALL.md](AI_INSTALL.md)의 내용을 프롬프트로 넣습니다.**
4. Cloudflare를 쓰면 [설치 안내](DEPLOY_CLOUDFLARE.md)를, 다른 호스팅을 쓰면 [변경 지침](HOSTING_MIGRATION.md)을 함께 사용합니다.

개인 프로젝트의 실제 할 일·이미지·원본 Git 이력·개인 계정 설정은 포함하지 않습니다. 제작·이식 템플릿의 섹션명은 기본 양식으로 제공합니다. 새 저장 공간에서 시작합니다.

## 두 가지 사용 방식

| 방식 | 올릴 파일 | 저장 방식 | 폰·PC 동기화 |
| --- | --- | --- | --- |
| Cloudflare 전체 설치 | 저장소 전체, 빌드 출력 `dist/` | D1 + 비공개 R2 | 지원 |
| 정적 웹 호스팅 | `web/` **안의 파일** | 해당 브라우저의 localStorage | 지원하지 않음 |

`web/`은 미리 만들어 둔 정적 업로드용 파일입니다. 웹 호스팅의 공개 디렉터리에 안의 파일을 올리면 사용할 수 있습니다. 브라우저의 사이트 데이터를 지우면 이 모드의 데이터도 없어집니다. 동기화와 서버 파일 저장이 필요하면 전체 설치를 사용하세요. `dist/`를 정적 호스팅에 올리는 것으로 서버 기능이 생기지는 않습니다.

## 기능

- 프로젝트 추가·이름 수정·드래그 순서 변경·보관·복원·삭제
- 독립된 제작·이식 프로젝트 추가 버튼, 템플릿의 섹션·할 일·하위 할 일 편집과 복제
- 섹션 추가·이름 수정·접기·이동·삭제 확인
- 할 일과 하위 할 일 입력, 동그라미로 완료, 글자·연필 클릭으로 제자리 수정
- Enter·바깥 클릭 저장, Esc 취소, 한국어 입력 조합 보호
- 맨 아래 하나의 완료 보관함, 원래 섹션·상위 경로 유지, 30일 후 자동 삭제
- 전체·프로젝트별 배경 이미지와 색상, 전체·프로젝트별 라이트·다크
- 7개 파스텔 프리셋, 이미지 대표색 자동 추출, 로고·브랜드 문구 변경
- PC 2열 / 모바일 프로젝트 목록·할 일 2화면
- SUIT Variable, 섹션 16px/700, 본문 16px/400
- Cloudflare 모드에서 기기 간 동기화, 오프라인 변경 재전송, 서버 이미지 참조·삭제 관리

## 로컬 실행

공유본은 Node.js 24 환경을 기준으로 검증합니다. 의존성 버전은 `package-lock.json`으로 고정합니다.

```sh
npm ci
npm test
npm run build
npm run db:local
npm run dev
```

Wrangler가 출력한 로컬 주소의 **`/todo/`** 경로를 엽니다. 로컬 실행은 별도의 로컬 DB·이미지 저장소를 사용합니다. 운영 DB를 붙이는 `--remote` 개발 실행은 기본 안내에 포함하지 않습니다.

정적 버전만 확인하려면:

```sh
npm run build
npm run preview:static
```

기본 미리보기 주소는 `http://localhost:4173/`입니다. `PORT` 환경변수로 바꿀 수 있습니다.

## 문서와 파일

- [AI_INSTALL.md](AI_INSTALL.md): AI에게 그대로 전달하는 설치 프롬프트
- [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md): 본인 Cloudflare 계정에 새로 설치하기
- [HOSTING_MIGRATION.md](HOSTING_MIGRATION.md): 다른 호스팅을 위한 서버 변경 지침
- [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md): 상세 디자인·동작 명세와 전체 CSS
- `app.js`, `styles.css`, `index.html`: 화면 코드
- `sync-client.mjs`, `sync-core.mjs`: 전송·충돌 병합
- `worker.mjs`: Cloudflare API·이미지·정기 정리
- `migrations/`: 초기 DB 스키마
- `wrangler.jsonc`: 설치자 계정의 DB·버킷으로 바꿔야 하는 설정
- `web/`: 서버 없이 업로드하는 정적 버전
- `tests/`: 동시 수정·삭제·모드·순서 동기화 검증

## 저장 공간의 범위

로그인 없는 **하나의 공유 작업 공간**입니다. 같은 설치 주소로 접속하면 같은 내용을 보고 수정합니다. 사람마다 별도로 쓰려면 서로 다른 설치·DB·이미지 저장 공간을 사용합니다. 선택한 프로젝트와 섹션 접힘 상태는 기기별로 유지하고, 프로젝트 데이터·순서·테마·화면 모드는 동기화합니다.

## 배포 전 주의할 설정

`wrangler.jsonc`의 D1 ID는 빈 설치를 위한 0으로 된 예시 값입니다. 반드시 자신의 D1 ID로 바꿉니다. `npm run deploy`는 예시 값이 남아 있으면 멈춥니다. 도메인은 필수가 아니며, Cloudflare 기본 `workers.dev` 주소의 `/todo/`에서 사용할 수 있습니다.

빌드 뒤 코드나 기본 문구를 고쳤다면 `npm run build`로 `web/`도 갱신합니다. 기존 서비스에서 가져온 DB 덤프나 이미지를 소스에 추가하지 않습니다.
