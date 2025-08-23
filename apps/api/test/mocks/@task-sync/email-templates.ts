export const render = async (
  template: string,
  data: Record<string, string>,
): Promise<string> => {
  return `<div data-testid="email-template-${template}">
    Email template "${template}" rendered with data: ${JSON.stringify(data, null, 2)}
  </div>`
}
