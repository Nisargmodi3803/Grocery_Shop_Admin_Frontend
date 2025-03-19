import logo from './logo.svg';
import './App.css';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';
import { BrowserRouter } from 'react-router-dom';
import { NavRouters } from './Components/NavRouters';

function App() {
  return (
    <div className="App">
      <Header/>
      {/* <Sidebar/> */}
      <BrowserRouter>
        <NavRouters/>
      </BrowserRouter>
    </div>
  );
}

export default App;
