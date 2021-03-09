import './App.css';
import Theme from '../components/theme/Theme.js'
import Calendar from '../components/calendar/Calendar.js'

function App() {
  return (
    <Theme>
      <div className="App">
        <Calendar/>
      </div>
    </Theme>
  );
}

export default App;
