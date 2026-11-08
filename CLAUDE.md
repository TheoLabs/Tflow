<!--
  대상 프로젝트의 CLAUDE.md에 아래 블록을 복사해 넣으면,
  그 프로젝트의 모든 Claude 세션이 이슈보드를 자동으로 활용한다. (진행용 상시 규칙)
-->

## Issue Board 연동

이 프로젝트의 기획·이슈는 issue-board(`http://localhost:4000/mcp`, MCP)로 관리된다.

> 이슈는 사람이 읽는 **키**(예: `CH-12`)로 지칭할 수 있다 — `issueId` 자리에 키를 넣으면
> 된다(긴 cuid도 계속 통한다). `get_project_context`가 각 이슈의 `key`를 함께 준다.

> 🔴 **기획 확정 가드 (반드시 준수)**: 기획이 **`approved`가 아닌 이슈로는 코드를 작성하지
> 마라.** `get_project_context`의 `guard`(및 각 기획 `status`)를 확인해, 착수할 이슈의 기획이
> draft(미확정)면 **구현을 멈추고** "이 기획은 아직 확정(approved)되지 않았습니다 — 확정 후
> 개발을 진행하겠습니다"라고 사용자에게 알려라. 착수 표시(`update_issue_status`를
> in_progress/done)도 **서버가 거부**한다. 기획이 확정돼야 개발이 이뤄지는 프로세스다.

- **작업 시작 전**: `get_project_context(repoPath=<이 저장소의 절대경로>)`로 기획서와
  이슈를 읽어 현재 맥락을 파악하고, **착수할 이슈의 기획이 approved인지 확인**한다.
- **이슈 착수 시**(기획이 approved일 때만): `update_issue_status(CH-12, "in_progress")`로 표시.
- **완료 조건 체크박스 동기화**: 이슈 본문의 "완료 조건" 체크리스트 항목을 실제로 끝낼
  때마다, `get_issue`로 본문을 읽어 해당 `- [ ]`를 `- [x]`로 바꾼 뒤
  `update_issue(issueId, body=<수정본>)`로 저장한다. **본문의 다른 부분은 건드리지 마라.**
  대시보드에서 사람이 체크하는 것과 같은 편집이다.
- **이슈 완료 시**: 완료 조건 체크박스를 모두 `- [x]`로 맞추고 `update_issue_status(issueId, "done")`.
- **상위 이슈(에픽)는 건드리지 마라**: 하위의 상태가 바뀌면 서버가 상위를 자동으로 재산출한다
  (하위가 **전부 done이면 상위도 done**, 하나라도 시작됐으면 **in_progress**). 에픽 상태를
  손으로 바꾸지 말고 하위만 정확히 갱신하면 된다. 다만 **에픽 본문의 완료 조건 체크박스는
  자동이 아니다** — 에픽 단위로 끝났으면 `/ib-progress`로 맞춰라.
- **작업 중 새 할 일 발견 시**: `create_issue`로 등록해 보드에 남긴다. 이때도 **`planId`를 반드시
  채운다** — 기획이 연결되지 않은 이슈는 착수/완료 전이가 거부된다.
- **기획에 결정/변경이 생기면**: 본문 끝에 메모를 덧붙이지 말고, `get_plan`으로 본문을 읽어
  변경을 해당 섹션(1~9) 안에 녹인 뒤 `update_plan(planId, content=<새 전체>)`로 저장한다.
  (승인된 기획이면 변경 결과가 자동으로 버전 이력에 스냅샷된다.)

MCP 툴이 보이지 않으면 이 저장소에 `.mcp.json`이 있는지, 서버가 떠 있는지 확인하라.

## back-office ↔ core-api 경계 규칙

> 🔴 **back-office에 맞추려고 core-api의 API를 변경하지 마라. (반드시 준수)**

- `back-office`는 **core-api가 이미 제공하는 API만으로** 만든다. core-api가 기준(source of truth)이고,
  back-office는 그 소비자다.
- back-office 작업 중에 core-api의 다음을 바꾸지 않는다: 엔드포인트 경로·HTTP 메서드, 요청/응답 DTO의
  필드·타입·이름, 응답 형태, 상태 코드, 인증·권한 동작.
- 화면에 필요한 데이터 모양이 API와 다르면 **프론트에서 변환·조합**한다(매핑 함수, 여러 API 조합 등).
- 필요한 API가 아예 없거나 API로는 도저히 구현할 수 없으면, core-api를 고치지 말고 **작업을 멈추고
  사용자에게 보고**한다. core-api 변경은 core-api 쪽 요구사항으로 따로 결정·진행한다.
- back-office 전용 작업은 `back-office-agent`(`.claude/agents/back-office-agent.md`)가 맡는다.
