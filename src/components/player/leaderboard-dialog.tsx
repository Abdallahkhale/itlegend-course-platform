import Image from "next/image";
import { Medal, Trophy, UserRound } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { leaderboard } from "@/data/courses";

export function LeaderboardDialog({ open, onClose, percentage }: { open: boolean; onClose: () => void; percentage: number }) {
  const encouragement = percentage === 100 ? "أحسنت! أنهيت الكورس. جرّب تطبيق ما تعلمته وابدأ رحلتك التالية." : percentage >= 50 ? "أنت قطعت شوطًا رائعًا! استمر، كل درس جديد يقربك من هدفك." : "كل رحلة كبيرة تبدأ بخطوة صغيرة. ابدأ اليوم، وامنح نفسك فرصة للتعلم.";
  return (
    <Dialog open={open} onClose={onClose} title="Leaderboard" className="leaderboard-dialog">
      <div className="dialog-body">
        <div className="leaderboard-motivation"><Trophy size={35} strokeWidth={1.4} aria-hidden="true" /><p dir="rtl" lang="ar">{encouragement}</p><span>Keep learning. Every lesson counts.</span></div>
        <ol className="leaderboard-list">{leaderboard.map((student, index) => <li key={student.name} className={student.name === "You" ? "is-you" : ""}><span className="leaderboard-rank">{index < 3 ? <Medal size={22} aria-label={`Rank ${index + 1}`} /> : index + 1}</span>{student.avatar ? <Image src={student.avatar} width={38} height={38} alt="" /> : <span className="leaderboard-avatar"><UserRound size={20} aria-hidden="true" /></span>}<strong>{student.name}</strong><span>{student.name === "You" ? percentage * 12 : student.points} <small>pts</small></span></li>)}</ol>
        <p className="dialog-note">Practice leaderboard · sample learners</p>
      </div>
    </Dialog>
  );
}
