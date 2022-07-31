import { Routes, Route, HashRouter } from 'react-router-dom';
import Home from './pages/home/Home';
import { Top } from './pages/top/Top';
import Edit from './pages/edit/Edit';
import { SettingsWrap } from './pages/settings/Settings';
import 'bootstrap/dist/css/bootstrap.css';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Top />} />
        <Route path="/home" element={<Home />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/settings" element={<SettingsWrap />} />
      </Routes>
    </HashRouter>
  );
}
