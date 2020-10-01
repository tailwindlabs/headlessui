export type PropsOf<TTag = any> = TTag extends React.ElementType
  ? React.ComponentProps<TTag>
  : never

export type Props<TTag, TSlot = {}, TOmitableProps extends keyof any = ''> = {
  as?: TTag
  children?: React.ReactNode | ((bag: TSlot) => React.ReactElement)
} & Omit<PropsOf<TTag>, TOmitableProps>
