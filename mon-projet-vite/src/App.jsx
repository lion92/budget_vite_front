// src/App.jsx
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import DashBoardAgenda from "./pages/components/DashBoardAgenda.jsx";
import DashBoardBudget from "./pages/components/DashBoardBudget.jsx";
import DashBoardHello from "./pages/components/DashBoardHello.jsx";
import DashLogin from "./pages/components/DashLogin.jsx";
import DashBoardInscription from "./pages/components/DashInscription.jsx";
import DashBoardCategorie from "./pages/components/DashBoardCategorie.jsx";
import DashBoardTache from "./pages/components/DashBoardTache.jsx";
import DashAllSpend from "./pages/components/DashAllSpend.jsx";
import DashAllSpendFilters from "./pages/components/DashAllSpendFilters.jsx";
import DashEnveloppe from "./pages/components/DashEnveloppe.jsx";
import DashPrediction from "./pages/components/DashPrediction.jsx";
import NotFound from "./pages/components/NotFound.jsx";
import ResetPasswordForm from "./pages/components/ResetPasswordForm.jsx";
import DashGraphBudget from "./pages/components/DashgraphBudget.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                    <Route path="/" element={<DashBoardHello/>}/>
                    <Route path="/login" element={<DashLogin/>}/>
                    <Route path="/inscription" element={<DashBoardInscription/>}/>
                    <Route path="/categorie" element={<DashBoardCategorie/>}/>
                    <Route path="/budget" element={<DashBoardBudget/>}/>
                    <Route path="/form" element={<DashBoardTache/>}/>
                    <Route path="/allSpend" element={<DashAllSpend/>}/>
                    <Route path="/allSpendFilters" element={<DashAllSpendFilters/>}/>
                    <Route path="/enveloppe" element={<DashEnveloppe/>}/>
                    <Route path="/prediction" element={<DashPrediction/>}/>
                    <Route path="/agenda" element={<DashBoardAgenda/>}/>
                    <Route path="/reset-password" element={<ResetPasswordForm />} />
                    <Route path="/graph" element={<DashGraphBudget/>} />
                    <Route path="*" element={<NotFound/>}/> {/* Remplace Route "catch-all" */}
            </Routes>
        </BrowserRouter>
    )
}

export default App
