/** Validate the visitor's own message before adding the optional campaign context. */
export function composeContactMessage(message: string, channel: string): string {
  const description = message.trim();
  if (description.length < 10 || description.length > 3000) {
    throw new Error('invalid_project_description');
  }
  return channel ? `Canale di interesse: ${channel}\n\n${description}` : description;
}
