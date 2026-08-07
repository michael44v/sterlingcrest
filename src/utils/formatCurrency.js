export const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

export const formatUSD_S = (amount) => {
  const value = Number(amount);
  
  // Handle Millions
  if (value >= 1000000) {
    return `£${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  
  // Handle Thousands
  if (value >= 1000) {
    return `£${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  
  // Handle standard small amounts
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0, // Keeps it to "3 figures" style
  }).format(value);
};
