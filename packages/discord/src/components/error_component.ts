import { ContainerBuilder, TextDisplayBuilder } from '@discordjs/builders'
import { SeparatorSpacingSize } from '@discordjs/core'

type Options = {
  message: string
}

export class ErrorComponent {
  #options: Options

  constructor(options: Options) {
    this.#options = options
  }

  static build(options: Options) {
    return new this(options)
  }

  render() {
    const { message } = this.#options

    const container = new ContainerBuilder()

    container
      .addTextDisplayComponents(new TextDisplayBuilder().setContent('**Une erreur est survenue**'))
      .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> ${message}`))

    return container
  }
}
