import { useForm } from '@tanstack/react-form'
import { ClockIcon } from 'lucide-react'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input_group'
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { daysOptions } from '../contents/days'
import { useAddMedicationScheduleMutation } from '../mutations'

const schema = z.object({
  timeOfDay: z.iso.time({ error: 'Invalide' }),
  daysOfWeek: z.array(z.number().min(1).max(7)),
  notes: z.string(),
})

export type MedicationScheduleFormSchema = z.infer<typeof schema>

interface MedicationScheduleFormProps {
  medicationId: number
}

export function MedicationScheduleForm({ medicationId }: MedicationScheduleFormProps) {
  const { mutateAsync: addSchedule } = useAddMedicationScheduleMutation(medicationId)

  const form = useForm({
    validators: {
      onSubmit: schema,
    },
    defaultValues: {
      timeOfDay: '',
      daysOfWeek: [] as number[],
      notes: '',
    },
    onSubmit: async ({ value }) => {
      await addSchedule(value, {
        onSuccess: () => {
          form.reset()
        },
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter un horaire</CardTitle>
        <CardDescription>Renseignez vos prochaines prises pour ce médicament.</CardDescription>
      </CardHeader>
      <CardPanel>
        <form
          id="medication-schedule-form"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <div className="flex flex-row gap-2">
              <form.Field
                name="timeOfDay"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid} className="flex-1">
                      <FieldLabel htmlFor={field.name}>Heure</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <ClockIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          autoComplete="off"
                          type="time"
                        />
                      </InputGroup>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />
              <form.Field
                name="daysOfWeek"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Jours</FieldLabel>
                      <Select
                        aria-label="Choisir les jours"
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value)}
                        multiple
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {(value: number[]) => {
                              if (value.length === 0) {
                                return 'Tous les jours'
                              }

                              const firstDay = daysOptions.find(
                                (day) => Number(day.value) === value[0]
                              )!.label

                              const additionalDays =
                                value.length > 1 ? ` (+${value.length - 1} de plus)` : ''
                              return firstDay + additionalDays
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectPopup alignItemWithTrigger={false}>
                          {daysOptions.map((day) => (
                            <SelectItem key={day.value} value={Number(day.value)}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectPopup>
                      </Select>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              />
            </div>
            <form.Field
              name="notes"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
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
      </CardPanel>
      <CardFooter>
        <Field orientation="horizontal" className="justify-end">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Réinitialiser
          </Button>
          <Button type="submit" form="medication-schedule-form" disabled={form.state.isSubmitting}>
            Ajouter
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
