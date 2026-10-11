interface PromptLineProps {
  /** Working directory shown after the user, e.g. '~/blog'. */
  path: string
  /** Command shown after the caret, e.g. 'ls -t'. */
  command: string
}

// One shell prompt + command, e.g. `kacper@warsaw ~/blog  › ls -t`.
// Decorative framing for the output that follows, so it is hidden from
// assistive tech and from print.
export function PromptLine({ path, command }: PromptLineProps) {
  return (
    <div aria-hidden="true" className="print-hidden text-[12px] leading-relaxed">
      <span className="prompt-user">kacper@warsaw</span>{' '}
      <span className="prompt-path">{path}</span>
      <span className="text-neutral-300">
        {' '}
        <span className="prompt-caret">›</span> {command}
      </span>
    </div>
  )
}
