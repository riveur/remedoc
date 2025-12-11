import { useForm } from '@tanstack/react-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { FieldsetLegend } from '@/components/ui/fieldset'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateMedicationMutation } from '../mutations'
import type { Medication } from '../types'

const schema = z.object({
  name: z.string().min(1, 'This field is required'),
  dosage: z.string(),
  form: z.string(),
  instructions: z.string(),
})

export type MedicationEditFormSchema = z.infer<typeof schema>

interface MedicationEditFormProps {
  medication: Medication
}

export function MedicationEditForm({ medication }: MedicationEditFormProps) {
  const { mutateAsync: updateMedication } = useUpdateMedicationMutation(medication.id)

  const form = useForm({
    validators: {
      onSubmit: schema,
    },
    defaultValues: {
      name: medication.name,
      dosage: medication.dosage || '',
      form: medication.form || '',
      instructions: medication.instructions || '',
    },
    onSubmit: async ({ value }) => {
      await updateMedication(value, {
        onSuccess: (data) => {
          form.reset({
            name: data.name,
            dosage: data.dosage || '',
            form: data.form || '',
            instructions: data.instructions || '',
          })
        },
      })
    },
  })

  return (
    <FieldSet>
      <FieldsetLegend>Informations</FieldsetLegend>
      <form
        id="medication-form"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <div className="grid grid-cols-4 gap-6">
            <Field className="col-span-2">
              <FieldLabel>ID</FieldLabel>
              <FieldDescription>{medication.id}</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Date de création</FieldLabel>
              <FieldDescription>{new Date(medication.createdAt).toLocaleString()}</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Dernière modification</FieldLabel>
              <FieldDescription>{new Date(medication.updatedAt).toLocaleString()}</FieldDescription>
            </Field>
          </div>
          <form.Field
            name="name"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Nom</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Entrez le nom du médicament"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <form.Field
            name="dosage"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Dosage</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="20mg, 100ml, etc..."
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <form.Field
            name="form"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Forme</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Comprimé, sirop, pilule, etc..."
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <form.Field
            name="instructions"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Instructions</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </FieldGroup>
      </form>
      <Field orientation="horizontal" className="justify-end">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Réinitialiser
        </Button>
        <Button type="submit" form="medication-form" disabled={form.state.isSubmitting}>
          Enregistrer
        </Button>
      </Field>
    </FieldSet>
  )
}
