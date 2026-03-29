'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Filter, Dumbbell, Heart, Timer, Trash2, X } from 'lucide-react'

interface WorkoutSession {
  id: string
  date: string
  exercises: Exercise[]
  effort?: number
  duration?: number
  notes?: string
}

interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  bodyPart: string
  sets: Set[]
  effort?: number
}

interface Set {
  id: string
  reps: number
  weight: number
  restTime: number
  effort?: number
}

const EXERCISES_DATABASE = {
  petto: [
    { name: 'Spinta su panca inclinata manubri', equipment: 'manubri', bodyPart: 'petto' },
    { name: 'Spinta panca inclinata 30°', equipment: 'manubri', bodyPart: 'petto' },
    { name: 'Spinta panca inclinata 45°', equipment: 'manubri', bodyPart: 'petto' },
    { name: 'Panca piana manubri', equipment: 'manubri', bodyPart: 'petto' },
    { name: 'Panca piana bilanciere', equipment: 'bilanciere', bodyPart: 'petto' },
    { name: 'Panca inclinata bilanciere', equipment: 'bilanciere', bodyPart: 'petto' },
    { name: 'Chest fly macchina', equipment: 'macchina', bodyPart: 'petto' },
    { name: 'Chest fly manubri', equipment: 'manubri', bodyPart: 'petto' },
    { name: 'Chest fly cavi', equipment: 'cavi', bodyPart: 'petto' },
    { name: 'Flessioni', equipment: 'corpo libero', bodyPart: 'petto' },
    { name: 'Flessioni a rullo', equipment: 'rullo', bodyPart: 'petto' },
    { name: 'Spinta multipower', equipment: 'multipower', bodyPart: 'petto' },
    { name: 'Petto multipower', equipment: 'multipower', bodyPart: 'petto' },
  ],
  spalle: [
    { name: 'Spinta panca 90°', equipment: 'manubri', bodyPart: 'spalle' },
    { name: 'Alzate laterali', equipment: 'manubri', bodyPart: 'spalle' },
    { name: 'Military press', equipment: 'bilanciere', bodyPart: 'spalle' },
    { name: 'Face pulley', equipment: 'cavi', bodyPart: 'spalle' },
  ],
  schiena: [
    { name: 'Trazioni', equipment: 'sbarra', bodyPart: 'schiena' },
    { name: 'Trazioni zavorrate', equipment: 'sbarra', bodyPart: 'schiena' },
    { name: 'Muscle up', equipment: 'sbarra', bodyPart: 'schiena' },
    { name: 'Lat machine', equipment: 'macchina', bodyPart: 'schiena' },
    { name: 'Pulley', equipment: 'cavi', bodyPart: 'schiena' },
    { name: 'Pulley singolo', equipment: 'cavi', bodyPart: 'schiena' },
    { name: 'Rematore cavo', equipment: 'cavi', bodyPart: 'schiena' },
    { name: 'Rematore macchina', equipment: 'macchina', bodyPart: 'schiena' },
  ],
  bicipiti: [
    { name: 'Bicipiti manubri', equipment: 'manubri', bodyPart: 'bicipiti' },
    { name: 'Bicipiti bilanciere', equipment: 'bilanciere', bodyPart: 'bicipiti' },
    { name: 'Bicipiti cavi', equipment: 'cavi', bodyPart: 'bicipiti' },
  ],
  tricipiti: [
    { name: 'Tricipiti cavi singolo', equipment: 'cavi', bodyPart: 'tricipiti' },
    { name: 'Tricipiti cavi doppio', equipment: 'cavi', bodyPart: 'tricipiti' },
    { name: 'Tricipiti sbarra', equipment: 'sbarra', bodyPart: 'tricipiti' },
    { name: 'French press', equipment: 'bilanciere', bodyPart: 'tricipiti' },
    { name: 'Dips', equipment: 'parallele', bodyPart: 'tricipiti' },
  ],
  addominali: [
    { name: 'Addominali macchina', equipment: 'macchina', bodyPart: 'addominali' },
    { name: 'Sit-up', equipment: 'corpo libero', bodyPart: 'addominali' },
    { name: 'Candele', equipment: 'corpo libero', bodyPart: 'addominali' },
    { name: 'Super set addome', equipment: 'corpo libero', bodyPart: 'addominali' },
    { name: 'Bandiera', equipment: 'corpo libero', bodyPart: 'addominali' },
    { name: 'Rotella', equipment: 'rotella', bodyPart: 'addominali' },
    { name: 'L-sit sbarra', equipment: 'sbarra', bodyPart: 'addominali' },
  ],
  gambe: [
    { name: 'Squat', equipment: 'bilanciere', bodyPart: 'gambe' },
    { name: 'Squat accosciati', equipment: 'corpo libero', bodyPart: 'gambe' },
    { name: 'Affondi', equipment: 'corpo libero', bodyPart: 'gambe' },
    { name: 'Affondi rumeni', equipment: 'manubri', bodyPart: 'gambe' },
    { name: 'Affondi rumeni camminati', equipment: 'manubri', bodyPart: 'gambe' },
    { name: 'Pressa 45°', equipment: 'macchina', bodyPart: 'gambe' },
    { name: 'Stacco da terra', equipment: 'bilanciere', bodyPart: 'gambe' },
    { name: 'Stacco da rialzo', equipment: 'bilanciere', bodyPart: 'gambe' },
  ],
  cardio: [
    { name: 'Basket', equipment: 'campo', bodyPart: 'cardio' },
    { name: 'Corsa', equipment: 'corpo libero', bodyPart: 'cardio' },
    { name: 'Trekking montagna', equipment: 'corpo libero', bodyPart: 'cardio' },
    { name: 'Trekking pianura', equipment: 'corpo libero', bodyPart: 'cardio' },
    { name: 'Kayak', equipment: 'kayak', bodyPart: 'cardio' },
    { name: 'Nuoto', equipment: 'piscina', bodyPart: 'cardio' },
    { name: 'Mountain bike', equipment: 'bici', bodyPart: 'cardio' },
    { name: 'Bici', equipment: 'bici', bodyPart: 'cardio' },
  ],
  benessere: [
    { name: 'Stretching', equipment: 'corpo libero', bodyPart: 'benessere' },
    { name: 'Meditazione', equipment: 'corpo libero', bodyPart: 'benessere' },
  ]
}

export default function Home() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gym-sessions')
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('gym-sessions', JSON.stringify(sessions))
  }, [sessions])

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const getMonthDays = () => {
    const start = startOfMonth(currentWeek)
    const end = endOfMonth(currentWeek)
    return eachDayOfInterval({ start, end })
  }

  const getDays = () => {
    return viewMode === 'week' ? getWeekDays() : getMonthDays()
  }

  const getSessionForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return sessions.find((s: WorkoutSession) => s.date === dateStr)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek((prev: Date) => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1))
  }

  const getBodyParts = () => [
    { id: 'petto', name: 'Petto', icon: '💪' },
    { id: 'spalle', name: 'Spalle', icon: '🦾' },
    { id: 'schiena', name: 'Schiena', icon: '🏋️' },
    { id: 'bicipiti', name: 'Bicipiti', icon: '💪' },
    { id: 'tricipiti', name: 'Tricipiti', icon: '💪' },
    { id: 'addominali', name: 'Addominali', icon: '🔥' },
    { id: 'gambe', name: 'Gambe', icon: '🦵' },
    { id: 'cardio', name: 'Cardio', icon: '🏃' },
    { id: 'benessere', name: 'Benessere', icon: '🧘' },
  ]

  const addExercise = (exerciseName: string, category: string, equipment: string, bodyPart: string) => {
    const exerciseId = crypto.randomUUID()
    const setId = crypto.randomUUID()
    
    // Per cardio, bici e addominali usiamo minuti invece di kg
    const isTimeBased = ['cardio', 'benessere'].includes(category) || 
                       (category === 'addominali' && (equipment === 'corpo libero' || equipment === 'rotella' || equipment === 'sbarra'))
    
    const newExercise: Exercise = {
      id: exerciseId,
      name: exerciseName,
      category,
      equipment,
      bodyPart,
      sets: [
        {
          id: setId,
          reps: isTimeBased ? 1 : 12, // Per time-based solo 1 "set"
          weight: isTimeBased ? 15 : 10, // Per time-based usiamo minuti
          restTime: isTimeBased ? 0 : 60, // Per time-based non serve recupero
          effort: 7
        }
      ]
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const existingSession = sessions.find(s => s.date === dateStr)
    
    if (existingSession) {
      const updatedSessions = sessions.map(session => 
        session.date === dateStr 
          ? { ...session, exercises: [...session.exercises, newExercise] }
          : session
      )
      setSessions(updatedSessions)
    } else {
      const sessionId = crypto.randomUUID()
      const newSession: WorkoutSession = {
        id: sessionId,
        date: dateStr,
        exercises: [newExercise],
        effort: 7,
        duration: 45
      }
      setSessions([...sessions, newSession])
    }

    setShowExerciseModal(false)
  }

  const addSet = (exerciseId: string) => {
    const setId = crypto.randomUUID()
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const updatedSessions = sessions.map(session => {
      if (session.date === dateStr) {
        return {
          ...session,
          exercises: session.exercises.map(exercise => {
            if (exercise.id === exerciseId) {
              // Verifica se è un esercizio time-based
              const isTimeBased = ['cardio', 'benessere'].includes(exercise.category) || 
                                 (exercise.category === 'addominali' && (exercise.equipment === 'corpo libero' || exercise.equipment === 'rotella' || exercise.equipment === 'sbarra'))
              
              const newSet: Set = {
                id: setId,
                reps: isTimeBased ? 1 : 12,
                weight: isTimeBased ? 15 : 10,
                restTime: isTimeBased ? 0 : 60,
                effort: 7
              }
              return {
                ...exercise,
                sets: [...exercise.sets, newSet]
              }
            }
            return exercise
          })
        }
      }
      return session
    })
    setSessions(updatedSessions)
  }

  const removeExercise = (exerciseId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const updatedSessions = sessions.map(session => {
      if (session.date === dateStr) {
        return {
          ...session,
          exercises: session.exercises.filter(exercise => exercise.id !== exerciseId)
        }
      }
      return session
    })
    setSessions(updatedSessions)
  }

  const removeSet = (exerciseId: string, setId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const updatedSessions = sessions.map(session => {
      if (session.date === dateStr) {
        return {
          ...session,
          exercises: session.exercises.map(exercise => {
            if (exercise.id === exerciseId) {
              return {
                ...exercise,
                sets: exercise.sets.filter(set => set.id !== setId)
              }
            }
            return exercise
          })
        }
      }
      return session
    })
    setSessions(updatedSessions)
  }

  const calculateTotalWorkoutTime = (session: WorkoutSession) => {
    let totalMinutes = 0
    
    session.exercises.forEach(exercise => {
      const isTimeBased = ['cardio', 'benessere'].includes(exercise.category) || 
                         (exercise.category === 'addominali' && (exercise.equipment === 'corpo libero' || exercise.equipment === 'rotella' || exercise.equipment === 'sbarra'))
      
      if (isTimeBased) {
        // Per esercizi time-based, sommiamo i minuti
        exercise.sets.forEach(set => {
          totalMinutes += set.weight
        })
      } else {
        // Per esercizi con pesi, stimiamo 2 minuti per set + recupero
        exercise.sets.forEach(set => {
          totalMinutes += 2 + (set.restTime / 60)
        })
      }
    })
    
    return Math.round(totalMinutes)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-orange-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="max-w-md mx-auto min-h-screen relative">
        {/* Enhanced glass background */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/20"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="px-4 pt-12 pb-4 border-b border-white/30 backdrop-blur-xl bg-white/20">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">GYM PRO</h1>
              <button
                onClick={() => setShowFilterModal(true)}
                className="p-2.5 bg-white/40 backdrop-blur-xl rounded-xl border border-white/50 shadow-xl hover:bg-white/50 transition-all duration-300 hover:scale-105"
              >
                <Filter className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2.5 bg-white/40 backdrop-blur-xl rounded-xl border border-white/50 shadow-xl hover:bg-white/50 transition-all duration-300 hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-xl border shadow-lg hover:scale-105 ${
                    viewMode === 'week' 
                      ? 'bg-orange-500/90 text-white border-orange-400/60 shadow-orange-500/30' 
                      : 'bg-white/40 text-gray-600 border-white/50 hover:bg-white/50'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-xl border shadow-lg hover:scale-105 ${
                    viewMode === 'month' 
                      ? 'bg-orange-500/90 text-white border-orange-400/60 shadow-orange-500/30' 
                      : 'bg-white/40 text-gray-600 border-white/50 hover:bg-white/50'
                  }`}
                >
                  Month
                </button>
              </div>

              <button
                onClick={() => navigateWeek('next')}
                className="p-2.5 bg-white/40 backdrop-blur-xl rounded-xl border border-white/50 shadow-xl hover:bg-white/50 transition-all duration-300 hover:scale-105"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className={`grid gap-1.5 ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
              {getDays().map((day) => {
                const session = getSessionForDate(day)
                const isSelected = isSameDay(day, selectedDate)
                const isTodayDate = isToday(day)
                
                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`p-2.5 px-1.5 rounded-xl border transition-all duration-300 backdrop-blur-xl hover:scale-105 ${
                      isSelected
                        ? 'bg-orange-500/90 border-orange-400/60 text-white shadow-xl shadow-orange-500/30'
                        : isTodayDate
                        ? 'bg-orange-100/60 border-orange-200/60 text-orange-600 shadow-lg'
                        : 'bg-white/30 border-white/40 text-gray-700 hover:bg-white/40'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium mb-1">
                        {format(day, viewMode === 'week' ? 'EEE' : 'EEE')}
                      </div>
                      <div className="text-sm font-semibold">
                        {format(day, 'd')}
                      </div>
                      {session && (
                        <div className="mt-1">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mx-auto shadow-lg animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Workout Area */}
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h2>
              <button
                onClick={() => setShowExerciseModal(true)}
                className="p-3.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 hover:scale-110 backdrop-blur-xl"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Today's Summary Card */}
            {(() => {
              const session = getSessionForDate(selectedDate)
              if (!session || session.exercises.length === 0) {
                return (
                  <div className="bg-white/40 backdrop-blur-2xl rounded-2xl p-6 border border-white/50 shadow-2xl mb-6 hover:shadow-3xl transition-all duration-300">
                    <div className="text-center">
                      <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-60" />
                      <p className="text-gray-600 font-medium">No workout today</p>
                      <p className="text-gray-500 text-sm mt-1">Tap + to add exercises</p>
                    </div>
                  </div>
                )
              }

              return (
                <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-2xl rounded-2xl p-4 mb-6 text-white border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium tracking-tight">Today&apos;s Workout</span>
                    {session.effort && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="font-bold">{session.effort}/10</span>
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold mb-1">{session.exercises.length} Exercises</div>
                  <div className="flex items-center gap-1 text-white/90 text-sm">
                    <Timer className="w-3 h-3" />
                    <span>{calculateTotalWorkoutTime(session)} min</span>
                  </div>
                </div>
              )
            })()}

            {/* Exercise List */}
            <div className="space-y-3">
              {(() => {
                const session = getSessionForDate(selectedDate)
                if (!session || session.exercises.length === 0) return null

                return session.exercises.map((exercise, index) => {
                    const isTimeBased = ['cardio', 'benessere'].includes(exercise.category) || 
                                       (exercise.category === 'addominali' && (exercise.equipment === 'corpo libero' || exercise.equipment === 'rotella' || exercise.equipment === 'sbarra'))
                    
                    return (
                  <div
                    key={exercise.id}
                    className="bg-white/40 backdrop-blur-2xl rounded-2xl p-4 border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100/60 backdrop-blur-xl rounded-xl flex items-center justify-center border border-orange-200/60 shadow-lg">
                          <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 tracking-tight">{exercise.name}</h3>
                          <p className="text-sm text-gray-500">{exercise.equipment}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {exercise.effort && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-gray-700 text-sm font-medium">{exercise.effort}</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeExercise(exercise.id)}
                          className="p-1.5 bg-red-100/60 hover:bg-red-100/80 rounded-xl transition-all duration-300 hover:scale-110 backdrop-blur-xl"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={set.id} className="bg-white/30 backdrop-blur-xl rounded-xl p-3 flex items-center justify-between border border-white/40 hover:bg-white/40 transition-all duration-300">
                          <span className="text-gray-600 text-sm font-medium">Set {setIndex + 1}</span>
                          <div className="flex items-center gap-4">
                            {!isTimeBased && (
                              <>
                                <span className="text-gray-900 font-medium">{set.reps}</span>
                                <span className="text-gray-500 text-sm">reps</span>
                              </>
                            )}
                            <span className="text-gray-900 font-medium">{set.weight}</span>
                            <span className="text-gray-500 text-sm">{isTimeBased ? 'min' : 'kg'}</span>
                            {!isTimeBased && (
                              <div className="flex items-center gap-1">
                                <Timer className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600 text-sm">{set.restTime}s</span>
                              </div>
                            )}
                            <button
                              onClick={() => removeSet(exercise.id, set.id)}
                              className="p-1 bg-red-100/60 hover:bg-red-100/80 rounded-lg transition-all duration-300 hover:scale-110 backdrop-blur-xl"
                            >
                              <X className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => addSet(exercise.id)}
                        className="w-full bg-orange-100/60 hover:bg-orange-100/80 rounded-xl p-2.5 flex items-center justify-center gap-2 transition-all duration-300 border border-orange-200/60 hover:scale-105 backdrop-blur-xl"
                      >
                        <Plus className="w-4 h-4 text-orange-600" />
                        <span className="text-orange-600 text-sm font-medium">Add Set</span>
                      </button>
                    </div>
                  </div>
                )
              })
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Selection Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-end z-50">
          <div className="bg-white/90 backdrop-blur-2xl w-full max-w-md mx-auto rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto border border-white/40 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Select Exercise</h3>
              <button
                onClick={() => setShowExerciseModal(false)}
                className="p-2.5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 hover:bg-white/70 transition-all duration-300 hover:scale-110"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {getBodyParts().map((part) => (
                <div key={part.id}>
                  <h4 className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <span>{part.icon}</span> {part.name}
                  </h4>
                  <div className="space-y-2">
                    {EXERCISES_DATABASE[part.id as keyof typeof EXERCISES_DATABASE]?.map((exercise) => (
                      <button
                        key={exercise.name}
                        onClick={() => addExercise(exercise.name, part.id, exercise.equipment, exercise.bodyPart)}
                        className="w-full bg-white/50 hover:bg-white/70 rounded-xl p-3.5 text-left text-gray-900 transition-all duration-300 border border-white/40 backdrop-blur-xl hover:scale-[1.02] hover:shadow-lg"
                      >
                        {exercise.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-end z-50">
          <div className="bg-white/90 backdrop-blur-2xl w-full max-w-md mx-auto rounded-t-3xl p-6 border border-white/40 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Filter by Body Part</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2.5 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 hover:bg-white/70 transition-all duration-300 hover:scale-110"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {getBodyParts().map((part) => (
                <button
                  key={part.id}
                  onClick={() => {
                    setSelectedCategory(part.id)
                    setShowFilterModal(false)
                  }}
                  className={`p-4 rounded-xl border transition-all duration-300 backdrop-blur-xl hover:scale-110 ${
                    selectedCategory === part.id
                      ? 'bg-orange-500/90 border-orange-400/60 text-white shadow-xl shadow-orange-500/30'
                      : 'bg-white/50 border-white/40 text-gray-700 hover:bg-white/60 hover:shadow-lg'
                  }`}
                >
                  <div className="text-2xl mb-1">{part.icon}</div>
                  <div className="text-sm font-medium">{part.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}