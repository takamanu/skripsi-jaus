import NavBar from './components/NavBar'
import HeroSection from './components/HeroSection'
import PredictSection from './components/PredictSection'
import ModelSection from './components/ModelSection'
import MethodologySection from './components/MethodologySection'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <PredictSection />
        <ModelSection />
        <MethodologySection />
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}
