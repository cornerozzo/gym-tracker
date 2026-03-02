'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signUp = async () => {
    await supabase.auth.signUp({ email, password })
    alert('Registrato')
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (!error) window.location.href = '/home'
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