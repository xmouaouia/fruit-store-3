export const formatDA = (number: number): string => {
  return new Intl.NumberFormat('en-US').format(Math.round(number)) + ' DA';
};

export const formatKg = (number: number): string => {
  return Number(number.toFixed(2)) + ' kg';
};

export const calculateMargin = (selling: number, purchase: number): number => {
  return selling - purchase;
};

export const getDayLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
};

export const getRelativeTimeLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const timeLabel = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  const dayLabel = getDayLabel(dateString);
  
  if (dayLabel === 'Today' || dayLabel === 'Yesterday') {
    return `${dayLabel} ${timeLabel}`;
  }
  
  return `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)} ${timeLabel}`;
};

export const groupSalesByDay = (sales: { total: number, timestamp: string }[]) => {
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const grouped = last7Days.map(date => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const daySales = sales.filter(s => {
      const saleDate = new Date(s.timestamp);
      return saleDate >= date && saleDate < nextDate;
    });

    const totalRevenue = daySales.reduce((sum, s) => sum + s.total, 0);
    
    return {
      date: date.toISOString(),
      label: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      revenue: totalRevenue
    };
  });

  return grouped;
};
