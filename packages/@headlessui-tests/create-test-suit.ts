import { match } from './utils/match'

type EnumValue<TEnum> = TEnum[keyof TEnum] extends keyof any ? TEnum[keyof TEnum] : never

// When we call `use(Scenario.XX)` it will return this type. When defining the scenarios, it should
// return this type so that it is in sync and we can use that information.
type ScenarioReturnType = {
  debug(): void
}

type Execute<TScenarios> = (context: {
  use: (scenario: EnumValue<TScenarios>, context?: any) => ScenarioReturnType
}) => void

type Configuration<TScenarios> = Record<
  EnumValue<TScenarios>,
  (context?: any) => ScenarioReturnType
>

export function createTestSuit<TScenarios>(scenarios: TScenarios, execute: Execute<TScenarios>) {
  return {
    scenarios,
    run(configuration: Configuration<TScenarios>) {
      return execute({
        use(scenario, context) {
          // @ts-expect-error
          return match(scenario, configuration, context)
        },
      })
    },
  }
}
