const STYLES = {
  Pending: 'bg-warning-bg text-[#FAFAFAB2]',
  Approved: 'bg-success-bg text-[#FAFAFAB2]',
  Rejected: 'bg-danger-bg text-[#FAFAFAB2]',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-block text-xs px-3 py-1 rounded-pill ${STYLES[status] || STYLES.Pending}`}>
    {status}
  </span>
);

export default StatusBadge;
