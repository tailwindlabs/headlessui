import React, { createContext, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDisposables } from '../hooks/use-disposables'
import { objectToFormEntries } from '../utils/form'
import { compact } from '../utils/render'
import { Hidden, HiddenFeatures } from './hidden'

let FormFieldsContext = createContext<{ target: HTMLElement | null } | null>(null)

export function FormFieldsProvider(props: React.PropsWithChildren<{}>) {
  let [target, setTarget] = useState<HTMLElement | null>(null)

  return (
    <FormFieldsContext.Provider value={{ target }}>
      {props.children}
      <Hidden features={HiddenFeatures.Hidden} ref={setTarget} />
    </FormFieldsContext.Provider>
  )
}

export function HoistFormFields({ children }: React.PropsWithChildren<{}>) {
  let formFieldsContext = useContext(FormFieldsContext)
  if (!formFieldsContext) return <>{children}</>

  let { target } = formFieldsContext
  return target
    ? createPortal(<>{children}</>, target) //
    : null // We know for sure that we are in a `FormFieldsContext`, but the DOM element where we want to render is not ready yet. Let's render nothing for now until that element is ready.
}

export function FormFields({
  data,
  form: formId,
  onReset,
}: {
  data: Record<string, any>
  form?: string
  onReset?: (e: Event) => void
}) {
  let [form, setForm] = useState<HTMLFormElement | null>(null)

  let d = useDisposables()
  useEffect(() => {
    if (!onReset) return
    if (!form) return

    return d.addEventListener(form, 'reset', onReset)
  }, [form, formId, onReset])

  return (
    <HoistFormFields>
      <FormResolver setForm={setForm} formId={formId} />
      {objectToFormEntries(data).map(([name, value]) => {
        return (
          <Hidden
            features={HiddenFeatures.Hidden}
            {...compact({
              key: name,
              as: 'input',
              type: 'hidden',
              hidden: true,
              readOnly: true,
              form: formId,
              name,
              value,
            })}
          />
        )
      })}
    </HoistFormFields>
  )
}

function FormResolver({
  setForm,
  formId,
}: {
  setForm: (form: HTMLFormElement) => void
  formId?: string
}) {
  useEffect(() => {
    if (formId) {
      let resolvedForm = document.getElementById(formId) as HTMLFormElement
      if (resolvedForm) setForm(resolvedForm)
    }
  }, [setForm, formId])

  return formId ? null : (
    <Hidden
      features={HiddenFeatures.Hidden}
      as="input"
      type="hidden"
      hidden
      readOnly
      ref={(el) => {
        if (!el) return
        let resolvedForm = el.closest('form')
        if (resolvedForm) setForm(resolvedForm)
      }}
    />
  )
}
