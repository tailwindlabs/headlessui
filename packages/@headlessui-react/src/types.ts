export type PropsOf<TTag = any> = TTag extends React.ElementType
  ? React.ComponentProps<TTag>
  : never

export type Props<TTag, TSlot = any, TOmitableProps extends keyof any = any> = {
  as?: TTag
  children?: React.ReactNode | ((bag: TSlot) => React.ReactElement)
} & Omit<PropsOf<TTag>, TOmitableProps>
