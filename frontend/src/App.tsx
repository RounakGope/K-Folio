import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing/LandingPage";
import SignIn from "./components/SignIn";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignIn />} /> //ADD SIGNUP HERE ONCE CREATED
      </Routes>
    </BrowserRouter>
  );
}

export default App;
