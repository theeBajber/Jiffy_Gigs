export function LeftBubble({
  content,
  time,
  avatar,
}: {
  content: string;
  time: string;
  avatar: string;
}) {
  return (
    <div className="w-full flex flex-col items-baseline gap-2">
      <div className="min-h-12 bg-neutral-light rounded-r-2xl rounded-t-2xl max-w-205 flex items-center px-4">
        {content}
      </div>
      <div className="flex gap-2 items-center">
        <img src={avatar} className="size-8 rounded-full" />
        <div className="text-sm text-primary-dark/50">{time}</div>
      </div>
    </div>
  );
}
export function RightBubble({
  content,
  time,
  status,
}: {
  content: string;
  time: string;
  status?: string;
}) {
  return (
    <div className="w-full flex flex-col items-end">
      <div className="min-h-12 bg-primary-light text-neutral-light rounded-l-2xl rounded-t-2xl max-w-205 flex items-center px-4">
        {content}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm text-primary-dark/50">{time}</div>
        <div className="size-1.5 rounded-full bg-primary-dark/50"></div>
        <div className="text-sm text-primary-dark/50 capitalize">{status}</div>
      </div>
    </div>
  );
}
