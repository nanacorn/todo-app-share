# 개인용 할 일 웹앱 재현 명세


## 1. 다른 AI에게 주는 구현 지침

1. 먼저 이 문서 전체를 읽고, 부록의 CSS와 HTML 구조를 기준으로 구현한다.
2. 보기 좋게 임의로 재설계하지 않는다. 색상, 간격, 폰트, 정렬, 투명도, 화면 전환, 수정 방식을 명세대로 재현한다.
3. 기본 명칭은 **My Todo List**, 초기 프로젝트는 **내 할 일**, 초기 섹션은 **할 일**로 한다.
4. 템플릿은 **제작**, **이식** 이름과 아래 기본 섹션명을 유지한다. 기본 로고 문구는 My Todo List로 한다.
5. 기존 앱이나 개인 계정에서 데이터를 가져오지 않는다. 새 저장 공간에서 시작한다.
6. 문서에 명시되지 않은 기능을 임의로 추가하지 않는다. 검색, 날짜·마감일, 알림, 우선순위, 태그 필터, 캘린더, 통계, 협업, 결제, 시스템 자동 테마를 추가하지 않는다.
7. 특정 프레임워크를 반드시 사용할 필요는 없다. 정적 HTML·CSS·JavaScript로 구현할 수 있다. 다른 프레임워크를 쓰더라도 DOM 구조와 스타일 결과는 유지한다.
8. 부록 A의 CSS는 축약 없는 기준이다. 원본 순서와 선택자 우선순위를 유지한다. 앞쪽 기본 규칙만 보고 뒤쪽 다크모드·이미지·반응형 덮어쓰기를 누락하지 않는다.
9. 부록 B는 정적인 화면 뼈대이다. JavaScript 이벤트, 상태 관리, 동적 목록 렌더링을 별도로 구현해야 실제 앱이 된다.
10. 기본 상태, 7개 색상, 배경 이미지 유무, 라이트·다크, 모바일을 모두 확인한 뒤 완료한다.

## 2. 화면 구성과 디자인 원칙

- PC는 왼쪽 프로젝트 메뉴와 오른쪽 할 일 영역의 2열이다.
- 모바일은 **프로젝트 목록 화면**과 **선택한 프로젝트의 할 일 화면** 두 화면이다. 긴 메뉴와 본문을 세로로 한꺼번에 쌓지 않는다.
- 기본 분위기는 차이수학 색상기반의 밝고 부드러운 그라데이션이다. 다른 추천 색상도 같은 파스텔 계열의 명도·채도를 유지한다.
- 할 일마다 네모 박스, 테두리, 상시 배경색을 넣지 않는다. 목록은 텍스트와 체크박스 위주로 간결하게 보인다.
- 섹션 아래에는 얇고 옅은 가로 구분선을 둔다. 섹션 제목과 구분선의 왼쪽 시작점은 같아야 한다.
- 프로젝트 제목과 추가 버튼에만 주로 강조색을 사용한다. 섹션 제목과 할 일 본문은 읽기 좋은 중성색이다.
- 섹션 앞에는 작은 접기 화살표가 있다. 별도의 색상 점은 넣지 않는다.
- 배경 이미지 위에 불투명한 커다란 흰 카드나 섹션 카드를 덮지 않는다. 화면 전체의 그라데이션 레이어로 가독성을 확보한다.
- 장식 목적의 큰 그림자, 과한 유리 효과, 두꺼운 윤곽선, 큰 여백, 동작 중 레이아웃 점프를 피한다.
- 설정창과 추가 입력 폼은 표면·테두리를 사용할 수 있다. 이것을 일반 할 일 행에 확장하지 않는다.

## 3. 레이아웃 수치

### PC: 화면 너비 701px 이상

| 요소 | 기준 |
| --- | --- |
| 전체 레이아웃 | `grid-template-columns: 288px minmax(0, 1fr)` |
| 최소 높이 | `100dvh` |
| 왼쪽 메뉴 | 너비 288px, `sticky`, `top: 0`, 높이 `100dvh`, 자체 세로 스크롤 |
| 메뉴 안쪽 여백 | 위아래 36px, 좌우 18px |
| 본문 바깥 여백 | 위 40px, 좌우 `clamp(24px, 5vw, 80px)`, 아래 60px |
| 본문 콘텐츠 | 최대 800px, 가로 중앙 정렬 |
| 프로젝트 헤더 | 가로 flex, 간격 20px, 아래 padding 20px, 아래 margin 28px, 1px 구분선 |
| 제목 옆 버튼 | 제목 → 이름 수정 연필 → 프로젝트 설정 순서, 기본 gap 10px |
| 섹션 간 여백 | 아래 margin 30px |
| 섹션 헤더 | 최소 높이 36px, 내부 gap 8px, 아래 padding 6px, 아래 margin 4px |
| 할 일 행 | 최소 높이 40px, 좌우 padding 8px, 행 안쪽 gap 4px |
| 체크·본문 묶음 | 위아래 padding 9px, 체크와 본문 gap 10px |
| 실제 한 줄 본문 | 본문 24px + 위아래 padding 18px이므로 보통 약 42px |
| 하위 목록 | 왼쪽 margin 26px + 왼쪽 padding 10px, 1px 세로 가이드 |
| 더 깊은 하위 목록 | 추가 왼쪽 margin 10px |

### 모바일: 화면 너비 700px 이하

| 요소 | 기준 |
| --- | --- |
| 레이아웃 | 단일 열, 한 번에 목록 또는 할 일 화면 하나만 표시 |
| 할 일 화면 padding | 위 12px, 좌우 16px, 아래 48px |
| 프로젝트 목록 padding | 위 16px, 좌우 18px, 아래 40px |
| 브랜드·로고 | 숨김, 숨긴 영역의 큰 여백도 제거 |
| 상단 툴바 | 왼쪽 `← 프로젝트 목록`, 오른쪽 전체 설정, 아래 margin 18px |
| 프로젝트 제목 | 23px |
| 프로젝트 헤더 | gap 8px, 아래 padding 16px, 아래 margin 22px |
| 섹션 목록 | 왼쪽 padding 32px로 화살표 자리 확보 |
| 섹션 제목 시작점 | 화면 왼쪽 48px = 본문 padding 16px + 섹션 목록 padding 32px |
| 접기 버튼 시작점 | 화면 왼쪽 16px, 화면 밖으로 잘리지 않음 |
| 섹션 헤더 | 아래 padding 4px, 아래 margin 4px |
| 섹션 간 여백 | 아래 margin 24px |
| 체크·본문 묶음 | 위아래 padding 10px, 체크와 글자 gap 14px, 최소 높이 44px |
| 할 일 행 내부 gap | 2px |
| 하위 목록 | 왼쪽 margin 15px, 왼쪽 padding 5px |
| 일반 버튼 높이 | 최소 44px |
| 프로젝트 목록 항목 | padding 18px 16px, 항목 사이 gap 10px |
| 프로젝트 이동 핸들 | 28 × 44px |
| 프로젝트 보관·삭제 | 각각 너비 36px, 높이 40px |

반응형을 핸드폰 종류로 추정하지 말고 `max-width: 700px` 규칙으로 구현한다. `min-width: 0`, `minmax(0, 1fr)`, 긴 글자 줄바꿈을 유지해 가로 스크롤이 생기지 않게 한다.

## 4. 폰트 규칙

**SUIT Variable** 웹폰트를 사용한다. 이름이 비슷한 다른 폰트로 바꾸지 않는다.

공개 웹폰트 파일:

`https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.woff2`

`font-weight: 100 900`, `font-display: swap`, `font-synthesis: none`을 사용한다. 폴백 순서는 부록 CSS 그대로 따른다.

| 위치 | 크기 | 굵기 | 추가 규칙 |
| --- | --- | --- | --- |
| PC 프로젝트 제목 | `clamp(25px, 2.5vw, 30px)` | 800 | 줄높이 1.4, 자간 `-.035em` |
| 모바일 프로젝트 제목 | 23px | 800 | 같은 줄높이·자간 |
| 섹션 제목 | **16px** | **700** | 줄높이 1.5, 자간 `-.015em` |
| 할 일·하위 할 일 | **16px** | **400** | 줄높이 1.5 = 24px, 줄바꿈 허용 |
| 제자리 수정 입력칸 | **16px** | **400** | 본문과 같은 위치·줄높이 |
| 브랜드 문구 | 15px | 800 | 줄높이 1.5, 자간 `-.025em` |
| PC 프로젝트 목록 | 14px | 400 | 선택 시 700 |
| 모바일 프로젝트 목록 | 15px | 400 | 선택 시 700 |
| PC 메뉴 소제목 | 12px | 700 | 자간 `.02em` |
| 모바일 목록 제목 | 22px | 700 | 자간 `-.03em` |
| 할 일 추가 버튼 | 14px | 400 | 줄높이 1.5 |
| 하위 추가 버튼 | 12px | 400 | 작고 차분한 보조 동작 |
| 기본 버튼 | 13px | 700 | 모바일에서도 본문 규칙과 혼동하지 않음 |
| 설정창 제목 | 20px | 700 | 자간 `-.03em` |
| 설정 설명 | 13px | 400 | 줄높이 1.6 |
| 설정 legend | 14px | 700 | 아래 margin 12px |
| 설정 보조 설명 | 12px | 400 | 줄높이 1.65 |
| 보관 경로·안내 | 11px | 400 | 옅은 중성색 |
| `MY PROJECT` | 10px | 700 | 자간 `.14em`, 모바일 숨김 |

섹션은 본문보다 크게 만들지 않는다. **같은 16px에 굵기만 달라야 한다.**


## 6. 라이트·다크와 설정 범위

- 루트 `<html>`의 `data-color-mode`를 `light` 또는 `dark`로 설정한다.
- 전체 설정은 라이트·다크 두 가지뿐이다. 운영체제 자동 모드는 없다.
- 프로젝트 설정은 **전체 설정 따르기 / 라이트 / 다크**다.
- 프로젝트의 `colorMode`가 없으면 전체 모드를 따른다. `inherit` 문자열은 UI 값이며 서버의 프로젝트 모드 값으로 저장하지 않는다.
- 최종 모드는 `project.colorMode ?? state.colorMode ?? 'light'`로 결정한다.
- 화면 모드는 프로젝트 배경·색상 설정과 독립적인 값이다. 배경 초기화 때문에 화면 모드까지 없어지면 안 된다.
- 전체 설정을 열면 전체 기본 테마를 미리 보여 준다. 닫으면 선택 프로젝트의 테마로 돌아간다.
- 프로젝트 설정을 열면 해당 프로젝트의 테마와 모드를 보여 준다.
- 전체 설정은 브랜드 문구·로고·기본 배경·기본 모드를 관리한다.
- 프로젝트 설정은 해당 프로젝트의 배경·색상·화면 모드를 관리한다. 로고 변경은 표시하지 않는다.
- 프로젝트 설정의 `전체 기본 테마 사용`은 개별 배경과 색상만 해제한다. 개별 화면 모드는 별도 라디오로 해제한다.
- 선택은 즉시 저장한다. 템플릿 편집의 명시적 저장 방식과 구분한다.
- 다크에서 입력창, select, 색상 입력, dialog, 취소 버튼, 삭제 상태도 함께 어두워져야 한다. 배경만 어둡게 하고 흰 입력창을 남기지 않는다.

## 7. 배경 이미지와 자동 스킨

### 표시 원칙

- `position: fixed; inset: 0`, `background-size: cover`, `background-position: center`로 화면 전체를 채운다.
- 가로·세로 비율을 유지한다. 화면 비율에 따라 가장자리가 잘릴 수 있다. 타일·늘이기·사이드바 한정 배경으로 바꾸지 않는다.
- 이미지 활성화 시 body에 `.has-background-image`를 붙인다.
- 이미지 URL은 루트 CSS 변수 `--background-image: url("...")`에 둔다.
- 이미지 위 메뉴와 본문은 투명하게 두고, 전체 화면과 본문 뒤 그라데이션 레이어를 겹친다.
- 라이트 이미지 모드에서 body 범위의 `--skin-ink`, `--skin-muted`는 `#101718`로 덮어쓴다. 루트 계산값만 사용하면 색이 달라진다.
- 다크 이미지 모드에서는 body 범위의 두 변수를 각각 `#edf0f4`, `#b2b8c2`로 쓴다.

### 정확한 레이어

| 모드 | 전체 이미지 위 레이어 |
| --- | --- |
| PC 라이트 | `linear-gradient(90deg, #fffffff0 0%, #ffffffd9 288px, #ffffff99 58%, #ffffff80 100%)` |
| PC 다크 | `linear-gradient(90deg, #11151bf2 0%, #11151bde 288px, #11151ba6 58%, #11151b99 100%)` |
| 모바일 라이트 | `linear-gradient(180deg, #ffffff99, #ffffff8c 50%, #ffffff99)` |
| 모바일 다크 | `linear-gradient(180deg, #11151ba6, #11151b99 50%, #11151ba6)` |

본문에 추가로 씌우는 `workspace::before` 레이어의 정확한 중간 정지점은 부록 A를 그대로 따른다. PC는 왼쪽 inset 288px, 모바일은 0이다. 모든 장식 레이어는 `pointer-events: none`이며 실제 UI 뒤에 놓는다.

### 업로드와 색 추출

- 입력 형식: JPG·PNG·WebP·GIF, 원본 파일 최대 20MB.
- 배경은 긴 변 1000px 이하, 로고는 긴 변 256px 이하로 축소한다. 작은 이미지는 확대하지 않는다.
- canvas에서 WebP 품질 `.82`로 변환한다. GIF도 이 흐름에서는 정지 이미지로 변환된다.
- 배경의 data URL은 2,000,000자 이하, 로고는 300,000자 이하로 제한한다.
- 배경 이미지 색 추출은 원본을 96 × 96px로 샘플링한다.
- alpha < `.1` 픽셀은 제외한다.
- HSL 채도 > `.12`인 색은 hue 20도 단위로, 나머지는 lightness를 4단계로 묶는다.
- 픽셀 가중치는 `alpha * (.15 + .85 * saturation) * (1 - abs(.5 - lightness) * .7)`이다.
- 가장 큰 가중치 묶음의 가중 평균 RGB를 대표색으로 선택한다.
- 대표 채도가 `.12`보다 크면 `.25`~`.72`로 제한한다. 저채도 이미지는 회색 분위기를 유지한다.
- 추출 HSL로 시작색 `(h, s*.7, .91)`, 끝색 `(h, s*.45, .97)`, 강조색 `(h, s, .58)`을 만든다.
- 정확한 함수는 부록 D에 있다. 완전히 투명한 이미지처럼 색을 추출할 수 없으면 오류를 표시하고 이전 설정을 유지한다.
- 로고는 테마색 추출에 사용하지 않는다.
- 배경 방식은 두 칸의 세그먼트 라디오로 표시한다. 이미지가 없어도 이미지 배경을 선택할 수 있고, 선택 시 파일 선택창을 즉시 연다. 성공적으로 적용하기 전에는 저장된 배경 방식을 바꾸지 않으며 파일 선택 취소·검증 실패 시 기존 테마를 유지한다.
- 색상 테마일 때는 추천 색상·배경 그라데이션·강조색 입력만 표시하고, 이미지 배경일 때는 미리보기·파일명·이미지 변경·삭제·자동 테마 안내만 표시한다. 오류·업로드·삭제 상태는 두 모드 모두에서 보이도록 별도 영역에 둔다.
- 이미지와 색상 테마 사이를 전환해도 업로드한 이미지는 보존한다.
- 이미지 제거 시 해당 이미지를 처음 적용하기 전 테마로 돌아간다. 이미지 교체 시 최초의 복원용 테마를 유지한다.
- 프로젝트를 전환하면 해당 프로젝트의 이미지·테마를 사용한다. 개별 배경 설정이 없으면 전체 기본 배경을 사용한다.
- 업로드 중에는 관련 설정과 닫기를 잠깐 비활성화하고 진행 문구를 보여 준다. 성공·실패 후 복구한다.

### 추천 색상 프리셋 (2026-10-19)

노랑은 유지하고 나머지는 맑은 파스텔로 구성한다. 왼쪽 메뉴의 흰색 반투명 레이어를 통과해도 색이 보이도록 배경 시작색·끝색의 농도를 맞춘다. 작은 색상 버튼은 swatchStart(이전의 연한 시작색)와 동일한 강조색을 사용해 기존 모습을 유지한다. 저장된 사용자 색상을 자동으로 바꾸지 않으며, 프리셋을 다시 선택할 때 아래 값을 적용한다.

| 계열 | 시작색 | 끝색 | 강조색 |
| --- | --- | --- | --- |
| 노랑 | #fff8cf | #fffdf6 | #ffda75 |
| 빨강 | #ffcccc | #fff8f8 | #ffc4c4 |
| 초록 | #cffff0 | #f7fffb | #baebd7 |
| 핑크 | #ffceea | #fff7fb | #ffd0e8 |
| 블루 | #cfeaff | #f7fcff | #c6e7ff |
| 보라 | #e3d1ff | #fcf8ff | #deceff |
| 그레이 | #d0d9e5 | #f7f9fc | #e6eaf0 |

## 8. 브랜드와 프로젝트 메뉴

- 브랜드는 `34px / 유동 텍스트 / 44px 버튼 영역` 3열, 열 간격 12px이다.
- 한 줄 문구는 34px 로고와 세로 중앙을 맞춘다. 두 줄 이상이면 로고는 위에 고정하고 첫 줄 중심에 맞추며 문구만 아래로 늘어난다. 텍스트 상단 여백은 `(34px - 1.5em) / 2`, 28px 버튼 영역의 상단 여백은 3px이다. 폰트 로드·창 크기·문구 변경에도 CSS로 같은 기준을 유지한다.
- 기본 마크는 34 × 34px, 둥근 모서리 12px의 체크 표시다.
- 업로드 로고는 34 × 34px 정원, `object-fit: cover`로 자른다. 설정 미리보기는 64 × 64px 정원이다.
- 브랜드 문구 옆 작은 연필 오른쪽에 전체 설정 아이콘을 둔다. 이 두 아이콘은 16×16 전용 SVG이며 선 두께 1.5px와 둥근 모서리를 사용한다. 설정 아이콘은 중심 (8, 8)의 대칭 6톱니와 반지름 2.25px 중심 원으로 구성한다. 버튼 크기와 정렬은 유지하고 24px 도형을 축소해서 대체하지 않는다. 앱 이름은 줄바꿈을 포함해 최대 80자·2줄이다. 연필 편집과 전체 설정 모두 2행 textarea를 사용하고, Enter는 줄바꿈이다. 세 번째 줄 입력을 막고, 3줄 이상 붙여넣은 값은 저장할 수 없도록 안내한다. 직접 지정한 두 줄은 각각 한 행으로 표시하고 긴 행은 말줄임한다. 직접 줄바꿈이 없는 이름은 자연스럽게 줄바꿈하되 두 줄까지만 표시한다. 원문은 title에 유지하며 브라우저 탭 제목에서는 줄바꿈을 공백으로 바꾼다.
- 프로젝트 목록의 각 항목은 이동 핸들 → 프로젝트 이름 → 보관 → 삭제 순서다.
- 선택 프로젝트는 부드러운 100도 강조색 그라데이션, 1px 테두리, 글자 굵기 700이다.
- `+ 프로젝트 추가` 아래에 제작·이식 프로젝트 추가 버튼을 각각 독립된 행으로 둔다. 드롭다운으로 합치지 않는다.
- 각 템플릿 행 오른쪽에 작은 편집 연필을 둔다.
- 템플릿 편집 중 비활성화되는 왼쪽 메뉴와 모바일 프로젝트 목록 버튼은 기본 화살표 커서를 사용한다. 편집 잠금을 진행 중인 로딩처럼 표시하지 않는다.
- 편집 화면에는 수정 취소 / 템플릿 저장 버튼을 둔다. 변경이 있을 때 수정 취소를 누르면 저장 / 저장 안 함 / 계속 수정의 모달을 띄운다. 저장은 저장 성공 후 닫고, 저장 안 함은 원본을 유지하며 나가고, 계속 수정·Escape는 입력을 유지한다. 변경이 없으면 안내 없이 닫는다. 아직 추가하지 않은 할 일·하위 할 일·섹션 입력도 변경 감지와 저장에 포함한다. 저장 실패 시 원본·초안·입력을 유지하며 재시도할 수 있다. 수정 중 새로고침·탭 닫기에는 브라우저 기본 이탈 경고를 사용하며 사용자 지정 문구나 자동 저장을 약속하지 않는다.
- 보관 프로젝트는 목록 아래 접고 펼치는 영역에 모은다. 복원·삭제할 수 있다.
- 모든 프로젝트가 없어도 새 프로젝트와 템플릿 편집을 사용할 수 있다.

프로젝트 제목 행은 flex gap 0으로 두고 제목 오른쪽 여백을 PC 7px·모바일 8px로 둔다. 30px(PC)·32px(모바일) 버튼 안의 16px 아이콘을 중앙에 놓아 제목→연필과 연필→설정의 SVG 사이 간격이 각각 PC 14px·모바일 16px로 같도록 한다.

## 9. 섹션 제목과 접기 버튼

- 섹션 제목과 구분선의 왼쪽 좌표를 일치시킨다.
- 접기 버튼은 그 시작점보다 32px 왼쪽에 두는 24 × 24px 버튼이다.
- SVG는 16 × 16px이며 버튼 중앙에 둔다. 버튼 오른쪽부터 제목까지 정확히 8px이다.
- 실제 작은 V 도형과 제목 사이 여백은 약 15.5px이다. SVG 박스 간격 12px와 혼동하지 않는다.
- 펼쳤을 때 아래쪽 V, 접었을 때 오른쪽 방향이다. `rotate(-90deg)`로 전환한다.
- 색은 기본 `--skin-muted`; hover는 `--workspace-accent`와 옅은 배경이다. 항상 강조색으로 칠하지 않는다.
- 섹션 이동 핸들과 이름 수정 연필은 헤더 오른쪽에 둔다.
- PC hover 또는 focus-within에서 보조 아이콘이 선명해진다. 접기 화살표는 기본 상태에도 보여야 한다.
- 접으면 섹션 제목·구분선·헤더 조작만 남고, 그 섹션의 할 일·하위 할 일·추가 버튼을 숨긴다.
- 각 버튼은 `aria-expanded`, `aria-controls`, 섹션명과 접기·펼치기 동작을 포함한 접근성 이름을 갖는다.
- 접힘 상태는 섹션 ID 기준으로 **이 브라우저에만** 저장한다. 클라우드의 업무 데이터와 분리한다.
- 새로고침·프로젝트 전환·순서 변경 후에도 같은 섹션의 접힘 상태가 유지된다.
- 다른 섹션의 입력 폼이나 데이터가 접기 때문에 재생성되거나 유실되면 안 된다.
- 입력 중인 새 할 일이 있는 섹션을 접으려 하면 입력칸을 유지하고 먼저 추가·취소하도록 안내한다.

접기 SVG:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#fff6c5">
    <title>My Todo List · 내 할 일</title>
    <link rel="stylesheet" href="styles.css">
    <script src="app.js" defer></script>
  </head>
  <body>
    <div class="app-background" aria-hidden="true"></div>
    <div class="app-shell" data-mobile-screen="tasks">
      <aside class="sidebar" aria-label="프로젝트">
        <div class="brand-row"><div class="brand"><span class="brand-mark" id="brand-mark" aria-hidden="true"><span id="brand-default">✓</span><img id="brand-image" alt="" hidden></span><span class="brand-text" id="brand-text">My Todo List</span><div class="brand-actions"><button class="edit-button brand-edit" id="edit-brand" type="button" aria-label="로고 문구 수정" title="로고 문구 수정"></button><button class="settings-button" id="open-settings" type="button" aria-label="설정" title="설정"></button></div></div></div>
        <button class="settings-button mobile-project-settings" id="project-list-settings" type="button" aria-label="설정" title="설정"></button>
        <div class="sidebar-heading"><h2 id="projects-heading" tabindex="-1">내 프로젝트</h2><button class="icon-button" id="new-project" type="button" aria-label="프로젝트 추가">+</button></div>
        <nav id="project-list" aria-label="프로젝트 목록"></nav>
        <details class="project-archive" id="project-archive" hidden><summary id="project-archive-summary">보관 프로젝트</summary><div id="archived-project-list" aria-label="보관 프로젝트 목록"></div></details>
        <form id="project-form" class="name-form" hidden novalidate>
          <label class="field-label" id="project-form-label" for="project-name">프로젝트 이름</label>
          <input id="project-name" maxlength="80" placeholder="프로젝트 이름" autocomplete="off" required>
          <div class="form-actions"><button class="button quiet" id="cancel-project" type="button">취소</button><button class="button primary" type="submit">추가</button></div>
        </form>
        <button class="sidebar-add" id="add-project" type="button"><span aria-hidden="true">+</span> 프로젝트 추가</button>
        <div class="template-row"><button class="sidebar-add template-add" id="add-templateA-project" type="button"><span aria-hidden="true">+</span> 제작 프로젝트 추가</button><button class="edit-button" id="edit-templateA-template" type="button" aria-label="제작 템플릿 수정" title="제작 템플릿 수정"></button></div>
        <div class="template-row"><button class="sidebar-add template-add" id="add-templateB-project" type="button"><span aria-hidden="true">+</span> 이식 프로젝트 추가</button><button class="edit-button" id="edit-templateB-template" type="button" aria-label="이식 템플릿 수정" title="이식 템플릿 수정"></button></div>
      </aside>
      <main class="workspace">
        <div class="content">
          <div class="mobile-toolbar"><button class="button quiet" id="back-to-projects" type="button">← 프로젝트 목록</button><button class="settings-button" id="mobile-settings" type="button" aria-label="설정" title="설정"></button></div>
          <div class="template-editor-bar" id="template-editor-bar" hidden><p>섹션과 하위 할 일을 편집한 뒤 저장하세요.</p><div class="form-actions"><button class="button quiet" id="cancel-template" type="button">수정 취소</button><button class="button primary" id="save-template" type="button">템플릿 저장</button></div></div>
          <header class="project-header"><div class="project-heading"><p class="eyebrow">MY PROJECT</p><div class="title-row"><h1 id="project-title"></h1><button class="edit-button" id="edit-project" type="button" aria-label="프로젝트 이름 수정"></button><button class="edit-button project-settings-button" id="project-settings" type="button" aria-label="프로젝트 배경 및 테마 설정" title="프로젝트 배경 및 테마 설정"></button></div></div><button class="button section-button" id="new-section" type="button"><span aria-hidden="true">+</span> 섹션 추가</button></header>
          <form id="section-form" class="name-form section-form" hidden>
            <label class="sr-only" for="section-name">섹션 이름</label>
            <input id="section-name" maxlength="80" placeholder="섹션 이름" autocomplete="off" required>
            <div class="form-actions"><button class="button quiet" id="cancel-section" type="button">취소</button><button class="button primary" type="submit">추가</button></div>
          </form>
          <div id="sections"></div>
          <p class="empty-projects field-help" id="empty-projects" hidden>프로젝트를 추가하거나 보관한 프로젝트를 다시 꺼내 주세요.</p>
          <div id="all-archives"></div>
          <p id="action-message" class="field-help" role="status" hidden></p>
          <p id="save-message" class="save-message" role="status" hidden></p>
        </div>
      </main>
    </div>
    <dialog id="edit-dialog" aria-labelledby="edit-title">
      <form id="edit-form" class="dialog-content">
        <h2 id="edit-title"></h2>
        <label class="field-label" id="edit-label" for="edit-value"></label>
        <input id="edit-value" autocomplete="off" required>
        <textarea class="brand-name-input" id="edit-brand-value" rows="2" maxlength="80" aria-describedby="edit-brand-help" required hidden disabled></textarea>
        <p class="field-help brand-name-help" id="edit-brand-help" hidden>Enter로 줄바꿈할 수 있어요. 최대 2줄 · 80자</p>
        <div class="form-actions"><button class="button quiet" id="cancel-edit" type="button">취소</button><button class="button primary" type="submit">저장</button></div>
      </form>
    </dialog>
    <dialog id="template-exit-dialog" aria-labelledby="template-exit-title" aria-describedby="template-exit-description"><div class="dialog-content"><h2 id="template-exit-title">변경 내용을 저장하시겠습니까?</h2><p id="template-exit-description" class="field-help">수정한 템플릿이 아직 저장되지 않았어요. 저장하지 않고 나가면 변경 내용은 사라집니다.</p><p id="template-save-error" class="save-message" role="alert" hidden>저장하지 못했어요. 변경 내용은 유지되어 있으니 계속 수정한 뒤 다시 저장해 주세요.</p><div class="form-actions template-exit-actions"><button class="button quiet" id="continue-template" type="button">계속 수정</button><button class="button quiet" id="discard-template" type="button">저장 안 함</button><button class="button primary" id="confirm-save-template" type="button">저장</button></div></div></dialog>
    <dialog id="delete-dialog" aria-labelledby="delete-title"><div class="dialog-content"><h2 id="delete-title">삭제</h2><p id="delete-description" class="field-help"></p><div class="form-actions"><button class="button quiet" id="cancel-delete" type="button">취소</button><button class="button danger" id="confirm-delete" type="button">삭제</button></div></div></dialog>
    <dialog id="settings-dialog" aria-labelledby="settings-title">
      <div class="dialog-content">
        <div class="dialog-heading"><h2 id="settings-title">설정</h2><button class="icon-button" id="close-settings" type="button" aria-label="설정 닫기">×</button></div>
        <p class="settings-caption" id="settings-caption">이미지와 색을 고르면 바로 적용되고 저장돼요.</p>
        <fieldset id="color-mode-settings"><legend>화면 모드</legend>
          <div class="color-mode-options"><label id="color-mode-inherit-option" class="color-mode-inherit" hidden><input type="radio" name="color-mode" id="color-mode-inherit" value="inherit"> 전체 설정 따르기</label><label><input type="radio" name="color-mode" id="color-mode-light" value="light"> 라이트</label><label><input type="radio" name="color-mode" id="color-mode-dark" value="dark"> 다크</label></div>
          <p id="color-mode-help" class="color-mode-help field-help">별도 화면 모드를 지정하지 않은 프로젝트에 적용되고, PC와 모바일에 함께 저장돼요.</p>
        </fieldset>
        <div id="project-appearance-controls" class="project-appearance-controls" hidden><p id="project-appearance-status" class="field-help"></p><button class="button quiet" id="reset-project-appearance" type="button">전체 기본 테마 사용</button></div>
        <fieldset class="logo-settings" id="logo-settings"><legend>로고</legend>
          <p class="field-help">문구 왼쪽의 로고를 원하는 이미지로 바꿀 수 있어요.</p>
          <img id="logo-preview" class="logo-preview" alt="선택한 로고" hidden>
          <input id="logo-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
          <div class="image-actions"><button class="button quiet" id="choose-logo" type="button">로고 이미지 선택</button><button class="button quiet" id="remove-logo" type="button" hidden>기본 로고로</button></div>
          <label class="field-label" for="brand-name-setting">로고 문구</label><textarea class="brand-name-input" id="brand-name-setting" rows="2" maxlength="80" aria-describedby="brand-name-help" required></textarea><p class="field-help brand-name-help" id="brand-name-help">Enter로 줄바꿈할 수 있어요. 최대 2줄 · 80자</p><button class="button quiet brand-save" id="save-brand-name" type="button">문구 저장</button>
          <p id="logo-message" class="field-help" role="status" hidden></p>
        </fieldset>
        <fieldset><legend>배경 방식</legend><div class="background-options"><label><input type="radio" name="background-mode" id="background-color-mode" value="color"><span>색상 테마</span></label><label><input type="radio" name="background-mode" id="background-image-mode" value="image"><span>이미지 배경</span></label></div></fieldset>
        <fieldset id="theme-presets-field"><legend>추천 색상</legend><div class="theme-presets" id="theme-presets" role="group" aria-label="추천 색상"></div></fieldset>
        <p id="background-mode-help" class="field-help">이미지 배경을 선택하면 사진을 고를 수 있어요.</p>
        <fieldset class="image-settings" id="background-image-settings" hidden><legend>배경 이미지</legend>
          <img id="image-preview" class="image-preview" alt="선택한 배경 이미지" hidden>
          <p id="image-name" class="image-name" hidden></p>
          <div class="image-actions"><button class="button primary" id="choose-image" type="button">이미지 변경</button><button class="button quiet" id="remove-image" type="button" hidden>삭제</button></div>
          <p class="field-help image-description">이미지 색상에 맞춰 테마가 바뀌어요.<br>메뉴와 글씨 뒤에는 그라데이션을 더해요.</p>
        </fieldset>
        <input id="sidebar-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
        <p id="image-message" class="field-help" role="status" hidden></p>
        <fieldset id="background-gradient-settings"><legend>배경 그라데이션</legend><div class="color-fields"><label for="gradient-start">시작 색<input id="gradient-start" type="color"></label><label for="gradient-end">끝 색<input id="gradient-end" type="color"></label></div></fieldset>
        <fieldset id="accent-color-settings"><legend>강조색</legend><div class="color-fields"><label for="accent-color">버튼과 체크 색<input id="accent-color" type="color"></label></div></fieldset>
      </div>
    </dialog>
  </body>
</html>
```

## 10. 할 일 행과 제자리 수정

### 행 구조

- 왼쪽 동그라미와 본문 버튼을 `div.task-label` 안에 나란히 둔다.
- 이 묶음을 HTML `<label>`로 만들지 않는다. 글자 클릭이 완료 처리로 전파되는 것을 막아야 한다.
- 체크박스는 native input을 원형으로 꾸민다. PC 18 × 18px, 모바일 22 × 22px다.
- 본문은 테두리·배경·기본 padding 없는 button이다. 클릭하면 수정으로 들어간다.
- 본문 옆에 작은 연필, 삭제 아이콘, `+ 하위` 버튼을 둔다.
- 완료는 동그라미 클릭으로만 변경한다. 글자·여백·연필 클릭이 완료 처리되면 안 된다.
- 체크된 항목의 글자는 중성색, opacity `.55`, 취소선이다.
- 하위 할 일에도 같은 수정·체크·삭제 규칙을 적용한다.

### 반드시 제자리에서 수정

1. 본문 또는 연필을 클릭하면 해당 글자 위치가 textarea로 바뀐다. 수정 팝업을 띄우지 않는다.
2. 체크박스와 옆 조작 버튼은 제자리에 둔다. 페이지 전체를 다시 렌더링해 클릭 대상을 없애지 않는다.
3. 입력칸은 본문과 같은 16px·400·줄높이 24px, padding·margin·border 0, 투명 배경이다. 포커스에는 얇은 강조색 밑줄만 둔다.
4. 기존 글자를 선택한 채 포커스한다. 긴 내용은 입력에 따라 높이가 자동으로 늘어나고 가로 스크롤이 생기지 않는다.
5. Enter 저장, Esc 취소, 바깥 클릭 또는 blur 저장이다. Shift+Enter는 줄바꿈이다.
6. 한국어 등 IME 조합 중의 Enter는 저장으로 해석하지 않는다. `isComposing` 및 키 코드 229를 확인한다.
7. 빈 문자열이나 공백만 입력한 뒤 저장하면 기존 내용을 유지한다. 빈 내용 때문에 할 일을 삭제하지 않는다.
8. 최대 500자다. 저장 시 양 끝 공백을 정리하되 내부 줄바꿈은 유지한다.
9. 한 번에 하나만 편집한다. 다른 글자로 이동하면 먼저 현재 항목을 저장한다.
10. 바깥 클릭 저장은 실제 클릭 대상의 조작을 막으면 안 된다. 특히 체크박스를 클릭하면 내용 저장 후 완료 처리까지 이어져야 한다.
11. 수정 중 다른 기기 변경이나 주기적 정리 때문에 입력칸을 덮어쓰지 않는다.
12. 수정 저장에 실패하면 이전 데이터를 보존하고 입력을 유지한다. 성공한 것처럼 닫지 않는다.
13. Enter·Esc 후 본문에 키보드 포커스를 돌려준다. 바깥 클릭 저장 시에는 클릭 대상의 포커스를 빼앗지 않는다.
14. 수정 후 체크박스·연필·삭제·하위 추가 버튼의 접근성 이름도 갱신한다.
15. 상위 항목 이름을 고치면 보관된 하위 항목의 경로 문구도 갱신한다.
16. 보관된 항목도 같은 자리에서 고칠 수 있다. 글자 수정으로 완료 상태나 완료 시각을 바꾸지 않는다.
17. 새 할 일 입력 폼의 미저장 내용은 기존 할 일을 수정해도 유지한다.

### 새 할 일 추가 폼

- 빈 섹션에 안내 문단을 넣지 않고 바로 `+ 할 일 추가`를 보여 준다.
- 추가를 누르면 그 섹션에 입력 폼이 나타난다. 상단 별도 팝업을 사용하지 않는다.
- PC 폼 margin `8px 8px 10px`, padding `12px 14px`, 모서리 10px, 그림자 없음.
- PC 입력 글자 15px, 모바일은 16px다. **기존 내용 제자리 수정칸은 항상 16px**라는 점과 구분한다.
- 취소와 추가 버튼을 오른쪽에 둔다. 빈 입력일 때 추가 버튼은 비활성화한다.
- 빈 폼은 바깥 클릭 시 자동으로 닫는다. 내용이 있으면 바깥 클릭만으로 버리지 않는다.
- 추가 후 같은 위치에 다음 항목을 계속 입력할 수 있다.
- 하위 추가 폼은 해당 항목 아래에 들여쓰기해 표시한다.

## 11. 보관·삭제·프로젝트·템플릿 기능

### 할 일 보관

- 완료한 항목은 섹션 안에 남겨 두지 않고 본문 최하단의 **모든 할 일 보관 (개수)** 한 곳으로 모은다.
- 섹션별로 별도 보관 버튼을 만들지 않는다.
- 원래 섹션명과 상위 항목 경로를 유지한다.
- 체크를 해제하면 원래 섹션·상위 위치로 복원한다.
- 완료 시각부터 30일 뒤 자동 삭제한다. 섹션과 프로젝트 자체를 삭제하지 않는다.
- 완료된 상위 항목에는 하위 항목을 함께 묶는다. 상위 항목이 만료되면 포함된 하위 항목도 제거된다.
- 클라이언트는 진입 시·이후 매분, 서버는 주기 작업으로 만료를 확인한다. 편집 중인 화면을 재생성하지 않는다.
- 완료 체크와 명시적 삭제는 구분한다. 삭제 아이콘은 확인 대화상자를 거친다.

### 프로젝트

- 추가·선택·이름 수정·순서 변경·보관·복원·삭제를 지원한다.
- 드래그 핸들로 위아래 이동하며 키보드 위·아래 키도 지원한다. 모바일은 터치로 이동한다.
- 순서 변경 시 프로젝트의 ID와 내부 데이터를 유지한다.
- 보관은 내용·설정·완료 상태를 유지한다. 프로젝트 보관 자체에는 30일 만료를 적용하지 않는다.
- 삭제는 확인 후 프로젝트 전체와 해당 프로젝트 전용 이미지의 참조를 정리한다.
- 프로젝트 선택은 기기별 로컬 값이다. 순서와 프로젝트 데이터는 기기 간 동기화한다.

### 템플릿

- 제작 템플릿은 다음 16개 빈 섹션으로 초기화한다: `기획`, `메인 프롬프트 수정`, `이미지`, `시작 설정`, `단축어`, `키워드 북(로어 북)`, `위젯`, `테스트 플레이`, `상세 페이지`, `고정 댓글`, `모델 추천`, `유저 노트`, `페르소나 및 RP 추천`, `썸네일`, `한 줄 설명`, `해시태그`. 이식 템플릿은 이 목록에서 첫 번째 `기획`만 제외한 15개 섹션으로 초기화한다.
- 각 추가 버튼은 복제할 프로젝트 이름 입력을 연다. 이름을 비우고 추가하면 각각 `제작 프로젝트`, `이식 프로젝트`로 바로 생성한다.
- 복제할 때 모든 섹션·할 일·하위 할 일에 새 UUID를 발급하고, 체크 해제·완료 시각 null로 시작한다.
- 새 프로젝트를 수정해도 원본 템플릿이나 다른 프로젝트를 바꾸지 않는다.
- 템플릿 편집은 초안이다. 섹션의 순서·이름·추가·삭제와 할 일·하위 할 일의 추가·수정·삭제가 가능하다.
- 템플릿 저장 버튼을 누를 때만 원본에 반영한다. 취소하면 초안을 버린다.
- 템플릿 편집에서 완료 체크는 표시하지 않는다.
- 섹션 이름 수정은 일반 화면에서도 가능하다. 섹션 삭제 조작은 일반 프로젝트와 템플릿 편집 화면에 둔다. 확인 후 섹션 안의 하위·보관 항목까지 함께 삭제한다.

## 12. 설정창·버튼·상태·접근성

- 설정창은 native dialog 또는 동등한 접근성 모달이다. 너비 `min(420px, calc(100% - 32px))`, 최대 높이 `calc(100dvh - 40px)`, 내부 세로 스크롤, 모서리 18px.
- 내부 padding은 PC 26px, 모바일 22px다.
- 라이트 그림자는 `0 20px 70px #302b2426`, 다크는 `0 20px 70px #00000066`이다.
- 화면 모드 선택은 2열 grid, gap 10px다. 프로젝트의 `전체 설정 따르기`는 두 열을 모두 사용한다.
- 배경·로고 미리보기, 파일명, 적용·제거·진행 상태를 명확히 표시한다.
- 배경 미리보기는 높이 125px, 너비 100%, cover, 모서리 10px다.
- 색상 입력은 높이 46px, 모서리 9px다. 두 그라데이션 색상은 나란히 둔다.
- 기본 버튼 모서리 8px, 폼 내부 작은 버튼은 6px다. 여러 버튼의 간격은 6~8px다.
- 저장 중·저장 완료·오프라인 대기·실패를 본문 아래 작은 상태 문구로 표시한다. 성공할 때마다 팝업을 띄우지 않는다.
- 위험 동작은 라이트에서 연한 붉은 배경과 어두운 붉은 글자, 다크에서 어두운 붉은 배경과 밝은 붉은 글자를 쓴다.
- 각 아이콘 버튼에 접근성 이름을 준다. 장식 SVG는 `aria-hidden="true"`다.
- 기본 focus-visible은 3px outline·3px offset, 본문 조작은 2px·2px다. 제자리 입력은 별도 밑줄 규칙을 따른다.
- `hidden`은 `display: none !important`로 처리해 숨긴 폼과 화면이 flex 스타일 때문에 다시 나타나지 않게 한다.
- 선택 프로젝트는 `aria-current="page"`, 추천색 버튼은 `aria-pressed`, 접기 버튼은 `aria-expanded`를 쓴다.
- 상태 알림은 `role="status"`로 제공한다.
- `prefers-reduced-motion: reduce`에서는 transition을 끈다.
- 긴 프로젝트명·섹션명·할 일·파일명은 줄바꿈하고 레이아웃 밖으로 넘치지 않게 한다.

## 13. 중립적인 데이터 구조

```ts
type Theme = { start: string; end: string; accent: string };
type Task = {
  id: string;
  text: string;
  done: boolean;
  completedAt: number | null;
  children: Task[];
};
type Section = { id: string; name: string; tasks: Task[] };
type Project = {
  id: string;
  name: string;
  archived: boolean;
  sections: Section[];
  appearance?: { theme: Theme; backgroundMode: 'color' | 'image' };
  colorMode?: 'light' | 'dark';
};
type ImageEntry = { data: string; name: string; previousTheme: Theme };
type SharedPayload = {
  state: {
    projects: Project[];
    theme: Theme;
    backgroundMode: 'color' | 'image';
    colorMode: 'light' | 'dark';
    brandName: string;
    templates: { templateA: { sections: Section[] }; templateB: { sections: Section[] } };
  };
  images: Record<string, ImageEntry>; // global 또는 프로젝트 ID
  logo: string | null;
};
```

`images`의 키는 `global` 또는 프로젝트 ID다. `data`와 `logo`는 서버 이미지 URL이다. 브라우저 단독 모드에서는 압축된 data URL을 쓸 수 있다. `selectedProjectId`와 접힘 상태는 공유 payload에 포함하지 않는다.

명칭은 최대 80자, 할 일은 최대 500자다. 기준 서버의 상한은 프로젝트 1000개, 각 섹션 목록 1000개, 전체 할 일 10000개, 하위 깊이 30이다. ID는 중복 없는 UUID다. 새 앱에서 식별자 이름을 바꾸면 프런트엔드와 서버 검증에 일관되게 반영한다.

## 14. 저장·동기화·서버 설치 요건

- 완성된 앱은 PC와 휴대폰에서 같은 저장 공간을 사용한다. 브라우저 localStorage만 쓰면 기기 간 동기화가 되지 않는다.
- 현재 동작의 기준은 로그인 화면 없는 하나의 공유 작업 공간이다. 따라서 같은 주소로 접속한 사람은 같은 내용을 읽고 수정한다. 사람마다 독립적으로 설치할 때는 DB와 이미지 저장 공간을 따로 둔다.
- 특정 호스팅 업체에 종속될 필요는 없다. 서버 API, 영속 DB, 이미지 저장소, 주기적 만료 정리를 제공하면 된다.
- 정적 파일 업로드만 가능한 호스팅에서는 서버 동기화·이미지 삭제·자동 정리까지 그대로 구현할 수 없다. 서버 기능의 실행 위치를 별도로 정한다.
- 서버 저장의 형태는 `revision + payload`이며 비교 후 저장하는 CAS 방식이다.
- 읽기는 `GET /todo/api/state`, 저장은 `PUT /todo/api/state`로 제공할 수 있다. 경로를 바꾸면 모든 정적 파일 경로와 API 경로도 함께 변경한다.
- PUT 입력은 `{ revision, payload }`, 정상 응답은 새 revision과 payload, 충돌 시 HTTP 409와 최신 서버 상태다.
- 별도 항목의 동시 변경은 합친다. 삭제가 오래된 수정 때문에 되살아나면 안 된다. 배열 순서 변경 시 다른 기기에서 새로 추가한 항목도 보존한다.
- 같은 필드의 충돌은 공통 스냅샷 대비 로컬 변경을 최신 서버 상태에 다시 적용하는 정책으로 일관되게 처리한다.
- 다른 기기 변경 확인 주기는 약 5초다. 입력·설정·템플릿·드래그 중에는 화면 적용을 미룬다. **제자리 textarea 편집도 이 보호에 포함한다.**
- 최근 서버 상태와 미전송 변경을 로컬 캐시에 보관한다. 재접속·다음 열기 후 병합해 전송한다.
- 요청 제한 시간은 15초, 연속 충돌은 한 번에 5회까지 재시도한 뒤 대기 상태를 표시하는 기준을 사용할 수 있다.
- 이미지 업로드는 `POST /todo/api/images`, 개별 파일 읽기는 `GET /todo/api/images/<uuid>` 형태다. 이미지별 실제 키와 MIME 타입은 서버에 보관한다.
- 서버에서 PNG·JPEG·WebP의 MIME과 실제 파일 시그니처를 검증한다. 서버의 이미지 1개 상한은 1,500,000바이트다.
- 전체 상태 요청은 1,500,000자 이하로 제한하고 허용 필드·타입·길이·ID 중복을 검증한다.
- 이미지 제거·교체·프로젝트 삭제 뒤 마지막 참조가 사라지면 실제 서버 파일도 삭제한다. 다른 곳에서 참조 중인 파일을 지우지 않는다.
- 삭제 실패는 재시도 가능한 상태로 남기고 다음 요청과 정기 작업에서 재처리한다. 업로드 후 상태에 연결되지 않은 파일은 하루 뒤 정리한다.
- 완료 항목의 30일 만료와 이미지 정리는 서버에서도 매시간 처리한다. 유저가 앱을 열어 두지 않아도 만료를 수행한다.
- API·이미지 응답은 오래된 캐시 때문에 내용이 섞이지 않게 관리하고, 브라우저 파일 주소와 서버 저장 구조를 분리한다.
- 코드 저장소의 main 변경을 자동 배포와 연결할 수 있다. 배포 시 기존 DB를 초기화하지 않는다.
- 기존 계정, 운영 도메인, DB ID, 버킷 ID, 개인 파일 또는 인증 정보를 복사하지 않는다. 설치자의 새 자원으로 설정한다.

## 15. 동적 DOM 예시

다음 구조를 기준으로 렌더링한다. 본문 편집은 `.task-text`를 숨기고 같은 위치에 `.task-inline-input`을 삽입한다. 고칠 때와 저장할 때 행의 왼쪽 위치를 바꾸지 않는다.

```html
<section class="section" data-section-id="section-id" aria-labelledby="section-section-id">
  <div class="section-heading">
    <button class="section-toggle" type="button" aria-expanded="true"
      aria-controls="section-body-section-id" aria-label="할 일 섹션 접기">
      <!-- 9절의 16px SVG -->
    </button>
    <button class="section-drag-handle" type="button" aria-label="할 일 섹션 위치 변경"></button>
    <h2 id="section-section-id">할 일</h2>
    <button class="edit-button" type="button" aria-label="할 일 섹션 이름 수정"></button>
  </div>
  <div class="section-body" id="section-body-section-id">
    <ul class="task-list" aria-label="할 일 목록">
      <li class="task-item">
        <div class="task-row">
          <div class="task-label">
            <input type="checkbox" class="task-checkbox" data-task-id="task-id" aria-label="예시 항목 완료">
            <button type="button" class="task-text" data-task-id="task-id" aria-label="예시 항목 내용 수정">예시 항목</button>
          </div>
          <button class="edit-button" type="button" aria-label="예시 항목 할 일 수정"></button>
          <button class="edit-button delete-button" type="button" aria-label="예시 항목 할 일 삭제"></button>
          <button class="subtask-add" type="button" aria-label="예시 항목에 하위 할 일 추가">+ 하위</button>
        </div>
        <ul class="task-list subtask-list" aria-label="예시 항목 하위 할 일"></ul>
        <!-- 필요한 경우 하위 추가 폼 -->
      </li>
    </ul>
    <button class="add-task" type="button"><span class="add-task-icon" aria-hidden="true">+</span>할 일 추가</button>
    <!-- 필요한 경우 새 할 일 추가 폼 -->
  </div>
</section>
```

## 16. 완료 전 검수표

- [ ] 실제 SUIT Variable이 로딩되고 섹션 16/700, 본문·제자리 입력 16/400으로 표시된다.
- [ ] PC 2열, 모바일 2화면 전환이 구현되고 모바일 브랜드 영역이 사라진다.
- [ ] 390px·700px·701px·1280px에서 가로 스크롤과 잘린 조작 버튼이 없다.
- [ ] 섹션 제목 x좌표와 구분선 시작 x좌표가 같다.
- [ ] 접기 버튼 24px, SVG 16px, 버튼 오른쪽과 제목 사이 8px이다.
- [ ] 접기 상태가 새로고침·이동·프로젝트 전환 후 유지된다.
- [ ] 본문과 연필 클릭은 제자리 수정이고, 동그라미 클릭만 완료 처리다.
- [ ] Enter 저장, 바깥 클릭 저장, Esc 취소, 빈 내용 복원, IME 조합이 정상이다.
- [ ] 긴 하위 할 일을 모바일에서 수정해도 입력칸이 줄바꿈되고 저장 내용이 유지된다.
- [ ] 수정 중 완료 버튼을 클릭하면 수정본이 저장된 뒤 보관된다.
- [ ] 보관된 항목을 고쳐도 완료 상태·완료 시각이 바뀌지 않는다.
- [ ] 다른 기기의 변경이 편집 중 입력을 덮어쓰지 않고, 저장 후 양쪽 변경을 보존한다.
- [ ] 미전송 수정은 오프라인·재접속·앱 다시 열기 후에도 유지된다.
- [ ] 모든 완료 항목은 맨 아래 하나의 보관 영역에 모이고 원래 경로로 복원된다.
- [ ] 프로젝트 보관과 할 일 30일 만료를 혼동하지 않는다.
- [ ] 템플릿 취소가 원본을 바꾸지 않고, 복제한 프로젝트의 ID와 체크 상태가 독립적이다.
- [ ] 7개 추천색, 수동 색상, 전체·개별 테마와 전체·개별 화면 모드가 독립적으로 동작한다.
- [ ] 라이트·다크 각각 이미지 유무를 검사한다. 이미지 위 흰 카드·행별 박스가 없다.
- [ ] 프로젝트별 이미지 전환과 제거 후 서버 파일 정리가 정상이다.
- [ ] 일반 추가 폼은 빈 입력만 바깥 클릭 취소되고, 내용 있는 입력은 유지된다.
- [ ] 삭제는 확인을 거치고 저장·오프라인·삭제 재시도 상태가 표시된다.
- [ ] 개인 식별 정보나 실제 운영 데이터를 예시·기본값·샘플 이미지에 포함하지 않는다.
- [ ] 구현 완료 후 저장·동기화 로직과 디자인 변경을 분리해 되돌릴 수 있게 커밋한다.

## 부록 A. 전체 기준 CSS

설명에서 생략된 작은 상태·여백도 이 CSS를 따른다. 이 블록은 파일 하나로 저장해 사용할 수 있다. CSS 변수의 런타임 갱신은 부록 C도 구현한다.

```css
@font-face {
  font-family: "SUIT Variable";
  src: url("https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.woff2") format("woff2-variations");
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
}
* { box-sizing: border-box; }
:root { --gradient-start: #fff8cf; --gradient-end: #fffdf6; --accent: #ffda75; --accent-soft: #fff8e3; --accent-light: #ffebb3; --accent-ink: #302c23; --skin-surface: #fffefa; --skin-workspace: #fffefa; --skin-ink: #35352f; --skin-muted: #716b5b; --skin-border: #eee3bb; font-family: "SUIT Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", "Malgun Gothic", sans-serif; font-weight: 400; color: var(--skin-ink); background: var(--skin-surface); color-scheme: light; font-synthesis: none; }
body { margin: 0; }
.app-background { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end)); }
.has-background-image .app-background { background-image: var(--background-image); background-size: cover; background-position: center; }
.has-background-image { --skin-ink: #101718; --skin-muted: #101718; }
.has-background-image .app-background::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, #fffffff0 0%, #ffffffd9 288px, #ffffff99 58%, #ffffff80 100%); }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
button, input { -webkit-tap-highlight-color: transparent; }
button:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible { outline: 3px solid var(--skin-muted); outline-offset: 3px; }
button { color: inherit; }
.ui-icon { display: block; width: 16px; height: 16px; flex-shrink: 0; shape-rendering: geometricPrecision; }
.sidebar-add > span[aria-hidden="true"] { display: grid; place-items: center; flex: 0 0 16px; height: 24px; }
.project-symbol { display: grid; place-items: center; flex: 0 0 16px; }
.subtask-add { display: inline-flex; align-items: center; justify-content: center; gap: 4px; }
#back-to-projects { display: inline-flex; align-items: center; gap: 6px; }
[hidden] { display: none !important; }
.app-shell { position: relative; z-index: 1; min-height: 100dvh; display: grid; grid-template-columns: 288px minmax(0, 1fr); background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end)); }
.has-background-image .app-shell { background: transparent; }
.sidebar { position: sticky; top: 0; align-self: start; height: 100dvh; overflow-y: auto; padding: 36px 18px; background: #ffffffcc; border-right: 1px solid #ffffff80; }
.has-background-image .sidebar { background: #ffffff26; }
.has-background-image .project-link:not([aria-current="page"]) { background: #ffffff80; }
.has-background-image .sidebar-add { background: #ffffff80; }
.has-background-image .project-link:hover, .has-background-image .sidebar-add:hover { background: var(--accent-soft); }
.brand-row { margin: 0 0 26px; }
.brand { display: grid; grid-template-columns: 34px minmax(0, 1fr) 44px; align-items: start; column-gap: 12px; min-width: 0; font-weight: 800; }
.brand-actions { display: flex; align-items: center; padding-top: 3px; }
.mobile-project-settings { display: none !important; }
.brand-text { font-size: 15px; line-height: 1.5; letter-spacing: -.025em; word-break: keep-all; overflow-wrap: anywhere; min-width: 0; padding-top: calc((34px - 1.5em) / 2); }
.brand-text { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.brand-text.has-line-break { display: block; }
.brand-name-line { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.brand-name-input { display: block; width: 100%; min-height: 72px; padding: 10px 12px; border: 1px solid var(--skin-border); border-radius: 8px; background: #fff; color: var(--skin-ink); font-size: 16px; line-height: 1.5; resize: none; }
.brand-name-input:focus-visible { outline: 3px solid var(--skin-muted); outline-offset: 3px; }
.brand-name-help { margin-top: 8px; }
:root[data-color-mode="dark"] .brand-name-input { background: #15191f; border-color: var(--skin-border); }
.brand-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 12px; background: linear-gradient(135deg, var(--accent-light), var(--accent-light)); font-size: 22px; color: var(--skin-ink); box-shadow: 0 4px 12px #44382015; }
.brand-mark.has-logo { background: transparent; box-shadow: none; border-radius: 50%; overflow: hidden; }
.brand-mark img { width: 34px; height: 34px; object-fit: cover; border-radius: 50%; }
.sidebar-heading { display: flex; align-items: center; justify-content: space-between; padding: 0 12px; margin-bottom: 10px; }
.sidebar-heading h2 { font-size: 12px; font-weight: 700; color: var(--skin-muted); margin: 0; letter-spacing: .02em; }
.icon-button { display: grid; place-items: center; border: 0; background: transparent; width: 32px; height: 32px; border-radius: 8px; font-size: 23px; color: var(--skin-muted); }
.icon-button:hover { background: var(--accent-soft); }
#project-list { display: flex; flex-direction: column; gap: 5px; }
.project-link { width: 100%; display: flex; align-items: center; gap: 10px; text-align: left; border: 1px solid transparent; background: transparent; border-radius: 10px; padding: 12px 14px; font-size: 14px; min-height: 44px; }
.project-link:hover { background: var(--accent-soft); }
.project-link[aria-current="page"] { background: linear-gradient(100deg, var(--accent-light), var(--accent-soft)); border-color: var(--accent-light); font-weight: 700; }
.project-symbol { color: var(--skin-muted); font-size: 18px; font-weight: 400; }
.project-label { overflow-wrap: anywhere; min-width: 0; }
.project-entry { display: flex; align-items: center; min-width: 0; gap: 2px; }
.project-drag-handle { display: grid; place-items: center; flex: 0 0 20px; width: 20px; height: 32px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--skin-muted); cursor: grab; touch-action: none; opacity: .55; }
.project-drag-handle:hover, .project-drag-handle:focus-visible { background: var(--accent-soft); opacity: 1; }
.project-drag-handle:disabled { cursor: default; opacity: .25; }
.project-entry.is-dragging { opacity: .65; background: var(--accent-soft); outline: 1px dashed var(--skin-muted); border-radius: 9px; }
.project-dragging, .project-dragging * { cursor: grabbing !important; user-select: none; }
.project-entry .project-link { flex: 1; min-width: 0; width: auto; padding-right: 6px; }
.project-actions { display: flex; flex: 0 0 auto; gap: 1px; }
.project-actions .project-action { width: 25px; height: 32px; opacity: .5; }
.project-entry:hover .project-action, .project-entry:focus-within .project-action { opacity: 1; }
.project-archive { margin: 12px 0 4px; }
.project-archive summary { padding: 10px 12px; font-size: 12px; color: var(--skin-muted); cursor: pointer; }
.archived-project-label { flex: 1; min-width: 0; font-size: 13px; padding: 10px 8px 10px 12px; overflow-wrap: anywhere; color: var(--skin-muted); }
.empty-projects { margin-top: 20px; }
.sidebar-add { display: flex; align-items: center; gap: 10px; width: 100%; padding: 13px 14px; background: none; border: 0; border-radius: 9px; margin-top: 8px; color: var(--skin-muted); font-size: 13px; text-align: left; min-height: 44px; }
.sidebar-add span { font-size: 20px; color: var(--skin-muted); }
.sidebar-add:hover { background: var(--accent-soft); }
.template-add { margin-top: 2px; font-size: 12px; }
.workspace { position: relative; padding: 40px clamp(24px, 5vw, 80px) 60px; min-width: 0; background: linear-gradient(#ffffffef, #ffffffef), linear-gradient(135deg, var(--gradient-start), var(--gradient-end)); }
.content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
.has-background-image .workspace { background: transparent; }
.has-background-image .workspace::before { content: ""; position: fixed; inset: 0 0 0 288px; z-index: 0; pointer-events: none; background: linear-gradient(90deg, transparent, #ffffff38 12%, #ffffff80 34%, #ffffff80 68%, #ffffff26 90%, transparent); }
.has-background-image .content { background: transparent; }
.has-background-image h1, .has-background-image .section-heading h2 { text-shadow: 0 1px 8px #ffffffb3; }
.has-background-image .project-header { border-bottom-color: #ffffff80; }
.has-background-image .task-text { font-weight: 400; }
.has-background-image .add-task { text-shadow: 0 1px 5px #ffffffb3; }
.has-background-image .task-archive > .task-list { background: #ffffff26; }
.has-background-image .subtask-list { border-left-color: #ffffff80; }
.has-background-image .section-button { background: #ffffff80; border-color: #ffffff99; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.project-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--skin-border); margin-bottom: 28px; }
.eyebrow { margin: 0 0 8px; color: var(--skin-muted); font-size: 10px; font-weight: 700; letter-spacing: .14em; }
h1 { font-size: clamp(25px, 2.5vw, 30px); font-weight: 800; letter-spacing: -.035em; line-height: 1.4; margin: 0; overflow-wrap: anywhere; }
.button { padding: 9px 15px; min-height: 40px; border-radius: 8px; border: 1px solid transparent; font-size: 13px; font-weight: 700; white-space: nowrap; }
.primary { background: var(--accent); border-color: transparent; color: var(--accent-ink); }
.primary:hover { filter: brightness(.96); }
.quiet { background: var(--accent-soft); color: var(--skin-muted); }
.quiet:hover { background: var(--accent-light); }
.section-button { background: var(--accent-soft); border-color: var(--accent-light); color: var(--skin-muted); display: flex; align-items: center; gap: 7px; }
.section-button:hover { background: var(--accent-light); }
.section-button span { font-size: 18px; line-height: 1; font-weight: 400; }
.section { margin-bottom: 30px; }
.section-heading { position: relative; display: flex; align-items: center; gap: 8px; min-height: 36px; padding: 0 0 6px; margin: 0 0 4px; border-bottom: 1px solid color-mix(in srgb, var(--skin-muted) 15%, transparent); }
.section-heading h2 { flex: 1; min-width: 0; font-size: 16px; font-weight: 700; letter-spacing: -.015em; line-height: 1.5; margin: 0; overflow-wrap: anywhere; }
.section-heading > .edit-button { width: 32px; height: 32px; opacity: .5; }
.section-heading > .section-drag-handle { order: 1; }
.section-heading > .edit-button { order: 2; }
.section-toggle { position: absolute; left: -32px; top: calc(50% - 3px); transform: translateY(-50%); display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 5px; background: transparent; color: var(--skin-muted); }
.section-toggle svg { width: 16px; height: 16px; transition: transform .15s; }
.section-toggle[aria-expanded="false"] svg { transform: rotate(-90deg); }
.section-toggle:hover { background: var(--accent-soft); color: var(--workspace-accent); }
.task-list { margin: 0; padding: 0; list-style: none; }
.task-row { display: flex; align-items: center; gap: 4px; min-height: 40px; border: 0; border-radius: 6px; background: transparent; padding: 0 8px; }
.task-row > .edit-button { width: 32px; height: 32px; opacity: .4; transition: opacity .15s; }
.task-row > .subtask-add { opacity: .65; }
.task-row:focus-within > .edit-button, .task-row:focus-within > .subtask-add { opacity: 1; }
@media (hover: hover) and (pointer: fine) {
  .section-heading > .section-drag-handle, .section-heading > .edit-button { opacity: 0; transition: opacity .15s; }
  .section:hover > .section-heading > .section-drag-handle, .section:hover > .section-heading > .edit-button,
  .section:focus-within > .section-heading > .section-drag-handle, .section:focus-within > .section-heading > .edit-button { opacity: 1; }
  .task-row:hover { background: var(--accent-soft); }
  .has-background-image .task-row:hover { background: #ffffff38; }
  .task-row:hover > .edit-button, .task-row:hover > .subtask-add { opacity: 1; }
}
@media (hover: none) { .task-row > .edit-button { opacity: .65; } }
.task-item { min-width: 0; }
.subtask-list { margin-left: 26px; border-left: 1px solid var(--skin-border); padding-left: 10px; }
.subtask-list .subtask-list { margin-left: 10px; }
.subtask-add { flex: 0 0 auto; border: 0; background: transparent; color: var(--skin-muted); font-size: 12px; min-height: 32px; padding: 6px; border-radius: 6px; }
.subtask-add:hover { background: var(--accent-soft); }
.subtask-form { margin-left: 26px; }
.task-archive { margin-top: 22px; border-top: 1px solid var(--skin-border); }
.task-archive summary { cursor: pointer; padding: 11px 4px; min-height: 40px; font-size: 12px; color: var(--skin-muted); }
.task-archive > .task-list { background: var(--skin-surface); padding: 0 6px; border-radius: 8px; }
.task-item > .task-archive { margin-left: 26px; }
.archive-note { margin: 0 4px 5px; color: var(--skin-muted); font-size: 11px; line-height: 1.6; }
.mobile-toolbar { display: none; }
.task-label { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; min-height: 40px; }
.task-checkbox { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; border: 1.5px solid #cac5b4; border-radius: 50%; flex: 0 0 auto; margin: 2px 0 0; display: grid; place-items: center; background: #fff; cursor: pointer; transition: background .15s, border-color .15s; }
.task-checkbox:hover { background: var(--accent-soft); border-color: #82765a; }
.task-checkbox:checked { background: var(--accent); border-color: var(--accent); }
.task-checkbox:checked::after { content: ""; width: 7px; height: 4px; border-left: 1.8px solid var(--accent-ink); border-bottom: 1.8px solid var(--accent-ink); transform: translateY(-1px) rotate(-45deg); }
.task-text { display: block; flex: 1; padding: 0; border: 0; border-radius: 3px; background: transparent; color: inherit; text-align: left; cursor: pointer; font-size: 16px; font-weight: 400; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; min-width: 0; }
.task-inline-input { display: block; flex: 1; width: 100%; min-width: 0; min-height: 24px; padding: 0; margin: 0; border: 0; border-radius: 0; background: transparent; color: var(--skin-ink); resize: none; overflow: hidden; font-size: 16px; font-weight: 400; line-height: 1.5; }
.task-inline-input:focus { outline: none; box-shadow: 0 1px 0 var(--workspace-accent); }
.task-checkbox:checked + .task-text { color: var(--skin-muted); opacity: .55; text-decoration: line-through; }
.add-task { display: flex; align-items: center; gap: 10px; border: 0; border-radius: 6px; background: none; padding: 8px; min-height: 40px; color: var(--skin-muted); font-size: 14px; line-height: 1.5; }
.add-task .add-task-icon { display: grid; place-items: center; flex: 0 0 18px; width: 18px; height: 22px; font-size: 23px; font-weight: 400; line-height: 1; }
.add-task:hover, .add-task:focus-visible { color: var(--accent-ink); }
.add-task:hover .add-task-icon, .add-task:focus-visible .add-task-icon { border-radius: 50%; background: var(--accent); color: var(--accent-ink); }
.task-form, .name-form { background: var(--skin-surface); border: 1px solid var(--skin-border); box-shadow: 0 4px 18px #655b2710; border-radius: 11px; padding: 12px; }
.task-form { margin: 8px 8px 10px; padding: 12px 14px; background: #fffffff5; border: 1px solid color-mix(in srgb, var(--skin-muted) 25%, transparent); border-radius: 10px; box-shadow: none; }
.task-form:focus-within { border-color: color-mix(in srgb, var(--skin-muted) 55%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--skin-muted) 8%, transparent); }
.task-form.subtask-form { margin-left: 36px; }
.task-label.template-task-label { padding-left: 28px; }
.task-form input, .name-form input { width: 100%; min-height: 40px; padding: 10px 9px; border: 0; border-radius: 5px; color: var(--skin-ink); background: transparent; font-size: 14px; }
.task-form input { padding: 4px 0 8px; min-height: 38px; font-size: 15px; line-height: 1.5; border-radius: 0; }
.task-form input:focus-visible { outline: none; }
.workspace button:focus-visible, .workspace .task-checkbox:focus-visible, .workspace summary:focus-visible { outline-width: 2px; outline-offset: 2px; }
.task-form .form-actions { align-items: center; margin-top: 8px; gap: 8px; }
.task-form .button { min-height: 36px; padding: 7px 14px; font-size: 13px; border-radius: 6px; }
.task-form .quiet { background: #f1f1ef; color: var(--skin-muted); }
.task-form .quiet:hover { background: #e8e8e5; }
.task-form .primary:disabled { cursor: default; opacity: .45; filter: none; }
input::placeholder { color: var(--skin-muted); opacity: .75; }
.form-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 9px; }
.name-form { margin: 10px 0; }
.section-form { margin: -8px 0 26px; }
.save-message { color: var(--skin-muted); font-size: 13px; line-height: 1.6; }
.save-message.is-error { color: #9a4b36; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.project-heading { min-width: 0; }
.title-row { display: flex; align-items: center; gap: 0; }
.title-row h1 { min-width: 0; margin-right: 7px; }
.edit-button { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 auto; padding: 0; border: 0; border-radius: 8px; background: transparent; color: var(--skin-muted); }
.edit-button:hover { background: var(--accent-soft); color: var(--skin-ink); }
.brand-edit { width: 22px; height: 28px; }
.brand-edit svg { width: 16px; height: 16px; }
.brand-actions svg { display: block; width: 16px; height: 16px; shape-rendering: geometricPrecision; }
.task-label { flex: 1; min-width: 0; }
.settings-button { display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--skin-muted); padding: 0; width: 28px; height: 28px; }
.brand-actions .settings-button { width: 22px; }
.settings-button:hover { background: var(--accent-soft); }
.template-row { display: flex; align-items: center; gap: 2px; }
.template-row .sidebar-add { flex: 1; min-width: 0; }
.template-row .edit-button { flex: 0 0 30px; }
.template-editor-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px; margin-bottom: 18px; border: 1px solid var(--accent-light); border-radius: 10px; background: var(--accent-soft); }
.template-editor-bar p { margin: 0; font-size: 12px; line-height: 1.5; }
.template-editor-bar .form-actions { margin: 0; }
.template-task-label { cursor: default; }
.delete-button:hover, .danger { background: #fbeae5; color: #9a3a28; }
.archive-group { margin: 10px 0 16px; }
.archive-group h3 { margin: 0 0 6px; color: var(--skin-muted); font-size: 12px; }
.archive-path { margin: 7px 4px 3px; color: var(--skin-muted); font-size: 11px; }
.section-drag-handle { flex: 0 0 20px; display: grid; place-items: center; width: 20px; height: 32px; border: 0; border-radius: 6px; padding: 0; background: transparent; color: var(--skin-muted); cursor: grab; touch-action: none; opacity: .55; }
.section-drag-handle:hover { background: var(--accent-soft); }
.section.is-dragging { opacity: .65; background: var(--accent-soft); outline: 1px dashed var(--skin-muted); border-radius: 9px; }
.section-dragging, .section-dragging * { cursor: grabbing !important; user-select: none; }
#delete-description { margin: 16px 0 0; }
.field-label { display: block; margin: 12px 0 7px; font-size: 12px; color: var(--skin-muted); }
select { width: 100%; min-height: 42px; padding: 8px; border: 1px solid var(--skin-border); border-radius: 7px; color: var(--skin-ink); background: #fff; font-size: 13px; }
dialog { border: 1px solid var(--skin-border); border-radius: 18px; padding: 0; background: var(--skin-surface); color: var(--skin-ink); width: min(420px, calc(100% - 32px)); max-height: calc(100dvh - 40px); overflow-y: auto; box-shadow: 0 20px 70px #302b2426; }
dialog::backdrop { background: #35302540; }
.dialog-content { padding: 26px; }
.dialog-content h2 { margin: 0; font-size: 20px; letter-spacing: -.03em; }
.dialog-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.dialog-content input:not([type="color"]):not([type="file"]):not([type="radio"]) { width: 100%; min-height: 46px; padding: 11px 12px; border: 1px solid var(--skin-border); border-radius: 8px; background: #fff; color: var(--skin-ink); font-size: 16px; }
.dialog-content .form-actions { margin-top: 22px; }
.template-exit-actions { flex-wrap: wrap; }
.settings-caption { font-size: 13px; color: var(--skin-muted); line-height: 1.6; margin: 8px 0 25px; }
fieldset { min-width: 0; border: 0; padding: 0; margin: 0 0 24px; }
fieldset:last-child { margin-bottom: 0; }
legend { padding: 0; font-size: 14px; font-weight: 700; margin-bottom: 12px; }
.color-fields { display: flex; gap: 14px; }
.color-fields label { flex: 1; min-width: 0; font-size: 12px; color: var(--skin-muted); }
input[type="color"] { display: block; width: 100%; height: 46px; margin-top: 8px; padding: 5px; border: 1px solid var(--skin-border); border-radius: 9px; background: #fff; cursor: pointer; }
input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
input[type="color"]::-webkit-color-swatch { border: 0; border-radius: 5px; }
.field-help { margin: 0 0 12px; color: var(--skin-muted); font-size: 12px; line-height: 1.65; }
.image-preview { display: block; width: 100%; height: 125px; object-fit: cover; border: 1px solid var(--skin-border); border-radius: 10px; margin-bottom: 8px; }
.image-name { margin: 0 0 12px; font-size: 12px; color: var(--skin-muted); overflow-wrap: anywhere; }
.image-actions { display: flex; flex-wrap: wrap; gap: 8px; }
#image-message, #logo-message { margin: 12px 0 0; }
#image-message.is-error, #logo-message.is-error { color: #9a4b36; }
.logo-preview { display: block; width: 64px; height: 64px; object-fit: cover; border-radius: 50%; margin-bottom: 12px; }
.theme-presets { display: flex; flex-wrap: wrap; gap: 6px; }
.theme-dot { display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 0; background: transparent; border-radius: 50%; }
.theme-dot::before { content: ""; width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, var(--preset-start), var(--preset-accent)); box-shadow: inset 0 0 0 1px #0000000d; }
.theme-dot[aria-pressed="true"]::before { outline: 2px solid var(--skin-muted); outline-offset: 3px; }
.theme-dot:hover::before { transform: scale(1.08); }
.brand-save { margin-top: 8px; }
.background-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 4px; border: 1px solid var(--skin-border); border-radius: 10px; background: color-mix(in srgb, var(--skin-muted) 5%, var(--skin-surface)); }
.background-options label { position: relative; display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 42px; padding: 9px 8px; border-radius: 7px; color: var(--skin-muted); font-size: 13px; font-weight: 600; cursor: pointer; }
.background-options input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.background-options label:has(input:checked) { background: var(--accent-light); color: var(--skin-ink); box-shadow: 0 1px 3px #00000008; }
.background-options label:has(input:checked)::before { content: '✓'; font-size: 14px; line-height: 1; }
.background-options label:has(input:focus-visible) { outline: 2px solid var(--skin-muted); outline-offset: 2px; }
.background-options label:has(input:disabled) { cursor: wait; opacity: .6; }
#theme-presets-field { margin-bottom: 10px; }
#background-mode-help { margin-bottom: 24px; }
.image-description { margin: 12px 0 0; }
#image-message:not([hidden]) { margin: 0 0 24px; }
button:disabled { cursor: wait; opacity: .6; }
.sidebar button:disabled, #back-to-projects:disabled { cursor: default; }
@media (max-width: 700px) {
  .app-shell { display: block; }
  .app-shell[data-mobile-screen="tasks"] .sidebar { display: none; }
  .app-shell[data-mobile-screen="projects"] .workspace { display: none; }
  .sidebar { position: relative; height: auto; min-height: 100dvh; overflow-y: visible; padding: 16px 18px 40px; border-right: 0; border-bottom: 0; }
  .has-background-image .app-background::after { background: linear-gradient(180deg, #ffffff99, #ffffff8c 50%, #ffffff99); }
  .has-background-image .workspace::before { left: 0; background: linear-gradient(90deg, #ffffff30, #ffffff80 18%, #ffffff80 82%, #ffffff30); }
  .brand-row { margin: 0; }
  .brand { display: none; }
  .mobile-project-settings { display: grid !important; position: absolute; top: 16px; right: 18px; }
  .sidebar-heading { padding: 0 60px 0 0; margin-bottom: 20px; min-height: 44px; }
  .sidebar-heading h2 { font-size: 22px; color: var(--skin-ink); letter-spacing: -.03em; }
  .sidebar-heading .icon-button { width: 44px; height: 44px; }
  #project-list { flex-direction: column; overflow: visible; padding: 0; gap: 10px; }
  .project-link { width: 100%; flex: 0 0 auto; padding: 18px 16px; max-width: none; background: #ffffffcf; font-size: 15px; }
  .project-label { overflow-wrap: anywhere; white-space: normal; }
  .project-entry .project-link { flex: 1; width: auto; }
  .project-drag-handle { flex-basis: 28px; width: 28px; height: 44px; opacity: .7; }
  .project-actions .project-action { width: 36px; min-width: 36px; height: 40px; opacity: .7; }
  .sidebar-add { display: flex; background: #ffffffcf; }
  .name-form { max-width: 100%; }
  .workspace { padding: 12px 16px 48px; min-height: 100dvh; }
  .mobile-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 18px; }
  .mobile-toolbar .button { padding: 8px 10px; font-size: 12px; }
  .project-header { align-items: center; gap: 8px; margin-bottom: 22px; padding-bottom: 16px; }
  h1 { font-size: 23px; }
  .section-button { padding: 8px 11px; font-size: 12px; min-height: 42px; }
  .eyebrow { display: none; }
  .task-label { padding: 10px 0; gap: 14px; min-height: 44px; }
  .task-checkbox { width: 22px; height: 22px; }
  .task-row { gap: 2px; }
  .subtask-add { min-height: 40px; min-width: 36px; padding: 5px 2px; }
  .subtask-list { margin-left: 15px; padding-left: 5px; }
  .subtask-form, .task-item > .task-archive { margin-left: 15px; }
  .task-form input, .name-form input, select { font-size: 16px; }
  .task-form { margin: 8px 4px 10px; padding: 12px; }
  .task-form.subtask-form { margin-left: 44px; }
  .task-label.template-task-label { padding-left: 36px; }
  .task-form .button { min-height: 44px; }
  .button { min-height: 44px; }
  .edit-button { width: 32px; min-width: 32px; min-height: 36px; }
  .settings-button { width: 40px; min-width: 40px; min-height: 40px; }
  .section-drag-handle { flex-basis: 28px; width: 28px; min-height: 40px; }
  .section-heading > .edit-button { width: 36px; min-width: 36px; min-height: 40px; }
  .template-editor-bar { align-items: stretch; flex-direction: column; }
  .template-editor-bar .form-actions { justify-content: flex-end; }
  .title-row h1 { margin-right: 8px; }
  .section-heading { gap: 8px; padding-bottom: 4px; margin-bottom: 4px; }
  #sections { padding-left: 32px; }
  .section-toggle { top: calc(50% - 2px); }
  .dialog-content { padding: 22px; }
  .section { margin-bottom: 24px; }
  .add-task { min-height: 44px; padding: 10px 8px; gap: 14px; }
  .add-task .add-task-icon { flex-basis: 22px; width: 22px; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }

.project-appearance-controls { margin-bottom: 24px; }
.project-settings-button { flex-shrink: 0; }
.title-row h1 { overflow-wrap: anywhere; min-width: 0; }

.color-mode-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.color-mode-options label { display: flex; align-items: center; gap: 9px; min-height: 44px; padding: 10px 12px; border: 1px solid var(--skin-border); border-radius: 8px; font-size: 14px; cursor: pointer; }
.color-mode-options label:has(input:checked) { background: var(--accent-soft); border-color: var(--accent-light); font-weight: 700; }
.color-mode-options input { width: 17px; height: 17px; margin: 0; accent-color: var(--accent); }
.color-mode-help { margin: 9px 0 0; }
.color-mode-inherit { grid-column: 1 / -1; }

/* Workspace accent polish: keep this block separate for a focused rollback. */
.workspace #project-title { color: var(--workspace-accent); }
.workspace .add-task, .workspace .subtask-add { color: var(--workspace-accent); }
.workspace .add-task:hover, .workspace .add-task:focus-visible,
.workspace .subtask-add:hover, .workspace .subtask-add:focus-visible { color: var(--workspace-accent); background: color-mix(in srgb, var(--workspace-accent) 10%, transparent); }
.workspace .add-task:hover .add-task-icon, .workspace .add-task:focus-visible .add-task-icon { background: transparent; color: inherit; }
.workspace .task-checkbox:hover { background: color-mix(in srgb, var(--workspace-accent) 12%, var(--skin-workspace)); border-color: var(--workspace-accent); }
.workspace .task-checkbox:checked { background: var(--workspace-accent); border-color: var(--workspace-accent); }
.workspace .task-checkbox:checked::after { border-color: #ffffff; }
:root[data-color-mode="dark"] .workspace .task-checkbox:hover { background: color-mix(in srgb, var(--workspace-accent) 12%, var(--skin-workspace)); border-color: var(--workspace-accent); }
:root[data-color-mode="dark"] .workspace .task-checkbox:checked { background: var(--workspace-accent); border-color: var(--workspace-accent); }
:root[data-color-mode="dark"] .workspace .task-checkbox:checked::after { border-color: #15191f; }
:root[data-color-mode="dark"] .workspace .add-task:hover,
:root[data-color-mode="dark"] .workspace .add-task:focus-visible { color: var(--workspace-accent); }

:root[data-color-mode="dark"] { color-scheme: dark; }
:root[data-color-mode="dark"] .sidebar { background: #171b22dd; border-right-color: var(--skin-border); }
:root[data-color-mode="dark"] .workspace { background: var(--skin-workspace); }
:root[data-color-mode="dark"] .has-background-image { --skin-ink: #edf0f4; --skin-muted: #b2b8c2; }
:root[data-color-mode="dark"] .has-background-image .app-background::after { background: linear-gradient(90deg, #11151bf2 0%, #11151bde 288px, #11151ba6 58%, #11151b99 100%); }
:root[data-color-mode="dark"] .has-background-image .sidebar { background: #11151b26; }
:root[data-color-mode="dark"] .has-background-image .workspace { background: transparent; }
:root[data-color-mode="dark"] .has-background-image .workspace::before { background: linear-gradient(90deg, transparent, #11151b26 12%, #11151b44 34%, #11151b44 68%, #11151b26 90%, transparent); }
:root[data-color-mode="dark"] .has-background-image .project-link:not([aria-current="page"]),
:root[data-color-mode="dark"] .has-background-image .sidebar-add { background: #1c202780; }
:root[data-color-mode="dark"] .has-background-image .project-link:hover,
:root[data-color-mode="dark"] .has-background-image .sidebar-add:hover { background: var(--accent-soft); }
:root[data-color-mode="dark"] .has-background-image h1,
:root[data-color-mode="dark"] .has-background-image .section-heading h2,
:root[data-color-mode="dark"] .has-background-image .add-task { text-shadow: 0 1px 8px #00000066; }
:root[data-color-mode="dark"] .has-background-image .project-header,
:root[data-color-mode="dark"] .has-background-image .subtask-list { border-color: var(--skin-border); }
:root[data-color-mode="dark"] .has-background-image .section-button,
:root[data-color-mode="dark"] .has-background-image .task-archive > .task-list { background: #1c202780; border-color: var(--skin-border); }
:root[data-color-mode="dark"] .has-background-image .task-row:hover { background: #ffffff0a; }
:root[data-color-mode="dark"] .task-checkbox { background: #232831; border-color: #747d8a; }
:root[data-color-mode="dark"] .task-checkbox:hover { background: var(--accent-soft); border-color: var(--accent); }
:root[data-color-mode="dark"] .task-checkbox:checked { background: var(--accent); border-color: var(--accent); }
:root[data-color-mode="dark"] .task-form { background: #1c2027f5; }
:root[data-color-mode="dark"] .task-form .quiet { background: #2c323d; }
:root[data-color-mode="dark"] .task-form .quiet:hover { background: #373f4b; }
:root[data-color-mode="dark"] .add-task:hover,
:root[data-color-mode="dark"] .add-task:focus-visible { color: var(--accent); }
:root[data-color-mode="dark"] select,
:root[data-color-mode="dark"] input[type="color"],
:root[data-color-mode="dark"] .dialog-content input:not([type="color"]):not([type="file"]):not([type="radio"]) { background: #15191f; border-color: var(--skin-border); }
:root[data-color-mode="dark"] dialog { box-shadow: 0 20px 70px #00000066; }
:root[data-color-mode="dark"] dialog::backdrop { background: #03070b99; }
:root[data-color-mode="dark"] .delete-button:hover,
:root[data-color-mode="dark"] .danger { background: #4a2928; color: #ffc1b4; }
:root[data-color-mode="dark"] .save-message.is-error,
:root[data-color-mode="dark"] #image-message.is-error,
:root[data-color-mode="dark"] #logo-message.is-error { color: #ffb5a6; }
@media (max-width: 700px) {
  :root[data-color-mode="dark"] .project-link,
  :root[data-color-mode="dark"] .sidebar-add { background: #232831cf; }
  :root[data-color-mode="dark"] .project-link[aria-current="page"] { background: linear-gradient(100deg, var(--accent-light), var(--accent-soft)); }
  :root[data-color-mode="dark"] .has-background-image .app-background::after { background: linear-gradient(180deg, #11151ba6, #11151b99 50%, #11151ba6); }
  :root[data-color-mode="dark"] .has-background-image .workspace::before { background: linear-gradient(90deg, #11151b26, #11151b66 18%, #11151b66 82%, #11151b26); }
}
```

## 부록 B. 중립적인 전체 HTML 뼈대

`app.js`에서 명세의 상태와 이벤트를 연결한다. 템플릿 관련 ID는 이 문서의 일반 명칭으로 통일했다. 문서 밖의 기존 서버나 계정을 자동으로 연결하지 않는다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#fff6c5">
    <title>My Todo List · 내 할 일</title>
    <link rel="stylesheet" href="styles.css">
    <script src="app.js" defer></script>
  </head>
  <body>
    <div class="app-background" aria-hidden="true"></div>
    <div class="app-shell" data-mobile-screen="tasks">
      <aside class="sidebar" aria-label="프로젝트">
        <div class="brand-row"><div class="brand"><span class="brand-mark" id="brand-mark" aria-hidden="true"><span id="brand-default">✓</span><img id="brand-image" alt="" hidden></span><span class="brand-text" id="brand-text">My Todo List</span><div class="brand-actions"><button class="edit-button brand-edit" id="edit-brand" type="button" aria-label="로고 문구 수정" title="로고 문구 수정"></button><button class="settings-button" id="open-settings" type="button" aria-label="설정" title="설정"></button></div></div></div>
        <button class="settings-button mobile-project-settings" id="project-list-settings" type="button" aria-label="설정" title="설정"></button>
        <div class="sidebar-heading"><h2 id="projects-heading" tabindex="-1">내 프로젝트</h2><button class="icon-button" id="new-project" type="button" aria-label="프로젝트 추가">+</button></div>
        <nav id="project-list" aria-label="프로젝트 목록"></nav>
        <details class="project-archive" id="project-archive" hidden><summary id="project-archive-summary">보관 프로젝트</summary><div id="archived-project-list" aria-label="보관 프로젝트 목록"></div></details>
        <form id="project-form" class="name-form" hidden novalidate>
          <label class="field-label" id="project-form-label" for="project-name">프로젝트 이름</label>
          <input id="project-name" maxlength="80" placeholder="프로젝트 이름" autocomplete="off" required>
          <div class="form-actions"><button class="button quiet" id="cancel-project" type="button">취소</button><button class="button primary" type="submit">추가</button></div>
        </form>
        <button class="sidebar-add" id="add-project" type="button"><span aria-hidden="true">+</span> 프로젝트 추가</button>
        <div class="template-row"><button class="sidebar-add template-add" id="add-templateA-project" type="button"><span aria-hidden="true">+</span> 제작 프로젝트 추가</button><button class="edit-button" id="edit-templateA-template" type="button" aria-label="제작 템플릿 수정" title="제작 템플릿 수정"></button></div>
        <div class="template-row"><button class="sidebar-add template-add" id="add-templateB-project" type="button"><span aria-hidden="true">+</span> 이식 프로젝트 추가</button><button class="edit-button" id="edit-templateB-template" type="button" aria-label="이식 템플릿 수정" title="이식 템플릿 수정"></button></div>
      </aside>
      <main class="workspace">
        <div class="content">
          <div class="mobile-toolbar"><button class="button quiet" id="back-to-projects" type="button">← 프로젝트 목록</button><button class="settings-button" id="mobile-settings" type="button" aria-label="설정" title="설정"></button></div>
          <div class="template-editor-bar" id="template-editor-bar" hidden><p>섹션과 하위 할 일을 편집한 뒤 저장하세요.</p><div class="form-actions"><button class="button quiet" id="cancel-template" type="button">수정 취소</button><button class="button primary" id="save-template" type="button">템플릿 저장</button></div></div>
          <header class="project-header"><div class="project-heading"><p class="eyebrow">MY PROJECT</p><div class="title-row"><h1 id="project-title"></h1><button class="edit-button" id="edit-project" type="button" aria-label="프로젝트 이름 수정"></button><button class="edit-button project-settings-button" id="project-settings" type="button" aria-label="프로젝트 배경 및 테마 설정" title="프로젝트 배경 및 테마 설정"></button></div></div><button class="button section-button" id="new-section" type="button"><span aria-hidden="true">+</span> 섹션 추가</button></header>
          <form id="section-form" class="name-form section-form" hidden>
            <label class="sr-only" for="section-name">섹션 이름</label>
            <input id="section-name" maxlength="80" placeholder="섹션 이름" autocomplete="off" required>
            <div class="form-actions"><button class="button quiet" id="cancel-section" type="button">취소</button><button class="button primary" type="submit">추가</button></div>
          </form>
          <div id="sections"></div>
          <p class="empty-projects field-help" id="empty-projects" hidden>프로젝트를 추가하거나 보관한 프로젝트를 다시 꺼내 주세요.</p>
          <div id="all-archives"></div>
          <p id="action-message" class="field-help" role="status" hidden></p>
          <p id="save-message" class="save-message" role="status" hidden></p>
        </div>
      </main>
    </div>
    <dialog id="edit-dialog" aria-labelledby="edit-title">
      <form id="edit-form" class="dialog-content">
        <h2 id="edit-title"></h2>
        <label class="field-label" id="edit-label" for="edit-value"></label>
        <input id="edit-value" autocomplete="off" required>
        <textarea class="brand-name-input" id="edit-brand-value" rows="2" maxlength="80" aria-describedby="edit-brand-help" required hidden disabled></textarea>
        <p class="field-help brand-name-help" id="edit-brand-help" hidden>Enter로 줄바꿈할 수 있어요. 최대 2줄 · 80자</p>
        <div class="form-actions"><button class="button quiet" id="cancel-edit" type="button">취소</button><button class="button primary" type="submit">저장</button></div>
      </form>
    </dialog>
    <dialog id="template-exit-dialog" aria-labelledby="template-exit-title" aria-describedby="template-exit-description"><div class="dialog-content"><h2 id="template-exit-title">변경 내용을 저장하시겠습니까?</h2><p id="template-exit-description" class="field-help">수정한 템플릿이 아직 저장되지 않았어요. 저장하지 않고 나가면 변경 내용은 사라집니다.</p><p id="template-save-error" class="save-message" role="alert" hidden>저장하지 못했어요. 변경 내용은 유지되어 있으니 계속 수정한 뒤 다시 저장해 주세요.</p><div class="form-actions template-exit-actions"><button class="button quiet" id="continue-template" type="button">계속 수정</button><button class="button quiet" id="discard-template" type="button">저장 안 함</button><button class="button primary" id="confirm-save-template" type="button">저장</button></div></div></dialog>
    <dialog id="delete-dialog" aria-labelledby="delete-title"><div class="dialog-content"><h2 id="delete-title">삭제</h2><p id="delete-description" class="field-help"></p><div class="form-actions"><button class="button quiet" id="cancel-delete" type="button">취소</button><button class="button danger" id="confirm-delete" type="button">삭제</button></div></div></dialog>
    <dialog id="settings-dialog" aria-labelledby="settings-title">
      <div class="dialog-content">
        <div class="dialog-heading"><h2 id="settings-title">설정</h2><button class="icon-button" id="close-settings" type="button" aria-label="설정 닫기">×</button></div>
        <p class="settings-caption" id="settings-caption">이미지와 색을 고르면 바로 적용되고 저장돼요.</p>
        <fieldset id="color-mode-settings"><legend>화면 모드</legend>
          <div class="color-mode-options"><label id="color-mode-inherit-option" class="color-mode-inherit" hidden><input type="radio" name="color-mode" id="color-mode-inherit" value="inherit"> 전체 설정 따르기</label><label><input type="radio" name="color-mode" id="color-mode-light" value="light"> 라이트</label><label><input type="radio" name="color-mode" id="color-mode-dark" value="dark"> 다크</label></div>
          <p id="color-mode-help" class="color-mode-help field-help">별도 화면 모드를 지정하지 않은 프로젝트에 적용되고, PC와 모바일에 함께 저장돼요.</p>
        </fieldset>
        <div id="project-appearance-controls" class="project-appearance-controls" hidden><p id="project-appearance-status" class="field-help"></p><button class="button quiet" id="reset-project-appearance" type="button">전체 기본 테마 사용</button></div>
        <fieldset class="logo-settings" id="logo-settings"><legend>로고</legend>
          <p class="field-help">문구 왼쪽의 로고를 원하는 이미지로 바꿀 수 있어요.</p>
          <img id="logo-preview" class="logo-preview" alt="선택한 로고" hidden>
          <input id="logo-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
          <div class="image-actions"><button class="button quiet" id="choose-logo" type="button">로고 이미지 선택</button><button class="button quiet" id="remove-logo" type="button" hidden>기본 로고로</button></div>
          <label class="field-label" for="brand-name-setting">로고 문구</label><textarea class="brand-name-input" id="brand-name-setting" rows="2" maxlength="80" aria-describedby="brand-name-help" required></textarea><p class="field-help brand-name-help" id="brand-name-help">Enter로 줄바꿈할 수 있어요. 최대 2줄 · 80자</p><button class="button quiet brand-save" id="save-brand-name" type="button">문구 저장</button>
          <p id="logo-message" class="field-help" role="status" hidden></p>
        </fieldset>
        <fieldset><legend>배경 방식</legend><div class="background-options"><label><input type="radio" name="background-mode" id="background-color-mode" value="color"><span>색상 테마</span></label><label><input type="radio" name="background-mode" id="background-image-mode" value="image"><span>이미지 배경</span></label></div></fieldset>
        <fieldset id="theme-presets-field"><legend>추천 색상</legend><div class="theme-presets" id="theme-presets" role="group" aria-label="추천 색상"></div></fieldset>
        <p id="background-mode-help" class="field-help">이미지 배경을 선택하면 사진을 고를 수 있어요.</p>
        <fieldset class="image-settings" id="background-image-settings" hidden><legend>배경 이미지</legend>
          <img id="image-preview" class="image-preview" alt="선택한 배경 이미지" hidden>
          <p id="image-name" class="image-name" hidden></p>
          <div class="image-actions"><button class="button primary" id="choose-image" type="button">이미지 변경</button><button class="button quiet" id="remove-image" type="button" hidden>삭제</button></div>
          <p class="field-help image-description">이미지 색상에 맞춰 테마가 바뀌어요.<br>메뉴와 글씨 뒤에는 그라데이션을 더해요.</p>
        </fieldset>
        <input id="sidebar-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
        <p id="image-message" class="field-help" role="status" hidden></p>
        <fieldset id="background-gradient-settings"><legend>배경 그라데이션</legend><div class="color-fields"><label for="gradient-start">시작 색<input id="gradient-start" type="color"></label><label for="gradient-end">끝 색<input id="gradient-end" type="color"></label></div></fieldset>
        <fieldset id="accent-color-settings"><legend>강조색</legend><div class="color-fields"><label for="accent-color">버튼과 체크 색<input id="accent-color" type="color"></label></div></fieldset>
      </div>
    </dialog>
  </body>
</html>
```

## 부록 C. 색상 혼합과 런타임 테마 적용

아래 함수의 `state`, `displayProject()`, `displayAppearance()`, `settingsProject`, `el(id)`, `syncThemePresets()`는 앞서 설명한 앱 상태와 DOM을 연결하는 함수다. `displayProject()`는 전체 설정에서 null, 프로젝트 설정에서 해당 프로젝트, 설정이 닫혀 있으면 현재 프로젝트를 반환한다. `displayAppearance()`는 그 프로젝트의 개별 appearance 또는 전체 state를 반환한다. 숫자와 색상식을 임의로 바꾸지 않는다.

```js
function mixWhite(hex, ratio) {
  const channels = [1, 3, 5].map((index) => Math.round(parseInt(hex.slice(index, index + 2), 16) * (1 - ratio) + 255 * ratio));
  return `rgb(${channels.join(', ')})`;
}
function mixDark(hex, ratio) {
  return `rgb(${[1, 3, 5].map((index) => Math.round(parseInt(hex.slice(index, index + 2), 16) * (1 - ratio))).join(', ')})`;
}
function mixColor(hex, base, ratio) {
  return `rgb(${[1, 3, 5].map((index) => Math.round(parseInt(hex.slice(index, index + 2), 16) * (1 - ratio) + parseInt(base.slice(index, index + 2), 16) * ratio)).join(', ')})`;
}

function applyTheme() {
  const theme = displayAppearance().theme;
  const style = document.documentElement.style;
  const dark = (displayProject()?.colorMode || state.colorMode) === 'dark';
  const selectedMode = settingsProject ? settingsProject.colorMode || 'inherit' : state.colorMode || 'light';
  document.documentElement.dataset.colorMode = dark ? 'dark' : 'light';
  el('color-mode-light').checked = selectedMode === 'light';
  el('color-mode-dark').checked = selectedMode === 'dark';
  el('color-mode-inherit').checked = selectedMode === 'inherit';
  style.setProperty('--gradient-start', dark ? mixColor(theme.start, '#171b22', .94) : theme.start);
  style.setProperty('--gradient-end', dark ? mixColor(theme.end, '#11151b', .97) : theme.end);
  style.setProperty('--accent', theme.accent);
  style.setProperty('--accent-soft', dark ? mixColor(theme.accent, '#1b1f26', .9) : mixWhite(theme.accent, .8));
  style.setProperty('--accent-light', dark ? mixColor(theme.accent, '#1b1f26', .78) : mixWhite(theme.accent, .45));
  style.setProperty('--skin-surface', dark ? mixColor(theme.accent, '#1c2027', .98) : mixWhite(theme.accent, .975));
  style.setProperty('--skin-workspace', dark ? '#15191f' : mixWhite(theme.accent, .965));
  style.setProperty('--skin-ink', dark ? '#edf0f4' : mixDark(theme.accent, .83));
  style.setProperty('--skin-muted', dark ? '#b2b8c2' : mixDark(theme.accent, .63));
  style.setProperty('--skin-border', dark ? '#353b46' : mixWhite(theme.accent, .8));
  const rgb = [1, 3, 5].map((index) => parseInt(theme.accent.slice(index, index + 2), 16) / 255);
  const luminance = rgb.map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  style.setProperty('--accent-ink', luminance > .179 ? '#302c23' : '#ffffff');
  // Workspace accents are separate from the saved theme, so this polish can be reverted independently.
  style.setProperty('--workspace-accent', dark ? mixWhite(theme.accent, luminance < .2 ? .55 : .08) : mixDark(theme.accent, .56));
  document.querySelector('meta[name="theme-color"]').content = dark ? '#15191f' : theme.start;
  syncThemePresets();
}
```

## 부록 D. 배경 이미지 대표색 추출

브라우저에서 디코딩한 Image를 `paletteFromImage`에 전달한다. 픽셀 처리와 HSL 변환의 기준 코드다.

```js
function rgbToHsl(red, green, blue) {
  const [r, g, b] = [red, green, blue].map((value) => value / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const lightness = (max + min) / 2;
  if (!delta) return [0, 0, lightness];
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  hue = (hue * 60 + 360) % 360;
  return [hue, saturation, lightness];
}
function hslToHex(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const base = lightness - chroma / 2;
  const channels = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
  return '#' + channels.map((value) => Math.round((value + base) * 255).toString(16).padStart(2, '0')).join('');
}
function paletteFromImage(image) {
  const sample = document.createElement('canvas');
  sample.width = 96;
  sample.height = 96;
  const context = sample.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('이미지의 색을 읽을 수 없습니다.');
  context.drawImage(image, 0, 0, 96, 96);
  const pixels = context.getImageData(0, 0, 96, 96).data;
  const buckets = new Map();
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3] / 255;
    if (alpha < .1) continue;
    const [hue, saturation, lightness] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
    const key = saturation > .12 ? `h${Math.floor(hue / 20)}` : `n${Math.floor(lightness * 4)}`;
    const weight = alpha * (.15 + .85 * saturation) * (1 - Math.abs(.5 - lightness) * .7);
    const bucket = buckets.get(key) || { weight: 0, red: 0, green: 0, blue: 0 };
    bucket.weight += weight;
    bucket.red += pixels[i] * weight;
    bucket.green += pixels[i + 1] * weight;
    bucket.blue += pixels[i + 2] * weight;
    buckets.set(key, bucket);
  }
  const dominant = [...buckets.values()].sort((a, b) => b.weight - a.weight)[0];
  if (!dominant) throw new Error('투명한 이미지에서 색을 읽을 수 없습니다. 다른 이미지를 선택해 주세요.');
  const [hue, rawSaturation] = rgbToHsl(dominant.red / dominant.weight, dominant.green / dominant.weight, dominant.blue / dominant.weight);
  const saturation = rawSaturation > .12 ? Math.max(.25, Math.min(.72, rawSaturation)) : rawSaturation;
  return { start: hslToHex(hue, saturation * .7, .91), end: hslToHex(hue, saturation * .45, .97), accent: hslToHex(hue, saturation, .58) };
}
```

## 부록 E. 보조 SVG 아이콘

연필·설정·삭제·보관·복원·추가·닫기·뒤로가기·프로젝트 기호는 공통 16×16 전용 벡터이며 선 두께 1.5px, 둥근 선 끝·모서리로 통일한다. 이동 핸들은 같은 16×16 안에 6개의 점을 채운다. 같은 동작에는 화면 위치와 관계없이 같은 SVG를 사용한다. 추가 버튼과 모바일 뒤로가기의 글자 기호도 이 SVG로 교체한다. 섹션 접기 아이콘은 9절의 기존 모양과 완료 동그라미를 유지한다.

```js
const iconSvg = (body, filled = false) => '<svg class="ui-icon" width="16" height="16" viewBox="0 0 16 16" fill="' + (filled ? 'currentColor' : 'none') + '" stroke="' + (filled ? 'none' : 'currentColor') + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
  const pencil = iconSvg('<path d="M10.5 2.5a2.12 2.12 0 0 1 3 3L6 13l-3.5.5L3 10Z"/><path d="m9.5 3.5 3 3"/>');
  const gear = iconSvg('<path d="M6.649 1.642L9.351 1.642L9.545 3.245L11.346 4.284L12.83 3.651L14.182 5.991L12.891 6.96L12.891 9.04L14.182 10.009L12.83 12.349L11.346 11.716L9.545 12.755L9.351 14.358L6.649 14.358L6.455 12.755L4.654 11.716L3.17 12.349L1.818 10.009L3.109 9.04L3.109 6.96L1.818 5.991L3.17 3.651L4.654 4.284L6.455 3.245Z"/><circle cx="8" cy="8" r="2.25"/>');
  const trash = iconSvg('<path d="M2.5 4.5h11M6 4.5v-2h4v2M4 4.5l.5 8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1l.5-8M6.5 7v4M9.5 7v4"/>');
  const grip = iconSvg('<circle cx="5.5" cy="3.5" r="1"/><circle cx="10.5" cy="3.5" r="1"/><circle cx="5.5" cy="8" r="1"/><circle cx="10.5" cy="8" r="1"/><circle cx="5.5" cy="12.5" r="1"/><circle cx="10.5" cy="12.5" r="1"/>', true);
  const archiveIcon = iconSvg('<rect x="2.5" y="2.5" width="11" height="3" rx=".75"/><path d="M3.5 5.5v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-7M6.5 8.5h3"/>');
  const restoreIcon = iconSvg('<path d="M2.5 7.25A5.5 5.5 0 1 1 4.1 12M2.5 3v4.25h4.25"/>');
  const plusIcon = iconSvg('<path d="M8 3v10M3 8h10"/>');
  const closeIcon = iconSvg('<path d="m4 4 8 8M12 4l-8 8"/>');
  const backIcon = iconSvg('<path d="M13 8H3m5-5L3 8l5 5"/>');
  const projectIcon = iconSvg('<path d="M6.25 2.5 4.75 13.5M11.25 2.5 9.75 13.5M3 5.75h10M2.5 10.25h10"/>');
```
