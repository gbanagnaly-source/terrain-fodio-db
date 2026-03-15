'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Globe,
  Building2,
  MapPin,
  CheckCircle,
  XCircle,
  Layers,
  TrendingUp,
  Clock,
  Activity,
  SearchCheck,
  SearchX,
  FileSearch,
  Settings,
  Pickaxe,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings, themePresets, chartColorSchemes, fontSizePresets, fontFamilyPresets } from '@/contexts/SettingsContext';

// Types
interface Terrain {
  id: string;
  ilot: number;
  lot: number;
  groupe: string | null;
  secteur: string | null;
  parcelle: number | null;
  execution: string | null;
  etat: string | null;
  titreFoncier: string | null;
  tp: string | null;
  numeroTitreProp: string | null;
  annee: number | null;
  pubJO: string | null;
  dateJO: string | null;
  nature: string | null;
  imm: string | null;
  possesseur: string | null;
  contact: string | null;
  email: string | null;
  statut: string;
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  general: {
    totalTerrains: number;
    uniqueIlots: number;
    uniqueLots: number;
    availableLots: number;
    soldLots: number;
    acdLots: number;
    lotsNonBatis: number;
  };
  byGroup: Record<string, { available: number; sold: number }>;
  bySector: Record<string, { available: number; sold: number }>;
  byExecution: Record<string, { available: number; sold: number }>;
  byNature: Record<string, { available: number; sold: number }>;
  byTP: Record<string, { available: number; sold: number }>;
  byPubJO: Record<string, { available: number; sold: number }>;
}

interface FormData {
  ilot: string;
  lot: string;
  groupe: string;
  secteur: string;
  parcelle: string;
  execution: string;
  etat: string;
  titreFoncier: string;
  tp: string;
  numeroTitreProp: string;
  annee: string;
  pubJO: string;
  dateJO: string;
  nature: string;
  imm: string;
  possesseur: string;
  contact: string;
  email: string;
  statut: string;
}

interface RecentSearch {
  id: string;
  type: 'ilot' | 'lot';
  value: string;
  success: boolean;
  timestamp: Date;
  terrain?: Terrain;
}

// Color theme - Green/Teal with multiple colors for charts
const COLORS = {
  primary: '#0d9488',
  secondary: '#14b8a6',
  available: '#10b981',
  sold: '#f97316',
  accent: '#059669',
};

// Multiple colors for charts with different elements
const CHART_COLORS = {
  available: '#10b981',   // emerald-500
  sold: '#f97316',        // orange-500
  availableAlt: '#14b8a6', // teal-500
  soldAlt: '#fb923c',      // orange-400
  groupA: '#8b5cf6',       // violet-500
  groupB: '#06b6d4',       // cyan-500
  sectorDW: '#3b82f6',     // blue-500
  sectorMO: '#ec4899',     // pink-500
};

const chartConfig: ChartConfig = {
  available: {
    label: 'Available',
    color: CHART_COLORS.available,
  },
  sold: {
    label: 'Sold',
    color: CHART_COLORS.sold,
  },
};

const NATURE_OPTIONS = ['BAT', 'BAT DUP', 'BAT R+2', 'CLOT', 'EC', 'HL', 'NBC', 'NBNC', 'TN'];

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const { settings, updateSettings, resetSettings, themeColors, chartColorsConfig } = useSettings();

  // State
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [allTerrains, setAllTerrains] = useState<Terrain[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    groupe: '',
    secteur: '',
    execution: '',
    nature: '',
    statut: '',
  });

  // Recent activities state
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  
  // Advanced search state
  const [advancedSearchIlot, setAdvancedSearchIlot] = useState('');
  const [advancedSearchLot, setAdvancedSearchLot] = useState('');
  const [advancedSearchResult, setAdvancedSearchResult] = useState<Terrain | null>(null);
  const [advancedSearchPerformed, setAdvancedSearchPerformed] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(null);

  // Dialog states
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingTerrain, setEditingTerrain] = useState<Terrain | null>(null);
  const [deletingTerrain, setDeletingTerrain] = useState<Terrain | null>(null);

  // Import states
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  const [clearExistingOnImport, setClearExistingOnImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported?: number;
    skipped?: number;
    errors?: number;
    totalInDatabase?: number;
    error?: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    ilot: '',
    lot: '',
    groupe: '',
    secteur: '',
    parcelle: '',
    execution: '',
    etat: '',
    titreFoncier: '',
    tp: '',
    numeroTitreProp: '',
    annee: '',
    pubJO: '',
    dateJO: '',
    nature: '',
    imm: '',
    possesseur: '',
    contact: '',
    email: '',
    statut: 'Dispo',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  const fetchTerrains = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.groupe) params.append('groupe', filters.groupe);
      if (filters.secteur) params.append('secteur', filters.secteur);
      if (filters.execution) params.append('execution', filters.execution);
      if (filters.nature) params.append('nature', filters.nature);
      if (filters.statut) params.append('statut', filters.statut);

      console.log('Fetching terrains with params:', params.toString() || 'none');
      const response = await fetch(`/api/terrains?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Terrains loaded:', data.length);
        setTerrains(data);
        setCurrentPage(1);
      } else {
        console.error('Failed to fetch terrains:', response.status);
      }
    } catch (error) {
      console.error('Error fetching terrains:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAllTerrains = useCallback(async () => {
    try {
      const response = await fetch('/api/terrains');
      if (response.ok) {
        const data = await response.json();
        setAllTerrains(data);
      }
    } catch (error) {
      console.error('Error fetching all terrains:', error);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
    fetchAllTerrains();
    fetchTerrains();
  }, [fetchStatistics, fetchAllTerrains, fetchTerrains]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentSearches(parsed.map((s: RecentSearch) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        })));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((search: RecentSearch) => {
    setRecentSearches(prev => {
      const updated = [search, ...prev.slice(0, 9)];
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Advanced search handler
  const handleAdvancedSearch = async () => {
    // Reset error message
    setSearchErrorMessage(null);
    setAdvancedSearchPerformed(false);
    setAdvancedSearchResult(null);

    // Validation: check if at least one field is filled
    const hasIlot = advancedSearchIlot.trim() !== '';
    const hasLot = advancedSearchLot.trim() !== '';

    if (!hasIlot && !hasLot) {
      setSearchErrorMessage(language === 'fr' 
        ? 'Veuillez saisir au moins un numéro d\'îlot ou de lot pour effectuer la recherche.'
        : 'Please enter at least an ilot or lot number to search.');
      return;
    }

    // Validation: if only one field is filled, show info message but continue search
    if ((hasIlot && !hasLot) || (!hasIlot && hasLot)) {
      // Allow search with just one field, but the search will look for all matching records
    }

    try {
      const params = new URLSearchParams();
      if (advancedSearchIlot.trim()) params.append('ilot', advancedSearchIlot);
      if (advancedSearchLot.trim()) params.append('lot', advancedSearchLot);
      
      const response = await fetch(`/api/terrains?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const found = data.length > 0 ? data[0] : null;
        
        setAdvancedSearchResult(found);
        setAdvancedSearchPerformed(true);
        
        // Save to recent searches
        saveRecentSearch({
          id: Date.now().toString(),
          type: 'ilot',
          value: `Ilot: ${advancedSearchIlot}, Lot: ${advancedSearchLot}`,
          success: !!found,
          timestamp: new Date(),
          terrain: found || undefined,
        });
      }
    } catch (error) {
      console.error('Error in advanced search:', error);
    }
  };

  // Handlers
  const handleOpenAddDialog = () => {
    setEditingTerrain(null);
    setFormData({
      ilot: '',
      lot: '',
      groupe: '',
      secteur: '',
      parcelle: '',
      execution: '',
      etat: '',
      titreFoncier: '',
      tp: '',
      numeroTitreProp: '',
      annee: '',
      pubJO: '',
      dateJO: '',
      nature: '',
      imm: '',
      possesseur: '',
      contact: '',
      email: '',
      statut: 'Dispo',
    });
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (terrain: Terrain) => {
    setEditingTerrain(terrain);
    setFormData({
      ilot: terrain.ilot.toString(),
      lot: terrain.lot.toString(),
      groupe: terrain.groupe || '',
      secteur: terrain.secteur || '',
      parcelle: terrain.parcelle?.toString() || '',
      execution: terrain.execution || '',
      etat: terrain.etat || '',
      titreFoncier: terrain.titreFoncier || '',
      tp: terrain.tp || '',
      numeroTitreProp: terrain.numeroTitreProp || '',
      annee: terrain.annee?.toString() || '',
      pubJO: terrain.pubJO || '',
      dateJO: terrain.dateJO || '',
      nature: terrain.nature || '',
      imm: terrain.imm || '',
      possesseur: terrain.possesseur || '',
      contact: terrain.contact || '',
      email: terrain.email || '',
      statut: terrain.statut,
    });
    setIsAddEditDialogOpen(true);
  };

  const handleSaveTerrain = async () => {
    try {
      const url = editingTerrain
        ? `/api/terrains/${editingTerrain.id}`
        : '/api/terrains';
      const method = editingTerrain ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ilot: parseInt(formData.ilot) || 0,
          lot: parseInt(formData.lot) || 0,
          groupe: formData.groupe || null,
          secteur: formData.secteur || null,
          parcelle: parseInt(formData.parcelle) || null,
          execution: formData.execution || null,
          etat: formData.etat || null,
          titreFoncier: formData.titreFoncier || null,
          tp: formData.tp || null,
          numeroTitreProp: formData.numeroTitreProp || null,
          annee: parseInt(formData.annee) || null,
          pubJO: formData.pubJO || null,
          dateJO: formData.pubJO === 'NON' ? null : (formData.dateJO || null),
          nature: formData.nature || null,
          imm: formData.imm || null,
          possesseur: formData.possesseur || null,
          contact: formData.contact || null,
          email: formData.email || null,
          statut: formData.statut,
        }),
      });

      if (response.ok) {
        setIsAddEditDialogOpen(false);
        fetchTerrains();
        fetchAllTerrains();
        fetchStatistics();
        toast({
          title: editingTerrain ? t.terrainUpdated : t.terrainAdded,
          description: t.confirm,
        });
      }
    } catch (error) {
      console.error('Error saving terrain:', error);
      toast({
        title: t.error,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTerrain = async () => {
    if (!deletingTerrain) return;

    try {
      const response = await fetch(`/api/terrains/${deletingTerrain.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        setDeletingTerrain(null);
        fetchTerrains();
        fetchAllTerrains();
        fetchStatistics();
        toast({
          title: t.terrainDeleted,
        });
      }
    } catch (error) {
      console.error('Error deleting terrain:', error);
      toast({
        title: t.error,
        variant: 'destructive',
      });
    }
  };

  // Import Excel handler
  const handleImportExcel = async () => {
    if (!selectedImportFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedImportFile);
      formData.append('clearExisting', String(clearExistingOnImport));

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setImportResult({
          success: true,
          imported: data.imported,
          skipped: data.skipped,
          errors: data.errors,
          totalInDatabase: data.totalInDatabase,
        });
        // Refresh data
        fetchTerrains();
        fetchAllTerrains();
        fetchStatistics();
        setSelectedImportFile(null);
        toast({
          title: language === 'fr' ? 'Importation réussie' : 'Import successful',
          description: language === 'fr' 
            ? `${data.imported} terrains importés avec succès`
            : `${data.imported} terrains imported successfully`,
        });
      } else {
        setImportResult({
          success: false,
          error: data.error || data.details || 'Unknown error',
        });
        toast({
          title: language === 'fr' ? 'Erreur d\'importation' : 'Import error',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      toast({
        title: language === 'fr' ? 'Erreur d\'importation' : 'Import error',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  // Pagination logic
  const paginatedTerrains = terrains.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(terrains.length / itemsPerPage);

  // Get recent terrains (last 5 added)
  const recentTerrains = [...allTerrains]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Chart data transformations
  const groupChartData = statistics
    ? Object.entries(statistics.byGroup).map(([name, data], index) => ({
        name: `Groupe ${name}`,
        available: data.available,
        sold: data.sold,
        fillColor: index === 0 ? CHART_COLORS.groupA : CHART_COLORS.groupB,
      }))
    : [];

  const sectorChartData = statistics
    ? Object.entries(statistics.bySector).map(([name, data], index) => ({
        name,
        available: data.available,
        sold: data.sold,
        fillColor: name === 'DW' ? CHART_COLORS.sectorDW : CHART_COLORS.sectorMO,
      }))
    : [];

  const natureChartData = statistics
    ? Object.entries(statistics.byNature)
        .filter(([, data]) => data.available > 0 || data.sold > 0)
        .map(([name, data]) => ({
          name,
          value: data.available + data.sold,
          available: data.available,
          sold: data.sold,
        }))
    : [];

  const statusPieData = statistics
    ? [
        { name: t.available, value: statistics.general.availableLots, color: COLORS.available },
        { name: t.sold, value: statistics.general.soldLots, color: COLORS.sold },
      ]
    : [];

  // Format date
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 shadow-md overflow-hidden">
        <div className="container mx-auto px-3 py-2 relative">
          {/* Mason with wheelbarrow animation */}
          {settings.animationsEnabled && (
          <div className="mason-animation">
            <svg viewBox="0 0 100 50" width="80" height="40">
              {/* Mason worker */}
              <g className="mason-body">
                {/* Head */}
                <circle cx="25" cy="15" r="8" fill="#fcd5b8" stroke="#d4a574" strokeWidth="1"/>
                {/* Hard hat */}
                <ellipse cx="25" cy="10" rx="10" ry="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
                <rect x="16" y="8" width="18" height="4" rx="2" fill="#f59e0b"/>
                {/* Body */}
                <rect x="18" y="23" width="14" height="18" rx="3" fill="#0d9488"/>
                {/* Arms */}
                <line x1="32" y1="28" x2="50" y2="35" stroke="#fcd5b8" strokeWidth="4" strokeLinecap="round"/>
                <line x1="18" y1="28" x2="10" y2="38" stroke="#fcd5b8" strokeWidth="4" strokeLinecap="round"/>
              </g>
              {/* Left leg */}
              <g className="mason-leg-left">
                <line x1="22" y1="41" x2="20" y2="55" stroke="#374151" strokeWidth="4" strokeLinecap="round"/>
                <rect x="16" y="53" width="8" height="4" rx="1" fill="#78350f"/>
              </g>
              {/* Right leg */}
              <g className="mason-leg-right">
                <line x1="28" y1="41" x2="30" y2="55" stroke="#374151" strokeWidth="4" strokeLinecap="round"/>
                <rect x="26" y="53" width="8" height="4" rx="1" fill="#78350f"/>
              </g>
              
              {/* Wheelbarrow */}
              <g>
                {/* Container */}
                <path d="M45 30 L75 25 L85 40 L50 45 Z" fill="#6b7280" stroke="#374151" strokeWidth="1"/>
                {/* Bricks in wheelbarrow */}
                <rect x="50" y="28" width="8" height="4" fill="#dc2626" rx="1"/>
                <rect x="60" y="26" width="8" height="4" fill="#dc2626" rx="1"/>
                <rect x="55" y="32" width="8" height="4" fill="#dc2626" rx="1"/>
                {/* Handles */}
                <line x1="45" y1="35" x2="32" y2="38" stroke="#4b5563" strokeWidth="3" strokeLinecap="round"/>
                <line x1="45" y1="38" x2="32" y2="42" stroke="#4b5563" strokeWidth="3" strokeLinecap="round"/>
                {/* Support leg */}
                <line x1="75" y1="42" x2="78" y2="55" stroke="#4b5563" strokeWidth="2" strokeLinecap="round"/>
                {/* Wheel */}
                <g className="wheelbarrow-wheel" style={{ transformOrigin: '55px 50px' }}>
                  <circle cx="55" cy="50" r="7" fill="#374151" stroke="#1f2937" strokeWidth="1"/>
                  <circle cx="55" cy="50" r="2" fill="#6b7280"/>
                  <line x1="55" y1="43" x2="55" y2="57" stroke="#6b7280" strokeWidth="1"/>
                  <line x1="48" y1="50" x2="62" y2="50" stroke="#6b7280" strokeWidth="1"/>
                </g>
              </g>
            </svg>
          </div>
          )}
          
          {/* House construction animation */}
          {settings.animationsEnabled && (
          <div className="house-construction">
            <svg viewBox="0 0 60 50" width="60" height="50">
              {/* House base */}
              <g className="house-base">
                <rect x="10" y="25" width="40" height="25" fill="#fcd5b8" stroke="#d4a574" strokeWidth="1"/>
              </g>
              {/* Roof */}
              <g className="house-roof">
                <polygon points="5,25 30,5 55,25" fill="#dc2626" stroke="#b91c1c" strokeWidth="1"/>
              </g>
              {/* Door */}
              <g className="house-door">
                <rect x="23" y="35" width="12" height="15" fill="#78350f" stroke="#92400e" strokeWidth="1"/>
                <circle cx="33" cy="43" r="1.5" fill="#fcd5b8"/>
              </g>
              {/* Windows */}
              <g className="house-window">
                <rect x="13" y="30" width="8" height="8" fill="#7dd3fc" stroke="#0ea5e9" strokeWidth="1"/>
                <line x1="17" y1="30" x2="17" y2="38" stroke="#0ea5e9" strokeWidth="1"/>
                <line x1="13" y1="34" x2="21" y2="34" stroke="#0ea5e9" strokeWidth="1"/>
                <rect x="39" y="30" width="8" height="8" fill="#7dd3fc" stroke="#0ea5e9" strokeWidth="1"/>
                <line x1="43" y1="30" x2="43" y2="38" stroke="#0ea5e9" strokeWidth="1"/>
                <line x1="39" y1="34" x2="47" y2="34" stroke="#0ea5e9" strokeWidth="1"/>
              </g>
              {/* Chimney */}
              <g className="house-chimney">
                <rect x="40" y="8" width="8" height="12" fill="#78350f" stroke="#92400e" strokeWidth="1"/>
                {/* Smoke */}
                <circle cx="44" cy="5" r="2" fill="#d1d5db" opacity="0.6"/>
                <circle cx="46" cy="2" r="1.5" fill="#e5e7eb" opacity="0.4"/>
              </g>
            </svg>
          </div>
          )}
          
          {/* Car with family animation */}
          {settings.animationsEnabled && (
          <div className="car-family">
            <svg viewBox="0 0 70 35" width="70" height="35">
              {/* Car body */}
              <g className="car-body">
                {/* Main body */}
                <path d="M5 20 L10 20 L15 10 L50 10 L55 20 L65 20 L65 28 L5 28 Z" fill="#0d9488" stroke="#0f766e" strokeWidth="1"/>
                {/* Roof */}
                <path d="M18 10 L22 3 L45 3 L50 10 Z" fill="#0f766e" stroke="#115e59" strokeWidth="1"/>
                {/* Windows */}
                <path d="M20 9 L23 4 L32 4 L32 9 Z" fill="#7dd3fc" stroke="#0ea5e9" strokeWidth="0.5"/>
                <path d="M34 9 L34 4 L43 4 L47 9 Z" fill="#7dd3fc" stroke="#0ea5e9" strokeWidth="0.5"/>
              </g>
              
              {/* Family inside car */}
              <g>
                {/* Dad driving */}
                <circle cx="25" cy="12" r="3" fill="#fcd5b8"/>
                <ellipse cx="25" cy="8" rx="2" ry="1" fill="#374151"/>
                
                {/* Mom */}
                <circle cx="35" cy="12" r="3" fill="#fcd5b8"/>
                <ellipse cx="35" cy="9" rx="2" ry="2" fill="#7c3aed"/>
                
                {/* Kid 1 */}
                <circle cx="44" cy="13" r="2" fill="#fcd5b8"/>
                
                {/* Kid 2 */}
                <circle cx="49" cy="13" r="2" fill="#fcd5b8"/>
              </g>
              
              {/* Wheels */}
              <g className="car-wheel" style={{ transformOrigin: '15px 26px' }}>
                <circle cx="15" cy="26" r="5" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
                <circle cx="15" cy="26" r="2" fill="#6b7280"/>
                <line x1="15" y1="21" x2="15" y2="31" stroke="#6b7280" strokeWidth="1"/>
                <line x1="10" y1="26" x2="20" y2="26" stroke="#6b7280" strokeWidth="1"/>
              </g>
              <g className="car-wheel" style={{ transformOrigin: '55px 26px' }}>
                <circle cx="55" cy="26" r="5" fill="#1f2937" stroke="#374151" strokeWidth="1"/>
                <circle cx="55" cy="26" r="2" fill="#6b7280"/>
                <line x1="55" y1="21" x2="55" y2="31" stroke="#6b7280" strokeWidth="1"/>
                <line x1="50" y1="26" x2="60" y2="26" stroke="#6b7280" strokeWidth="1"/>
              </g>
              
              {/* Headlights */}
              <ellipse cx="63" cy="22" rx="2" ry="3" fill="#fef3c7" stroke="#fcd34d" strokeWidth="0.5"/>
              <ellipse cx="7" cy="24" rx="1.5" ry="2" fill="#fecaca" stroke="#f87171" strokeWidth="0.5"/>
            </svg>
          </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-white/30 rounded-full blur-sm"></div>
                <Image
                  src="/logo.png"
                  alt="FODIO Logo"
                  width={60}
                  height={60}
                  className="relative h-10 w-10 md:h-12 md:w-12 object-contain drop-shadow-lg"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg md:text-2xl font-bold text-white drop-shadow-sm tracking-tight">
                  {t.appTitle}
                </h1>
                <p className="text-xs md:text-sm text-teal-100 font-medium">
                  {t.terrainManagement}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsDialogOpen(true)}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm h-8"
              >
                <Settings className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline text-xs">{t.settings}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm h-8"
              >
                <Globe className="h-4 w-4 md:mr-1" />
                <span className="font-semibold text-xs">{language === 'fr' ? 'EN' : 'FR'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 py-4 space-y-4">
        {/* Quick Search Section */}
        <Card className="border-teal-200 shadow-sm bg-gradient-to-r from-teal-50 to-emerald-50">
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FileSearch className="h-4 w-4 text-teal-600" />
                <span className="font-medium text-teal-800 text-sm">{t.advancedSearch}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
                <Input
                  type="number"
                  value={advancedSearchIlot}
                  onChange={(e) => { setAdvancedSearchIlot(e.target.value); setSearchErrorMessage(null); }}
                  placeholder={t.ilot}
                  className="border-teal-300 focus:border-teal-500 focus:ring-teal-500 w-full sm:w-28 h-9 text-sm"
                />
                <Input
                  type="number"
                  value={advancedSearchLot}
                  onChange={(e) => { setAdvancedSearchLot(e.target.value); setSearchErrorMessage(null); }}
                  placeholder={t.lot}
                  className="border-teal-300 focus:border-teal-500 focus:ring-teal-500 w-full sm:w-28 h-9 text-sm"
                />
                <Button
                  onClick={handleAdvancedSearch}
                  className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto h-9"
                  size="sm"
                >
                  <Search className="h-3 w-3 mr-1" />
                  {t.search}
                </Button>
                <Button
                  onClick={handleOpenAddDialog}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto h-9"
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {t.addTerrain}
                </Button>
              </div>
            </div>
            
            {/* Error Message */}
            {searchErrorMessage && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700">
                <XCircle className="h-3 w-3 flex-shrink-0" />
                <span className="text-xs">{searchErrorMessage}</span>
              </div>
            )}
            
            {/* Search Result */}
            {advancedSearchPerformed && (
              <div className="mt-3 pt-3 border-t border-teal-200">
                {advancedSearchResult ? (
                  <Card className="border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="pb-1 pt-2 px-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {t.terrainFound}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-white/70 p-2 rounded-lg">
                          <span className="text-teal-600 text-xs">{t.ilot}</span>
                          <p className="font-bold text-teal-800 text-lg">{advancedSearchResult.ilot}</p>
                        </div>
                        <div className="bg-white/70 p-2 rounded-lg">
                          <span className="text-teal-600 text-xs">{t.lot}</span>
                          <p className="font-bold text-teal-800 text-lg">{advancedSearchResult.lot}</p>
                        </div>
                        <div className="bg-white/70 p-2 rounded-lg">
                          <span className="text-teal-600 text-xs">{t.group}</span>
                          <p className="font-medium text-teal-800">{advancedSearchResult.groupe || '-'}</p>
                        </div>
                        <div className="bg-white/70 p-2 rounded-lg">
                          <span className="text-teal-600 text-xs">{t.sector}</span>
                          <p className="font-medium text-teal-800">{advancedSearchResult.secteur || '-'}</p>
                        </div>
                        <div className="bg-white/70 p-2 rounded-lg">
                          <span className="text-teal-600 text-xs">{t.nature}</span>
                          <p className="font-medium text-teal-800">{advancedSearchResult.nature || '-'}</p>
                        </div>
                        <div className="bg-white/70 p-2 rounded-lg">
                          <span className="text-teal-600 text-xs">{t.surface}</span>
                          <p className="font-medium text-teal-800">{advancedSearchResult.imm ? `${advancedSearchResult.imm} m²` : '-'}</p>
                        </div>
                        <div className="bg-white/70 p-2 rounded-lg col-span-2">
                          <span className="text-teal-600 text-xs">{t.owner}</span>
                          <p className="font-medium text-teal-800">{advancedSearchResult.possesseur || '-'}</p>
                        </div>
                        <div className="bg-white/70 p-2 rounded-lg col-span-2">
                          <span className="text-teal-600 text-xs">{t.status}</span>
                          <Badge className={
                            advancedSearchResult.statut === 'Dispo'
                              ? 'bg-green-100 text-green-700 ml-2'
                              : 'bg-orange-100 text-orange-700 ml-2'
                          }>
                            {advancedSearchResult.statut === 'Dispo' ? t.statusDispo : t.statusVendu}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleOpenEditDialog(advancedSearchResult);
                          }}
                          className="border-teal-200 text-teal-700 hover:bg-teal-50"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          {t.editTerrain}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAdvancedSearchResult(null);
                            setAdvancedSearchPerformed(false);
                            setAdvancedSearchIlot('');
                            setAdvancedSearchLot('');
                          }}
                          className="border-teal-200 text-teal-700 hover:bg-teal-50"
                        >
                          {t.cancel}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        <span className="font-medium">
                          {language === 'fr' ? 'Terrain non existant dans la base de données' : 'Terrain not found in database'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Section */}
        <section className="space-y-3">
          <h2 className="text-base md:text-lg font-semibold text-teal-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t.statistics}
          </h2>

          {/* General Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden cursor-trowel group">
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <Image
                  src="/watermark-ilot.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="pb-1 pt-3 px-3 relative z-10">
                <CardDescription className="text-emerald-100 text-[10px] md:text-xs">
                  {language === 'fr' ? 'Total Îlots' : 'Total Ilots'}
                </CardDescription>
                <CardTitle className="text-xl md:text-2xl font-bold">
                  {statistics?.general.uniqueIlots || 0}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 relative z-10">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-emerald-200 group-hover:scale-110 transition-transform duration-300" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden cursor-trowel group">
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <Image
                  src="/watermark-lot.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="pb-1 pt-3 px-3 relative z-10">
                <CardDescription className="text-cyan-100 text-[10px] md:text-xs">
                  {language === 'fr' ? 'Total Lots' : 'Total Lots'}
                </CardDescription>
                <CardTitle className="text-xl md:text-2xl font-bold">
                  {statistics?.general.uniqueLots || 0}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 relative z-10">
                <MapPin className="h-5 w-5 md:h-6 md:w-6 text-cyan-200 group-hover:scale-110 transition-transform duration-300" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden cursor-trowel group">
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <Image
                  src="/watermark-acd.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="pb-1 pt-3 px-3 relative z-10">
                <CardDescription className="text-purple-100 text-[10px] md:text-xs">
                  {language === 'fr' ? 'Lots avec ACD' : 'Lots with ACD'}
                </CardDescription>
                <CardTitle className="text-xl md:text-2xl font-bold">
                  {statistics?.general.acdLots || 0}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 relative z-10">
                <FileSearch className="h-5 w-5 md:h-6 md:w-6 text-purple-200 group-hover:scale-110 transition-transform duration-300" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden cursor-trowel group">
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                <Image
                  src="/watermark-nonbatis.png"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="pb-1 pt-3 px-3 relative z-10">
                <CardDescription className="text-indigo-100 text-[10px] md:text-xs">
                  {language === 'fr' ? 'Lots non batis' : 'Unbuilt Lots'}
                </CardDescription>
                <CardTitle className="text-xl md:text-2xl font-bold">
                  {statistics?.general.lotsNonBatis || 0}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3 relative z-10">
                <Layers className="h-5 w-5 md:h-6 md:w-6 text-indigo-200 group-hover:scale-110 transition-transform duration-300" />
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {/* Group Statistics Chart */}
            <Card className="border-teal-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-trowel">
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-sm md:text-base text-teal-800">{t.byGroup}</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <ChartContainer config={chartConfig} className="h-[160px] md:h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={groupChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="available" radius={[4, 4, 0, 0]}>
                        {groupChartData.map((entry, index) => (
                          <Cell key={`cell-available-${index}`} fill={index === 0 ? CHART_COLORS.groupA : CHART_COLORS.groupB} />
                        ))}
                      </Bar>
                      <Bar dataKey="sold" radius={[4, 4, 0, 0]}>
                        {groupChartData.map((entry, index) => (
                          <Cell key={`cell-sold-${index}`} fill={index === 0 ? '#a78bfa' : '#22d3ee'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Sector Statistics Chart */}
            <Card className="border-teal-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-trowel">
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-sm md:text-base text-teal-800">{t.bySector}</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <ChartContainer config={chartConfig} className="h-[160px] md:h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="available" radius={[4, 4, 0, 0]}>
                        {sectorChartData.map((entry, index) => (
                          <Cell key={`cell-avail-${index}`} fill={entry.name === 'DW' ? CHART_COLORS.sectorDW : CHART_COLORS.sectorMO} />
                        ))}
                      </Bar>
                      <Bar dataKey="sold" radius={[4, 4, 0, 0]}>
                        {sectorChartData.map((entry, index) => (
                          <Cell key={`cell-sold-${index}`} fill={entry.name === 'DW' ? '#60a5fa' : '#f472b6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Status Pie Chart */}
            <Card className="border-teal-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-trowel">
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-sm md:text-base text-teal-800">
                  {t.generalStatistics}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <ChartContainer config={chartConfig} className="h-[160px] md:h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Nature Statistics Chart */}
            <Card className="border-teal-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-trowel">
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-sm md:text-base text-teal-800">{t.byNature}</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <ScrollArea className="h-[160px] md:h-[200px]">
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={natureChartData}
                        layout="vertical"
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="available" fill={COLORS.available} radius={[0, 4, 4, 0]} />
                        <Bar dataKey="sold" fill={COLORS.sold} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="bg-teal-100" />

        {/* Recent Activities Section */}
        <section className="space-y-3">
          <h2 className="text-base md:text-lg font-semibold text-teal-800 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t.recentActivities}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Recently Added Terrains */}
            <Card className="border-teal-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-trowel">
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-sm md:text-base text-teal-800 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {t.recentlyAdded}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                {recentTerrains.length === 0 ? (
                  <p className="text-xs text-teal-600/60 text-center py-3">{t.noRecentActivity}</p>
                ) : (
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-1">
                      {recentTerrains.map((terrain) => (
                        <div
                          key={terrain.id}
                          className="flex items-center justify-between p-1.5 bg-teal-50/50 rounded hover:bg-teal-50 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="border-teal-300 text-teal-700 text-[10px] h-5">
                              {t.ilot} {terrain.ilot}
                            </Badge>
                            <Badge variant="outline" className="border-teal-300 text-teal-700 text-[10px] h-5">
                              {t.lot} {terrain.lot}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge
                              className={
                                terrain.statut === 'Dispo'
                                  ? 'bg-green-100 text-green-700 text-[10px] h-5'
                                  : 'bg-orange-100 text-orange-700 text-[10px] h-5'
                              }
                            >
                              {terrain.statut === 'Dispo' ? t.statusDispo : t.statusVendu}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card className="border-teal-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-trowel">
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-sm md:text-base text-teal-800 flex items-center gap-2">
                  <Search className="h-3 w-3" />
                  {t.recentSearches}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                {recentSearches.length === 0 ? (
                  <p className="text-xs text-teal-600/60 text-center py-3">{t.noRecentActivity}</p>
                ) : (
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-1">
                      {recentSearches.map((search) => (
                        <div
                          key={search.id}
                          className={`flex items-center justify-between p-1.5 rounded text-xs ${
                            search.success
                              ? 'bg-green-50/50 hover:bg-green-50'
                              : 'bg-red-50/50 hover:bg-red-50'
                          } transition-colors`}
                        >
                          <div className="flex items-center gap-2">
                            {search.success ? (
                              <SearchCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <SearchX className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">
                              {t.searchedBy === 'ilot' ? t.ilot : t.lot}: {search.value}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                search.success
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }
                            >
                              {search.success ? t.found : t.notFound}
                            </Badge>
                            <span className="text-xs text-teal-600/60">
                              {formatDate(search.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="bg-teal-100" />

        {/* Terrain List Section */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-base md:text-lg font-semibold text-teal-800 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t.terrains}
            </h2>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            <Select
              value={filters.groupe}
              onValueChange={(value) => setFilters({ ...filters, groupe: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="border-teal-200 focus:ring-teal-500 h-8 text-xs">
                <SelectValue placeholder={t.group} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">{t.total}</SelectItem>
                <SelectItem value="A" className="text-xs">A</SelectItem>
                <SelectItem value="B" className="text-xs">B</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.secteur}
              onValueChange={(value) => setFilters({ ...filters, secteur: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="border-teal-200 focus:ring-teal-500 h-8 text-xs">
                <SelectValue placeholder={t.sector} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">{t.total}</SelectItem>
                <SelectItem value="DW" className="text-xs">DW</SelectItem>
                <SelectItem value="MO" className="text-xs">MO</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.execution}
              onValueChange={(value) => setFilters({ ...filters, execution: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="border-teal-200 focus:ring-teal-500 h-8 text-xs">
                <SelectValue placeholder={t.execution} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">{t.total}</SelectItem>
                <SelectItem value="NF" className="text-xs">{t.execNF}</SelectItem>
                <SelectItem value="F" className="text-xs">{t.execF}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.nature}
              onValueChange={(value) => setFilters({ ...filters, nature: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="border-teal-200 focus:ring-teal-500 h-8 text-xs">
                <SelectValue placeholder={t.nature} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">{t.total}</SelectItem>
                {NATURE_OPTIONS.map((nature) => (
                  <SelectItem key={nature} value={nature} className="text-xs">
                    {nature}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.statut}
              onValueChange={(value) => setFilters({ ...filters, statut: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="border-teal-200 focus:ring-teal-500 h-8 text-xs">
                <SelectValue placeholder={t.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">{t.total}</SelectItem>
                <SelectItem value="Dispo" className="text-xs">{t.statusDispo}</SelectItem>
                <SelectItem value="Vendu" className="text-xs">{t.statusVendu}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <Card className="border-teal-100 shadow-sm overflow-hidden">
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader className="bg-teal-50 sticky top-0">
                  <TableRow className="hover:bg-teal-50">
                    <TableHead className="text-teal-700 font-semibold text-xs">{t.ilot}</TableHead>
                    <TableHead className="text-teal-700 font-semibold text-xs">{t.lot}</TableHead>
                    <TableHead className="text-teal-700 font-semibold text-xs hidden md:table-cell">{t.group}</TableHead>
                    <TableHead className="text-teal-700 font-semibold text-xs hidden md:table-cell">{t.sector}</TableHead>
                    <TableHead className="text-teal-700 font-semibold text-xs hidden lg:table-cell">{t.execution}</TableHead>
                    <TableHead className="text-teal-700 font-semibold text-xs hidden lg:table-cell">{t.state}</TableHead>
                    <TableHead className="text-teal-700 font-semibold text-xs hidden md:table-cell">{t.nature}</TableHead>
                    <TableHead className="text-teal-700 font-semibold text-xs">{t.surface}</TableHead>
                    <TableHead className="text-teal-700 font-semibold text-xs hidden lg:table-cell">{t.owner}</TableHead>
                    <TableHead className="text-teal-700 font-semibold text-xs">{t.status}</TableHead>
                    <TableHead className="text-teal-700 font-semibold text-xs text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-teal-600">
                        {t.loading}
                      </TableCell>
                    </TableRow>
                  ) : paginatedTerrains.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-teal-600">
                        {language === 'fr' ? 'Aucun terrain ajouté' : 'No terrain added'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTerrains.map((terrain) => (
                      <TableRow key={terrain.id} className="hover:bg-teal-50/50">
                        <TableCell className="font-medium">{terrain.ilot}</TableCell>
                        <TableCell>{terrain.lot}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {terrain.groupe && (
                            <Badge variant="outline" className="border-teal-300 text-teal-700">
                              {terrain.groupe}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{terrain.secteur || '-'}</TableCell>
                        <TableCell className="hidden lg:table-cell">{terrain.execution || '-'}</TableCell>
                        <TableCell className="hidden lg:table-cell">{terrain.etat || '-'}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {terrain.nature && (
                            <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                              {terrain.nature}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{terrain.imm ? `${terrain.imm} m²` : '-'}</TableCell>
                        <TableCell className="hidden lg:table-cell max-w-[150px] truncate">
                          {terrain.possesseur || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              terrain.statut === 'Dispo'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }
                          >
                            {terrain.statut === 'Dispo' ? t.statusDispo : t.statusVendu}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditDialog(terrain)}
                              className="h-8 w-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingTerrain(terrain);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-teal-100 bg-teal-50/50">
                <p className="text-sm text-teal-600">
                  {((currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, terrains.length)} / {terrains.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-teal-200 hover:bg-teal-100"
                  >
                    {'<'}
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={
                          currentPage === pageNum
                            ? 'bg-teal-600 hover:bg-teal-700'
                            : 'border-teal-200 hover:bg-teal-100'
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-teal-200 hover:bg-teal-100"
                  >
                    {'>'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </section>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-teal-800">
              {editingTerrain ? t.editTerrain : t.newTerrain}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ilot" className="text-teal-700">{t.ilot} *</Label>
              <Input
                id="ilot"
                type="number"
                value={formData.ilot}
                onChange={(e) => setFormData({ ...formData, ilot: e.target.value })}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lot" className="text-teal-700">{t.lot} *</Label>
              <Input
                id="lot"
                type="number"
                value={formData.lot}
                onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupe" className="text-teal-700">{t.group}</Label>
              <Select
                value={formData.groupe}
                onValueChange={(value) => setFormData({ ...formData, groupe: value })}
              >
                <SelectTrigger className="border-teal-200 focus:ring-teal-500">
                  <SelectValue placeholder={t.group} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secteur" className="text-teal-700">{t.sector}</Label>
              <Select
                value={formData.secteur}
                onValueChange={(value) => setFormData({ ...formData, secteur: value })}
              >
                <SelectTrigger className="border-teal-200 focus:ring-teal-500">
                  <SelectValue placeholder={t.sector} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DW">DW</SelectItem>
                  <SelectItem value="MO">MO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parcelle" className="text-teal-700">{t.parcel}</Label>
              <Input
                id="parcelle"
                type="number"
                value={formData.parcelle}
                onChange={(e) => setFormData({ ...formData, parcelle: e.target.value })}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="execution" className="text-teal-700">{t.execution}</Label>
              <Select
                value={formData.execution}
                onValueChange={(value) => setFormData({ ...formData, execution: value })}
              >
                <SelectTrigger className="border-teal-200 focus:ring-teal-500">
                  <SelectValue placeholder={t.execution} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NF">{t.execNF}</SelectItem>
                  <SelectItem value="F">{t.execF}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="etat" className="text-teal-700">{t.state}</Label>
              <Input
                id="etat"
                value={formData.etat}
                onChange={(e) => setFormData({ ...formData, etat: e.target.value })}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titreFoncier" className="text-teal-700">{t.landTitle}</Label>
              <Input
                id="titreFoncier"
                value={formData.titreFoncier}
                onChange={(e) => setFormData({ ...formData, titreFoncier: e.target.value })}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp" className="text-teal-700">{t.tp}</Label>
              <Select
                value={formData.tp}
                onValueChange={(value) => setFormData({ ...formData, tp: value })}
              >
                <SelectTrigger className="border-teal-200 focus:ring-teal-500">
                  <SelectValue placeholder={t.tp} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACD">ACD</SelectItem>
                  <SelectItem value="AD">AD</SelectItem>
                  <SelectItem value="RIR">RIR</SelectItem>
                  <SelectItem value="LA">LA</SelectItem>
                  <SelectItem value="ACP">ACP</SelectItem>
                  <SelectItem value="TLA">TLA</SelectItem>
                  <SelectItem value="Sans">{language === 'fr' ? 'Sans' : 'None'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroTitreProp" className="text-teal-700">{t.titleNumber}</Label>
              <Input
                id="numeroTitreProp"
                value={formData.numeroTitreProp}
                onChange={(e) => setFormData({ ...formData, numeroTitreProp: e.target.value })}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annee" className="text-teal-700">{t.year}</Label>
              <Input
                id="annee"
                type="number"
                value={formData.annee}
                onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pubJO" className="text-teal-700">{t.pubJO}</Label>
              <Select
                value={formData.pubJO}
                onValueChange={(value) => setFormData({ ...formData, pubJO: value, dateJO: value === 'NON' ? '' : formData.dateJO })}
              >
                <SelectTrigger className="border-teal-200 focus:ring-teal-500">
                  <SelectValue placeholder={t.pubJO} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUI">{t.yes}</SelectItem>
                  <SelectItem value="NON">{t.no}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateJO" className={`text-teal-700 ${formData.pubJO === 'NON' ? 'opacity-50' : ''}`}>
                {t.date}
              </Label>
              <Input
                id="dateJO"
                value={formData.dateJO}
                onChange={(e) => setFormData({ ...formData, dateJO: e.target.value })}
                placeholder={formData.pubJO === 'NON' ? `${t.no} PubJO` : t.date}
                disabled={formData.pubJO === 'NON'}
                className={`border-teal-200 focus:border-teal-500 focus:ring-teal-500 ${formData.pubJO === 'NON' ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
              />
              {formData.pubJO === 'NON' && (
                <p className="text-xs text-teal-600/60">{language === 'fr' ? 'Désactivé car PubJO est Non' : 'Disabled because PubJO is No'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nature" className="text-teal-700">{t.nature}</Label>
              <Select
                value={formData.nature}
                onValueChange={(value) => setFormData({ ...formData, nature: value })}
              >
                <SelectTrigger className="border-teal-200 focus:ring-teal-500">
                  <SelectValue placeholder={t.nature} />
                </SelectTrigger>
                <SelectContent>
                  {NATURE_OPTIONS.map((nature) => (
                    <SelectItem key={nature} value={nature}>
                      {nature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imm" className="text-teal-700">{t.surface}</Label>
              <Input
                id="imm"
                value={formData.imm}
                onChange={(e) => setFormData({ ...formData, imm: e.target.value })}
                placeholder="m²"
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="possesseur" className="text-teal-700">{t.owner}</Label>
              <Input
                id="possesseur"
                value={formData.possesseur}
                onChange={(e) => setFormData({ ...formData, possesseur: e.target.value })}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-teal-700">{t.contact}</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-teal-700">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statut" className="text-teal-700">{t.status}</Label>
              <Select
                value={formData.statut}
                onValueChange={(value) => setFormData({ ...formData, statut: value })}
              >
                <SelectTrigger className="border-teal-200 focus:ring-teal-500">
                  <SelectValue placeholder={t.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dispo">{t.statusDispo}</SelectItem>
                  <SelectItem value="Vendu">{t.statusVendu}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddEditDialogOpen(false)}
              className="border-teal-200 hover:bg-teal-50"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSaveTerrain}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-teal-800">{t.delete}</AlertDialogTitle>
            <AlertDialogDescription>{t.confirmDelete}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-teal-200 hover:bg-teal-50">
              {t.no}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTerrain}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {t.yes}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-teal-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t.appSettings}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="language" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="language" className="text-xs">{t.languageSettings}</TabsTrigger>
              <TabsTrigger value="theme" className="text-xs">{t.themeSettings}</TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">{t.chartSettings}</TabsTrigger>
              <TabsTrigger value="font" className="text-xs">{t.fontSettings}</TabsTrigger>
              <TabsTrigger value="animations" className="text-xs">{language === 'fr' ? 'Animations' : 'Animations'}</TabsTrigger>
              <TabsTrigger value="import" className="text-xs">{language === 'fr' ? 'Import' : 'Import'}</TabsTrigger>
            </TabsList>
            
            {/* Language Tab */}
            <TabsContent value="language" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-teal-700">{t.language}</Label>
                <div className="flex gap-2">
                  <Button
                    variant={language === 'fr' ? 'default' : 'outline'}
                    onClick={() => setLanguage('fr')}
                    className={language === 'fr' ? 'bg-teal-600 hover:bg-teal-700' : 'border-teal-200'}
                  >
                    🇫🇷 Français
                  </Button>
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    onClick={() => setLanguage('en')}
                    className={language === 'en' ? 'bg-teal-600 hover:bg-teal-700' : 'border-teal-200'}
                  >
                    🇬🇧 English
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-teal-700">{t.theme}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(themePresets).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant={settings.theme === key ? 'default' : 'outline'}
                      onClick={() => updateSettings({ theme: key as keyof typeof themePresets })}
                      className={`h-auto py-3 flex flex-col gap-1 ${
                        settings.theme === key ? 'bg-teal-600 hover:bg-teal-700' : 'border-teal-200'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full" 
                        style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                      />
                      <span className="text-xs">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Chart Colors Tab */}
            <TabsContent value="colors" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-teal-700">{t.chartColors}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(chartColorSchemes).map(([key, scheme]) => (
                    <Button
                      key={key}
                      variant={settings.chartColors === key ? 'default' : 'outline'}
                      onClick={() => updateSettings({ chartColors: key as keyof typeof chartColorSchemes })}
                      className={`h-auto py-3 flex flex-col gap-2 ${
                        settings.chartColors === key ? 'bg-teal-600 hover:bg-teal-700' : 'border-teal-200'
                      }`}
                    >
                      <span className="text-xs font-medium">{scheme.name}</span>
                      <div className="flex gap-1">
                        <div 
                          className="w-6 h-6 rounded" 
                          style={{ backgroundColor: scheme.available }}
                          title="Available"
                        />
                        <div 
                          className="w-6 h-6 rounded" 
                          style={{ backgroundColor: scheme.sold }}
                          title="Sold"
                        />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Font Tab */}
            <TabsContent value="font" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-teal-700">{t.fontSize}</Label>
                  <div className="flex gap-2">
                    {Object.entries(fontSizePresets).map(([key, preset]) => (
                      <Button
                        key={key}
                        variant={settings.fontSize === key ? 'default' : 'outline'}
                        onClick={() => updateSettings({ fontSize: key as keyof typeof fontSizePresets })}
                        className={settings.fontSize === key ? 'bg-teal-600 hover:bg-teal-700' : 'border-teal-200'}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-teal-700">{t.fontFamily}</Label>
                  <div className="flex gap-2">
                    {Object.entries(fontFamilyPresets).map(([key, preset]) => (
                      <Button
                        key={key}
                        variant={settings.fontFamily === key ? 'default' : 'outline'}
                        onClick={() => updateSettings({ fontFamily: key as keyof typeof fontFamilyPresets })}
                        className={settings.fontFamily === key ? 'bg-teal-600 hover:bg-teal-700' : 'border-teal-200'}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Animations Tab */}
            <TabsContent value="animations" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex flex-col">
                    <Label className="text-teal-700 font-medium">
                      {language === 'fr' ? 'Animations de l\'entête' : 'Header Animations'}
                    </Label>
                    <span className="text-xs text-teal-600 mt-1">
                      {language === 'fr' 
                        ? 'Activer les animations du maçon, de la construction et de la voiture'
                        : 'Enable mason, construction and car animations'}
                    </span>
                  </div>
                  <Button
                    variant={settings.animationsEnabled ? 'default' : 'outline'}
                    onClick={() => updateSettings({ animationsEnabled: !settings.animationsEnabled })}
                    className={settings.animationsEnabled 
                      ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                      : 'border-teal-200 text-teal-700'
                    }
                  >
                    {settings.animationsEnabled 
                      ? (language === 'fr' ? 'Activées' : 'Enabled')
                      : (language === 'fr' ? 'Désactivées' : 'Disabled')
                    }
                  </Button>
                </div>
                
                {/* Animation preview description */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {language === 'fr' ? 'Aperçu des animations :' : 'Animation preview:'}
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>🧱 {language === 'fr' ? 'Maçon avec brouette traversant l\'entête' : 'Mason with wheelbarrow crossing the header'}</li>
                    <li>🏠 {language === 'fr' ? 'Construction progressive d\'une maison' : 'Progressive house construction'}</li>
                    <li>🚗 {language === 'fr' ? 'Voiture avec famille arrivant à la maison' : 'Car with family arriving at the house'}</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            {/* Import Tab */}
            <TabsContent value="import" className="space-y-4 py-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <Label className="text-teal-700 font-medium">
                    {language === 'fr' ? 'Importer des données Excel' : 'Import Excel Data'}
                  </Label>
                  <p className="text-xs text-gray-500">
                    {language === 'fr' 
                      ? 'Importez vos terrains depuis un fichier Excel (.xlsx). Les colonnes reconnues sont : Ilots, Lots, Groupe, Section, Parcelle, Execution, Etat, TP, Nature, Immatriculation, Possesseur, etc.'
                      : 'Import your terrains from an Excel file (.xlsx). Recognized columns are: Ilots, Lots, Groupe, Section, Parcelle, Execution, Etat, TP, Nature, Immatriculation, Possesseur, etc.'}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedImportFile(file);
                          }
                        }}
                        className="hidden"
                        id="import-file-input"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('import-file-input')?.click()}
                        className="border-teal-200 text-teal-700"
                      >
                        <FileSearch className="h-4 w-4 mr-2" />
                        {language === 'fr' ? 'Choisir un fichier' : 'Choose file'}
                      </Button>
                      {selectedImportFile && (
                        <span className="text-xs text-teal-600">{selectedImportFile.name}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="clear-existing"
                        checked={clearExistingOnImport}
                        onChange={(e) => setClearExistingOnImport(e.target.checked)}
                        className="rounded border-teal-300"
                      />
                      <Label htmlFor="clear-existing" className="text-xs text-gray-600">
                        {language === 'fr' 
                          ? 'Supprimer les données existantes avant import' 
                          : 'Delete existing data before import'}
                      </Label>
                    </div>
                    
                    <Button
                      onClick={handleImportExcel}
                      disabled={!selectedImportFile || importing}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {importing ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                          {language === 'fr' ? 'Importation...' : 'Importing...'}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          {language === 'fr' ? 'Importer les données' : 'Import data'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Import result */}
                {importResult && (
                  <div className={`p-4 rounded-lg border ${importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <h4 className={`font-medium mb-2 ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {importResult.success 
                        ? (language === 'fr' ? '✅ Importation réussie' : '✅ Import successful')
                        : (language === 'fr' ? '❌ Erreur d\'importation' : '❌ Import failed')}
                    </h4>
                    {importResult.success && (
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>{language === 'fr' ? 'Importés' : 'Imported'}: {importResult.imported}</li>
                        <li>{language === 'fr' ? 'Ignorés' : 'Skipped'}: {importResult.skipped}</li>
                        <li>{language === 'fr' ? 'Erreurs' : 'Errors'}: {importResult.errors}</li>
                        <li className="font-medium">{language === 'fr' ? 'Total en base' : 'Total in database'}: {importResult.totalInDatabase}</li>
                      </ul>
                    )}
                    {!importResult.success && importResult.error && (
                      <p className="text-xs text-red-600">{importResult.error}</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                resetSettings();
                toast({ title: language === 'fr' ? 'Paramètres réinitialisés' : 'Settings reset' });
              }}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {t.resetSettings}
            </Button>
            <Button
              onClick={() => setIsSettingsDialogOpen(false)}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {t.apply}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-teal-700 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-teal-100">
            © {new Date().getFullYear()} {t.appTitle}. {t.terrainManagement}
          </p>
        </div>
      </footer>
    </div>
  );
}
