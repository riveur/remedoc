import type { MetaDescriptor } from '@tanstack/react-router'

const APP_TITLE = 'Remedoc'

export function seo(options: { title?: string }) {
  let { title } = options

  if (title) {
    title = `${APP_TITLE} - ${title}`
  } else {
    title = APP_TITLE
  }

  return [{ title: title }] satisfies MetaDescriptor[]
}
