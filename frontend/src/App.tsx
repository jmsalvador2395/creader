import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 class="text-3xl font-bold underline">
        Hello world!
      </h1> 
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Tailwind is working 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          If you see colors, spacing, and rounded corners, everything is set up
          correctly.
        </p>

        <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-95 transition">
          Click me
        </button>

        <div className="mt-6 flex gap-2">
          <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
            Success
          </span>
          <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
            Warning
          </span>
          <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700">
            Error
          </span>
        </div>
      </div>
    </div>
    </>
  )
}

export default App
