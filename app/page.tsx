'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      alert('Errore registrazione: ' + error.message)
    } else {
      alert('Registrato! Controlla l\'email per confermare.')
    }
  }

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
      <button onClick={signUp}>Register</button>
    </div>
  )
}