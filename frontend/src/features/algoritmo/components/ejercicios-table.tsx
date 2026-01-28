'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fetchCatalogoEjercicios } from '../actions/fetch-catalogo';
import type { CatalogoEjercicio, CatalogoEjerciciosResponse } from '../types/algoritmo.types';

const TIPO_LABELS: Record<string, string> = {
  FISICO: 'Fisico',
  TECNICO_TACHI: 'Tecnico Tachi-waza',
  TECNICO_NE: 'Tecnico Ne-waza',
  RESISTENCIA: 'Resistencia',
  VELOCIDAD: 'Velocidad',
};

const TIPOS = [
  { value: 'ALL', label: 'Todos los tipos' },
  { value: 'FISICO', label: 'Fisico' },
  { value: 'TECNICO_TACHI', label: 'Tecnico Tachi-waza' },
  { value: 'TECNICO_NE', label: 'Tecnico Ne-waza' },
  { value: 'RESISTENCIA', label: 'Resistencia' },
  { value: 'VELOCIDAD', label: 'Velocidad' },
];

interface EjerciciosTableProps {
  dataInicial: CatalogoEjerciciosResponse;
}

// Tabla de ejercicios del catalogo con filtros
export function EjerciciosTable({ dataInicial }: EjerciciosTableProps) {
  const [data, setData] = useState<CatalogoEjerciciosResponse>(dataInicial);
  const [tipoFiltro, setTipoFiltro] = useState<string>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleTipoChange(value: string) {
    setTipoFiltro(value);
    startTransition(async () => {
      const result = await fetchCatalogoEjercicios({
        tipo: value === 'ALL' ? undefined : value,
        search: searchInput || undefined,
      });
      if (result) {
        setData(result);
      }
    });
  }

  function handleSearch() {
    startTransition(async () => {
      const result = await fetchCatalogoEjercicios({
        tipo: tipoFiltro === 'ALL' ? undefined : tipoFiltro,
        search: searchInput || undefined,
      });
      if (result) {
        setData(result);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <Select value={tipoFiltro} onValueChange={handleTipoChange}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tipo de ejercicio" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder="Buscar por nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            variant="outline"
            onClick={handleSearch}
            disabled={isPending}
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Info */}
      <p className="text-sm text-muted-foreground">
        {data.meta.total} ejercicio{data.meta.total !== 1 ? 's' : ''} encontrado{data.meta.total !== 1 ? 's' : ''}
      </p>

      {/* Tabla */}
      {data.data.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No se encontraron ejercicios con los filtros seleccionados.
        </p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Subtipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Duracion (min)</TableHead>
                <TableHead>Dificultad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((ej) => (
                <TableRow key={ej.id}>
                  <TableCell className="font-medium">{ej.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {TIPO_LABELS[ej.tipo] || ej.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{ej.subtipo || '-'}</TableCell>
                  <TableCell>{ej.categoria || '-'}</TableCell>
                  <TableCell className="font-mono">
                    {ej.duracionMinutos ?? '-'}
                  </TableCell>
                  <TableCell className="font-mono">
                    {ej.nivelDificultad ?? '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
