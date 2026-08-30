
const StarRating = ({ value = 0, onChange, readOnly = false, size = 'text-2xl' }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`flex gap-1 ${size}`}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={readOnly ? undefined : () => onChange(star)}
          className={`${readOnly ? '' : 'cursor-pointer'} ${
            star <= value ? 'text-brand-orange' : 'text-gray-600'
          }`}
        >
          {star <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
