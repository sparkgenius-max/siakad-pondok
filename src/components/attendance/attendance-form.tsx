'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { saveAttendance } from '@/app/(dashboard)/attendance/actions'

interface SantriOption {
    id: string
    name: string
    nis: string
}

interface ExistingAttendance {
    santri_id: string
    status: 'present' | 'sick' | 'permission' | 'alpha'
    notes: string | null
}

interface AttendanceFormProps {
    santriList: SantriOption[]
    existingAttendance: ExistingAttendance[]
    date: string
    className: string
}

export function AttendanceForm({ santriList, existingAttendance, date, className }: AttendanceFormProps) {
    const defaultStatuses = santriList.reduce((acc, santri) => {
        const existing = existingAttendance.find(a => a.santri_id === santri.id)
        acc[santri.id] = existing?.status || 'present'
        return acc
    }, {} as Record<string, 'present' | 'sick' | 'permission' | 'alpha'>)

    const [statuses, setStatuses] = useState(defaultStatuses)
    const [notes, setNotes] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    const updateStatus = (santriId: string, status: 'present' | 'sick' | 'permission' | 'alpha') => {
        setStatuses(prev => ({ ...prev, [santriId]: status }))
    }

    const updateNote = (santriId: string, note: string) => {
        setNotes(prev => ({ ...prev, [santriId]: note }))
    }

    const handleSubmit = async () => {
        setSaving(true)
        const formData = new FormData()

        // Append date
        formData.append('date', date)

        // Append each santri's status and notes
        Object.entries(statuses).forEach(([santriId, status]) => {
            formData.append(`status_${santriId}`, status)
            if (notes[santriId]) {
                formData.append(`notes_${santriId}`, notes[santriId])
            }
        })

        const result = await saveAttendance(formData)

        setSaving(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Absensi berhasil disimpan')
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Absensi Santri</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Kelas {className} • {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" />Simpan Absensi</>
                    )}
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">No</TableHead>
                            <TableHead>NIS</TableHead>
                            <TableHead>Nama Santri</TableHead>
                            <TableHead className="text-center w-[100px]">Hadir</TableHead>
                            <TableHead className="text-center w-[100px]">Sakit</TableHead>
                            <TableHead className="text-center w-[100px]">Izin</TableHead>
                            <TableHead className="text-center w-[100px]">Alpha</TableHead>
                            <TableHead>Catatan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {santriList.map((santri, index) => {
                            const status = statuses[santri.id]

                            return (
                                <TableRow key={santri.id} className={status === 'alpha' ? 'bg-red-50' : ''}>
                                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-mono text-sm">{santri.nis}</TableCell>
                                    <TableCell className="font-medium">{santri.name}</TableCell>

                                    {/* Status Radio Buttons */}
                                    <TableCell className="text-center">
                                        <input
                                            type="radio"
                                            name={`status_${santri.id}`}
                                            checked={status === 'present'}
                                            onChange={() => updateStatus(santri.id, 'present')}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <input
                                            type="radio"
                                            name={`status_${santri.id}`}
                                            checked={status === 'sick'}
                                            onChange={() => updateStatus(santri.id, 'sick')}
                                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <input
                                            type="radio"
                                            name={`status_${santri.id}`}
                                            checked={status === 'permission'}
                                            onChange={() => updateStatus(santri.id, 'permission')}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <input
                                            type="radio"
                                            name={`status_${santri.id}`}
                                            checked={status === 'alpha'}
                                            onChange={() => updateStatus(santri.id, 'alpha')}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <input
                                            type="text"
                                            placeholder="Catatan..."
                                            value={notes[santri.id] || ''}
                                            onChange={(e) => updateNote(santri.id, e.target.value)}
                                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
