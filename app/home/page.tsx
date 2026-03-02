'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    const { data } = await supabase.from('sessions').select('*')
    setSessions(data || [])
  }

  const createSession = async () => {
    await supabase.from('sessions').insert({
      date: new Date().toISOString().split('T')[0],
      type: 'gym'
    })
    loadSessions()
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Home</h1>
      <button onClick={createSession}>+ Nuova Sessione</button>

      {sessions.map((s) => (
        <div key={s.id}>
          {s.date} - {s.type}
        </div>
      ))}
    </div>
  )
}