const STYLES = {
  Pending: 'bg-warning-bg text-warning',
  Approved: 'bg-success-bg text-success',
  Rejected: 'bg-danger-bg text-danger',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-block text-xs px-3 py-1 rounded-pill ${STYLES[status] || STYLES.Pending}`}>
    {status}
  </span>
);

export default StatusBadge;
