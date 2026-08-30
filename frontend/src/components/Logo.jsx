const Logo = ({ dark = false }) => (
  <span className="flex items-center gap-2 font-bold uppercase tracking-wide text-sm">
    <span className="flex gap-0.5">
      <span className={`w-3 h-4 rounded-sm ${dark ? 'bg-bg/60' : 'bg-brand-orange'}`} />
      <span className={`w-3 h-4 rounded-sm ${dark ? 'bg-bg/40' : 'bg-brand-blue'}`} />
    </span>
    <span className={dark ? 'text-bg' : 'text-white'}>Reelboxed</span>
  </span>
);

export default Logo;
