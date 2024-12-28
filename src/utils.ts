export function styledLogger(message: string, style: Style): void {
  const styles = [
    'color: red; font-weight: bold;',
    'color: yellow; text-decoration: underline;',
    'color: green; font-family: monospace; font-style: italic;'
  ];

  console.log(`%c${message}`, styles[style]);
}

export enum Style {
  speak,
  requiresInput,
  information
}
