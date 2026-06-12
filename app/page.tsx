'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Atom, Cpu, FunctionSquare, ChevronRight, Search, LogOut, Mail, FileXCorner } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, } from "@/components/ui/empty"
import Link from "next/link"

interface Document {
  id: string
  title: string
  level: 'PTSI' | 'PT'
  matiere: 'Mathématiques' | 'Physique' | 'Chimie' | 'SI'
  type: 'Cours' | 'TD' | 'DM' | 'DS' | 'Colles'
  tags: string[]
  file_path: string
  owner: string | null
  created_at: string
}

const matiereIcon: Record<string, React.ReactNode> = {
  Maths: <FunctionSquare className="size-5" />,
  Physique: <Atom className="size-5" />,
  SI: <Cpu className="size-5" />,
}

const matiereColor: Record<string, string> = {
  Maths: 'bg-blue-50 text-blue-700',
  Physique: 'bg-emerald-50 text-emerald-700',
  SI: 'bg-amber-50 text-amber-700',
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
      if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'date-desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === 'date-asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sort === 'title-asc') return a.title.localeCompare(b.title)
      return b.title.localeCompare(a.title)
    })

  if (loading) return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-svh bg-muted">
      <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
        <h1 className="font-medium text-lg">Cours de Prépa</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="size-4 mr-2" />
          Déconnexion
        </Button>
      </header>

      <div className="flex gap-6 p-6 max-w-6xl mx-auto">

        <aside className="w-52 shrink-0 flex flex-col gap-4">
          <div className="bg-background rounded-xl border p-4 flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Niveau</p>
              {['all', 'PTSI', 'PT'].map(v => (
                <button
                  key={v}
                  onClick={() => setLevel(v)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-md mb-0.5 transition-colors ${level === v ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                  {v === 'all' ? 'Tous' : v}
                </button>
              ))}
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Matière</p>
              {['all', 'Maths', 'Physique', 'SI'].map(v => (
                <button
                  key={v}
                  onClick={() => setMatiere(v)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-md mb-0.5 transition-colors ${matiere === v ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                  {v === 'all' ? 'Toutes' : v}
                </button>
              ))}
            </div>

            <div className="border-t pt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Type</p>
              {['all', 'Cours', 'TD', 'DS', 'DM'].map(v => (
                <button
                  key={v}
                  onClick={() => setType(v)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-md mb-0.5 transition-colors ${type === v ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                  {v === 'all' ? 'Tous' : v}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setLevel('all'); setMatiere('all'); setType('all'); setSearch('') }}
              className="text-xs text-muted-foreground hover:text-foreground border rounded-md py-1.5 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-40 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Plus récent</SelectItem>
                <SelectItem value="date-asc">Plus ancien</SelectItem>
                <SelectItem value="title-asc">A → Z</SelectItem>
                <SelectItem value="title-desc">Z → A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            {filtered.length} document{filtered.length > 1 ? 's' : ''}
          </p>

          {filtered.length === 0 ? (
            <Empty className="h-full bg-muted/30">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileXCorner />
        </EmptyMedia>
        <EmptyTitle>Aucun document</EmptyTitle>
        <EmptyDescription className="max-w-xs text-pretty">
          Si vous pensez qu'il s'agit d'un problème, contacter l'administrateur
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">
            <Link href="mailto:tonadresse@mail.com">
              <Mail />
              Contact
            </Link>
        </Button>
      </EmptyContent>
    </Empty>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map(doc => (
                <a
                  key={doc.id}
                  href={doc.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-background rounded-xl border px-4 py-3 flex items-center gap-4 hover:border-border/80 hover:bg-muted/30 transition-colors no-underline group"
                >
                  <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${matiereColor[doc.matiere] ?? 'bg-muted text-muted-foreground'}`}>
                    {matiereIcon[doc.matiere] ?? <FunctionSquare className="size-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{doc.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{doc.level}</Badge>
                      <Badge variant="secondary" className="text-xs">{doc.matiere}</Badge>
                      <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                      {doc.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  <ChevronRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </a>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}