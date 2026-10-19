# Cloudflare 설치 안내

기본 구조는 **Workers(서버·정적 파일) + D1(상태) + 비공개 R2(이미지)**입니다. GitHub는 코드 배포·다운로드에 사용합니다.

## 1. 코드와 도구

압축을 풀거나 본인의 GitHub 저장소로 복사한 뒤 폴더에서 실행합니다.

```sh
npm ci
npm test
npm run build
npx wrangler login
npx wrangler whoami
```

로그인은 본인 Cloudflare 계정으로 진행합니다. 이미 로그인되어 있다면 계정만 확인합니다.

## 2. 새 저장 공간 생성

다음 이름은 예시입니다. 계정에 기존 자원이 있으면 충돌하지 않는 새 이름을 사용하고 설정에도 같은 이름을 반영합니다.

```sh
npx wrangler d1 create todo-share-db
npx wrangler r2 bucket create todo-share-media
```

R2가 아직 계정에서 활성화되지 않았다면 사용자가 계정의 R2 설정을 먼저 완료합니다. 이 앱은 공개 R2 주소를 필요로 하지 않습니다.

## 3. wrangler.jsonc 수정

- `name`: 자신의 Worker 이름. 예시 `todo-app-share`.
- `d1_databases[0].database_name`: 방금 만든 D1 이름.
- `d1_databases[0].database_id`: 생성 결과의 실제 D1 ID. 제공된 0 ID를 교체.
- `r2_buckets[0].bucket_name`: 방금 만든 R2 이름.
- 바인딩 이름 `DB`, `BUCKET`, `ASSETS`와 `migrations_dir`, `assets` 설정은 유지.

이 파일에는 기존 계정 ID나 도메인 연결이 없습니다. 여러 계정에 접근할 수 있는 경우 본인 설치 계정을 확인하고 필요한 계정 설정만 추가하세요.

## 4. 스키마와 로컬 테스트

```sh
npx wrangler d1 migrations apply DB --local
npm run dev
```

로컬 주소의 `/todo/`에서 확인합니다. 로컬 DB는 운영 D1과 별개입니다.

새 운영 DB에 스키마를 적용합니다.

```sh
npx wrangler d1 migrations apply DB --remote
```

마이그레이션 도구는 적용 이력을 관리합니다. 기존 DB를 삭제하거나 초기 SQL을 수동으로 반복 실행하지 마세요.

## 5. 배포

```sh
npm run deploy
```

출력된 주소가 `https://<worker>.<account>.workers.dev`라면 앱은 그 주소의 **`/todo/`**에서 엽니다. 루트 `/`는 `/todo/`로 이동합니다. 기본값으로 도메인 구매나 DNS 연결은 필요하지 않습니다.

등록된 매시간 작업은 완료 30일 만료와 이미지 정리를 처리합니다. 실제 배포 후 Cron Trigger가 등록됐는지 확인합니다.

## 6. GitHub 자동 배포

Cloudflare의 Workers Git 연동에서 이 코드를 담은 자신의 GitHub 저장소를 선택합니다.

- 브랜치: `main`
- 빌드: `npm ci && npm run build`
- 배포: `npx wrangler deploy`
- Worker 이름: `wrangler.jsonc`의 `name`과 동일

최초 DB·R2 생성과 원격 마이그레이션은 먼저 완료해야 합니다. 코드 배포 때마다 DB를 새로 만들지 않습니다. 공개 저장소에 API 토큰을 커밋하지 마세요.

## 7. 확인

프로젝트·섹션·할 일을 추가하고 다른 브라우저에서 같은 내용이 보이는지 확인합니다. 이미지 업로드·제거, 제자리 수정, 모바일 레이아웃, 설정 유지와 완료 복원도 확인합니다. 서버 데이터가 있는 설치에 다시 배포해도 내용이 유지되어야 합니다.

## 공식 문서

- [Wrangler 설정](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [D1 명령](https://developers.cloudflare.com/d1/wrangler-commands/)
- [D1 마이그레이션](https://developers.cloudflare.com/d1/reference/migrations/)
- [R2 명령](https://developers.cloudflare.com/r2/reference/wrangler-commands/)
- [Workers Git 연동](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/)
