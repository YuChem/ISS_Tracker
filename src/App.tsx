import React from 'react';
import ISSTracker from './components/ISSTracker';
import { Satellite } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Satellite className="h-8 w-8 text-blue-400 mr-3" />
          <h1 className="text-2xl font-bold">ISS Tracker</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">International Space Station Location</h2>
            <p className="text-gray-300">
              Track the real-time position of the International Space Station as it orbits Earth.
              The map below shows the current location of the ISS, which is updated every 15 seconds.
            </p>
          </div>
          
          <ISSTracker />
          
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">About the ISS</h3>
            <p className="text-gray-300 mb-3">
              The International Space Station is a modular space station in low Earth orbit. 
              It's a multinational collaborative project involving NASA, Roscosmos, JAXA, ESA, and CSA.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Orbits at approximately 400 km (250 mi) above Earth</li>
              <li>Travels at about 28,000 km/h (17,500 mph)</li>
              <li>Completes 15.5 orbits per day</li>
              <li>Has been continuously occupied since November 2000</li>
            </ul>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>Data provided by the Open Notify API. This application updates the ISS position every 15 seconds.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
