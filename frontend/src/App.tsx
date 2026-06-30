import { DropZone } from './components/DropZone/DropZone';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>🎓 University Search</h1>
        <p>Интеллектуальная поисковая система университета</p>
      </header>

      <main className="app__main">
        <DropZone />
      </main>

      <footer className="app__footer">
        <p>© 2026 University Search Project | Учебная практика БПИ24</p>
      </footer>
    </div>
  );
}

export default App;


