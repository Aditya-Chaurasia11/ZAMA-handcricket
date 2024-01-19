import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import MatchHome from "./Pages/Match/MatchHome.jsx";
import { GlobalContextProvider } from "./context/index.jsx";
import Join from "./Pages/Join/Join.jsx";
import Create from "./Pages/Create/Create.jsx";
import HomePage from "./Pages/Home/HomePage.jsx";
import FinalWinner from "./components/FinalWinner.jsx";
import Matchdraw from "./components/MatchDraw.jsx";


function App() {
  return (
    <GlobalContextProvider>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <>
                <div className="gradient__bg">
                  <Navbar />
                </div>
                <HomePage />
              </>
            }
            path="/"
            exact
          />

          <Route path="/create" element={<Create />} />
          <Route path="/temp" element={<FinalWinner />} />
          <Route path="/aa" element={<Matchdraw />} />


          <Route path="/match/:id" element={<MatchHome />} />
          <Route path="/join" element={<Join />} />
        </Routes>
      </BrowserRouter>
    </GlobalContextProvider>
  );
}

export default App;
