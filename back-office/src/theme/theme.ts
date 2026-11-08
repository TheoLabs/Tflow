import type { ThemeConfig } from 'antd'

/**
 * 테오플로우 디자인 시스템(issue-board design — approved) → antd 테마 토큰.
 * 색·폰트·라운드는 여기서만 정한다. 화면 코드는 antd 토큰(theme.useToken)이나 아래 상수를 쓴다.
 */
export const BRAND = {
  main: '#4F46E5',
  /** 서브 컬러 — antd에 대응 토큰이 없어 권한 태그 등에서 직접 쓴다 */
  sub: '#7C3AED',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0284C7',
  bg: '#F7F8FC',
  surface: '#FFFFFF',
  /** 표 헤더·옅은 채움 배경 */
  surface2: '#F1F2F9',
  border: '#E2E4EF',
  text: '#161A2E',
  muted: '#646A85',
} as const

export const FONT_FAMILY =
  "Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif"

export const SIDER_WIDTH = 212
export const TOPBAR_HEIGHT = 56

/**
 * 미니멀·촘촘한 무드: compact 알고리즘은 컨트롤 높이를 28px로 줄여 디자인 시스템(32~34px)보다 작아지므로
 * 쓰지 않고, 표·폼·메뉴의 여백만 컴포넌트 토큰으로 줄였다.
 */
export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: BRAND.main,
    colorSuccess: BRAND.success,
    colorWarning: BRAND.warning,
    colorError: BRAND.danger,
    colorInfo: BRAND.info,
    // antd는 링크 색을 colorInfo에서 파생하므로 메인 컬러로 고정
    colorLink: BRAND.main,

    colorBgLayout: BRAND.bg,
    colorBgContainer: BRAND.surface,
    colorBorder: BRAND.border,
    colorBorderSecondary: BRAND.border,
    colorSplit: BRAND.border,
    colorFillAlter: BRAND.surface2,
    colorText: BRAND.text,
    colorTextSecondary: BRAND.muted,
    colorTextDescription: BRAND.muted,

    fontFamily: FONT_FAMILY,
    fontSize: 14,
    // 타입 스케일: display 28 / h1 22 / h2 18 / h3 16 / body 14
    fontSizeHeading1: 28,
    fontSizeHeading2: 22,
    fontSizeHeading3: 18,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 8,

    controlHeight: 32,
  },
  components: {
    Layout: {
      siderBg: BRAND.surface,
      bodyBg: BRAND.bg,
      headerBg: BRAND.surface,
    },
    Menu: {
      itemHeight: 34,
      itemMarginInline: 0,
      itemBorderRadius: 6,
      groupTitleFontSize: 12,
      groupTitleColor: BRAND.muted,
      itemSelectedColor: BRAND.main,
      activeBarBorderWidth: 0,
    },
    Table: {
      headerBg: BRAND.surface2,
      headerColor: BRAND.muted,
      cellPaddingBlock: 8,
      cellPaddingInline: 12,
      headerSplitColor: 'transparent',
    },
    Form: {
      itemMarginBottom: 16,
      verticalLabelPadding: '0 0 4px',
      labelFontSize: 14,
    },
    Card: {
      headerHeight: 48,
      headerFontSize: 16,
    },
    Descriptions: {
      itemPaddingBottom: 8,
    },
  },
}
