import { cn } from '@/lib/cn';

interface AvatarProps {
  name: string;
  url?: string;
  size?: number;
  className?: string;
}

export const Avatar = ({ name, url, size = 40, className }: AvatarProps) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (!parts[0]) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };
  
  return (
    <div 
      className={cn(
        `flex items-center justify-center font-bold rounded-full overflow-hidden shrink-0 border border-blue-500/10 bg-blue-500/15 text-blue-400`,
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};
