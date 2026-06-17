export const formatDate = (isoString: string) => {
  const d = new Date(isoString);
  return d.toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (isoString: string) => {
  const d = new Date(isoString);
  return d.toLocaleString('fr-DZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatCurrency = (amount: number) =>
  `${Math.abs(amount).toLocaleString('fr-DZ')} DA`;
