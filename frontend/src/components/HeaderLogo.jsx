const HeaderLogo = ({ dark = false }) => (
  <span className="flex items-center gap-2 font-bold uppercase tracking-wide text-sm">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="20" viewBox="0 0 36 20" fill="none">
  <rect width="20" height="20" rx="4" fill="#FFA500"/>
  <rect x="16" width="20" height="20" rx="4" fill="#205889"/>
</svg>
    <span className={dark ? 'text-bg' : 'text-white'}>Reelboxed</span>
  </span>
);

export default HeaderLogo;
