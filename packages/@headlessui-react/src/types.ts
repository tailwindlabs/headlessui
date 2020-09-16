export type PropsOf<TTag = any> = TTag extends React.ElementType
  ? React.ComponentProps<TTag>
  : never

export type AsShortcut<TTag, TOmitableProps extends keyof any = any> = { as?: TTag } & Omit<
  PropsOf<TTag>,
  TOmitableProps
>
export type AsRenderProp<TBag> = { children?: (bag: TBag) => React.ReactElement }
