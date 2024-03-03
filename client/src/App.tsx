import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import { LoginForm } from './pages/LoginForm';
import { SignUpForm } from './pages/SignUpForm';

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" index element={<SignUpForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
