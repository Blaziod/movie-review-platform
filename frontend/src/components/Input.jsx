const Input = ({ error, className = '', ...props }) => (
  <input
    className={`w-full px-4 py-3 rounded-pill bg-input text-white placeholder-gray-500 border ${
      error ? 'border-danger' : 'border-transparent'
    } focus:outline-none focus:border-brand-orange ${className}`}
    {...props}
  />
);

export default Input;
