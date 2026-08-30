const VARIANTS = {
  primary: 'bg-brand-orange text-bg font-semibold hover:bg-brand-orange-dark',
  secondary: 'bg-[#D9D9D920] text-white font-medium hover:bg-input border border-border',
  outlineSuccess: 'bg-transparent border border-success text-success font-medium hover:bg-success/10',
  outlineDanger: 'bg-transparent border border-danger text-danger font-medium hover:bg-danger/10',
};

const Button = ({ variant = 'primary', className = '', ...props }) => (
  <button
    className={`px-4 py-2 rounded-pill transition-colors ${VARIANTS[variant]} ${className}`}
    {...props}
  />
);

export default Button;
