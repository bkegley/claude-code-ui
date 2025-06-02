
interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="whitespace-pre-wrap bg-muted/30 rounded p-3">
      {content}
    </div>
  );
}