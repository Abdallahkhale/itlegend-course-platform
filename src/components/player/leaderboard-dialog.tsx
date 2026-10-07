import Image from "next/image";
import { UserRound } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { leaderboard } from "@/data/courses";
import { progressEncouragement } from "@/lib/encouragement";
import { withBasePath } from "@/lib/paths";

const medals = ["🥇", "🥈", "🥉"];

export function LeaderboardDialog({ open, onClose, courseTitle, percentage }: { open: boolean; onClose: () => void; courseTitle: string; percentage: number }) {
  const students = leaderboard.map((student) => ({ ...student, points: student.name === "You" ? percentage * 12 : student.points })).sort((a, b) => b.points - a.points);
  return (
    <Dialog open={open} onClose={onClose} title="Leaderboard" context={courseTitle} className="leaderboard-dialog">
      <div className="dialog-body">
        <div className="leaderboard-motivation"><p dir="rtl" lang="ar">{progressEncouragement(percentage)}</p><span>{percentage}% of your course complete</span></div>
        <ol className="leaderboard-list">{students.map((student, index) => <li key={student.name} className={student.name === "You" ? "is-you" : ""}><span className="leaderboard-rank">{index < medals.length ? <span role="img" aria-label={`Rank ${index + 1}`}>{medals[index]}</span> : index + 1}</span>{student.avatar ? <Image src={withBasePath(student.avatar)} width={38} height={38} alt="" /> : <span className="leaderboard-avatar"><UserRound size={20} aria-hidden="true" /></span>}<strong>{student.name}</strong><span>{student.points} <small>pts</small></span></li>)}</ol>
        <p className="dialog-note">Practice leaderboard · sample learners</p>
      </div>
    </Dialog>
  );
}
