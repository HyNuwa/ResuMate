import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './shared/components/layout/Layout';
import { OptimizePage } from './pages/OptimizePage';
import { MyCVsPage } from './pages/MyCVsPage';
import { CreateCVPage } from './pages/CreateCVPage';
import { CVEditorPage } from './pages/CVEditorPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/my-cvs" replace />} />
        <Route path="/my-cvs" element={<MyCVsPage />} />
        <Route path="/optimize" element={<OptimizePage />} />
        <Route path="/create" element={<CreateCVPage />} />
        <Route path="/cv/:id" element={<CVEditorPage />} />
      </Route>
    </Routes>
  );
}

export default App;
