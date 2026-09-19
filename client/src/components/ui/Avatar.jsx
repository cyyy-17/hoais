export default function Avatar({ name, size = 40 }) {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate a consistent gradient based on the name string length
  const colors = [
    'linear-gradient(135deg, #6c63ff, #48cfad)',
    'linear-gradient(135deg, #fc8181, #ff6584)',
    'linear-gradient(135deg, #f6e05e, #ed8936)',
    'linear-gradient(135deg, #4299e1, #667eea)'
  ];
  
  const colorIndex = name ? name.length % colors.length : 0;

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: colors[colorIndex],
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: `${size * 0.4}px`,
      boxShadow: 'var(--shadow-sm)',
      flexShrink: 0
    }}>
      {getInitials(name)}
    </div>
  );
}
