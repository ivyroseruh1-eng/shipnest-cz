import { useEffect, useState } from "react";

interface Props {
  target: string; // ISO date
  className?: string;
  delivered?: boolean;
}

const EtaCountdown = ({ target, className = "", delivered }: Props) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (delivered) return <span className={className}>Delivered</span>;

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return <span className={className}>Arriving today</span>;

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days >= 1) return <span className={className}>{days}d {hours}h</span>;
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  return <span className={className}>{hours}h {mins}m</span>;
};

export default EtaCountdown;