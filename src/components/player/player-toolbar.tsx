import { CircleHelp, List, MessageCircle, Trophy } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

export function PlayerToolbar({ onCurriculum, onComments, onQuestion, onLeaderboard }: { onCurriculum: () => void; onComments: () => void; onQuestion: () => void; onLeaderboard: () => void }) {
  return (
    <nav className="player-toolbar" aria-label="Course tools">
      <IconButton label="Go to curriculum" onClick={onCurriculum}><List size={20} strokeWidth={1.5} /></IconButton>
      <IconButton label="Go to comments" onClick={onComments}><MessageCircle size={20} strokeWidth={1.5} /></IconButton>
      <IconButton label="Ask a question" onClick={onQuestion}><CircleHelp size={20} strokeWidth={1.5} /></IconButton>
      <IconButton label="Open leaderboard" onClick={onLeaderboard}><Trophy size={20} strokeWidth={1.5} /></IconButton>
    </nav>
  );
}
