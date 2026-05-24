import { cn } from '@/shared/utils/cn';

interface AvatarProps {
  name: string;
  url?: string;
  size?: number;
  className?: string;
}

export const Avatar = ({ name, url, size = 40, className }: AvatarProps) => {
  const getInitials = (n: string) => n.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase();
  
  // Hash name to color
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgColor = colors[hash % colors.length];

  return (
    <div 
      className={cn(
        `flex items-center justify-center font-bold text-white rounded-full overflow-hidden shrink-0 shadow-sm border border-white/10 ${bgColor}`,
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
