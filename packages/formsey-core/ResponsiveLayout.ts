export interface ResponsiveLayout {
  style?: string
  breakpoints?: Breakpoints
  sizes?: {
    xxs?: Layout
    xs?: Layout
    s?: Layout
    m?: Layout
    l?: Layout
    xl?: Layout
    xxl?: Layout
  }
}

export interface Breakpoints {
  xxs?: number
  xs?: number
  s?: number
  m?: number
  l?: number
  xl?: number
  xxl?: number
}

export interface Layout {
  formatter: string
}

export interface ToolbarLayout extends Layout {
  formatter: "toolbar"
  horizontal?: "left" | "center" | "right",
  vertical?: "top" | "middle" | "bottom"
  wrap?: "wrap" | "nowrap"
  grow?: {
    [index: string]: number
  }
}

export interface ColumnsLayout extends Layout {
  formatter: "columns" | "areas" | "table"
  columns: number[]
}

export interface AreasLayout extends ColumnsLayout {
  formatter: "areas"
  areas: string[]
}

export interface TableLayout extends Layout {
  formatter: "table"
  vertical?: "top" | "middle" | "bottom"
  rowHeight?: "s" | "m" | "l" | "xl"
  fixedColumns?: number
  columns: {
    width: number
    field?: string
  }[]
}