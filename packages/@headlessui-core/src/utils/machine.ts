export type MachineEvent<Type extends string, Payload> = {
  type: Type
  payload?: Payload
}

export interface Machine<State = any, Events extends MachineEvent<any, any> = any> {
  readonly id: string
  readonly state: State

  send(event: Events['type'], payload?: Extract<Events, { type: Events['type'] }>['payload']): void
}
