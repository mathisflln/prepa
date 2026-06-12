'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Atom, Cpu, FunctionSquare, ChevronRight, Search, LogOut, Mail, FileX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import Link from "next/link"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface Document {
  id: string
  title: string
  level: 'PTSI' | 'PT'
  matiere: string
  type: string
  tags: string[]
  file_path: string
  owner: string | null
  created_at: string
}

const matiereConfig: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  Mathématiques: {
    icon: <FunctionSquare className="size-5" />,
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  Physique: {
    icon: <Atom className="size-5" />,
    bg: 'bg-violet-100 dark:bg-violet-950',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
  },
  SI: {
    icon: <Cpu className="size-5" />,
    bg: 'bg-amber-100 dark:bg-amber-950',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
}

const levelColor: Record<string, string> = {
  PTSI: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  PT: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
}

const typeColor: Record<string, string> = {
  Cours: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  TD: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  DS: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  DM: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border hover:bg-muted'
      }`}
    >
      {label}
    </button>
  )
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [matiere, setMatiere] = useState('all')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('date-desc')
  const router = useRouter()

  useEffect(() => {
    const fetchDocs = async () => {
      const { data, error } = await supabase.from('documents').select('*')
      if (error) console.error(error)
      else setDocs(data || [])
      setLoading(false)
    }
    fetchDocs()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filtered = docs
    .filter(d => {
      if (level !== 'all' && d.level !== level) return false
      if (matiere !== 'all' && d.matiere !== matiere) return false
      if (type !== 'all' && d.type !== type) return false
      if (search && !d.title.toLowerCase().includes(search.toLowerCase()) &&
          !d.tags?.join(' ').toLowerCase().includes(search.toLowerCase())) return false
      return true
    })

  if (loading) return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  )

  const m = matiereConfig[matiere] ?? null

  return (
    <div className="min-h-svh bg-muted">
      <header className="bg-background border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-medium text-lg">Cours de Prépa</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="size-4 mr-2" />
          Déconnexion
        </Button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* Barre de recherche + tri */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document ou un thème..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Filtres */}
        <div className="bg-background rounded-xl border p-4 flex flex-col gap-4">

            <ToggleGroup
              type="single"
              value={level}
              onValueChange={(v) => v && setLevel(v)}
              className="justify-start flex-wrap"
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="all">Tous</ToggleGroupItem>
              <ToggleGroupItem value="PTSI">PTSI</ToggleGroupItem>
              <ToggleGroupItem value="PT">PT</ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup
              type="single"
              value={matiere}
              onValueChange={(v) => v && setMatiere(v)}
              className="justify-start flex-wrap"
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="all">Toutes</ToggleGroupItem>
              <ToggleGroupItem value="Mathématiques">Maths</ToggleGroupItem>
              <ToggleGroupItem value="Physique">Physique</ToggleGroupItem>
              <ToggleGroupItem value="SI">SI</ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup
              type="single"
              value={type}
              onValueChange={(v) => v && setType(v)}
              className="justify-start flex-wrap"
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="all">Tous</ToggleGroupItem>
              <ToggleGroupItem value="Cours">Cours</ToggleGroupItem>
              <ToggleGroupItem value="TD">TD</ToggleGroupItem>
              <ToggleGroupItem value="DS">DS</ToggleGroupItem>
              <ToggleGroupItem value="DM">DM</ToggleGroupItem>
            </ToggleGroup>

          {(level !== 'all' ||
            matiere !== 'all' ||
            type !== 'all' ||
            search) && (
            <>
              <div className="border-t" />

              <Button
                variant="ghost"
                size="sm"
                className="w-fit"
                onClick={() => {
                  setLevel('all')
                  setMatiere('all')
                  setType('all')
                  setSearch('')
                }}
              >
                Réinitialiser les filtres
              </Button>
            </>
          )}
        </div>

        {/* Résultats */}
        <p className="text-sm text-muted-foreground">
          {filtered.length} document{filtered.length > 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <Empty className="bg-background border rounded-xl">
            <EmptyHeader>
              <EmptyMedia variant="icon"><FileX /></EmptyMedia>
              <EmptyTitle>Aucun document</EmptyTitle>
              <EmptyDescription>Si vous pensez qu'il s'agit d'un problème, contactez l'administrateur.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" asChild>
                <Link href="mailto:mathis.follin@free.fr">
                  <Mail className="size-4 mr-2" />
                  Contact
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(doc => {
              const cfg = matiereConfig[doc.matiere]
              return (
                <a
                  key={doc.id}
                  href={doc.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background rounded-xl border px-4 py-3.5 flex items-center gap-4 hover:bg-muted/40 transition-colors group"
                >
                  <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 border ${cfg?.bg ?? 'bg-muted'} ${cfg?.text ?? 'text-muted-foreground'} ${cfg?.border ?? 'border-border'}`}>
                    {cfg?.icon ?? <FunctionSquare className="size-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate mb-1.5">{doc.title}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColor[doc.level] ?? 'bg-muted text-muted-foreground'}`}>
                        {doc.level}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg?.bg} ${cfg?.text}`}>
                        {doc.matiere}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[doc.type] ?? 'bg-muted text-muted-foreground'}`}>
                        {doc.type}
                      </span>
                      {doc.tags?.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}