import { useEffect, useRef } from 'react';

interface StreamingDisplayProps {
  content: string;
  isStreaming: boolean;
}

export function StreamingDisplay({ content, isStreaming }: StreamingDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (scrollRef.current && isStreaming) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  return (
    <div className="relative w-full">
      {/* Top fade gradient */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#1F1F20] to-transparent pointer-events-none z-10 rounded-t-md" />
      
      {/* Scrollable content container */}
      <div
        ref={scrollRef}
        className="w-full h-96 overflow-y-auto rounded-md border border-white/20 bg-[#19191A] p-4 font-mono text-xs text-white/90 scroll-smooth"
        style={{
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        `}</style>
        <pre
          className="whitespace-pre-wrap break-words"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          }}
        >
          {content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-white/70 animate-pulse">▋</span>
          )}
        </pre>
      </div>
      
      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1F1F20] to-transparent pointer-events-none z-10 rounded-b-md" />
    </div>
  );
}

