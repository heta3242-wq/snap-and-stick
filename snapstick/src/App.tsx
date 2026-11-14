import { AnimatePresence } from 'framer-motion';
import { StoreProvider, useStore } from './store';
import { Nav, Footer, Toast, PageFade } from './components/ui';
import { AuthModal } from './components/Auth';
import Home from './pages/Home';
import Themes from './pages/Themes';
import Booth from './pages/Booth';
import Studio from './pages/Studio';
import Final from './pages/Final';
import Creations from './pages/Creations';
import About from './pages/About';

function Router() {
  const { route: r0, design, lastExport } = useStore();
  const route = r0 === 'studio' && !design ? 'booth' : r0 === 'final' && !lastExport ? (design ? 'studio' : 'booth') : r0;
  const Page = { home: Home, themes: Themes, booth: Booth, studio: Studio, final: Final, creations: Creations, about: About }[route];
  const bare = route === 'studio';
  return (
    <>
      <Nav />
      <main className="min-h-[70vh]">
        <AnimatePresence mode="wait">
          <PageFade key={route}><Page /></PageFade>
        </AnimatePresence>
      </main>
      {!bare && <Footer />}
      <Toast />
      <AuthModal />
    </>
  );
}

export default function App() {
  return <StoreProvider><Router /></StoreProvider>;
}
