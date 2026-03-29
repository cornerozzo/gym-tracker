'use client'

import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signIn = async () => {
    // Temporaneo: bypass autenticazione
    window.location.href = '/home'
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Gym Tracker</h1>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={signIn}>Login</button>
    </div>
  )
}