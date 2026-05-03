interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
}

export default function StreamingText({ text, isStreaming }: StreamingTextProps) {
  return (
    <p className="text-[length:--font-size-body-main] leading-[1.6] text-on-surface-variant whitespace-pre-wrap">
      {text}
      {isStreaming && (
        <span
          data-cursor=""
          className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 align-middle animate-pulse"
        />
      )}
    </p>
  );
}
