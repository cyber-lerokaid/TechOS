

export const Avatar = ({ name, url, size = 40 }: { name: string, url?: string, size?: number }) => {
  const getInitials = (n: string) => n.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase();
  
  // Hash name to color
  const colors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-success)', 'var(--color-info)'];
  const colorIndex = name.length % colors.length;
  
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', 
      backgroundColor: url ? 'transparent' : colors[colorIndex],
      backgroundImage: url ? `url(${url})` : 'none',
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 600, fontSize: size * 0.4,
      flexShrink: 0
    }}>
      {!url && getInitials(name)}
    </div>
  );
};
