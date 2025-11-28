// This file is a small compatibility shim that re-exports the main Home page
// component located in `HomePage.tsx`. The previous file content included a
// partial permission check which is now handled by hooks and the app's
// VoiceContext/BackgroundVoiceService. Keep this as a simple re-export so
// imports of `./pages/Home` continue to work.

import HomePage from './HomePage';
export default HomePage;
